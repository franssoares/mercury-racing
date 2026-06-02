import axios from "axios";

/**
 * Instância configurada do Axios para comunicação com a API da OpenF1.
 * Define a URL base para todas as requisições do sistema.
 */
export const openF1Api = axios.create({
    baseURL: "https://api.openf1.org/v1",
    timeout: 10000,
});

/**
 * Interceptor de resposta global para tratamento de erros.
 * Captura falhas nas requisições, loga no console e propaga o erro.
 * Atende ao requisito de tratamento global de erros (tópico 8).
 */
openF1Api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Erro na requisição à OpenF1:", error);
        return Promise.reject(error);
    },
);
