import { CARD_DEFINITIONS, STARTER_DECK } from "./cards"
import type {
  CardId,
  CardInstance,
  CardType,
  CombatLogEntry,
  CombatState,
  GraphEdge,
  GraphNode,
  NodeId,
  NodeType,
  Pulse,
} from "./types"

const MAX_EXECUTION_STEPS = 12

export function createInitialCombat(): CombatState {
  let nextId = 1

  const makeNode = (type: NodeType, x: number, y: number): GraphNode => ({
    id: `node-${nextId++}`,
    type,
    x,
    y,
  })

  const generator = makeNode("spark_generator", 1, 1)
  const output = makeNode("strike_output", 2, 1)
  const edge: GraphEdge = {
    id: `edge-${nextId++}`,
    from: generator.id,
    to: output.id,
  }

  const deck = STARTER_DECK.map((type, index) => ({
    id: `card-${index + 1}`,
    type,
  }))

  const state: CombatState = {
    nextId,
    turn: 1,
    playerHp: 40,
    playerMaxHp: 40,
    playerBlock: 0,
    enemyHp: 50,
    enemyMaxHp: 50,
    enemyAttack: 6,
    energy: 3,
    maxEnergy: 3,
    surgeBonus: 0,
    graph: {
      width: 4,
      height: 3,
      nodes: {
        [generator.id]: generator,
        [output.id]: output,
      },
      edges: {
        [edge.id]: edge,
      },
    },
    deck,
    hand: [],
    discard: [],
    log: [],
    status: "playing",
  }

  return startTurn(state, "Combat started.")
}

export function startTurn(state: CombatState, message?: string): CombatState {
  if (state.status !== "playing") return state

  let next = {
    ...state,
    playerBlock: 0,
    energy: state.maxEnergy,
    surgeBonus: 0,
  }

  next = drawCards(next, 5)

  return addLog(
    next,
    message ?? `Turn ${next.turn}: draw ${next.hand.length} cards.`,
  )
}

export function playCardAtCell(
  state: CombatState,
  cardId: CardId,
  x: number,
  y: number,
): CombatState {
  const card = state.hand.find((item) => item.id === cardId)
  if (!card) return addLog(state, "That card is no longer in hand.")

  const definition = CARD_DEFINITIONS[card.type]
  if (definition.intent !== "place-node" || !definition.nodeType) {
    return addLog(state, `${definition.name} cannot be played on a cell.`)
  }

  if (!canSpend(state, definition.cost)) {
    return addLog(state, "Not enough energy.")
  }

  if (!isInsideBoard(state, x, y)) {
    return addLog(state, "That cell is outside the graph.")
  }

  if (nodeAt(state, x, y)) {
    return addLog(state, "That cell already contains a node.")
  }

  const node: GraphNode = {
    id: `node-${state.nextId}`,
    type: definition.nodeType,
    x,
    y,
  }

  return finishPlayingCard(
    {
      ...state,
      nextId: state.nextId + 1,
      graph: {
        ...state.graph,
        nodes: {
          ...state.graph.nodes,
          [node.id]: node,
        },
      },
    },
    card,
    `${definition.name} installed.`,
  )
}

export function playWire(
  state: CombatState,
  cardId: CardId,
  fromNodeId: NodeId,
  toNodeId: NodeId,
): CombatState {
  const card = state.hand.find((item) => item.id === cardId)
  if (!card) return addLog(state, "That card is no longer in hand.")

  const definition = CARD_DEFINITIONS[card.type]
  if (definition.intent !== "create-edge") {
    return addLog(state, `${definition.name} cannot create a wire.`)
  }

  if (!canSpend(state, definition.cost)) {
    return addLog(state, "Not enough energy.")
  }

  const from = state.graph.nodes[fromNodeId]
  const to = state.graph.nodes[toNodeId]
  if (!from || !to) return addLog(state, "Choose two existing nodes.")

  if (!areAdjacent(from, to)) {
    return addLog(state, "Wires can only connect adjacent nodes.")
  }

  const existing = Object.values(state.graph.edges).some(
    (edge) => edge.from === fromNodeId && edge.to === toNodeId,
  )
  if (existing) return addLog(state, "That wire already exists.")

  const edge: GraphEdge = {
    id: `edge-${state.nextId}`,
    from: fromNodeId,
    to: toNodeId,
  }

  return finishPlayingCard(
    {
      ...state,
      nextId: state.nextId + 1,
      graph: {
        ...state.graph,
        edges: {
          ...state.graph.edges,
          [edge.id]: edge,
        },
      },
    },
    card,
    "Wire connected.",
  )
}

export function playInstantCard(
  state: CombatState,
  cardId: CardId,
): CombatState {
  const card = state.hand.find((item) => item.id === cardId)
  if (!card) return addLog(state, "That card is no longer in hand.")

  const definition = CARD_DEFINITIONS[card.type]
  if (definition.intent !== "instant") {
    return addLog(state, `${definition.name} needs a target.`)
  }

  if (!canSpend(state, definition.cost)) {
    return addLog(state, "Not enough energy.")
  }

  if (card.type === "surge") {
    return finishPlayingCard(
      {
        ...state,
        surgeBonus: state.surgeBonus + 2,
      },
      card,
      "Spark charged with +2 power.",
    )
  }

  return addLog(state, "Nothing happened.")
}

export function executeTurn(state: CombatState): CombatState {
  if (state.status !== "playing") return state

  let next = addLog(state, "Execute.")
  const generators = Object.values(next.graph.nodes).filter(
    (node) => node.type === "spark_generator",
  )

  for (const generator of generators) {
    const pulse: Pulse = {
      id: `pulse-${next.nextId}`,
      power: 3 + next.surgeBonus,
      tags: [],
    }
    next = { ...next, nextId: next.nextId + 1 }
    next = addLog(next, `Spark emits ${pulse.power} power.`)
    next = propagatePulse(next, generator.id, pulse, 0)
  }

  if (next.enemyHp <= 0) {
    return addLog({ ...next, enemyHp: 0, status: "won" }, "Enemy defeated.")
  }

  next = enemyTurn(next)

  if (next.playerHp <= 0) {
    return addLog({ ...next, playerHp: 0, status: "lost" }, "You were defeated.")
  }

  return startTurn(
    {
      ...next,
      turn: next.turn + 1,
      hand: [],
    },
    `Turn ${next.turn + 1}.`,
  )
}

function propagatePulse(
  state: CombatState,
  fromNodeId: NodeId,
  pulse: Pulse,
  depth: number,
): CombatState {
  if (depth >= MAX_EXECUTION_STEPS) {
    return addLog(state, "Pulse fizzled to prevent a loop.")
  }

  const outgoing = Object.values(state.graph.edges).filter(
    (edge) => edge.from === fromNodeId,
  )

  if (outgoing.length === 0) return state

  let next = state

  for (const edge of outgoing) {
    const target = next.graph.nodes[edge.to]
    if (!target) continue

    next = resolveNode(next, target, { ...pulse }, depth + 1)
  }

  return next
}

function resolveNode(
  state: CombatState,
  node: GraphNode,
  pulse: Pulse,
  depth: number,
): CombatState {
  switch (node.type) {
    case "spark_generator":
      return propagatePulse(state, node.id, pulse, depth)
    case "amplifier": {
      const amplified = { ...pulse, power: pulse.power + 2 }
      return propagatePulse(
        addLog(state, `Amplifier raises pulse to ${amplified.power}.`),
        node.id,
        amplified,
        depth,
      )
    }
    case "splitter":
      return propagatePulse(addLog(state, "Splitter copies the pulse."), node.id, pulse, depth)
    case "strike_output": {
      const enemyHp = Math.max(0, state.enemyHp - pulse.power)
      return addLog(
        {
          ...state,
          enemyHp,
        },
        `Strike deals ${pulse.power} damage.`,
      )
    }
    case "shield_output":
      return addLog(
        {
          ...state,
          playerBlock: state.playerBlock + pulse.power,
        },
        `Shield gains ${pulse.power} block.`,
      )
  }
}

function enemyTurn(state: CombatState): CombatState {
  const damage = Math.max(0, state.enemyAttack - state.playerBlock)
  const blocked = state.enemyAttack - damage

  return addLog(
    {
      ...state,
      playerHp: Math.max(0, state.playerHp - damage),
    },
    `Enemy attacks for ${state.enemyAttack}. Blocked ${blocked}, took ${damage}.`,
  )
}

function drawCards(state: CombatState, count: number): CombatState {
  let deck = [...state.deck]
  const hand = [...state.hand]
  let discard = [...state.discard]

  for (let index = 0; index < count; index++) {
    if (deck.length === 0) {
      deck = [...discard]
      discard = []
    }

    const card = deck.shift()
    if (!card) break
    hand.push(card)
  }

  return {
    ...state,
    deck,
    hand,
    discard,
  }
}

function finishPlayingCard(
  state: CombatState,
  card: CardInstance,
  message: string,
): CombatState {
  const definition = CARD_DEFINITIONS[card.type]
  return addLog(
    {
      ...state,
      energy: state.energy - definition.cost,
      hand: state.hand.filter((item) => item.id !== card.id),
      discard: [...state.discard, card],
    },
    message,
  )
}

function canSpend(state: CombatState, cost: number): boolean {
  return state.energy >= cost
}

function isInsideBoard(state: CombatState, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < state.graph.width && y < state.graph.height
}

function nodeAt(state: CombatState, x: number, y: number): GraphNode | undefined {
  return Object.values(state.graph.nodes).find((node) => node.x === x && node.y === y)
}

function areAdjacent(first: GraphNode, second: GraphNode): boolean {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y) === 1
}

function addLog(state: CombatState, message: string): CombatState {
  const entry: CombatLogEntry = {
    id: `log-${state.nextId}-${state.log.length}`,
    message,
  }

  return {
    ...state,
    log: [entry, ...state.log].slice(0, 8),
  }
}
