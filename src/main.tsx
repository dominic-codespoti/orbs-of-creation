import React from "react"
import ReactDOM from "react-dom/client"
import { startGame } from "./game/Game"
import { App } from "./ui/App"
import "./style.css"

startGame({
  canvas: document.getElementById("game-canvas") as HTMLCanvasElement,
})

ReactDOM.createRoot(document.getElementById("ui-root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
