import { PixiGameView } from "./render/PixiGameView"
import { useGameStore } from "../ui/store"

type StartGameOptions = {
  canvas: HTMLCanvasElement
}

export async function startGame({ canvas }: StartGameOptions) {
  const view = new PixiGameView({
    canvas,
    getCombat: () => useGameStore.getState().combat,
    onCellClick: (x, y) => useGameStore.getState().clickCell(x, y),
    onNodeClick: (nodeId) => useGameStore.getState().clickNode(nodeId),
  })

  await view.init(canvas)
}
