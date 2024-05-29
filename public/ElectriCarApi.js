// Variable globale pour stocker la marque sélectionnée
var marqueSelect = '';
var modelSelect = '';
var vehicule = '';

// Sélection du sélecteur et de l'input
var selectModel = document.getElementById('model-api');
var inputModel = document.getElementById('model-info');

function displayBrand() {
    var apiKey = 'jksdhcksdbcvksdjcqncsjkhsqgdfbx';
    //var apiKey = 'code';
    var url = 'https://electricarapi.automiles.fr/api/list/mar/' + apiKey;
    //var url = 'http://localhost:8080/api/list/mar/' + apiKey;

    return fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Sélection du sélecteur et de l'input
            var selectElement = document.getElementById('electric-api');
            var inputElement = document.getElementById('additional-info');

            // Boucle à travers les marques et ajoute les options au sélecteur
            data.marques.forEach(brand => {
                var option = document.createElement('option');
                option.value = brand; // La valeur et le texte de l'option seront la même pour chaque marque
                option.textContent = brand;
                selectElement.appendChild(option);
            });

            // Événement de changement de sélection
            selectElement.addEventListener('change', function(event) {
                marqueSelect = event.target.value; // Mettre à jour la variable avec la marque sélectionnée
                inputElement.value = marqueSelect;
                displayModel();
            });

            // Événement de clic sur une option du sélecteur
            selectElement.addEventListener('click', function(event) {
                if (event.target.tagName === 'OPTION') {
                    marqueSelect = event.target.value; // Mettre à jour la variable avec la marque sélectionnée
                    inputElement.value = marqueSelect;
                    displayModel()
                }
                selectModel.innerHTML = '';
            });

            // Événement de saisie dans l'input
            inputElement.addEventListener('input', function(event) {
                // Vérifier si la touche pressée est la touche "Supprimer" (Delete)
                if (event.inputType === 'deleteContentBackward') {
                    return; // Sortir de la fonction sans effectuer de recherche
                }

                var searchString = event.target.value;

                // Envoyer une requête à l'API avec la chaîne de recherche actuelle
                fetch(`https://electricarapi.automiles.fr/api/mar/rech/${apiKey}/${searchString}`)
                //fetch(`http://localhost:8080/api/mar/rech/${apiKey}/${searchString}`)
                    .then(response => {
                        // Vérifier le type de contenu de la réponse
                        if (!response.ok || response.headers.get('Content-Type') !== 'application/json') {
                            throw new Error('Le format de la réponse de l\'API n\'est pas valide.');
                        }
                        return response.json();
                    })
                    .then(result => {
                        // Vérifier si la réponse contient la propriété 'marques'
                        if (!result || !result.marques || !Array.isArray(result.marques)) {
                            throw new Error('Le format de la réponse de l\'API n\'est pas valide.');
                        }
                        // Vider les options précédentes du select
                        selectElement.innerHTML = '';
                        // Ajouter les options en fonction des résultats de la recherche
                        result.marques.forEach(brand => {
                            var option = document.createElement('option');
                            option.value = brand; // La valeur et le texte de l'option seront la même pour chaque marque
                            option.textContent = brand;
                            selectElement.appendChild(option);
                        });

                        // Mettre à jour l'input avec la marque sélectionnée si elle est unique
                        if (result.marques.length === 1) {
                            selectModel.innerHTML = '';
                            inputElement.value = result.marques[0];
                            marqueSelect = event.target.value; // Mettre à jour la variable avec la marque sélectionnée
                            
                            displayModel()
                        }
                    })
                    .catch(error => console.error('Erreur lors de la recherche :', error));
            });

        })
        .catch(error => console.error('Soucis de connexion à l\'Api:', error));
}



function displayModel() {
    var apiKey = 'jksdhcksdbcvksdjcqncsjkhsqgdfbx';
    //var apiKey = 'code';
    if (!marqueSelect){
        var url = 'https://electricarapi.automiles.fr/api/list/tout/voi/' + apiKey ;
        //var url = 'http://localhost:8080/api/list/tout/voi/' + apiKey ;
    } else {
        var url = 'https://electricarapi.automiles.fr/api/list/voi/par/mar/' + apiKey + '/' + marqueSelect ;
        //var url = 'http://localhost:8080/api/list/voi/par/mar/' + apiKey + '/' + marqueSelect ;
    }

    return fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {

    // Ajouter l'option "option" en premier
    var optionDefault = document.createElement('option');
    optionDefault.value = 'option';
    optionDefault.textContent = '--Sélectionnez votre modèle--';
    selectModel.appendChild(optionDefault);

    // Boucle à travers les marques et ajoute les options au sélecteur
    data.voitures.forEach(brand => {
        var option = document.createElement('option');
        option.value = brand.modele; // La valeur et le texte de l'option seront la même pour chaque marque
        option.textContent = brand.modele;
        selectModel.appendChild(option);
    });

    // Événement de clic sur une option du sélecteur
    selectModel.addEventListener('click', function(event) {
        if (event.target.tagName === 'OPTION') {
            modelSelect = event.target.value; // Mettre à jour la variable avec la marque sélectionnée
            inputElement.value = modelSelect;
        }
    });


            // Événement de changement de sélection
            selectModel.addEventListener('change', function(event) {
                // Récupérer la valeur du modèle sélectionné
                modelSelect = event.target.value;

                // Trouver l'objet correspondant dans les données
                var selectedCar = data.voitures.find(car => car.modele === modelSelect);
                
                // Vérifier si l'objet a été trouvé
                if (selectedCar) {
                    // Récupérer l'ID de la voiture sélectionnée
                    var selectedCarId = selectedCar.id;
                    recoverCar(selectedCarId)
                    // Vous pouvez utiliser selectedCarId comme nécessaire dans votre application
                }

                // Mettre à jour la valeur de l'input
                inputModel.value = modelSelect;
            });

            // Événement de saisie dans l'input
                inputModel.addEventListener('input', function(event) {
                // Vérifier si la touche pressée est la touche "Supprimer" (Delete)
                if (event.inputType === 'deleteContentBackward') {
                    return; // Sortir de la fonction sans effectuer de recherche
                }

                var searchModel = event.target.value;

                // Envoyer une requête à l'API avec la chaîne de recherche actuelle
                fetch(`https://electricarapi.automiles.fr/api/list/voi/par/mod/${apiKey}/${searchModel}`)
                //fetch(`http://localhost:8080/api/list/voi/par/mod/${apiKey}/${searchModel}`)
                    .then(response => {
                        // Vérifier le type de contenu de la réponse
                        if (!response.ok || response.headers.get('Content-Type') !== 'application/json') {
                            throw new Error('Le format de la réponse de l\'API n\'est pas valide.');
                        }
                        return response.json();
                    })
                    .then(result => {
                        // Vérifier si la réponse contient la propriété 'marques'
                        if (!result || !result.voitures || !Array.isArray(result.voitures)) {
                            throw new Error('Le format de la réponse de l\'API n\'est pas valide.');
                        }
                        // Vider les options précédentes du select
                        selectModel.innerHTML = '';
                        // Ajouter les options en fonction des résultats de la recherche
                        result.voitures.forEach(brand => {
                            // Vérifier si la touche pressée est la touche "Supprimer" (Delete)
                            if (event.inputType === 'deleteContentBackward') {
                                return; // Sortir de la fonction sans effectuer de recherche
                            }
                            var option = document.createElement('option');
                            option.value = brand.modele; // La valeur et le texte de l'option seront la même pour chaque marque
                            option.textContent = brand.modele;
                            selectModel.appendChild(option);
                            if (result.voitures.length === 1) {
                                selectModel.innerHTML = ''; // Vider les options précédentes du select
                                inputModel.value = result.voitures[0].modele; // Mettre à jour la valeur de l'input avec le modèle sélectionné
                                
                                // Récupérer l'ID de la voiture sélectionnée
                                var selectedCarId = result.voitures[0].id;
                                
                                // Appeler la fonction pour récupérer les détails de la voiture
                                recoverCar(selectedCarId);
                            }
                            
                        });
                    })
                    .catch(error => console.error('Erreur lors de la recherche :', error));
            });
        })
        .catch(error => console.error('Soucis de connexion à l\'Api:', error));
}

function recoverCar(selectedCarId) {
    var apiKey = 'jksdhcksdbcvksdjcqncsjkhsqgdfbx';
    //var apiKey = 'code';
    var url = 'https://electricarapi.automiles.fr/api/info/voit/' + apiKey + '/' + selectedCarId;
    //var url = 'http://localhost:8080/api/info/voit/' + apiKey + '/' + selectedCarId;

    return fetch(url)
    .then(response => {
        return response.json()
    })
    .then(data => {
        vehicule = data.voitures; // Supposons que data.voitures contient un seul objet
        document.getElementById('conso').value = vehicule.consommation;
        document.getElementById('battery').value = vehicule.capaciteBatterie;
        document.getElementById('capaChargeCar').value = vehicule.puissanceDc;
    })
    .catch(error => console.error('soucis de récupération du véhicule', error));
}

var calculer = document.getElementById('calculer');
calculer.addEventListener('click', function(){
    var favori = document.getElementById('sauvegarde');
    //console.log(vehicule)
    if(favori.checked == true){
        // Envoi des données de vehicule au backend Symfony
        return fetch('/add/vehic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehicule)
        });
    }
})

// Appelez la fonction pour charger les marques au chargement de la page
displayBrand();
displayModel();