import axios from 'axios';

// let url = "https://backend-chatapp-hwhs.onrender.com";

let url = process.env.REACT_APP_URL;

const instance = axios.create({
  baseURL: url
});

export { instance };
