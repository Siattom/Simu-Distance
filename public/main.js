var friwigo = document.getElementById('friwigo')
if(friwigo){
    friwigo.addEventListener('click', function() {
        window.location.href = '/user/friwigo'
    })
}

var Mobilfriwigo = document.getElementById('Mobilfriwigo')
if(Mobilfriwigo){
    Mobilfriwigo.addEventListener('click', function() {
        window.location.href = '/user/friwigo'
    })
}

var compte = document.getElementById('compte')
if(compte){
    compte.addEventListener('click', function(){
        window.location.href = '/user/perso'
    })
}

var Mobilcompte = document.getElementById('Mobilcompte')
if(Mobilcompte){
    Mobilcompte.addEventListener('click', function(){
        window.location.href = '/user/perso'
    })
}

var mapmap = document.getElementById('mapmap')
if(mapmap){
    mapmap.addEventListener('click', function() {
        window.location.href = '/map'
    })
}

var Mobilmapmap = document.getElementById('Mobilmapmap')
if(Mobilmapmap){
    Mobilmapmap.addEventListener('click', function() {
        window.location.href = '/map'
    })
}

var toCalc = document.getElementById('toCalc')
if(toCalc){
    toCalc.addEventListener('click', function(){
        window.location.href = '/'
    })
}

var MobiltoCalc = document.getElementById('MobiltoCalc')
if(MobiltoCalc){
    MobiltoCalc.addEventListener('click', function(){
        window.location.href = '/'
    })
}

var actu = document.getElementById('actu')
if(actu){
    actu.addEventListener('click', function(){
        window.location.href = '/actualite'
    })
}

var Mobilactu = document.getElementById('Mobilactu')
if(Mobilactu){
    Mobilactu.addEventListener('click', function(){
        window.location.href = '/actualite'
    })
}

var admin = document.getElementById('admin');
if(admin){
    admin.addEventListener('click', function() {
        window.location.href = '/admin/articles'
    })
}

var Mobiladmin = document.getElementById('Mobiladmin');
if(Mobiladmin){
    Mobiladmin.addEventListener('click', function() {
        window.location.href = '/admin/articles'
    })
}

var infosPerso = document.getElementById('show-perso');
if(infosPerso){
    infosPerso.addEventListener('click', function() {
        var trHiddenPerso = document.querySelectorAll('.thp');
        trHiddenPerso.forEach(function(element) {
            if(element.classList == 'thp tr-hidden-perso'){
                element.classList.remove('tr-hidden-perso');
            } else {
                element.classList.add('tr-hidden-perso')
            }
        });
    });
}

var infosIti = document.getElementById('show-iti');
if(infosIti){
    infosIti.addEventListener('click', function() {
        var trHiddenPerso = document.querySelectorAll('.thi');
        trHiddenPerso.forEach(function(element) {
            if(element.classList == 'thi tr-hidden-iti'){
                element.classList.remove('tr-hidden-iti');
            } else {
                element.classList.add('tr-hidden-iti')
            }
        });
    });
}

var slides = document.querySelectorAll('.slide');
if(slides.length > 0){

    var currentSlide = 0;
    
    function showSlide(index) {
        // Masquer toutes les images
        slides.forEach(function(slide) {
        slide.style.opacity = 0;
        slide.style.display = 'none';
    });

    // Afficher l'image correspondant à l'index avec une transition
    slides[index].style.display = 'block';
    setTimeout(function() {
        slides[index].style.opacity = 1;
    }, 10); // Ajouter un léger délai pour que la transition soit visible
}

function nextSlide() {
    currentSlide++;
    if (currentSlide >= slides.length) {
        currentSlide = 0; // Revenir au début si on atteint la fin
    }
    showSlide(currentSlide);
}

// Afficher la première image au chargement de la page
showSlide(currentSlide);

// Définir l'intervalle pour passer à la prochaine image toutes les 3 secondes
setInterval(nextSlide, 5000);
}

var lock = document.getElementById('show-lock');
if(lock){
    lock.addEventListener('click', function() {
        var trHiddenPerso = document.querySelectorAll('.thl');
        trHiddenPerso.forEach(function(element) {
            if(element.classList == 'thl tr-hidden-lock'){
                element.classList.remove('tr-hidden-lock');
            } else {
                element.classList.add('tr-hidden-lock')
            }
        });
    });
}

//user_password_first
//user_password_second
var eyes = document.getElementById('eyes-psw');
if (eyes) {
    var userPassword = document.getElementById('user_password_first');
    var passwordVerif = document.getElementById('user_password_second');

    eyes.addEventListener('click', function () {
        if (userPassword.type === 'password') {
            userPassword.type = 'text';
            passwordVerif.type = 'text';
        } else {
            userPassword.type = 'password';
            passwordVerif.type = 'password';
        }
    });
}

var toSee = document.getElementById('toSee');
if(toSee){
    toSee.addEventListener('click', function(){
        window.location.href = '/logo'
    })
}

var MobilToSee = document.getElementById('MobiltoSee');
if(MobilToSee){
    MobilToSee.addEventListener('click', function(){
        window.location.href = '/logo'
    })
}