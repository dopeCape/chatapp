import axios from "axios";

let url = "https://backend-chatapp-hwhs.onrender.com";
const instance = axios.create({
  baseURL: url,
});

export { instance };
