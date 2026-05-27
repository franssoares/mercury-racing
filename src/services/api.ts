import axios from "axios";

export const api = axios.create({
    baseURL: "https://api.openf1.org/v1",
});

// Interceptor para tratamento global de erros (req. topico 8)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Erro na requisição à OpenF1:", error);
        return Promise.reject(error);
    },
);
