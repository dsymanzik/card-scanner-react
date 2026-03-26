import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.50.25:8000',
  timeout: 10000,
})

export default api
