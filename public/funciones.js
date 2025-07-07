const BASE_URL = 'http://18.119.93.126:3000';
/*
// óóóóó Cargar carrito guardado en servidor óóóóó
async function cargarCarritoDesdeServidor() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (!usuario.id) return;

  try {
    // ? aquÌ debes anteponer el BASE_URL
const res = await fetch(`${BASE_URL}/carrito/${usuario.id}`, { mode: 'cors' });    if (res.ok) {
      const { carrito: servidor } = await res.json();
      localStorage.setItem('carrito', JSON.stringify(servidor));
    }
  } catch (e) {
    console.error('Error cargando carrito del servidor', e);
  }
}

// óóóóó Persistir carrito en servidor óóóóó
async function persistirCarritoEnServidor() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (!usuario.id) return;
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  try {
    // ? y aquÌ tambiÈn
 await fetch(`${BASE_URL}/carrito`, { 
      method:  'POST',
      mode:    'cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId: usuario.id, carrito })
    });
  } catch (e) {
    console.error('Error guardando carrito en servidor', e);
  }
}

*/
// --- funciones.js ---

// Recuperar carrito del localStorage
	let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Funci√≥n para agregar producto al carrito
	
function agregarAlCarrito(nombre, precio, imagen) {
    const usuario = localStorage.getItem('usuario');
    let datos = {};
    try {
        datos = JSON.parse(usuario);
    } catch (e) {
        datos = null;
    }

    if (!datos || !datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
        alert('Debes iniciar sesiÛn o registrarte para agregar productos al carrito.');
        window.location.href = 'login.html';
        return;
    }

    // Detectar imagen actual del carrusel
    const botonActivo = document.activeElement;
    if (botonActivo && botonActivo.closest('.producto')) {
        const carruselImg = botonActivo.closest('.producto').querySelector('.carrusel img');
        if (carruselImg) {
            imagen = carruselImg.getAttribute('src').split('/').pop();
        }
    }

    const imagenAbsoluta = `${BASE_URL}/imagenes/${imagen}`;
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // óó> AquÌ viene el cambio: si ya existe, solo sube la cantidad
    const idx = carrito.findIndex(item => item.nombre === nombre);
    if (idx !== -1) {
        // incremento de cantidad
        carrito[idx].cantidad = (carrito[idx].cantidad || 1) + 1;
    } else {
        // nuevo producto con cantidad = 1
        carrito.push({
            nombre,
            precio: parseFloat(precio),
            imagen: imagenAbsoluta,
            cantidad: 1
        });
    }
    // óó> fin del cambio

    localStorage.setItem('carrito', JSON.stringify(carrito));
	

    actualizarContador();
    mostrarToast("Producto agregado al carrito");
}




// Funci√≥n para actualizar contador del carrito
function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  // suma cantidades (si no existe cantidad, asumimos 1)
  const totalPiezas = carrito.reduce(
    (sum, item) => sum + (item.cantidad || 1),
    0
  );
  const cantidadSpan = document.getElementById('cantidad-carrito');
  if (cantidadSpan) {
    cantidadSpan.textContent = totalPiezas;
  }
}


// Mostrar carrito en pantalla

function mostrarCarrito() {
    const lista = document.getElementById('lista-carrito');
    const totalDiv = document.getElementById('total-carrito');
    const btnPagar = document.getElementById('pagar');
    const btnVaciar = document.getElementById('vaciar-carrito');
    const volverMenu = document.getElementById('volver-menu');

    lista.innerHTML = '';
    totalDiv.textContent = '';

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        // Mostrar mensaje de carrito vac√≠o
        const vacio = document.createElement('div');
	

vacio.innerHTML = `
  <div style="text-align: center; margin: 40px 0;">
    <p style="font-size: 20px; font-weight: bold;">! Tu carrito esta vacio :(</p>
  </div>
`;
        
        lista.appendChild(vacio);

        // Ocultar pagar, mostrar bot√≥n inactivo y "volver al men√∫"
        btnPagar.style.display = 'none';
        btnVaciar.textContent = 'Carrito vac√≠o';
        btnVaciar.disabled = true;
        btnVaciar.style.backgroundColor = '#c0392b'; // rojo
        volverMenu.style.display = 'block';
        return;
    }

    // Si hay productos:
   carrito.forEach((producto, index) => {
    const item = document.createElement('div');
    const cantidadActual = producto.cantidad || 1;

    const nombreBase = producto.imagen.split('/').pop().replace(/\.(jpe?g|png)$/i, '');
    let imagenes = [];

    if (nombreBase.toLowerCase() === 'amarilla') {
        imagenes = ['imagenes/Amarilla.jpeg','imagenes/Amarilla2.jpeg'];
    } else {
        imagenes = [`imagenes/${nombreBase}.jpeg`,`imagenes/${nombreBase}1.jpeg`,`imagenes/${nombreBase}2.jpeg`];
    }

    item.innerHTML = `
        <div class="item-carrito">
            <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-carrito" onclick='mostrarVistaPrevia(${JSON.stringify(imagenes)}, 0)'>
            <div class="detalle-carrito">
                <p><strong>${producto.nombre}</strong></p>
                <p>$${producto.precio}</p>
                <div>
                    <button class="btn-cantidad" onclick="disminuirCantidad(${index})">-</button>
                    <span id="cantidad-${index}">(${cantidadActual})</span>
                    <button class="btn-cantidad" onclick="aumentarCantidad(${index})">+</button>
                </div>
            </div>
            <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">Eliminar producto</button>
        </div>`;
    lista.appendChild(item);
});


    // Mostrar total
	 const total = carrito.reduce((suma, producto) => 
    suma + (parseFloat(typeof producto.precio === 'string' ? producto.precio.replace('$', '') : producto.precio) * (producto.cantidad || 1)), 0);

	totalDiv.textContent = `Total de productos = $${total.toFixed(2)}`;


   // Mostrar botones correctos
    btnPagar.style.display = 'block';
    btnVaciar.textContent = 'Vaciar carrito';
    btnVaciar.disabled = false;
    btnVaciar.style.backgroundColor = '#00695c'; // color original
    volverMenu.style.display = 'none';
}

// Eliminar producto del carrito
	function eliminarDelCarrito(index) {
    	carrito.splice(index, 1);
    	localStorage.setItem('carrito', JSON.stringify(carrito));
    	mostrarCarrito();
    	actualizarContador();
	}

// Mostrar mensaje toast
	function mostrarToast(mensaje) {
    	const toast = document.getElementById('toast');
    	toast.innerText = mensaje;
    	toast.className = 'show';
    	toast.style.visibility = 'visible';
	    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
        toast.style.visibility = 'hidden';
    }, 3000);
}










document.addEventListener('DOMContentLoaded', () => {
    const btnCarrito = document.getElementById('ver-carrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', () => {
            carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            if (carrito.length === 0) {
                mostrarToast('El carrito est√° vac√≠o. Agrega productos antes de pagar.');
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

            // Agrega "/" despu√©s de 2 d√≠gitos
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



function cambiarImagen(boton, direccion) {
    const contenedor = boton.closest('.carrusel');
    const img = contenedor.querySelector('img');
    const imagenes = JSON.parse(img.getAttribute('data-imagenes'));
    let actual = imagenes.indexOf(img.getAttribute('src'));

    // Si el src es relativo (como "imagenes/img.jpg"), aseg√∫rate de comparar sin dominio
    if (actual === -1) {
        const nombreActual = img.getAttribute('src').split('/').pop();
        actual = imagenes.findIndex(ruta => ruta.includes(nombreActual));
    }

    let nuevaPosicion = actual + direccion;
    if (nuevaPosicion < 0) nuevaPosicion = imagenes.length - 1;
    if (nuevaPosicion >= imagenes.length) nuevaPosicion = 0;

    img.setAttribute('src', imagenes[nuevaPosicion]);
}



async function cerrarSesion() {
   // 1) guardamos en servidor el carrito actual
   await persistirCarritoEnServidor();
   // 2) ahora sÌ limpiamos sesiÛn
   localStorage.clear();
   // 3) redirigimos
   window.location.replace("index.html");
 }







//INICIAR SESION
/*
function iniciarSesion(event) {
    event.preventDefault();

    const correo = document.getElementById('correoLogin').value.trim();
    const password = document.getElementById('passwordLogin').value.trim();
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioRegistrado') || '{}');

	
	const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!correoValido.test(correo)) {
    mostrarToast("‚ùå Correo electr√≥nico inv√°lido. Debe contener '@' y un dominio v√°lido (ej. .com, .edu.mx)");
    return;
}


    if (!usuarioGuardado.correo || usuarioGuardado.correo !== correo) {
        mostrarToast("‚ùå Usuario no registrado. Haz clic en 'Registrarse'");
        return;
    }

    if (usuarioGuardado.password !== password) {
        mostrarToast("‚ùå Contrase√±a incorrecta.");
        document.getElementById("restablecer-container").style.display = "block";
        return;
    }

    // Usuario v√°lido
    const usuario = {
        nombre: usuarioGuardado.nombre,
        correo: usuarioGuardado.correo
    };

    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('usuarioLogueado', 'true');
    window.location.href = 'index.html';
}
*/











 // FUNCION REGISTRAR USUARIOS (versiÛn que guarda el ID)
 async function registrarUsuario(event) {
   event.preventDefault();

   const nombre     = document.getElementById('nombre').value.trim();
   const correo     = document.getElementById('correo').value.trim();
   const contrasena = document.getElementById('password').value;
   const confirmar  = document.getElementById('confirmar').value;

  // ó Tus validaciones aquÌ ó
   if (contrasena !== confirmar) {
     alert("Las contraseÒas no coinciden.");
     return;
   }

   // ó Llamada al servidor ó
   const res  = await fetch(`${BASE_URL}/registrar`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ nombre, correo, contrasena })
   });
   const data = await res.json();

   if (!res.ok) {
     alert(data.error || '? Error al registrar usuario.');
     return;
   }

   // ó Guardamos el ID que devuelve el servidor ó
   const user = { id: data.id, nombre, correo };
   localStorage.setItem('usuario', JSON.stringify(user));
   localStorage.setItem('usuarioLogueado', 'true');

   // Ahora podemos persistir carritos con user.id
   window.location.href = 'index.html';
 }







document.addEventListener("DOMContentLoaded", function () {
    const cerrarSesionBtn = document.getElementById("cerrarSesion");
    const loginBtn = document.getElementById("loginBtn");
    const registroBtn = document.getElementById("btn-registro");

    const usuarioLogueado = localStorage.getItem("usuarioLogueado");

    if (usuarioLogueado === "true") {
        if (cerrarSesionBtn) cerrarSesionBtn.style.display = "inline-block";
        if (loginBtn) loginBtn.style.display = "none";
        if (registroBtn) registroBtn.style.display = "none";
    } else {
        if (cerrarSesionBtn) cerrarSesionBtn.style.display = "none";
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (registroBtn) registroBtn.style.display = "inline-block";
    }
});


function mostrarVistaPrevia(imagenes, indiceInicial = 0) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay-preview';
  overlay.innerHTML = `
    <div class="preview-container">
      <span class="cerrar-preview" onclick="document.body.removeChild(this.parentElement.parentElement)">‚úñ</span>
      <img id="imagen-grande" src="${imagenes[indiceInicial]}" class="imagen-grande">
      <div class="controles-preview">
        <button onclick="cambiarImagenPreview(-1)">‚ü®</button>
        <button onclick="cambiarImagenPreview(1)">‚ü©</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.dataset.indice = indiceInicial;
  overlay.dataset.imagenes = JSON.stringify(imagenes);
}

function cambiarImagenPreview(direccion) {
  const overlay = document.querySelector('.overlay-preview');
  let indice = parseInt(overlay.dataset.indice);
  const imagenes = JSON.parse(overlay.dataset.imagenes);
  indice = (indice + direccion + imagenes.length) % imagenes.length;
  overlay.dataset.indice = indice;
  document.getElementById('imagen-grande').src = imagenes[indice];
}







/*
document.addEventListener("DOMContentLoaded", function () {
  const cerrarSesionBtn = document.getElementById("cerrarSesion");

  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", function () {
      localStorage.removeItem("usuarioLogueado");
      localStorage.removeItem("usuario");
      localStorage.removeItem("carrito");
      window.location.href = "index.html";
    });
  }
});

*/


document.addEventListener("DOMContentLoaded", () => {
  const saludoDiv = document.getElementById("saludo-usuario");
  const carritoContador = document.getElementById("contador-carrito");
  const usuarioLogueado = localStorage.getItem("usuarioLogueado");
  const usuario = JSON.parse(localStorage.getItem("usuario") || '{}');

  if (usuarioLogueado === "true" && usuario.nombre) {
    if (saludoDiv) {
saludoDiv.innerHTML = `üëã ¬°Hola, ${usuario.nombre}!`;
      saludoDiv.style.display = "block";
    }
    if (carritoContador) {
      carritoContador.style.display = "inline-block";
    }
  } else {
    if (saludoDiv) saludoDiv.innerHTML = "";
    if (carritoContador) carritoContador.style.display = "none";
  }

  actualizarContador(); // para que muestre (n)
});




document.addEventListener("DOMContentLoaded", () => {
  // ó Autocompletar nombre y correo ó
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const nombreInput = document.getElementById("nombre");
    if (nombreInput && usuario.nombre) {
      nombreInput.value = usuario.nombre;
    }
    const correoInput = document.getElementById("correo");
    if (correoInput && usuario.correo) {
      correoInput.value = usuario.correo;
    }  const btnPagar = document.getElementById("btn-pagar");
  if (!btnPagar) return;

  btnPagar.addEventListener("click", async () => {
    // ó Leer campos ó
    const nombre     = document.getElementById("nombre").value.trim();
    const correo     = document.getElementById("correo").value.trim();
    const direccion  = document.getElementById("direccion").value.trim();
    const tarjeta    = document.getElementById("tarjeta").value.trim();
    const expiracion = document.getElementById("fecha-expiracion").value.trim();
    const cvv        = document.getElementById("cvv").value.trim();

    // ó Validaciones ó

    // 1) Nombre: solo letras (incluye acentos) y espacios
    const nombreRx = /^[A-Za-z¡…Õ”⁄·ÈÌÛ˙—Ò\s]+$/;
    if (!nombreRx.test(nombre)) {
      mostrarToast("X Nombre invalido. Solo letras y espacios.");
      return;
    }

    // 2) Correo: debe contener '@' y un dominio (.algo)
    const correoRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRx.test(correo)) {
      mostrarToast("X Correo invalido. Debe contener '@' y dominio.");
      return;
    }

    // 3) Resto de validaciones
    const tarjeRx  = /^\d{16}$/;
    const fechaRx  = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRx    = /^\d{3,4}$/;

    if (!direccion)            { mostrarToast("X Direccion vacÌa.");     return; }
    if (!tarjeRx.test(tarjeta))     { mostrarToast("X Tarjeta invalida.");    return; }
    if (!fechaRx.test(expiracion))  { mostrarToast("X Fecha invalida.");      return; }
    if (!cvvRx.test(cvv))            { mostrarToast("X CVV invalido.");       return; }

    // ó Comprobar caducidad ó
    const [mesNum, anioNum] = expiracion.split("/").map(n => parseInt(n, 10));
    const ahora      = new Date();
    const mesActual  = ahora.getMonth() + 1;
    const anioActual = ahora.getFullYear() % 100;
    // permitimos hasta 6 aÒos en el futuro (ajusta el 6 si quieres)
    const anioMaximo = (ahora.getFullYear() + 6) % 100;

    if (
      anioNum < anioActual ||
      anioNum > anioMaximo ||
      (anioNum === anioActual && mesNum < mesActual)
    ) {
      mostrarToast("X Fecha de expiracion invalida.");
      return;
    }

    // ó Leer carrito antes de vaciarlo ó
    const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carritoActual.length === 0) {
      mostrarToast("X Carrito vacÌo."); 
      return;
    }

    // ó Montar payload y enviar ó
    const total = carritoActual.reduce((sum, p) => sum + p.precio * (p.cantidad||1), 0);
    const datos = {
      para:       correo,
      asunto:     "Confirmacion de pago  T-Sports",
      nombre:     nombre,
      productos:  carritoActual.map(p => ({
        nombre:         p.nombre,
        precioUnitario: p.precio,
        cantidad:       p.cantidad || 1,
        nombreArchivo:  p.imagen.split("/").pop()
      })),
      direccion:  direccion,
      correo:     correo,
      tarjeta:    tarjeta.replace(/\d(?=\d{4})/g, "*"),
      total:      total
    };

    try {
      const res = await fetch(`${BASE_URL}/enviar-correo`, {

        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify(datos)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);

      document.getElementById("formularioPago").style.display = "none";
      document.getElementById("confirmacion").style.display  = "block";

      localStorage.setItem("carrito", "[]");

      actualizarContador();
      mostrarToast("Correo de confirmaciÛn enviado.");
      document.getElementById("formularioPago").reset();

    } catch (e) {
      console.error(e);
      mostrarToast("X Error al enviar el correo.");
    }
  });
});








function mostrarFormularioRestablecer() {
    document.getElementById("form-restablecer").style.display = "block";
}
function restablecerPassword() {
  const correo = document.getElementById('correoLogin').value;
  const nueva = document.getElementById('nuevaPassword').value;
  const confirmar = document.getElementById('confirmarPassword').value;

  if (!correo || !nueva || !confirmar) {
    alert('Por favor, llena todos los campos.');
    return;
  }

  if (nueva !== confirmar) {
    alert('Las contrase√±as no coinciden.');
    return;
  }

  fetch('/restablecer-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, nuevaContrasena: nueva })
  })
  .then(res => res.json())
  .then(data => {
    if (data.mensaje) {
      alert(data.mensaje + '. Ahora ser√°s redirigido para iniciar sesi√≥n.');
      document.getElementById('nuevaPassword').value = '';
      document.getElementById('confirmarPassword').value = '';
      document.getElementById("form-restablecer").style.display = "none";
      location.reload(); // Tambi√©n puedes usar window.location.href = 'index.html';
    } else {
      alert('‚ùå Error: ' + data.error);
    }
  })
  .catch(err => {
    console.error(err);
    alert('‚ùå Error al intentar restablecer contrase√±a');
  });
}










//REGISTRAR USUARIOS 	








// Funci√≥n para iniciar sesi√≥n
// Funci√≥n para iniciar sesi√≥n
async function iniciarSesion(event) {
  event.preventDefault();

  const correo = document.getElementById("correoLogin").value.trim();
  const contrasena = document.getElementById("passwordLogin").value.trim();

  try {
    const respuesta = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      alert(data.mensaje || "‚ùå Error al iniciar sesi√≥n.");
      const cont = document.getElementById("restablecer-container");
      if (cont) cont.style.display = "block";
      return;
    }

    if (!data.usuario || !data.usuario.correo) {
      alert("‚ùå Usuario inv√°lido.");
      return;
    }

     localStorage.setItem("usuario", JSON.stringify(data.usuario));
    localStorage.setItem("usuarioLogueado", "true");

    // REDIRIGE seg˙n el rol
    if (data.usuario.rol === "admin") {
      window.location.href = "admin.html";    } else {
// en lugar de window.location.href = 'index.html';
fetch(`${BASE_URL}/carrito/${data.usuario.id}`)
  .then(r => r.json())
  .then(({ carrito: carritoServer }) => {
    localStorage.setItem('carrito', JSON.stringify(carritoServer));
    window.location.href = 'index.html';
  })
  .catch(err => {
    console.error('No se pudo recuperar carrito:', err);
    window.location.href = 'index.html';
  });
      

}
  } catch (error) {
    console.error("‚ùå Error en la solicitud:", error);
    alert("‚ùå Hubo un error al intentar iniciar sesi√≥n.");
  }
}










//Admin


function cargarUsuarios() {
  fetch('/usuarios')
    .then(res => res.json())
    .then(usuarios => {
      console.log("üë• Usuarios recibidos:", usuarios);
      const tabla = document.querySelector('#tabla-usuarios tbody');
      tabla.innerHTML = '';  // Limpia tabla

      usuarios.forEach(usuario => {
        const fila = document.createElement('tr');
        // Dentro del forEach de usuarios:
fila.innerHTML = `
  <td>${usuario.id}</td>
  <td>${usuario.nombre}</td>
  <td>${usuario.correo}</td>
  <td>
    <select onchange="cambiarRol(${usuario.id}, this.value)">
      <option value="user"  ${usuario.rol==='user'?'selected':''}>User</option>
      <option value="admin" ${usuario.rol==='admin'?'selected':''}>Admin</option>
    </select>
  </td>
  <td>
    <button onclick="deshabilitarUsuario(${usuario.id})">
      ${usuario.activo? 'Deshabilitar' : 'Habilitar'}
    </button>
  </td>
`;
        tabla.appendChild(fila);
      });
    })
    .catch(err => {
      console.error('‚ùå Error al cargar usuarios:', err);
    });
}




function agregarUsuario(event) {
  event.preventDefault();

  const nombre = document.getElementById('nuevoNombre').value;
  const correo = document.getElementById('nuevoCorreo').value;
  const contrasena = document.getElementById('nuevoContrasena').value;

  if (!nombre || !correo || !contrasena) {
    alert('Todos los campos son obligatorios.');
    return;
  }

  fetch('/agregar-usuario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, contrasena })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      cargarUsuarios();
      document.getElementById('form-agregar-usuario').reset();
    })
    .catch(err => console.error('‚ùå Error al agregar usuario:', err));
}

function eliminarUsuario(id) {
  if (!confirm('¬øEst√°s seguro de eliminar este usuario?')) return;

fetch(`/eliminar-usuario/${id}`, {
    method: 'DELETE'
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje || 'Usuario eliminado');
      cargarUsuarios(); // Refresca la tabla
    })
    .catch(err => {
      console.error('‚ùå Error al eliminar usuario:', err);
      alert('‚ùå Error al eliminar usuario');
    });
}




function cargarPedidos() {
  fetch('/pedidos')
    .then(res => res.json())
    .then(pedidos => {
      console.log("üì¶ Pedidos recibidos:", pedidos);
      const tabla = document.querySelector('#tabla-pedidos tbody');
      tabla.innerHTML = '';

      pedidos.forEach(p => {
        const fila = `
          <tr>
            <td>${p.id_pedido}</td>
            <td>${p.nombre_usuario}</td>
            <td>${p.correo}</td>
            <td>${p.producto}</td>
            <td>$${parseFloat(p.precio).toFixed(2)}</td>
            <td>$${parseFloat(p.total).toFixed(2)}</td>
            <td>${new Date(p.fecha).toLocaleString()}</td>
          </tr>
        `;
        tabla.innerHTML += fila;
      });
    })
    .catch(err => console.error('‚ùå Error al cargar pedidos:', err));
}




// Funciones para admin.html
// Protecci√≥n de acceso a admin.html + carga autom√°tica de datos
// Funci√≥n central de cerrar sesi√≥n
//CERRAR SESION	
async function cerrarSesion() {
  // 1) guarda en servidor el estado actual del carrito
    // 2) limpia sÛlo la sesiÛn de usuario, no necesitas borrar el carrito
  localStorage.removeItem('usuario');
  localStorage.removeItem('usuarioLogueado');
  // 3) redirige
  window.location.replace('index.html');
}

// Protecci√≥n + carga admin.html
document.addEventListener('DOMContentLoaded', () => {
  const rutaActual = window.location.pathname;

  if (rutaActual.includes('admin.html')) {
    const cerrarSesionBtn = document.getElementById("cerrarSesion");
    if (cerrarSesionBtn) {
      cerrarSesionBtn.addEventListener("click", cerrarSesion);
    }

    setTimeout(() => {
      const usuario = JSON.parse(localStorage.getItem("usuario") || '{}');
          const esAdmin = usuario && usuario.rol === 'admin';
    if (!esAdmin) {
      localStorage.clear();
      window.location.replace("index.html");
      return;
    }
      cargarUsuarios();
      cargarPedidos();

      const form = document.getElementById('form-agregar-usuario');
      if (form) {
        form.addEventListener('submit', agregarUsuario);
      }
    }, 50);
  }
});

// Activar bot√≥n de cerrar sesi√≥n en cualquier p√°gina
document.addEventListener('DOMContentLoaded', () => {
  const cerrarSesionBtn = document.getElementById("cerrarSesion");
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.replace("index.html");
    });
  }
});

// Aumentar cantidad del producto
function aumentarCantidad(index) {
    carrito[index].cantidad = (carrito[index].cantidad || 1) + 1;
    actualizarCarrito();
}

// Disminuir cantidad del producto
function disminuirCantidad(index) {
    if (carrito[index].cantidad && carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1); // Eliminar si solo queda 1
    }
    actualizarCarrito();
}

// Actualizar visualizaciÛn del carrito
function actualizarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
    actualizarContador();
}



// calificar (solo en rating.html)
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("rating-container");
  if (!container) return;      // <-- SALIR si no estamos en la p·gina de rating

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.forEach((p, i) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "rating-card";
    tarjeta.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" class="rating-img">
      <h2>${p.nombre}</h2>
      <div class="stars" id="stars-${i}">
        ${[5,4,3,2,1].map(st => `
          <input type="radio" id="rating-${i}-${st}" name="rating-${i}" value="${st}">
          <label for="rating-${i}-${st}" class="star">&#9733;</label>
        `).join('')}
      </div>
      <textarea id="comment-${i}" placeholder="Deja tu comentario..."></textarea>
      <hr>
    `;
    container.appendChild(tarjeta);
  });

  // Volver al carrito
  const volverBtn = document.getElementById("volver-carrito");
  if (volverBtn) volverBtn.addEventListener("click", () => window.location.href = "carrito.html");

  // Continuar al pago
  // Continuar al pago con validaciÛn de estrellas y comentarios
  const continuarBtn = document.getElementById("continuar-pago");
  if (continuarBtn) continuarBtn.addEventListener("click", () => {
    const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
    const totalItems = carritoActual.length;

    // 1) Recorremos todos los productos
    for (let i = 0; i < totalItems; i++) {
      // a) Debe tener una estrella seleccionada
      if (!document.querySelector(`input[name="rating-${i}"]:checked`)) {
        mostrarToast(" X Debes calificar todos los productos.");
        return;
      }
      // b) Debe tener comentario no vacÌo
      const comment = document.getElementById(`comment-${i}`).value.trim();
      if (!comment) {
        mostrarToast("X Debes dejar un comentario para cada producto.");
        return;
      }
    }

    // 2) Si todo est· completo, guardamos y redirigimos
    const ratings = carritoActual.map((p, i) => {
      const sel = document.querySelector(`input[name="rating-${i}"]:checked`);
      const val = sel ? parseInt(sel.value, 10) : 0;
      return {
        nombre:     p.nombre,
        ratingPct:  Math.round((val / 5) * 100),
        comentario: document.getElementById(`comment-${i}`).value.trim()
      };
    });
    localStorage.setItem("ratings", JSON.stringify(ratings));
    window.location.href = "pago.html";
  });



});








// óóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóó
// 1) Capturar el click en ìProceder al pagoî (carrito.html)
// 2) Redirigir primero a rating.html
// óóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóó
document.addEventListener('DOMContentLoaded', () => {
  const btnPagar = document.getElementById('pagar');
  if (!btnPagar) return;

  btnPagar.addEventListener('click', () => {
    const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carritoActual.length === 0) {
      mostrarToast('El carrito est· vacÌo. Agrega productos antes de pagar.');
      return;
    }
    // Primero vamos a la p·gina de calificaciÛnÖ
    window.location.href = 'rating.html';
  });
});


// FunciÛn para vaciar todo el carrito
function vaciarCarrito() {
  carrito = [];
  localStorage.setItem('carrito', JSON.stringify(carrito));
	

  actualizarContador();
  mostrarCarrito();
  mostrarToast("Carrito vaciado.");
}

// Atachar el listener al botÛn de "Vaciar carrito"
document.addEventListener("DOMContentLoaded", () => {
  const btnVaciar = document.getElementById("vaciar-carrito");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", vaciarCarrito);
  }
});











 document.addEventListener('DOMContentLoaded', () => {
   // Solo en la p·gina p˙blica
   if (!window.location.pathname.includes('index.html')) return;
   const grid = document.querySelector('main .productos');
   if (!grid) return;

  // óóóóó Quitar los productos que vinieron "hard-codeados" en index.html óóóóó
//  grid.innerHTML = '';

   // óóóóó Traer del servidor y renderizar din·micamente óóóóó
   fetch(`${BASE_URL}/productos`)
     .then(res => res.json())
     .then(productos => {
       productos.forEach(p => {
         const imgs = JSON.parse(p.imagenes || '[]');
         const card = document.createElement('div');
         card.className = 'producto';
         card.innerHTML = `
           <div class="carrusel">
             <button class="prev" onclick="cambiarImagen(this,-1)">&#10094;</button>
             <img src="${imgs[0]||''}" data-imagenes='${JSON.stringify(imgs)}'>
             <button class="next" onclick="cambiarImagen(this,1)">&#10095;</button>
           </div>
           <h3>${p.nombre}</h3>
           <p>Licra estilo Dry-Fit</p>
           <p>$${p.precio.toFixed(2)} MXN</p>
           <button onclick="agregarAlCarrito('${p.nombre}',${p.precio},'${imgs[0]?.split('/').pop()}')">
             Agregar al carrito
           </button>
         `;
         grid.appendChild(card);
       });
     })
     .catch(console.error);
 });











// funciones.js

// productosCache guardar· el listado para tener acceso r·pido al editar
let productosCache = [];

// Referencias al formulario y su botÛn
const form = document.getElementById('form-agregar-producto');
const submitBtn = form.querySelector('button[type="submit"]');

// 1) Cargar y mostrar productos, y llenar la cache
async function cargarProductos() {
  const res = await fetch('/productos');
  const productos = await res.json();
  productosCache = productos;

  const tbody = document.querySelector('#tabla-productos tbody');
  tbody.innerHTML = '';

  productos.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>$${p.precio.toFixed(2)}</td>
        <td>${p.stock}</td>
        <td>${p.fecha_entrega_estimada || '-'}</td>
        <td>
          <button onclick="editarProducto(${p.id})">Editar</button>
          <button onclick="eliminarProducto(${p.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

// 2) Handler para crear un nuevo producto (POST)
async function crearProductoHandler(e) {
  e.preventDefault();
  const data = new FormData(form);
  await fetch('/productos', { method: 'POST', body: data });
  form.reset();
  // Reiniciar el handler al modo "crear"
  submitBtn.textContent = 'Crear producto';
  form.onsubmit = crearProductoHandler;
  cargarProductos();
}

// 3) FunciÛn para eliminar (DELETE)
async function eliminarProducto(id) {
  if (!confirm('øSeguro que quieres eliminar este producto?')) return;
  await fetch(`/productos/${id}`, { method: 'DELETE' });
  cargarProductos();
}

// 4) FunciÛn para editar (PUT)
//    Rellena el formulario y cambia el submit para hacer PUT en lugar de POST
function editarProducto(id) {
  const p = productosCache.find(x => x.id === id);
  if (!p) return alert('Producto no encontrado');

  // Rellenar campos
  form.elements.nombre.value = p.nombre;
  form.elements.precio.value = p.precio;
  form.elements.stock.value = p.stock;
if (p.fecha_entrega_estimada) {
  // Convertir a YYYY-MM-DD
  const d = new Date(p.fecha_entrega_estimada);
  form.elements.fecha_entrega_estimada.value = d.toISOString().substring(0, 10);
} else {
  form.elements.fecha_entrega_estimada.value = '';
}

  // Cambiar texto del botÛn y el handler
  submitBtn.textContent = 'Actualizar producto';
  form.onsubmit = async function(e) {
    e.preventDefault();
    const data = new FormData(form);
    await fetch(`/productos/${id}`, { method: 'PUT', body: data });
    form.reset();
    // Volver al modo crear
    submitBtn.textContent = 'Crear producto';
    form.onsubmit = crearProductoHandler;
    cargarProductos();
  };
}

// 5) InicializaciÛn: asignar el handler de crear y cargar productos
form.onsubmit = crearProductoHandler;
window.addEventListener('DOMContentLoaded', cargarProductos);

// óóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóó
// GestiÛn de Pedidos con filtros y cambio de estado
// óóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóóó
// --- GestiÛn de Pedidos con filtros, cambio de estado y detalle ---
async function cargarPedidos(status, desde, hasta) {
  // 1) Construye los query params
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (desde)  params.append('desde',  desde);
  if (hasta)  params.append('hasta',  hasta);

  // 2) Llama al backend
  const url = `${BASE_URL}/ordenes?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Error cargando pedidos:', res.statusText);
    return;
  }
  const pedidos = await res.json();

  // 3) POBLA la tabla
  const tbody = document.querySelector('#tabla-pedidos tbody');
  tbody.innerHTML = '';

  pedidos.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td>${p.id_pedido}</td>
        <td>${p.nombre_usuario}</td>
        <td>${p.correo_usuario}</td>
        <td>${p.producto || '-'}</td>
        <td>$${parseFloat(p.precio_producto || 0).toFixed(2)}</td>
        <td>$${parseFloat(p.total_orden    || 0).toFixed(2)}</td>
        <td>${new Date(p.fecha_orden).toLocaleString()}</td>
        <td>
          <select data-id="${p.id_pedido}" class="status-select">
            ${['pendiente','en envÌo','entregado','cancelado']
              .map(s => `<option value="${s}" ${s===p.status?'selected':''}>${s}</option>`)
              .join('')}
          </select>
        </td>
        <td>
          <button class="btn-guardar" data-id="${p.id_pedido}">Guardar</button>
          <button class="btn-detalle" data-id="${p.id_pedido}">Ver detalle</button>
        </td>
      </tr>
    `;
  });

  // 4) Re-attach listeners
  document.querySelectorAll('.btn-guardar').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const select = document.querySelector(`.status-select[data-id="${id}"]`);
      const nuevo = select.value;
      await fetch(`${BASE_URL}/ordenes/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nuevo })
      });
      alert('Estado actualizado a "' + nuevo + '"');
    };
  });

  document.querySelectorAll('.btn-detalle').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const res = await fetch(`${BASE_URL}/ordenes/${id}`);
      const detalle = await res.json();
      console.table(detalle);
      alert('Mira la consola para el detalle completo del pedido.');
    };
  });
}

// Hook de filtros y carga inicial en admin.html
window.addEventListener('DOMContentLoaded', () => {
  const btnFiltrar = document.getElementById('btn-filtrar');
  if (btnFiltrar) {
    btnFiltrar.addEventListener('click', () => {
      const status = document.getElementById('filtro-status').value;
      const desde  = document.getElementById('filtro-desde').value;
      const hasta  = document.getElementById('filtro-hasta').value;
      cargarPedidos(status, desde, hasta);
    });
  }

  if (window.location.pathname.includes('admin.html')) {
    cargarPedidos();
  }
});

async function deshabilitarUsuario(id) {
  if (!confirm('øSeguro quieres cambiar su estado?')) return;
  const res = await fetch(`${BASE_URL}/eliminar-usuario/${id}`, { method: 'DELETE' });
  const data = await res.json();
  alert(data.mensaje || data.error);
  cargarUsuarios();
}

async function cambiarRol(id, rol) {
  const res = await fetch(`${BASE_URL}/usuarios/${id}/rol`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rol })
  });
  const data = await res.json();
  alert(data.mensaje || data.error);
  cargarUsuarios();
}
