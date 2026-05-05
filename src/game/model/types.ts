export type NodeId = string
export type EdgeId = string
export type CardId = string

export type GridPosition = {
  x: number
  y: number
}

export type NodeType =
  | "spark_generator"
  | "amplifier"
  | "splitter"
  | "strike_output"
  | "shield_output"

export type CardType =
  | "amplifier"
  | "splitter"
  | "shield_output"
  | "wire"
  | "surge"

export type PulseTag = "pierce"

export type Pulse = {
  id: string
  power: number
  tags: PulseTag[]
}

export type GraphNode = {
  id: NodeId
  type: NodeType
  x: number
  y: number
}

export type GraphEdge = {
  id: EdgeId
  from: NodeId
  to: NodeId
}

export type CombatGraph = {
  width: number
  height: number
  nodes: Record<NodeId, GraphNode>
  edges: Record<EdgeId, GraphEdge>
}

export type CardInstance = {
  id: CardId
  type: CardType
}

export type CombatLogEntry = {
  id: string
  message: string
}

export type CombatState = {
  nextId: number
  turn: number
  playerHp: number
  playerMaxHp: number
  playerBlock: number
  enemyHp: number
  enemyMaxHp: number
  enemyAttack: number
  energy: number
  maxEnergy: number
  surgeBonus: number
  graph: CombatGraph
  deck: CardInstance[]
  hand: CardInstance[]
  discard: CardInstance[]
  log: CombatLogEntry[]
  status: "playing" | "won" | "lost"
}
