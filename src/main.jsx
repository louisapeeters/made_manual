import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { OnboardingProvider } from './context/OnboardingContext'
import { TourProvider } from './context/TourContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <OnboardingProvider>
        <TourProvider>
          <App />
        </TourProvider>
      </OnboardingProvider>
    </BrowserRouter>
  </React.StrictMode>
)
