var friwigo = document.getElementById('friwigo')
friwigo.addEventListener('click', function() {
    window.location.href = '/user/friwigo'
})

var compte = document.getElementById('compte')
compte.addEventListener('click', function(){
    window.location.href = '/user/perso'
})

var mapmap = document.getElementById('mapmap')
mapmap.addEventListener('click', function() {
    window.location.href = '/'
})

var toCalc = document.getElementById('toCalc')
toCalc.addEventListener('click', function(){
    window.location.href = '/calc'
})

var actu = document.getElementById('actu')
actu.addEventListener('click', function(){
    window.location.href = '/actualite'
})

var infosPerso = document.getElementById('show-perso');
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

var lock = document.getElementById('show-lock');
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