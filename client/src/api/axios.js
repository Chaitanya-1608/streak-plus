import axios from 'axios'

const API = axios.create({
  baseURL: 'http://https://streak-plus-api.onrender.com/api'
})

export default API