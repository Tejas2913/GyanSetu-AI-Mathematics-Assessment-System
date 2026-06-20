import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MathJaxContext } from 'better-react-mathjax'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ErrorBoundary from './components/feedback/ErrorBoundary.jsx'
import './index.css'

const mathJaxConfig = {
  loader: { load: ['input/tex', 'output/chtml'] },
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <MathJaxContext config={mathJaxConfig}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MathJaxContext>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
