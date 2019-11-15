import * as admin from 'firebas-admin';
import * as serviceAccount from './serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.firebaseDatabaseURL
});
