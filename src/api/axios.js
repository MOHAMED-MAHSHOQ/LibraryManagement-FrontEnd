import axios from 'axios'
const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Something went wrong'
        return Promise.reject(new Error(message))
    }
)

export default api