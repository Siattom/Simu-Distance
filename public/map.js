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

    var gmarkers = [];

    var apiKey = '56fa6422-eeff-4be6-a733-92a29cb26fdd';
    var url = 'https://api.openchargemap.io/v3/poi/?output=json&countrycode=FR&maxresults=100000&key=' + apiKey;
    
    function toInitMap() {
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
    function toggleActive(button) {
    // Désactiver 
    
        for(i=0; i<gmarkers.length; i++){
            gmarkers[i].setMap(null);
        }
        var googleMap = document.getElementById('googleMap');
        //googleMap.classList.add('selected-carte')

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
        var googleMap = document.getElementById('googleMap');
        //googleMap.classList.add('selected-carte')
    
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

    toInitMap()