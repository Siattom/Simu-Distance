    // Set map options
    var myLatLng = { lat: 47.84408791733109, lng: -0.33631967544888164 };
    var mapOptions = {
        center: myLatLng,
        zoom: 7,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var chargePointsArray = [];

    // Create map
    var map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

    // Create a DirectionsService object to use the route method and get a result for our request
    var directionsService = new google.maps.DirectionsService();

    // Create a DirectionsRenderer object which we will use to display the route
    var directionsDisplay = new google.maps.DirectionsRenderer();

    var all = document.getElementById('all');
    var normal = document.getElementById('normal');
    var fast = document.getElementById('fast');

    var selectedChargeType = 'all';

    all.addEventListener('click', function(){
        selectedChargeType = 'all';
    })

    normal.addEventListener('click', function(){
        selectedChargeType = 'normal';
    })

    fast.addEventListener('click', function(){
        selectedChargeType = 'fast';
    })

    var Markers = [];

    // Bind the DirectionsRenderer to the map
    directionsDisplay.setMap(map);

    const removeMarkers = () => {
        Markers.forEach((m) => m.setMap(null));
        Markers = [];
    }

    // Function to fetch and display charging points
    function fetchAndDisplayChargePoints(latitude, longitude, selectedChargeType) {
        var apiKey = '56fa6422-eeff-4be6-a733-92a29cb26fdd';
        var url = 'https://api.openchargemap.io/v3/poi/?output=json&maxresults=40&latitude=' + latitude + '&longitude=' + longitude + '&distance=20&distanceunit=KM&key=' + apiKey;

        fetch(url)
            .then(response => {
                return response.json()
            })
            .then(data => {
                // Process and display charging points on the map
                processChargePoints(data, selectedChargeType);
            })
            .catch(error => console.error('Error fetching charging points:', error));
    }

    function getTotalDistance(result) {
        let totalDistance = 0;
        result.routes[0].legs.forEach(leg => {
            totalDistance += leg.distance.value; // Utilisez .value pour obtenir la distance en mètres
        });
        return Math.round(totalDistance / 1000); // Arrondir au kilomètre le plus proche
    }

    // Function to fetch nearest charging point from a given location
    function fetchNearestChargePoint(latitude, longitude, selectedChargeType) {
        var apiKey = '56fa6422-eeff-4be6-a733-92a29cb26fdd';
        var url = 'https://api.openchargemap.io/v3/poi/?output=json&latitude=' + latitude + '&longitude=' + longitude + '&distance=20&distanceunit=KM&key=' + apiKey;

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                // Filter charging points based on selected charge type
                var filteredChargePoints = data.filter(chargePoint => {
                    return selectedChargeType === 'all' ||
                        (selectedChargeType === 'normal' && chargePoint.Connections[0] && chargePoint.Connections[0].PowerKW >= 3 && chargePoint.Connections[0].PowerKW <= 22) ||
                        (selectedChargeType === 'fast' && chargePoint.Connections[0] && chargePoint.Connections[0].PowerKW > 30);
                });
                if (selectedChargeType === 'all') {
                    // Filtrer les bornes qui ont des connexions définies
                    filteredChargePoints = filteredChargePoints.filter(chargePoint => chargePoint.Connections && chargePoint.Connections.length > 0);
                
                    // Trier par ordre décroissant de PowerKW
                    filteredChargePoints.sort((a, b) => {
                        const powerA = a.Connections[0]?.PowerKW || 0; // Utiliser 0 si PowerKW n'est pas défini
                        const powerB = b.Connections[0]?.PowerKW || 0; // Utiliser 0 si PowerKW n'est pas défini
                        return powerB - powerA;
                    });
                }                
                
                if (filteredChargePoints.length > 0) {
                    // Sort the filtered charging points by distance from the current location
                    filteredChargePoints.sort((a, b) => {
                        // Calculate distances from the current location
                        var distanceA = google.maps.geometry.spherical.computeDistanceBetween(
                            new google.maps.LatLng(latitude, longitude),
                            new google.maps.LatLng(a.AddressInfo.Latitude, a.AddressInfo.Longitude)
                        );
                        var distanceB = google.maps.geometry.spherical.computeDistanceBetween(
                            new google.maps.LatLng(latitude, longitude),
                            new google.maps.LatLng(b.AddressInfo.Latitude, b.AddressInfo.Longitude)
                        );

                        // Return the comparison result
                        return distanceA - distanceB;
                    });

                    // Return the first charging point (the nearest one)
                    return filteredChargePoints[0];
                } else {
                    // If no matching charging points found, return null
                    return null;
                }
            })
            .catch(error => console.error('Error fetching nearest charging point:', error));
    }

    function calculForCalcRoute(distance) {
        var charge = document.getElementById('charge').value;
        var conso = document.getElementById('conso').value;
        var battery = document.getElementById('battery').value;
        
                // pour convertir le pourcentage en kWh
                var chargeKWh = (battery * charge) / 100;

                // connaitre le niveau correspondant à 30%
                var trentePourcent = battery * 30 / 100;

                // connaitre la plage de kWh avant les 30 %
                var plagePourcent = chargeKWh - trentePourcent;

                // convertir les kWh restant en km
                var prevCharge = (100 * plagePourcent) / conso;

                // avoir la consommation réelle du trajet
                var consoReel = (conso * distance) / 100;

                // avoir le reste de charge en kWh
                var chargeResteKWh = chargeKWh - consoReel;

                // savoir le pourcentage restant
                var restPercent = (chargeResteKWh * 100) / battery;

                return { prevCharge: prevCharge, restPercent: restPercent };
    }

    function verifWaypointsCalcNewRoute(verifWaypoints, selectedChargeType, result, prevCharge, destinationCoordinates, map) {
        var lastWaypoint = verifWaypoints.length - 1;
        var lastWaypointAddress = verifWaypoints[lastWaypoint].location;
        // Use the Google Maps Geocoding service to convert address to coordinates
        var geocoder = new google.maps.Geocoder();
        var prevChargeMeters = prevCharge * 1000;

        geocoder.geocode({ 'address': lastWaypointAddress.query }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();
                var lastWaypointLatLng = new google.maps.LatLng(latitude, longitude);

                // Calculer la direction entre le dernier waypoint et la destination
                var directionToDestination = google.maps.geometry.spherical.computeHeading(lastWaypointLatLng, destinationCoordinates);

                // Calculer les coordonnées du point insuffisamment chargé à une distance donnée du dernier waypoint dans la direction de la destination
                var insufficientChargePoint = google.maps.geometry.spherical.computeOffset(
                    lastWaypointLatLng,
                    prevChargeMeters,
                    directionToDestination
                );

                // Récupérer la borne de recharge la plus proche du nouveau point
                fetchNearestChargePoint(insufficientChargePoint.lat(), insufficientChargePoint.lng(), selectedChargeType)
                    .then(nearestChargePoint => {
                        if (nearestChargePoint) {
                            // Si une borne de recharge est trouvée à proximité, appeler la fonction reCalcIti avec cette borne
                            reCalcIti(nearestChargePoint, prevCharge, result, destinationCoordinates);
                        } else {
                            output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i>Aucune borne de recharge correspondante trouvée (essayer de sélectionner autre que recharge rapide).</div>";
                            
                            
                            ('Aucune borne de recharge trouvée à proximité.');
                            // Gérer le cas où aucune borne de recharge n'est trouvée à proximité
                        }
                    })
                    .catch(error => console.error('Erreur lors de la récupération de la borne de recharge la plus proche:', error));
                } else {
                    console.error('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
        
        var infosBornes = [];
        
        // Define the calcRoute function
    function calcRoute() {
        infosBornes = [];
        var charge = document.getElementById('charge').value;
        var avoidHighwaysStatut = document.getElementById('avoidHighways').checked;

        // Create request
        var request = {
            origin: document.getElementById("from").value,
            destination: document.getElementById("to").value,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: avoidHighwaysStatut
        };

        // Pass the request to the route method
        directionsService.route(request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                // Display route information
                var distanceData = result.routes[0].legs[0].distance.text;
                var distanceDataSansKm = distanceData.replace(' km', '');
                var distanceSansVirgule = distanceDataSansKm.replace(',', '.');
                var distance = distanceSansVirgule.replace(/\s+/g, '');

                var { prevCharge, restPercent } = calculForCalcRoute(distance);
                
                if (prevCharge <= distance) {
                    var destinationCoordinates = result.routes[0].legs[0].end_location;

                    calcNewRoute(result, prevCharge, destinationCoordinates)
                } else {
                    console.log('ok c\'est bon');
                }
                var totalDurationText = getTotalDuration(result);

                const output = document.querySelector('#output');
                output.innerHTML = "<div class='alert-info'>De: " + document.getElementById("from").value + " avec " + charge + " %.<br />à: " + document.getElementById("to").value + " avec " + Math.round(restPercent) + " %.<br /> Distance <i class='fas fa-road'></i> : " + result.routes[0].legs[0].distance.text + ".<br />Durée <i class='fas fa-hourglass-start'></i> : " + totalDurationText;

                removeMarkers();

                // Display route on the map
                directionsDisplay.setDirections(result);
                // Fetch and display charging points along the route
                var route = result.routes[0].overview_path;
                for (var i = 0; i < route.length; i += 5) {
                    //fetchAndDisplayChargePoints(route[i].lat(), route[i].lng(), selectedChargeType);
                }
            } else {
                // Delete route from map
                directionsDisplay.setDirections({ routes: [] });
                // Center map
                map.setCenter(myLatLng);
                // Show error message
                output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Impossible de trouver la distance.</div>";
            }
        });
    }

    function calcNewRoute(result, prevCharge, destinationCoordinates) {
        const output = document.querySelector('#output');

        var verifWaypoints = result.request.waypoints;
        
        if (verifWaypoints != undefined && verifWaypoints.length > 0) {
            // Appelez la fonction verifWaypointsCalcNewRoute en passant les mêmes paramètres
            verifWaypointsCalcNewRoute(verifWaypoints, selectedChargeType, result, prevCharge, destinationCoordinates, map);
        } else {   
            // If there are no waypoints, calculate from the origin to 30%
            var overviewPath = result.routes[0].overview_path; // Get the overview path of the route
            var totalDistance = 0;
            var insufficientChargePoint = null;
        
            for (var i = 1; i < overviewPath.length; i++) {
                var distanceToNextPoint = google.maps.geometry.spherical.computeDistanceBetween(overviewPath[i - 1], overviewPath[i]);
                totalDistance += distanceToNextPoint;
        
                if (totalDistance >= prevCharge * 1000) {
                    // Use the current point as insufficientChargePoint
                    insufficientChargePoint = overviewPath[i];
                    break;
                }
            }
        
            //if (insufficientChargePoint) { // Vérifier si insufficientChargePoint est défini
            //    var marker = new google.maps.Marker({
            //        position: insufficientChargePoint,
            //        map: map, // Ajouter le marqueur à la carte
            //        title: 'Point insuffisamment chargé' // Titre du marqueur (facultatif)
            //    });
            //}
            if(!insufficientChargePoint){
                output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i>Aucune borne de recharge correspondante trouvée (essayer de modifier légèrement votre pourcentage de batterie).</div>";
            }

            fetchNearestChargePoint(insufficientChargePoint.lat(), insufficientChargePoint.lng(), selectedChargeType)
            .then(insufficientChargePoint => {
                if (insufficientChargePoint) {
                    
                    reCalcIti(insufficientChargePoint, prevCharge, result, destinationCoordinates);
                } else {
                            output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i>Aucune borne de recharge correspondante trouvée (essayer de modifier légèrement votre pourcentage de batterie).</div>";
                            console.log('Aucune borne de recharge trouvée à proximité.');
                }
            })
            .catch(error => console.error('Erreur lors de la récupération de la borne de recharge la plus proche:', error));
        }
    }


    function getTotalDuration(result) {
        let totalDuration = 0;
        result.routes[0].legs.forEach(leg => {
            totalDuration += leg.duration.value; // Utilisez .value pour obtenir la durée en secondes
        });

        // Convertir la durée totale en format lisible (heures et minutes)
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.round((totalDuration % 3600) / 60);

        return hours + " heures et " + minutes + " minutes";
    }

    function addressNotNull(address, additionalInfo) {
        if (!address && !additionalInfo) {
            return "Non renseigné.";
        } else {
            var fullAddress = '';
            if (address) {
                fullAddress += address;
            }
            if (additionalInfo) {
                fullAddress += (address ? ", " : "") + additionalInfo;
            }
            return fullAddress;
        }
    }


    function reCalcIti(insufficientChargePoint, prevCharge, result, destinationCoordinates) {
        var avoidHighwaysStatut = document.getElementById('avoidHighways');
        if (avoidHighwaysStatut.checked) {
            avoidHighwaysStatut = true;
        } else {
            avoidHighwaysStatut = false;
        }

        // Create request
        var request = {
            origin: document.getElementById("from").value,
            destination: document.getElementById("to").value,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: avoidHighwaysStatut
        };

        var capaChargeCar = document.getElementById('capaChargeCar').value;
        var powerKW = insufficientChargePoint.Connections[0].PowerKW

        if (powerKW < capaChargeCar){
            capaChargeCar = powerKW
        }

        var conso = document.getElementById('conso').value;
        var battery = document.getElementById('battery').value;
        var charge = document.getElementById('charge').value;

        var waypoints = [];

        // Add previous waypoints to the request
        var prevWaypoints = result.request.waypoints;
        if (prevWaypoints) {
            for (var i = 0; i < prevWaypoints.length; i++) {
                waypoints.push({
                    location: prevWaypoints[i].location,
                    stopover: true 
                });
            }
        }

        // Exemple de requête à l'API Geocoding
        var lat = insufficientChargePoint.AddressInfo.Latitude
        var lng = insufficientChargePoint.AddressInfo.Longitude
        var apiKey = 'AIzaSyBZeMfqzI4a7F3nsoRrGOWGXQC_qAOzshY';
        
        // Construction de l'URL de requête
        var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        
        // Envoi de la requête GET à l'API Geocoding
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Traitement de la réponse de l'API
                if (data.status === 'OK' && data.results.length > 0) {
                    // Récupération de l'adresse à partir des résultats de la réponse
                    addressData = data.results[0].formatted_address; // Assigner la valeur à la variable
                } else {
                    console.error('Erreur lors de la récupération de l\'adresse.');
                }
            })
            .catch(error => console.error('Erreur lors de la requête à l\'API Geocoding:', error));
        
        // Vérifier si l'adresse n'est pas déjà présente dans les waypoints
        var isAddressAlreadyAdded = waypoints.some(waypoint => waypoint.location.query === addressData);

        // Ajouter le nouveau waypoint s'il n'est pas déjà présent
        if (!isAddressAlreadyAdded) {
            waypoints.push({
                location: addressData,
                stopover: true
            });
        }



        request.waypoints = waypoints;
        
        // Re-calculer l'itinéraire avec les nouveaux 
        directionsService.route(request, function (result, updatedStatus) {
            if (updatedStatus == google.maps.DirectionsStatus.OK) {
                // Afficher le nouvel itinéraire sur la carte
                directionsDisplay.setDirections(result);

                // Récupérer la distance entre le dernier waypoint et la destination
                var lastLegIndex = result.routes[0].legs.length - 1;
                var lastLegDistanceData = result.routes[0].legs[lastLegIndex].distance.text;
                var lastLegDistanceDataSansKm = lastLegDistanceData.replace(' km', '');
                var lastLegDistanceDataSansKmSansEspace = lastLegDistanceDataSansKm.replace(/\s+/g, '')
                var remainingDistance = parseFloat(lastLegDistanceDataSansKmSansEspace.replace(',', '.')); // Convertir en nombre

                // pour convertir le pourcentage en kWh
                var chargeKWh = (battery * charge) / 100;

                // savoir la consommation jusqu'à l'arret borne
                var consoDepartBorne = (conso * remainingDistance) / 100;
                
                // savoir le nombre de kw restant en arrivant à la borne
                var resteKwBorne = chargeKWh - consoDepartBorne;
                
                // connaitre les Kw correspondant à 85% de batterie
                var quatreVingtCinq = (battery * 85) / 100;
                
                // connaitre la plage de recharge
                var plageRecharge = quatreVingtCinq - resteKwBorne;
                
                // récupérer le temps de recharge
                var tempsRecharge = (plageRecharge / capaChargeCar) * 60;

                // avoir la conso réelle de la borne a la destination
                var consoReelApresBorne = conso * remainingDistance / 100;

                // avoir le reste de charge en kWh
                var chargeResteKWhApresBorne = quatreVingtCinq - consoReelApresBorne;

                // savoir le pourcentage restant
                var restPercentApresBorne = Math.round((chargeResteKWhApresBorne * 100) / battery);
                if (restPercentApresBorne < 30) {

                    // connaitre le niveau correspondant à 30%
                    var trentePourcent = battery * 30 / 100;

                    // connaitre la plage de kWh avant les 30 %
                    var plagePourcent = quatreVingtCinq - trentePourcent;

                    // convertir les kWh restant en km
                    var prevCharge = (100 * plagePourcent) / conso;

                    calcNewRoute(result, prevCharge, destinationCoordinates);
                } else {
                    console.log('ok');
                }

                var tempsRechargeArrondi = Math.round(tempsRecharge);
                // Créer un objet avec les informations de la borne
                var powerKw = insufficientChargePoint.Connections[0] && insufficientChargePoint.Connections[0].PowerKW ? insufficientChargePoint.Connections[0].PowerKW : "Non renseigné";

                var borneInfo = {
                    temps: tempsRechargeArrondi,
                    titre: insufficientChargePoint.AddressInfo.Title,
                    adresse: addressNotNull(
                        insufficientChargePoint.AddressInfo.AddressLine1,
                        insufficientChargePoint.AddressInfo.Town
                    ) + ", " +
                    addressNotNull(insufficientChargePoint.AddressInfo.Postcode, null),
                    puissance: powerKw
                };
                
            // Vérifier si la nouvelle borne n'existe pas déjà dans le tableau
            var isDuplicate = false;
            for (var i = 0; i < infosBornes.length; i++) {
                if (infosBornes[i].adresse === borneInfo.adresse) {
                    isDuplicate = true;
                    break;
                }
            }

            // Ajouter l'objet au tableau infosBornes uniquement s'il n'existe pas déjà
            if (!isDuplicate) {
                infosBornes.push(borneInfo);
            }


            // Ajouter l'objet au tableau infosBornes après la vérification

                document.getElementById('openMapBtn').addEventListener('click', function() {
                    // Créer le lien vers Google Maps avec l'itinéraire et les options
                    var googleMapsLink = "https://www.google.com/maps/dir/";
                
                    // Ajouter l'origine
                    googleMapsLink += encodeURIComponent(document.getElementById("from").value);
                
                    // Ajouter les étapes intermédiaires
                    infosBornes.forEach(function(borne) {
                        borne.adresse = borne.adresse.replace(', Non renseigné', '');
                        googleMapsLink += "/" + encodeURIComponent(borne.adresse);
                    });
                
                    // Ajouter la destination
                    googleMapsLink += "/" + encodeURIComponent(document.getElementById("to").value);
                
                    // Vérifier si l'utilisateur veut éviter les autoroutes
                    var avoidHighwaysStatut = document.getElementById('avoidHighways');
                    if (avoidHighwaysStatut.checked) {
                        googleMapsLink += "/data=!4m3!4m2!2m1!2b1"; // Ajouter l'option pour éviter les autoroutes
                    }
                
                    // Ouvrir le lien dans une nouvelle fenêtre
                    window.open(googleMapsLink);
                });
                
                
                var totalDistance = getTotalDistance(result);
                // Construire le contenu HTML pour afficher les informations des bornes
                var bornesHTML = "<div class='infos-bornes'>";
                infosBornes.forEach(function(borne, index) {
                    bornesHTML += "<div class='borne'>";
                    bornesHTML += "<h3>Borne " + (index + 1) + "</h3>";
                    bornesHTML += "<p><strong>Temps de recharge:</strong> " + borne.temps + " minutes</p>";
                    bornesHTML += "<p><strong>Titre:</strong> " + borne.titre + "</p>";
                    bornesHTML += "<p><strong>Adresse:</strong> " + borne.adresse + "</p>";
                    bornesHTML += "<p><strong>Puissance:</strong> " + borne.puissance + " kW</p>";
                    bornesHTML += "</div>";
                });
                bornesHTML += "</div>";
                var totalDurationText = getTotalDuration(result);

                // Afficher le contenu HTML dans la div output
                output.innerHTML = "<div class='alert-info'>De: " + document.getElementById("from").value + " avec " + charge + " %.<br />à: " + document.getElementById("to").value + " avec " + restPercentApresBorne + " %.<br /> Distance <i class='fas fa-road'></i> : " + totalDistance + "Km.<br />Durée <i class='fas fa-hourglass-start'></i> : " + totalDurationText + ".<br /></div>" + bornesHTML;
            } else {
                console.error('Erreur lors du recalcul de l\'itinéraire:', updatedStatus);
            }
        });
    }


    function processChargePoints(data, selectedChargeType) {
        data.forEach(chargePoint => {
            // Vérifier si les données de la borne de recharge sont valides
            if (chargePoint.Connections && chargePoint.Connections.length > 0 && chargePoint.Connections[0].PowerKW !== undefined) {
                // Accéder aux coordonnées de latitude et de longitude
                var latitude = chargePoint.AddressInfo.Latitude;
                var longitude = chargePoint.AddressInfo.Longitude;

                // Vérifier si le point de charge correspond au type sélectionné
                if ((selectedChargeType === 'normal' && chargePoint.Connections[0].PowerKW >= 3 && chargePoint.Connections[0].PowerKW <= 43) ||
                    (selectedChargeType === 'fast' && chargePoint.Connections[0].PowerKW > 43) ||
                    selectedChargeType === 'all') {

                    // Déterminer la couleur du marqueur en fonction de la puissance
                    var powerKW = chargePoint.Connections[0].PowerKW;
                    var markerColor = '';
                    if (powerKW >= 3.5 && powerKW < 7) {
                        markerColor = 'red'; // Puissance entre 3.5 et 7 kW
                    } else if (powerKW >= 7 && powerKW <= 43) {
                        markerColor = 'orange'; // Puissance entre 7 et 43 kW
                    } else {
                        markerColor = 'green'; // Puissance supérieure à 43 kW
                    }

                    // Créer un marqueur pour chaque point de charge avec la couleur déterminée
                    //var marker = new google.maps.Marker({
                    //    position: { lat: latitude, lng: longitude },
                    //    map: map,
                    //    title: chargePoint.AddressInfo.Title,
                    //    icon: {
                    //        url: 'http://maps.google.com/mapfiles/ms/icons/' + markerColor + '-dot.png' // Utiliser une icône de couleur déterminée
                    //    }
                    //});

                    //Markers.push(marker);

                    // Ajouter une info-bulle avec le titre du point de charge
                    //var infoWindow = new google.maps.InfoWindow({
                    //    content: chargePoint.AddressInfo.Title
                    //});

                    // Afficher l'info-bulle lorsque le marqueur est cliqué
                    marker.addListener('click', function() {
                        infoWindow.open(map, marker);
                    });
                }
            }
        });
    }

    // Create autocomplete objects for all inputs
    var options = {
        types: ['address'], // Limiter les suggestions aux adresses
        componentRestrictions: { country: 'fr' } // Limiter les suggestions à la France
    };

    var input1 = document.getElementById("from");
    var autocomplete1 = new google.maps.places.Autocomplete(input1, options);

    var input2 = document.getElementById("to");
    var autocomplete2 = new google.maps.places.Autocomplete(input2, options);


    function toggleDesactive(button){
        window.location.reload()
    }

    var gmarkers = [];

    // Activer le bouton cliqué (trajet/carte)
    function toggleActive(button) {
    // Désactiver 
    
        for(i=0; i<gmarkers.length; i++){
            gmarkers[i].setMap(null);
        }
        var buttons = document.querySelectorAll('.value');
        var form = document.getElementById('form-form');
        var calcBtn = document.getElementById('calc-btn');
        var googleMap = document.getElementById('googleMap');
        var filtre = document.getElementById('filtre-carte');
        var filtre2 = document.getElementById('filtre-carte2');
        form.classList.add('details-hidden')
        calcBtn.classList.add('details-hidden')
        //googleMap.classList.add('selected-carte')
        filtre.classList.remove('hidden-filtre')
        filtre2.classList.remove('hidden-filtre')

        buttons.forEach(function(btn) {
            btn.classList.remove('active');
        });

        // Activer 
        button.classList.add('active');

        var apiKey = '56fa6422-eeff-4be6-a733-92a29cb26fdd';
        var url = 'https://api.openchargemap.io/v3/poi/?output=json&countrycode=FR&maxresults=100000&key=' + apiKey;
        
        return fetch(url)
            .then(response => {
                return response.json();
            })
            .then(data => {
                // Assurez-vous que les données sont disponibles et qu'elles contiennent des points de charge
                if (data && data.length > 0) {
                    // Parcourir les points de charge
                    data.forEach(chargePoint => {
                        if (chargePoint.Connections && chargePoint.Connections.length > 0 && chargePoint.Connections[0].PowerKW !== undefined) {
                            // Accéder aux coordonnées de latitude et de longitude
                            var latitude = chargePoint.AddressInfo.Latitude;
                            var longitude = chargePoint.AddressInfo.Longitude;
                
                            // Vérifier si la puissance est supérieure à 43 kW (recharge rapide)
                            var powerKW = chargePoint.Connections[0].PowerKW;
                            if (powerKW > 43) {
                                // Déterminer la couleur du marqueur en fonction de la puissance
                                var markerColor = 'green'; // Puissance supérieure à 43 kW
                
                                // Créer un marqueur pour chaque point de charge avec la couleur déterminée
                                var marker = new google.maps.Marker({
                                    position: { lat: latitude, lng: longitude },
                                    map: map,
                                    title: chargePoint.AddressInfo.Title,
                                    icon: {
                                        url: 'http://maps.google.com/mapfiles/ms/icons/' + markerColor + '-dot.png' // Utiliser une icône de couleur déterminée
                                    }
                                });
                
                                // Ajouter une info-bulle avec le titre du point de charge
                                var infoWindow = new google.maps.InfoWindow({
                                    content: chargePoint.AddressInfo.Title
                                });
                
                                // Afficher l'info-bulle lorsque le marqueur est cliqué
                                marker.addListener('click', function() {
                                    infoWindow.open(map, marker);
                                });

                                gmarkers.push(marker);
                            }
                        }
                    });
                } else {
                    console.error('Aucun point de charge trouvé.');
                }
            })
            .catch(error => console.error('Erreur lors de la récupération des points de charge:', error));
    
    }

    // Activer le bouton cliqué (trajet/carte)
    function toggleActiveSlow(button) {

        for(i=0; i<gmarkers.length; i++){
            gmarkers[i].setMap(null);
        }

        // Désactiver 
        var buttons = document.querySelectorAll('.value');
        var form = document.getElementById('form-form');
        var calcBtn = document.getElementById('calc-btn');
        var googleMap = document.getElementById('googleMap');
        var filtre = document.getElementById('filtre-carte');
        var filtre2 = document.getElementById('filtre-carte2');
        form.classList.add('details-hidden')
        calcBtn.classList.add('details-hidden')
        //googleMap.classList.add('selected-carte')
        filtre.classList.remove('hidden-filtre')
        filtre2.classList.remove('hidden-filtre')
    
        buttons.forEach(function(btn) {
        btn.classList.remove('active');
        });
    
        // Activer 
        button.classList.add('active');
    
        var apiKey = '56fa6422-eeff-4be6-a733-92a29cb26fdd';
        var url = 'https://api.openchargemap.io/v3/poi/?output=json&countrycode=FR&maxresults=100000&key=' + apiKey;
        
        return fetch(url)
            .then(response => {
                return response.json();
            })
            .then(data => {
                // Assurez-vous que les données sont disponibles et qu'elles contiennent des points de charge
                if (data && data.length > 0) {
                    // Parcourir les points de charge
                    data.forEach(chargePoint => {
                        if (chargePoint.Connections && chargePoint.Connections.length > 0 && chargePoint.Connections[0].PowerKW !== undefined) {
                            // Accéder aux coordonnées de latitude et de longitude
                            var latitude = chargePoint.AddressInfo.Latitude;
                            var longitude = chargePoint.AddressInfo.Longitude;
                
                            // Vérifier si la puissance est supérieure à 43 kW (recharge rapide)
                            var powerKW = chargePoint.Connections[0].PowerKW;
                            if (powerKW < 43) {
                                // Déterminer la couleur du marqueur en fonction de la puissance
                                var markerColor = 'orange'; // Puissance supérieure à 43 kW
                
                                // Créer un marqueur pour chaque point de charge avec la couleur déterminée
                                var marker = new google.maps.Marker({
                                    position: { lat: latitude, lng: longitude },
                                    map: map,
                                    title: chargePoint.AddressInfo.Title,
                                    icon: {
                                        url: 'http://maps.google.com/mapfiles/ms/icons/' + markerColor + '-dot.png' // Utiliser une icône de couleur déterminée
                                    }
                                });

                                // Ajouter une info-bulle avec le titre du point de charge
                                var infoWindow = new google.maps.InfoWindow({
                                    content: chargePoint.AddressInfo.Title
                                });
                
                                // Afficher l'info-bulle lorsque le marqueur est cliqué
                                marker.addListener('click', function() {
                                    infoWindow.open(map, marker);
                                });

                            gmarkers.push(marker);

                            }
                        }
                    });
                } else {
                    console.error('Aucun point de charge trouvé.');
                }
            })
            .catch(error => console.error('Erreur lors de la récupération des points de charge:', error));
        
    }


    function toggleDetails(event) {
    var details = document.getElementById('details');
    var details1 = document.getElementById('navigation-options');

    if (!event.target.closest('.panel-body')) {
        details.classList.toggle('details-hidden');
        details1.classList.add('details-hidden'); // Fermer details1
    }
    }

    function toggleDetails1(event) {
        var details = document.getElementById('details');
        var details1 = document.getElementById('navigation-options');

        if (!event.target.closest('.panel-body')) {
            details1.classList.toggle('details-hidden');
            details.classList.add('details-hidden'); // Fermer details
        }
    }

    function preventClosing(event) {
        event.stopPropagation();
    }

    // Sélection de tous les éléments avec la classe "station"
    var stationElements = document.querySelectorAll('.station');

    // Ajout d'un gestionnaire d'événements à chaque élément station
    stationElements.forEach(function(element) {
        element.addEventListener('click', function() {
            // Supprimer la classe 'selected' de tous les éléments de la station
            stationElements.forEach(function(el) {
                el.classList.remove('selected');
            });

            // Ajouter la classe 'selected' à l'élément cliqué
            element.classList.add('selected');

            // Récupération de la valeur de l'attribut "value" de l'élément cliqué
            var chargeType = element.getAttribute('value');
            
            // Mettre à jour le contenu du textarea avec la valeur sélectionnée
         });
    });

    document.getElementById("calculer").addEventListener("click", () => calcRoute());