require('dotenv').config();
const db = require('./db'); 



const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3000;
const BASE_URL = "http://18.119.93.126:3000";

const multer = require('multer');
const path  = require('path');

// Configuraci�n de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, __dirname + '/../public/imagenes'),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '_' + Math.round(Math.random()*1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });






app.use(cors());
app.use(express.json()); // Para poder leer req.body
app.use('/imagenes', express.static(__dirname + '/../public/imagenes'));

app.get('/', (req, res) => {
  res.send('✅ Backend de T-Sports funcionando correctamente');
});





app.post('/enviar-correo', async (req, res) => {
  console.log('?? payload /enviar-correo:', req.body);

  const { para, asunto, nombre, productos, direccion, correo, tarjeta, total } = req.body;
  console.log("Datos recibidos en el backend:", req.body);

 /* if (!para || !asunto || !nombre || !productos || !productos.length) {
    return res.status(400).json({ error: 'Faltan datos del correo o carrito vacío.' });
  }*/

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mendozarevillaefrenalejandro@gmail.com',
        pass: 'qwegiucslyeuzxdl' // Usa process.env en producción
      }
    });

    let contenidoHTML = `<p>Hola ${nombre}, gracias por tu compra. Pronto recibirás tu pedido.</p>`;
    contenidoHTML += `<h3>Productos comprados:</h3><ul>`;

    
productos.forEach(producto => {
  // tomamos cantidad y precio unitario (por compatibilidad)
  const cantidad      = producto.cantidad || 1;
  const precioUnitario = producto.precioUnitario ?? producto.precio;

  contenidoHTML += `
    <li style="margin-bottom: 15px;">
      <img src="${BASE_URL}/imagenes/${producto.nombreArchivo}" width="200" height="200">
      <p>
        <strong>
          ${producto.nombre} (${cantidad})
        </strong>
         $${precioUnitario.toFixed(2)}
      </p>
    </li>
  `;
});




    contenidoHTML += `</ul>
      <hr>
      <h3>Información del comprador</h3>
      <p><strong>Dirección de envío:</strong> ${direccion}</p>
      <p><strong>Correo electrónico:</strong> ${correo}</p>
      <p><strong>Tarjeta:</strong> ************${tarjeta.slice(-4)}</p>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
    `;

    const mailOptions = {
      from: 'T-Sports <mendozarevillaefrenalejandro@gmail.com>',
      to: para,
      subject: asunto,
      html: contenidoHTML
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado correctamente');

    // Buscar ID del usuario
    const buscarUsuario = 'SELECT id FROM usuarios WHERE correo = ?';
    db.query(buscarUsuario, [correo], (err, results) => {
      if (err || results.length === 0) {
        console.error("❌ Usuario no encontrado:", err);
        return res.status(500).json({ error: 'Usuario no encontrado para registrar el pedido' });
      }

      const idUsuario = results[0].id;
      const insertarPedido = 'INSERT INTO pedidos (id_usuario, productos, total) VALUES (?, ?, ?)';
      db.query(insertarPedido, [idUsuario, JSON.stringify(productos), total], (err2, result) => {
        if (err2) {
          console.error("❌ Error al guardar el pedido:", err2);
          return res.status(500).json({ error: 'Error al guardar el pedido' });
        }

        const idPedido = result.insertId;
        const fecha = new Date();
        const insertarDetalle = `
          INSERT INTO detalle_pedidos (id_pedido, nombre_usuario, correo, producto, precio, total, fecha)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        productos.forEach((producto) => {
          db.query(
            insertarDetalle,
            [idPedido, nombre, correo, producto.nombre, producto.precio, total, fecha],
            (err3) => {
              if (err3) {
                console.error("❌ Error al insertar detalle:", err3);
              }
            }
          );
        });

        return res.status(200).json({ mensaje: '✅ Correo enviado y pedido guardado con detalle' });
      });
    });

  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ error: 'Error al enviar correo y registrar pedido' });
  }
});








app.post('/registrar', (req, res) => {
  const { nombre, correo, contrasena, telefono } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const query = 'INSERT INTO usuarios (nombre, correo, contrasena, telefono) VALUES (?, ?, ?, ?)';
  db.query(query, [nombre, correo, contrasena, telefono], (err, result) => {
    if (err) {
      console.error('❌ Error al registrar usuario:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    res.status(200).json({ mensaje: '✅ Usuario registrado con éxito', id: result.insertId });
  });
});


app.post('/login', (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ mensaje: 'Faltan datos' });
  }

  const query = `
    SELECT id, nombre, correo, rol
    FROM usuarios
    WHERE correo = ? 
      AND contrasena = ? 
      AND activo = 1
  `;
  db.query(query, [correo, contrasena], (error, results) => {
    if (error) {
      console.error('Error al buscar usuario:', error);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
    if (!results.length) {
      return res.status(401).json({ mensaje: 'Credenciales inv�lidas o usuario inactivo' });
    }
    // devolvemos id, nombre, correo y rol
    res.json({ mensaje: 'Inicio de sesi�n exitoso', usuario: results[0] });
  });
});



app.post('/restablecer-password', (req, res) => {
  const { correo, nuevaContrasena } = req.body;

  if (!correo || !nuevaContrasena) {
    return res.status(400).json({ error: 'Faltan datos para actualizar contraseña' });
  }

  const query = 'UPDATE usuarios SET contrasena = ? WHERE correo = ?';
  db.query(query, [nuevaContrasena, correo], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar contraseña:', err);
      return res.status(500).json({ error: 'Error en la base de datos al actualizar contraseña' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ mensaje: '✅ Contraseña actualizada correctamente' });
  });
});












app.get('/usuarios', (req, res) => {

const query = 'SELECT id, nombre, correo, rol FROM usuarios WHERE activo = 1';

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.status(200).json(results);
  });
});





app.post('/agregar-usuario', (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Faltan datos para agregar usuario' });
  }

  const query = 'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)';
  db.query(query, [nombre, correo, contrasena], (err, result) => {
    if (err) {
      console.error('❌ Error al agregar usuario:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.status(200).json({ mensaje: '✅ Usuario agregado correctamente' });
  });
});


app.delete('/eliminar-usuario/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Paso 1: Obtener el correo del usuario
  const verificarCorreo = 'SELECT correo FROM usuarios WHERE id = ?';
  db.query(verificarCorreo, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const correo = results[0].correo;
    if (correo === 'tsports@gmail.com') {
      return res.status(403).json({ error: '⛔ No puedes eliminar al administrador T-Sports' });
    }

    // Paso 2: Ejecutar eliminación solo si no es tsports@gmail.com
     const query = 'UPDATE usuarios SET activo = 0 WHERE id = ?';
  db.query(query, [id], (err2, result) => {
    if (err2) return res.status(500).json({ error: 'Error en la base de datos al deshabilitar' });
    if (result.affectedRows === 0)
      return res.status(404).json({ mensaje: 'Usuario no encontrado o ya deshabilitado' });
    res.status(200).json({ mensaje: 'Usuario deshabilitado correctamente' });
  });
});
});




app.get('/pedidos', (req, res) => {
  const query = `
    SELECT id_pedido, nombre_usuario, correo, producto, precio, total, fecha
    FROM detalle_pedidos
    ORDER BY fecha DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener pedidos:', err);
      return res.status(500).json({ error: 'Error al obtener pedidos' });
    }
    res.status(200).json(results);
  });
});



/*
app.post('/carrito', (req, res) => {
  const { userId, carrito } = req.body;
  const sql = `
    INSERT INTO carritos (user_id, carrito)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE carrito = ?
  `;
  db.query(sql, [userId, JSON.stringify(carrito), JSON.stringify(carrito)], (err) => {
    if (err) return res.status(500).json({ error: 'No se pudo guardar carrito' });
    res.json({ mensaje: 'Carrito guardado' });
  });
});


app.get('/carrito/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const sql = 'SELECT carrito FROM carritos WHERE user_id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err)      return res.status(500).json({ error: 'Error base de datos' });
    if (!results.length) return res.json({ carrito: [] });  // carrito vac�o
    res.json({ carrito: JSON.parse(results[0].carrito) });
  });
});

*/



// -- Listar todos los productos --
app.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos ORDER BY id';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al listar productos' });
    // Aqu� conviertes cada fila en tu objeto JS
    const productos = results.map(row => ({
      id:                     row.id,
      nombre:                 row.nombre,
      precio:                 parseFloat(row.precio),
      stock:                  row.stock,
      fecha_entrega_estimada: row.fecha_entrega_estimada,
      // <-- ELIMINA JSON.parse
      imagenes:               row.imagenes
    }));
    res.json(productos);
  });
});

// justo debajo de tu GET /productos
app.get('/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM productos WHERE id = ?';
  db.query(sql, [id], (err, rows) => {
    if (err)    return res.status(500).json({ error: 'Error en la base de datos' });
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    const row = rows[0];
    res.json({
      id: row.id,
      nombre: row.nombre,
      precio: parseFloat(row.precio),
      stock: row.stock,
      fecha_entrega_estimada: row.fecha_entrega_estimada,
      imagenes: JSON.parse(row.imagenes || '[]')
    });
  });
});


// -- Crear producto (hasta 5 im�genes) --
app.post('/productos', upload.array('imagenes', 5), (req, res) => {
  const { nombre, precio, stock, fecha_entrega_estimada } = req.body;
  const files = req.files || [];
  const urls  = files.map(f => `/imagenes/${f.filename}`);
  const sql   = `
    INSERT INTO productos (nombre, precio, stock, imagenes, fecha_entrega_estimada)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql,
    [nombre, precio, stock, JSON.stringify(urls), fecha_entrega_estimada],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear producto' });
      res.json({ mensaje: 'Producto creado', id: result.insertId });
    }
  );
});

// -- Actualizar producto (a�ade im�genes nuevas al JSON existente) --
app.put('/productos/:id', upload.array('imagenes', 5), (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, fecha_entrega_estimada } = req.body;
  // 1) Leer im�genes actuales
  db.query('SELECT imagenes FROM productos WHERE id = ?', [id], (err, rows) => {
    if (err || !rows.length)
      return res.status(404).json({ error: 'Producto no encontrado' });

    let actuales = JSON.parse(rows[0].imagenes || '[]');
    const nuevas = (req.files || []).map(f => `/imagenes/${f.filename}`);
    const todas  = actuales.concat(nuevas);

    // 2) Actualizar fila
    const sql = `
      UPDATE productos
      SET nombre=?, precio=?, stock=?, imagenes=?, fecha_entrega_estimada=?
      WHERE id=?
    `;
    db.query(sql,
      [ nombre, precio, stock, JSON.stringify(todas), fecha_entrega_estimada, id ],
      err2 => {
        if (err2) return res.status(500).json({ error: 'Error al actualizar' });
        res.json({ mensaje: 'Producto actualizado' });
      }
    );
  });
});

// -- Eliminar producto --
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar' });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Producto no existe' });
    res.json({ mensaje: 'Producto eliminado' });
  });
});



// obtener todas las �rdenes (con opcional filter por status o fecha)
// -- Listar todas las �rdenes (ahora con usuario y detalle) --
app.get('/ordenes', (req, res) => {
  const { status, desde, hasta } = req.query;
  // Selecciono de ordenes, usuario y detalle
  let sql = `
    SELECT
      o.id                     AS id_pedido,
      u.nombre                 AS nombre_usuario,
      u.correo                 AS correo_usuario,
      d.producto               AS producto,
      d.precio                 AS precio_producto,
      o.total                  AS total_orden,
      o.fecha_orden,
      o.status
    FROM ordenes o
    JOIN usuarios u    ON u.id = o.id_usuario
    LEFT JOIN detalle_pedidos d ON d.id_pedido = o.id
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    sql += ' AND o.status = ?';
    params.push(status);
  }
  if (desde) {
    sql += ' AND o.fecha_orden >= ?';
    params.push(desde);
  }
  if (hasta) {
    sql += ' AND o.fecha_orden <= ?';
    params.push(hasta);
  }
  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});










// cambiar estado de una orden
app.patch('/ordenes/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sql = 'UPDATE ordenes SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Estado actualizado' });
  });
});

// detalle completo de una orden (productos, cantidades, totales)
app.get('/ordenes/:id', (req, res) => {
  const { id } = req.params;
  // suponiendo que tienes detalle_pedidos o similar:
  const sql = `
    SELECT o.id, o.id_usuario, o.total as total_orden, o.fecha_orden, o.status,
           d.producto, d.precio, d.cantidad
    FROM ordenes o
    JOIN detalle_pedidos d ON o.id = d.id_pedido
    WHERE o.id = ?
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
    res.json(rows);
  });
});

// PATCH /usuarios/:id/rol �> body: { rol: 'admin'|'user' }
app.patch('/usuarios/:id/rol', (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;
  if (!['user','admin'].includes(rol))
    return res.status(400).json({ error: 'Rol inv�lido' });
  const sql = 'UPDATE usuarios SET rol = ? WHERE id = ?';
  db.query(sql, [rol, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error base de datos' });
    res.json({ mensaje: `Rol cambiado a ${rol}` });
  });
});





app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

