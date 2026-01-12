class producto {  // Objeto producto: guarda todos los datos del producto
    constructor(id, name, desc, precio, imagen) {
        this.id = id
        this.name = name
        this.desc = desc
        this.precio = precio
        this.imagen = imagen
    }
    toString() {  // Devuelve la informacion del producto formateado
        return `▪ <b>Id Producto:</b> ${this.id} <br>
                ▪ <b>Nombre:</b> ${this.name} <br>
                ▪ <b>Precio:</b> ${this.precio} €<br>
                ▪ <b>Descripción:</b> ${this.desc}`
    }
}

const productos = []  // Array con todos los productos

const DOM = {  // Array con las variables del DOM
    // Variables del formulario
    id: document.getElementById('id'),
    nombre: document.getElementById('name'),
    desc: document.getElementById('desc'),
    precio: document.getElementById('precio'),
    imagen: document.getElementById('imagen'),

    // Botones, formulario, mensaje
    form: document.getElementById('formularioAñadir'),
    botonFormulario: document.getElementById('Añadir'),
    botonSubmit: document.getElementById('añadirProducto'),
    mensaje: document.getElementById('mensaje')
}

const Validators = {  // Array con las diferentes expreciones a validar en el formulario
    noVacio: (val) => !val || val.trim() === "",
    noDuplicado: (val, lista) => lista.some(p => p.id == val),
    numValido: (val) => val === "" || isNaN(val) || Number(val) < 0
}

function validacionFormulario() {  // Comprueba que los datos del formulario sean validos
    return [
        {
            campo: DOM.id,
            errorID: 'idError',
            rules: [
                { check: () => Validators.noVacio(DOM.id.value), msg: 'Campo obligatorio' },
                { check: () => Validators.noDuplicado(DOM.id.value, productos), msg: 'ID duplicado' }
            ]
        },
        {
            campo: DOM.nombre,
            errorID: 'nameError',
            rules: [
                { check: () => Validators.noVacio(DOM.nombre.value), msg: 'Campo obligatorio' }
            ]
        },
        {
            campo: DOM.precio,
            errorID: 'precioError',
            rules: [
                { check: () => Validators.numValido(DOM.precio.value), msg: 'Precio inválido o negativo' }
            ]
        },
        {
            campo: DOM.imagen,
            errorID: 'imagenError',
            rules: [
                { check: () => Validators.noVacio(DOM.imagen.value), msg: 'Debes pegar una URL de imagen' }
            ]
        }
    ]
}

function promesaGuardar(datos) {  // Cuando se guarda un producto tiene un retraso de 2 seg
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await fetch('api.php?action=guardar', {  // Espera una respuesta del servidor
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                })
                const server = await response.json()  // Respuesta del servidor
                if (server.success) { resolve(server.message) }  // Si la respuesta es afirmativa resolve
                else { reject(server.error) }

            } catch (error) {
                reject("Error al conectar con el servidor")
            }
            
        }, 2000) // 2 segundos de espera
    })
}

function promesaBorrar(id) {  // Cuando se borra un producto tiene un retraso de 1.5 seg
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await fetch(`api.php?action=borrar&id=${id}`)  // Espera una respuesta del servidor

                const server = await response.json()  // Respuesta del servidor
                if (server.success) resolve("Producto eliminado")  // Si la respuesta es afirmativa resolve
                else reject(server.error)

            } catch (error) {
                reject("Error al conectar con el servidor")
            }
        }, 1500) // 1.5 segundos de espera
    })  
}

// ---------------------------------------- Listeners ---------------------------------------- //

DOM.botonFormulario.addEventListener('click', () => {  // Boton que despliega el formulario
    const visible = DOM.form.classList.toggle("visible")  // Si no tiene la clase visible se la pone, si la tiene se la quita
    if (visible) {  // Cambia el texto del boton. Si se la pone es 'TRUE', si se la quita es 'FALSE'
        DOM.botonFormulario.textContent = "Ocultar formulario";
    } else {
        DOM.botonFormulario.textContent = "Añadir producto";
    }
})

DOM.form.addEventListener('submit', async (e) => {
    e.preventDefault()  // Evita que se recarge la pagina

    let bool = true  // Se asegura que se comprueben todos los campos y si hay uno solo incorrecto no se crea el objeto
    const validar = validacionFormulario()

    validar.forEach(input => {  // Comprueba cada campo de la tabla segun las reglas que definimos antes
        limpiar(input.campo, input.errorID)
        for (let rule of input.rules) {
            if (rule.check()) {  // Si no cumple alguna regla se ejecuta
                error(input.campo, input.errorID, rule.msg)  // Imprime el error en el campo correspondiente
                bool = false
                break  // Si hay algun fallo se sale del bucle for
            }
        }
    })

    if (!bool) return  // Si hay fallos no se crea el objeto

    DOM.botonSubmit.disabled = true
    DOM.mensaje.style.color = 'white'
    DOM.mensaje.textContent = "Guardando producto..."

    const p = {
        id: DOM.id.value,
        name: DOM.nombre.value,
        desc: DOM.desc.value,
        precio: DOM.precio.value,
        imagen: DOM.imagen.value.trim()
    }

    try {
        await validarImagen(p.imagen)  // Espera que se valide la imagen
        
        const mensaje = await promesaGuardar(p)  // Espera a que se guarde en la BD

        // Si todo ha salido bien se crea el objeto, lo guarda en un array y lo imprime por pantalla
        const nuevoProducto = new producto(p.id, p.name, p.desc, p.precio, p.imagen)
        productos.push(nuevoProducto)
        crearTarjetas(nuevoProducto)
        
        DOM.form.reset()  // Vacia el formulario
        validar.forEach(input => limpiar(input.campo, input.errorID))  // Borra los errores que salen en pantalla
        DOM.mensaje.style.color = '#2ec4c6'
        DOM.mensaje.textContent = mensaje  // Imprime el mensaje de guardado
    } 
    catch (error) {
        DOM.mensaje.style.color = '#ff6b6b'
        DOM.mensaje.textContent = error
    } 
    finally {
        DOM.botonSubmit.disabled = false
        contadorProductos(productos)  // Contabilisa los productos
    }
})

const contenedor = document.getElementById('productos')

// Al usar target evitamos la sobrecarga de listener que se produce al asignar un listener a cada producto
contenedor.addEventListener('mouseover', (e) => {  // Al pasar el raton la imagen desaparece y sale el nombre
    const card = e.target.closest('.card')  // Busca el objeto con clase .card dentro del contenedor que cumpla el requisito
    if (card) {  // Si esta en el contenedor pero no en una tarjeta no se ejecuta
        card.querySelector('.producto_oculto').style.opacity = 1
        card.querySelector('.img_producto').style.opacity = 0
    }
})

contenedor.addEventListener('mouseout', (e) => {  // Al quitar el raton la imagen vuelve y el nombre desaparece
    const card = e.target.closest('.card')  // Busca el objeto con classe .card dentro del contenedor que cumpla el requisito
    if (card) {  // Si esta en el contenedor pero no en una tarjeta no se ejecuta
        card.querySelector('.producto_oculto').style.opacity = 0
        card.querySelector('.img_producto').style.opacity = 1
    }
})

contenedor.addEventListener('click', (e) => {  // Al hacer click sale la descripcion del producto, y si ya esta desplegada se oculta
    const card = e.target.closest('.card')  // Busca el objeto con classe .card dentro del contenedor que cumpla el requisito
    if (!card) return  // Si esta en el contenedor pero no en una tarjeta se sale de la funcion

    const id = card.dataset.id
    const productoEncontrado = productos.find(p => p.id == id)  // Busca el producto
    
    const detalles = card.querySelector('.detalles_producto')
    if (productoEncontrado) {
        detalles.innerHTML = productoEncontrado.toString()
    } else { 
        detalles.innerHTML = "Información no disponible" 
    } 

    if (detalles.style.display === 'block') {
        detalles.classList.remove('activo')
        setTimeout(() => detalles.style.display = 'none', 250)  // Espera hasta que acabe la animacion para ocultar los detallees
    } else {
        detalles.style.display = 'block'
        requestAnimationFrame(() => detalles.classList.add('activo'))  // Espera un frame para ejecutar la animacion correctamente
    }
})

contenedor.addEventListener('contextmenu', async (e) => {  // Al hacer click derecho se elimina el objeto
    e.preventDefault()  // Evita que salga el contexmenu

    const card = e.target.closest('.card')
    if (!card) return  // Si esta en el contenedor pero no en una tarjeta se sale de la funcion

    const id = card.dataset.id
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return  // Sale una pestaña de confirmacion antes de borrar el producto

    card.classList.add('eliminando')
    DOM.mensaje.style.color = "white"
    DOM.mensaje.textContent = "Eliminando..."

    try {
        await promesaBorrar(id)  // Espera que se elimine el producto de la BD

        const productoEncontrado = productos.findIndex(p => p.id == id)
        productos.splice(productoEncontrado, 1)

        card.style.transition = "opacity .3s ease, transform .3s ease"
        card.style.opacity = "0"
        card.style.transform = "scale(.9)"

        setTimeout(() => { card.remove() }, 300)  // Espera que acabe la animacion y los elimina
        contadorProductos(productos)  // Imprime el total de productos

        DOM.mensaje.style.color = '#2ec4c6'
        DOM.mensaje.textContent = "Producto eliminado correctamente"

    } catch (error) {
        card.classList.remove('eliminando')
        
        alert(error)
    }
})

function crearTarjetas(producto) {  // Crea la tarjeta de los productos
    // Si creamos el article con innerHTML los listener al aliminar uno de los productos deje de funcionar, por eso es mejor esta forma
    const card = document.createElement('article')  // De esta forma se crea de forma dinamica con la clase que queramos
    card.className = 'card'
    card.dataset.id = producto.id

    card.innerHTML = `
        <div class="card-top">
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

    contadorProductos(productos)  // Imprime el total de productos
}

function error(campo, spanId, mensaje) {
    document.getElementById(spanId).textContent = mensaje  // Mesaje de ERROR
    campo.classList.add('input-error') 
}

function limpiar(campo, spanId) {
    document.getElementById(spanId).textContent = ""  // Eliminar el mensaje de error si el valor es correcto
    campo.classList.remove('input-error')
}

function contadorProductos(productos) {
    document.getElementById('contador').innerHTML = `Total productos en catálogo: ${productos.length}`
}

function validarImagen(url) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => reject(false)
        img.src = url
    })
}

document.addEventListener('DOMContentLoaded', cargarProductos)  // Se ejecuta al abrir la pagina
async function cargarProductos() {  // Crea las tarjetas de los productos guardados en la base de datos
    try {
        const response = await fetch('api.php?action=listar')  // Espera la respuesta del servidor
        const server = await response.json()
        if (server.success) {  // Si la respuesta es correcta se ejecuta
            server.data.forEach(productoBD => {
                const p = new producto(productoBD.id, productoBD.name, productoBD.desc, productoBD.precio, productoBD.imagen)
                productos.push(p)
                crearTarjetas(p)
            })
            contadorProductos(productos)
        }
    } catch (error) {
        DOM.mensaje.style.color = '#ff6b6b'
        DOM.mensaje.textContent = error
    }
}