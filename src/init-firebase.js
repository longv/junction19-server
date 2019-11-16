import * as admin from 'firebase-admin';
import * as serviceAccount from '../serviceAccountKey';
import * as parkData from '../nuuksio_converted'

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.firebaseDatabaseURL
});

const firestore = admin.firestore();
const settings = {timestampsInSnapshots: true};

firestore.settings(settings);
if (parkData) {
    console.log(Array.isArray(parkData));

    JSON.parse(parkData).forEach(row => {
        console.log("Test");
        firestore.collection("ParkCounter").doc(row.CounterReadingID).set(row)
            .then((res) => {
                console.log("Document successfully written!");
            }).catch((error) => {
                console.error("Error writing document: ", error);
            });
    });
}
