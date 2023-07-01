// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import 'firebase/storage';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
let firebaseConfig;
// Your web app's Firebase configuration
if (process.env.REACT_APP_ENV === 'DEV') {
  firebaseConfig = {
    apiKey: 'AIzaSyDHFoaYIWN3I2-LOnDNEcxv3_I7RmwMmlQ',
    authDomain: 'mym-chatapp.firebaseapp.com',
    projectId: 'mym-chatapp',
    storageBucket: 'mym-chatapp.appspot.com',
    messagingSenderId: '502159711033',
    appId: '1:502159711033:web:d2941f57f54b79104366e8'
  };
} else if (process.env.REACT_APP_ENV === 'PROD') {
  firebaseConfig = {
    apiKey: 'AIzaSyDRdsur2EKs5BKmMfGPrMjwLDDRTx9H4Fg',
    authDomain: 'mym-chatapp-prod.firebaseapp.com',
    projectId: 'mym-chatapp-prod',
    storageBucket: 'mym-chatapp-prod.appspot.com',
    messagingSenderId: '321815325655',
    appId: '1:321815325655:web:4a9fe6541a470291953992'
  };
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, storage };
