var bouton = document.getElementById('calculer');
var origine = document.getElementById("from");

bouton.addEventListener('click', function(){
    var destination = document.getElementById("to").value;
    var formattedDestination = destination.replace(' ', '_');
    
    var url = '/new/itineraire';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destination: formattedDestination })
    })
    .then(response => {
        return response.json()
    })
    .then(data => {
        // Process and display charging points on the map
        console.log(data)
    })
    .catch(error => console.error('Vous êtes déconnecté', error));
});

var position = document.getElementById('maPosition');
position.addEventListener('click', function(){

    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    };
    
    function success(pos) {
        const crd = pos.coords;
      
        console.log("Your current position is:");
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);

        // Appel à l'API de géocodage
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${crd.latitude},${crd.longitude}&key=AIzaSyBZeMfqzI4a7F3nsoRrGOWGXQC_qAOzshY`)
            .then(response => response.json())
            .then(data => {
                // Récupérer l'adresse à partir de la réponse de l'API
                const address = data.results[0].formatted_address;
                console.log(`Votre adresse actuelle : ${address}`);
                origine.value = address;
            })
            .catch(error => console.error('Erreur lors de la récupération de l\'adresse :', error));
    }
      
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
            
    navigator.geolocation.getCurrentPosition(success, error, options);
});

var mesItineraires = document.getElementById('mesIti');
if(mesItineraires){
    mesItineraires.addEventListener('click', function(){
        var destination = document.getElementById('to');
        destination.value = mesItineraires.value
    }) 
}