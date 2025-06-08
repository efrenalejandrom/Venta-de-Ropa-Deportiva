const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // ← Importante: para poder leer req.body

app.get('/', (req, res) => {
  res.send('Backend de T-Sports funcionando 🟢');
});

app.post('/enviar-correo', async (req, res) => {
  const { para, asunto, mensaje } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mendozarevillaefrenalejandro@gmail.com',
        pass: 'qwegiucslyeuzxdl'
      }
    });

    const mailOptions = {
      from: 'T-Sports <mendozarevillaefrenalejandro@gmail.com>',
      to: para,
      subject: asunto,
      text: mensaje
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo enviado correctamente');
    res.status(200).json({ mensaje: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: 'Error al enviar correo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

