import axios from "axios"; // AxiosRequestConfig
// import { Cookies } from "quasar";

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://sorozatok.herokuapp.com/";

const $axios = axios.create({
  baseURL,
  withCredentials: true,
});
// $axios.interceptors.request.use(
//   async function (config: AxiosRequestConfig) {
//     if (!config!.headers!.Authorization) {
//       const token = await Cookies.get("Authorization");
//       if (token) {
//         $axios.defaults.headers.common["Authorization"] = token;
//         config!.headers!.Authorization = token;
//       }
//     }
//     console.log(config);
//     return config;
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );

export default $axios;
