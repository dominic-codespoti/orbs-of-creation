import { Application, Graphics } from "pixi.js"

type StartGameOptions = {
  canvas: HTMLCanvasElement
}

export async function startGame({ canvas }: StartGameOptions) {
  const app = new Application()

  await app.init({
    canvas,
    resizeTo: window,
    background: "#111111",
    antialias: false,
  })

  const player = new Graphics()

  player.rect(-16, -16, 32, 32)
  player.fill(0x44ccff)
  player.x = app.screen.width / 2
  player.y = app.screen.height / 2

  app.stage.addChild(player)

  app.ticker.add((ticker) => {
    player.rotation += 0.03 * ticker.deltaTime
  })
}
