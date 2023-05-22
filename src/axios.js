import axios from "axios";

// let url = "https://backend-chatapp-hwhs.onrender.com";
let url = "http://localhost:9000";

const instance = axios.create({
  baseURL: url,
});

export { instance };
