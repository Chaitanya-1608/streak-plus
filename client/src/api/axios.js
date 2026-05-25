import axios from 'axios'

const API = axios.create({
  baseURL: 'https://streak-plus-api.onrender.com/api'
})

export default API