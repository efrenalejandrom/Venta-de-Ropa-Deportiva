const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'ReyesLuisyMendozaRevilla',
  password: 'BasedeDatos$pagina1',
  database: 'tsports'
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión a MySQL establecida correctamente.');
});

module.exports = connection;

