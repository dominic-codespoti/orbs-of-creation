import { Application, Container, Graphics, Text } from "pixi.js"
import type { CombatState, GraphNode, NodeId } from "../model/types"

const CELL_SIZE = 120
const NODE_RADIUS = 28
const BOARD_OFFSET_X = 120
const BOARD_OFFSET_Y = 150

const NODE_STYLE: Record<GraphNode["type"], { color: number; label: string }> = {
  spark_generator: { color: 0x44ccff, label: "G" },
  amplifier: { color: 0xffd166, label: "+" },
  splitter: { color: 0xb78cff, label: "S" },
  strike_output: { color: 0xff5c7a, label: "D" },
  shield_output: { color: 0x6ea8ff, label: "B" },
}

type PixiGameViewOptions = {
  canvas: HTMLCanvasElement
  getCombat: () => CombatState
  onCellClick: (x: number, y: number) => void
  onNodeClick: (nodeId: NodeId) => void
}

export class PixiGameView {
  private readonly app = new Application()
  private readonly board = new Container()
  private readonly getCombat: () => CombatState
  private readonly onCellClick: (x: number, y: number) => void
  private readonly onNodeClick: (nodeId: NodeId) => void
  private lastSignature = ""

  constructor(options: PixiGameViewOptions) {
    this.getCombat = options.getCombat
    this.onCellClick = options.onCellClick
    this.onNodeClick = options.onNodeClick
  }

  async init(canvas: HTMLCanvasElement) {
    await this.app.init({
      canvas,
      resizeTo: window,
      background: "#080b12",
      antialias: true,
    })

    this.app.stage.addChild(this.board)
    this.app.ticker.add(() => this.renderIfNeeded())
  }

  destroy() {
    this.app.destroy(true)
  }

  private renderIfNeeded() {
    const combat = this.getCombat()
    const signature = JSON.stringify({
      nodes: combat.graph.nodes,
      edges: combat.graph.edges,
      hp: combat.enemyHp,
      block: combat.playerBlock,
    })

    if (signature === this.lastSignature) return

    this.lastSignature = signature
    this.render(combat)
  }

  private render(combat: CombatState) {
    this.board.removeChildren()
    this.drawGrid(combat)
    this.drawEdges(combat)
    this.drawNodes(combat)
  }

  private drawGrid(combat: CombatState) {
    for (let y = 0; y < combat.graph.height; y++) {
      for (let x = 0; x < combat.graph.width; x++) {
        const cell = new Graphics()
        const position = cellToScreen(x, y)

        cell.roundRect(position.x - 42, position.y - 42, 84, 84, 12)
        cell.fill({ color: 0x101827, alpha: 0.82 })
        cell.stroke({ color: 0x26324a, width: 2 })
        cell.eventMode = "static"
        cell.cursor = "pointer"
        cell.on("pointertap", () => this.onCellClick(x, y))

        this.board.addChild(cell)
      }
    }
  }

  private drawEdges(combat: CombatState) {
    for (const edge of Object.values(combat.graph.edges)) {
      const from = combat.graph.nodes[edge.from]
      const to = combat.graph.nodes[edge.to]
      if (!from || !to) continue

      const fromPosition = cellToScreen(from.x, from.y)
      const toPosition = cellToScreen(to.x, to.y)

      const line = new Graphics()
      line.moveTo(fromPosition.x, fromPosition.y)
      line.lineTo(toPosition.x, toPosition.y)
      line.stroke({ color: 0x91a7ff, width: 5, alpha: 0.72 })

      const angle = Math.atan2(toPosition.y - fromPosition.y, toPosition.x - fromPosition.x)
      const arrowX = toPosition.x - Math.cos(angle) * 46
      const arrowY = toPosition.y - Math.sin(angle) * 46
      const arrow = new Graphics()
      arrow.poly([
        arrowX,
        arrowY,
        arrowX - Math.cos(angle - 0.55) * 18,
        arrowY - Math.sin(angle - 0.55) * 18,
        arrowX - Math.cos(angle + 0.55) * 18,
        arrowY - Math.sin(angle + 0.55) * 18,
      ])
      arrow.fill(0x91a7ff)

      this.board.addChild(line, arrow)
    }
  }

  private drawNodes(combat: CombatState) {
    for (const node of Object.values(combat.graph.nodes)) {
      const style = NODE_STYLE[node.type]
      const position = cellToScreen(node.x, node.y)

      const body = new Graphics()
      body.circle(position.x, position.y, NODE_RADIUS)
      body.fill(style.color)
      body.stroke({ color: 0xffffff, alpha: 0.72, width: 3 })
      body.eventMode = "static"
      body.cursor = "pointer"
      body.on("pointertap", () => this.onNodeClick(node.id))

      const label = new Text({
        text: style.label,
        style: {
          fill: 0x08111f,
          fontSize: 24,
          fontWeight: "700",
        },
      })
      label.anchor.set(0.5)
      label.x = position.x
      label.y = position.y

      this.board.addChild(body, label)
    }
  }
}

function cellToScreen(x: number, y: number) {
  return {
    x: BOARD_OFFSET_X + x * CELL_SIZE,
    y: BOARD_OFFSET_Y + y * CELL_SIZE,
  }
}
