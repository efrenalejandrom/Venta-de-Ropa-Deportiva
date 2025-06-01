// --- funciones.js ---

// Recuperar carrito del localStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Función para agregar producto al carrito
function agregarAlCarrito(nombre, precio, imagen) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario || !usuario.nombre) {
        alert('Debes iniciar sesión o registrarte para agregar productos al carrito.');
        window.location.href = 'login.html';
        return;
    }

    carrito.push({nombre, precio, imagen});
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContador();
    mostrarToast("Producto agregado al carrito");
}

// Función para actualizar contador del carrito
function actualizarContador() {
    document.getElementById('contador-carrito').innerText = carrito.length;
}


function mostrarCarrito() {
    const lista = document.getElementById('lista-carrito');
    lista.innerHTML = '';

    const btnPagar = document.getElementById('pagar');
const volverMenu = document.getElementById('volver-menu');

if (carrito.length === 0) {
    lista.innerHTML = `
        <p style="text-align: center; font-weight: bold; color: gray; margin-top: 40px;">
            🛒 Tu carrito está vacío
        </p>
    `;

    // Botón "Volver al menú"
    if (volverMenu) volverMenu.style.display = 'block';

    // Cambiar estilo del botón de pago a rojo
    if (btnPagar) {
        btnPagar.style.backgroundColor = 'crimson';
        btnPagar.style.color = 'white';
    }

    return;
} else {
    // Si hay productos, volver a color verde
    if (btnPagar) {
        btnPagar.style.backgroundColor = '#00695c'; // verde esmeralda u otro verde que uses
        btnPagar.style.color = 'white';
    }

    if (volverMenu) volverMenu.style.display = 'none';
}

    carrito.forEach((producto, index) => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.marginBottom = '10px';
        item.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;">
            <div style="flex-grow: 1;">
                <strong>${producto.nombre}</strong> - $${producto.precio} MXN
            </div>
            <button onclick="eliminarProducto(${index})">Eliminar</button>
        `;
        lista.appendChild(item);
    });
}



// Función para eliminar un producto del carrito
function eliminarProducto(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
    actualizarContador();
}

function vaciarCarrito() {
    carrito = [];
    localStorage.removeItem('carrito'); // Borra del navegador
    mostrarCarrito(); // Vuelve a pintar el carrito vacío
    actualizarContador(); // Actualiza el número en el icono
}


// Función para registrar usuario
function registrarUsuario(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    const confirmar = document.getElementById('confirmar').value;

    if (password !== confirmar) {
        alert('Las contraseñas no coinciden');
        return;
    }

    localStorage.setItem('usuario', JSON.stringify({ nombre, correo, password }));
    mostrarToast('Usuario registrado correctamente');

    // Redirige automáticamente después de 2.5 segundos
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2500);
    
}

// Función para iniciar sesión
function iniciarSesion(event) {
    event.preventDefault();
    const correo = document.getElementById('correoLogin').value;
    const password = document.getElementById('passwordLogin').value;
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (usuario && usuario.correo === correo && usuario.password === password) {
        mostrarToast('Inicio de sesión exitoso');

// Redirige automáticamente después de 2.5 segundos
setTimeout(() => {
    window.location.href = 'index.html';
}, 2500);

    } else {
        mostrarToast('Correo o contraseña incorrectos');

    }
}

// Mostrar carrito al cargar la página si existe
if (document.getElementById('lista-carrito')) {
    mostrarCarrito();
}

// ------- AGREGADO PARA CAMBIO DE IMÁGENES EN CADA PLAYERA ---------

// Función para cambiar imagen (izquierda o derecha)
function cambiarImagen(boton, direccion) {
    const producto = boton.closest('.producto');
    const imagen = producto.querySelector('img');
    const imagenes = JSON.parse(imagen.getAttribute('data-imagenes'));

    // Si no tiene índice actual, inicializarlo
    if (!imagen.hasAttribute('data-indice')) {
        imagen.setAttribute('data-indice', 0);
    }

    let indiceActual = parseInt(imagen.getAttribute('data-indice'));
    let nuevoIndice = indiceActual + direccion;

    // Validar el rango de imágenes
    if (nuevoIndice < 0) {
        nuevoIndice = imagenes.length - 1;
    } else if (nuevoIndice >= imagenes.length) {
        nuevoIndice = 0;
    }

    imagen.setAttribute('src', imagenes[nuevoIndice]);
    imagen.setAttribute('data-indice', nuevoIndice);
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    mostrarToast('Sesión cerrada con éxito');

// Redirige después de 2.5 segundos
setTimeout(() => {
    location.reload(); // o window.location.href = 'index.html';
}, 2500);

}

window.onload = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const cerrarBtn = document.getElementById('cerrar-sesion');

    if (usuario && usuario.nombre) {
        cerrarBtn.style.display = 'inline-block';

        // Ocultar Registro/Login del menú
        const menu = document.getElementById('menu-usuario');
        menu.innerHTML = `
            <li><a href="index.html">Inicio</a></li>
            <li><a href="carrito.html">Carrito (<span id="contador-carrito">0</span>)</a></li>
        `;
    }

    if (document.getElementById('lista-carrito')) {
        mostrarCarrito();
    }

    actualizarContador();
}
function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    toast.innerText = mensaje;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // Se oculta en 3 segundos
}




// --- Eventos del carrito --- //
window.addEventListener('DOMContentLoaded', () => {
    const btnVaciar = document.getElementById('vaciar-carrito');
    const btnPagar = document.getElementById('pagar');
    const volverMenu = document.getElementById('volver-menu');

    if (btnVaciar && btnPagar && volverMenu) {
        const carritoLocal = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carritoLocal.length === 0) {
            btnVaciar.style.display = 'none';
            btnPagar.style.display = 'none';
            volverMenu.style.display = 'block';
        }

        btnVaciar.addEventListener('click', () => {
            vaciarCarrito();
            btnVaciar.style.display = 'none';
            btnPagar.style.display = 'none';
            volverMenu.style.display = 'block';
            mostrarToast('Carrito vacío');
        });

        btnPagar.addEventListener('click', () => {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            if (carrito.length === 0) {
                mostrarToast('El carrito está vacío. Agrega productos antes de pagar.');
                return;
            }
            window.location.href = 'pago.html';
        });
    }

    if (document.getElementById('lista-carrito')) {
        mostrarCarrito();
    }
});


// Autocompletar la barra (/) en campo MM/AA
document.addEventListener('DOMContentLoaded', () => {
    const campoFecha = document.getElementById('fecha-expiracion');

    if (campoFecha) {
        campoFecha.addEventListener('input', (e) => {
            let valor = e.target.value;

            // Agrega "/" después de 2 dígitos
            if (valor.length === 2 && !valor.includes('/')) {
                e.target.value = valor + '/';
            }

            // Limitar a 5 caracteres (MM/AA)
            if (valor.length > 5) {
                e.target.value = valor.slice(0, 5);
            }
        });
    }
});