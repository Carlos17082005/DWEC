class API_Server { 
    constructor() {
        this.db = [] 
    }

    guardarProducto(producto) {
        const guardar = new Promise((resolve, reject) => {
            setTimeout(() => {
                const existe = this.db.find(p => p.id == producto.id)
                if (existe) {
                    reject("Error: El ID ya esta registrado en el sevidor")
                } else {
                    this.db.push({...producto}) 
                    resolve("Producto guardado con exito")
                }
            }, 2000)
        })
        return guardar
    }

    borrarProducto(id) {
        const borrar =  new Promise((resolve, reject) => {
            setTimeout(() => {
                const fallo = Math.random() < 0.10  // Fallo aleatorio
                if (fallo) {
                    reject("Fallo al borrar el producto")
                    return  // No ejecuta lo siguiente
                }
                const idProducto = this.db.findIndex(p => p.id == id)
                if (idProducto == -1) {
                    reject("Producto no encontrado")
                } else {
                    this.db.splice(idProducto, 1)
                    resolve("Producto borrado con exito")
                }
            }, 1500)
        })
        return borrar
    }
}

window.API = new API_Server()  // Variable global
