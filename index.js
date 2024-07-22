const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();
const port = process.env.PORT || 3000;

// Configurar AWS SDK
AWS.config.update({ region: 'us-east-1' });

// Inicializar la aplicación de Firebase Admin
const serviceAccount = require('./authnotipoli-e438b-firebase-adminsdk-e8mps-d7933fb23f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://authnotipoli-e438b-default-rtdb.firebaseio.com'
});

const db = admin.database();

app.use(cors());
app.use(bodyParser.json());

// Ruta GET para la raíz para comprobar que el servidor está en funcionamiento
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Endpoint para recibir datos del perfil de usuario
app.post('/data', (req, res) => {
  const userProfile = req.body;
  console.log('Received user profile:', userProfile);

  // Guardar los datos en Firebase Realtime Database
  const userRef = db.ref(`users/${userProfile.uid}`);
  userRef.set(userProfile, (error) => {
    if (error) {
      console.log('Error saving data to Firebase:', error);
      res.status(500).json({ message: 'Error saving data to Firebase', error });
    } else {
      res.json({ message: 'Data saved successfully to Firebase!' });
    }
  });
});

// Endpoint para recibir datos de fecha y descripción desde la app Android
app.post('/receive', (req, res) => {
  const { month, id, date, description } = req.body;
  console.log('Received date and description:', month, id, date, description);

  // Guardar los datos en Firebase Realtime Database bajo la sección "events"
  const ref = db.ref(`events/${month}/${id}`);
  ref.set({ day: date, description, id }, (error) => {
    if (error) {
      console.log('Error saving data to Firebase:', error);
      res.status(500).json({ message: 'Error saving data to Firebase', error });
    } else {
      res.json({ message: 'Data saved successfully to Firebase!' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
