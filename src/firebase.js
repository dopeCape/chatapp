// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

import { getAuth } from 'firebase/auth';
import 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDHFoaYIWN3I2-LOnDNEcxv3_I7RmwMmlQ',
  authDomain: 'mym-chatapp.firebaseapp.com',
  projectId: 'mym-chatapp',
  storageBucket: 'mym-chatapp.appspot.com',
  messagingSenderId: '502159711033',
  appId: '1:502159711033:web:d2941f57f54b79104366e8'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export { auth };
