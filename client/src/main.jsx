import React from 'react'

import ReactDOM from 'react-dom/client'

import App from './App'

import './index.css'

import {

  HabitProvider

} from './context/HabitContext'

ReactDOM.createRoot(

  document.getElementById('root')

).render(

  <React.StrictMode>

    <HabitProvider>

      <App />

    </HabitProvider>

  </React.StrictMode>

)