import axios from 'axios'

const BASE = import.meta.env.VITE_BACKEND_URL || 'https://system-backend-1u5m.onrender.com'

export const api = (token) => axios.create({
  baseURL: BASE,
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})
