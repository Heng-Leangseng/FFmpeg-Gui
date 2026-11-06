import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import { ffmpegEngine } from './engine/ffmpeg'

const root = ReactDOM.createRoot(document.getElementById('root')!)
const preloader = document.getElementById('ffmpeg-preloader')

async function bootstrap() {
  try {
    await ffmpegEngine.load()
  } catch {
  } finally {
    preloader?.remove()
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  }
}

bootstrap()
