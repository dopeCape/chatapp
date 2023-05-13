import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

let url = process.env.URL;
const instance = axios.create({
  baseURL: url,
});

export { instance };
