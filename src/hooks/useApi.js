import axios from 'axios'

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export const api = (token) => axios.create({
  baseURL: BASE,
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})
