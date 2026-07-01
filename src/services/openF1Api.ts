import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";

const MAX_RETRIES = 3;
const getRetryDelay = (retryCount: number) => 1000 * Math.pow(2, retryCount);

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
    __retryCount?: number;
}

/**
 * Instância configurada do Axios para comunicação com a API da OpenF1.
 * Define a URL base para todas as requisições do sistema.
 */
export const openF1Api = axios.create({
    baseURL: "https://api.openf1.org/v1",
    timeout: 10000,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Interceptor de resposta global para tratamento de erros.
 * Captura falhas nas requisições, loga no console e propaga o erro.
 * Para 429, tenta reexecutar a requisição com backoff exponencial.
 */
openF1Api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfigWithRetry | undefined;

        if (
            error.response?.status === 429 &&
            config &&
            (config.__retryCount ?? 0) < MAX_RETRIES
        ) {
            config.__retryCount = (config.__retryCount ?? 0) + 1;
            const delay = getRetryDelay(config.__retryCount);
            console.warn(
                `OpenF1 rate limit hit, retry ${config.__retryCount}/${MAX_RETRIES} after ${delay}ms`,
            );
            await sleep(delay);
            return openF1Api(config);
        }

        console.error("Erro na requisição à OpenF1:", error);
        return Promise.reject(error);
    },
);
