class producto {  // Objeto producto: guarda todos los datos del producto
    constructor(id, name, desc, precio, imagen) {
        this.id = id
        this.name = name
        this.desc = desc
        this.precio = precio
        this.imagen = imagen
    }
    toString() {  // Devuelve la informacion del producto formateado
        return `▪ Id Producto: ${this.id} <br>
                ▪ Nombre: ${this.name} <br>
                ▪ Precio: ${this.precio} <br>
                ▪ Descripción: ${this.desc}`
    }
}

const productos = []  // Array con todos los productos

const A = document.getElementById('Añadir')  
A.addEventListener('click', () => {  // Listener del boton "añadir producto" para desplegar el formulario
    FA.classList.add("visible")
})

const FA = document.getElementById('formularioAñadir')
FA.addEventListener('submit', (e) => {  // Listener del boton "añadir" para comprobar los datos y guardarlos
    e.preventDefault()  // Evita que se recarge la pagina
    const id = document.getElementById('id')
    const name = document.getElementById('name')
    const desc = document.getElementById('desc')
    const precio = document.getElementById('precio')
    const imagen = document.getElementById('imagen')
    let bool = true  // Se asegura que se comprueben todos los campos y si hay uno solo incorrecto no se crea el objeto

    const objetoEncontrado = productos.findIndex(producto => producto.id == id.value)
    if (objetoEncontrado != -1)  {  // El objeto existe
        document.getElementById('idError').textContent = "El ID del producto debe ser unico, no se puede repetir"  // Mesaje de ERROR
        id.style.backgroundColor = 'red'
        bool = false  // Evita que se cree el objeto
    } else if (id.value == '')  {
        document.getElementById('idError').textContent = "Este campo es obligatorio"  // Mesaje de ERROR
        id.style.backgroundColor = 'red'
        bool = false  // Evita que se cree el objeto
    } else {
        document.getElementById('idError').textContent = ""  // Eliminar el mensaje de error si el valor es correcto
        id.style.backgroundColor = 'transparent'
    }

    if (name.value == '')  {
        document.getElementById('nameError').textContent = "Este campo es obligatorio"  // Mesaje de ERROR
        name.style.backgroundColor = 'red'
        bool = false  // Evita que se cree el objeto
    } else {
        document.getElementById('nameError').textContent = ""  // Eliminar el mensaje de error si el valor es correcto
        name.style.backgroundColor = 'transparent'
    }

    if (precio.value == '')  {
        document.getElementById('precioError').textContent = "Este campo es obligatorio"  // Mesaje de ERROR
        precio.style.backgroundColor = 'red'
        bool = false  // Evita que se cree el objeto
    } else if (precio.value < 0)  {
        document.getElementById('precioError').textContent = "Debe ser un numero positivo"  // Mesaje de ERROR
        precio.style.backgroundColor = 'red'
        bool = false  // Evita que se cree el objeto
    } else {
        document.getElementById('precioError').textContent = ""  // Eliminar el mensaje de error si el valor es correcto
        precio.style.backgroundColor = 'transparent'
    }

    if (imagen.files.length === 0)  {
        document.getElementById('imagenError').textContent = "Este campo es obligatorio"  // Mesaje de ERROR
        imagen.style.backgroundColor = 'red'
        bool = false  // Evita que se cree el objeto
    } else {
        document.getElementById('imagenError').textContent = ""  // Eliminar el mensaje de error si el valor es correcto
        imagen.style.backgroundColor = 'transparent'
    }

    if (bool) {  // Si NO hay errores se crea el objeto, se guarda en el array y se crea la tarjeta
        const imageURL = URL.createObjectURL(imagen.files[0])  // De esta forma peermite usar la imagen subida por el usuario
        const p = new producto(id.value, name.value, desc.value, precio.value, imageURL)
        productos.push(p)

        crearTarjetas(p)
        FA.reset()  // Vacia el formulario
    }
})

const contenedor = document.getElementById('productos')

// Al usar target evitamos la sobrecarga de listener que se produce al asignar un listener a cada producto
contenedor.addEventListener('mouseover', (e) => {  // Al pasar el raton la imagen desaparece y sale el nombre
    const card = e.target.closest('.card')  // Busca el objeto con classe .card dentro del contenedor que cumpla el requisito
    if (!card) return  // Si esta en el contenedor pero no en una tarjeta se sale de la funcion

    const oculto = card.querySelector('.producto_oculto')
    const img = card.querySelector('.img_producto')
    
    oculto.style.opacity = 1
    oculto.style.transform = 'scale(1)'

    img.style.opacity = 0
    img.style.transform = 'scale(1)'
})

contenedor.addEventListener('mouseout', (e) => {  // Al quitar el raton la imagen vuelve y el nombre desaparece
    const card = e.target.closest('.card')  // Busca el objeto con classe .card dentro del contenedor que cumpla el requisito
    if (!card) return  // Si esta en el contenedor pero no en una tarjeta se sale de la funcion

    const oculto = card.querySelector('.producto_oculto')
    const img = card.querySelector('.img_producto')
    
    oculto.style.opacity = 0
    oculto.style.transform = 'scale(1)'

    img.style.opacity = 1
    img.style.transform = 'scale(1)'
})

contenedor.addEventListener('click', (e) => {  // Al hacer click sale la descripcion del producto, y si ya esta desplegada se oculta
    const card = e.target.closest('.card')  // Busca el objeto con classe .card dentro del contenedor que cumpla el requisito
    if (!card) return  // Si esta en el contenedor pero no en una tarjeta se sale de la funcion

    const id = card.dataset.id
    const productoEncontrado = productos.find(p => p.id == id)  // Busca el producto

    const detalles = card.querySelector('.detalles_producto')
    detalles.innerHTML = productoEncontrado.toString()  // Inserta los detalles con la funcion toString()

    if (detalles.style.display == 'block') {
        detalles.classList.remove('activo')
        setTimeout(() => detalles.style.display = 'none', 250)  // Espera hasta que acabe la animacion para ocultar los detallees
    } else {
        detalles.style.display = 'block'
        requestAnimationFrame(() => detalles.classList.add('activo')) // Espera un frame para ejecutar la animacion correctamente
    }
})

contenedor.addEventListener('contextmenu', (e) => {  // Al hacer click deerecho se elimina el objeto
    e.preventDefault()  // Evita que salga el contexmenu

    const card = e.target.closest('.card')  // Busca el objeto con classe .card dentro del contenedor que cumpla el requisito
    if (!card) return  // Si esta en el contenedor pero no en una tarjeta se sale de la funcion

    const id = card.dataset.id
    const productoEncontrado = productos.findIndex(p => p.id == id)  // Busca el producto por su id

    productos.splice(productoEncontrado, 1)  // Lo elimina del array

    // Animacion de desaparicion
    card.style.transition = "opacity .3s ease, transform .3s ease"
    card.style.opacity = "0"
    card.style.transform = "scale(.9)"

    setTimeout(() => { card.remove() }, 300)  // Espera que acabe la animacion y los elimina

    contador_de_productos(productos)  // Imprime el total de productos
})

function crearTarjetas(producto) {  // Crea la tarjeta de los productos
    // Si creamos el article con innerHTML los listener al aliminar uno de los productos deje de funcionar, por eso es mejor esta forma
    const card = document.createElement('article')  // De esta forma se crea de forma dinamica con la clase que queramos
    card.className = 'card'
    card.dataset.id = producto.id

    card.innerHTML = 
        `<div class="card-top">
            <img class="img_producto" src="${producto.imagen}" alt="Producto">
            <p class="producto_oculto">${producto.name}</p>
        </div>
        <p id="${producto.id}" class="detalles_producto"></p>`

    card.style.opacity = "0"  // Empieza invisible, para hacer una animacion de aparicion
    card.style.transform = "scale(.95)" 

    document.getElementById('productos').appendChild(card)  // Introduce la tarjeta en el div productos

    requestAnimationFrame(() => {  // Animacion de aparicion, espera un frame para que la animacion se ejecute correctamente
        card.style.transition = "opacity .35s ease, transform .35s ease"
        card.style.opacity = "1"
        card.style.transform = "scale(1)"
    })

    contador_de_productos(productos)  // Imprime el total de productos
}

function contador_de_productos(productos)  {  // Cuenta e imprime el total de productos
    const contador = document.getElementById('contador')
    const num = productos.length
    contador.innerHTML = `El total de productos es: ${num}`
}