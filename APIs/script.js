// Carlos Gabriel García Guzmán

var puntosGuardados = []

const lat = document.getElementById('lat')
const lng = document.getElementById('lng')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

document.addEventListener('DOMContentLoaded', function() {  // Carga los puntos guardados en el localstorage
    puntosGuardados = JSON.parse(localStorage.getItem('cords') || [])  // Recupera el array guardado y si nno existe devulve uno vacio
    puntosGuardados.forEach( function(e) {
        let lat = e.substring(0, e.indexOf(",") - 1)  // Separa latitud y longitud
        let lng = e.substring(e.indexOf(",") + 2)
        
        anadirPunto(lat, lng)
    })
    dibujarEnCanvas()
})

const map = L.map('map').setView([40.4168, -3.7038], 13)  // Inicializa el mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

function coordenadas(latlng) {  // Escribe en pantalla las coordenadas actules del raton
    if (latlng != '')  {
        lat.innerHTML = 'Lat: ' + (latlng.lat)
        lng.innerHTML = 'Lng: ' + (latlng.lng)

    }  else  {
        lat.innerHTML = 'Lat: ' 
        lng.innerHTML = 'Lng: '
    }
}

function anadirPunto(lat, lng)  {  // Marca los puntos en el mapa
    L.marker([lat, lng]).addTo(map)
        .bindPopup(lat + ' , ' + lng)
}

function dibujarEnCanvas() {  // Dibuja en el canvas
    canvas.height = 30 + puntosGuardados.length * 20
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '14px Arial'
    ctx.fillStyle = 'black'

    puntosGuardados.forEach((punto, index) => {  // Escribe ls cordenadas de cada uno de los puntos
        ctx.fillText(punto, 10, 20 + index * 20)
    })
}

map.on('mousemove', function(e) {  // Listener de poner el raton
    coordenadas(e.latlng) 
})

map.on('mouseout', function() {  // Listener de quitar el raton
    coordenadas('')  // Vacia las coordenadas
})

map.on('click', function(e) {  // Listener del click
    var lat = e.latlng.lat
    var lng = e.latlng.lng

    puntosGuardados.push(lat + ' , ' + lng)
    localStorage.setItem('cords', JSON.stringify(puntosGuardados))
    anadirPunto(lat, lng)
    dibujarEnCanvas()
})
