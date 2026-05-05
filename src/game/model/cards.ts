import type { CardType, NodeType } from "./types"

export type CardDefinition = {
  type: CardType
  name: string
  cost: number
  description: string
  intent: "place-node" | "create-edge" | "instant"
  nodeType?: NodeType
}

export const CARD_DEFINITIONS: Record<CardType, CardDefinition> = {
  amplifier: {
    type: "amplifier",
    name: "Amplifier",
    cost: 1,
    description: "Place a node. Pulses passing through gain +2 power.",
    intent: "place-node",
    nodeType: "amplifier",
  },
  splitter: {
    type: "splitter",
    name: "Splitter",
    cost: 1,
    description: "Place a node. Pulses are copied to every outgoing wire.",
    intent: "place-node",
    nodeType: "splitter",
  },
  shield_output: {
    type: "shield_output",
    name: "Shield Output",
    cost: 1,
    description: "Place an output. Incoming pulses become block.",
    intent: "place-node",
    nodeType: "shield_output",
  },
  wire: {
    type: "wire",
    name: "Wire",
    cost: 0,
    description: "Create one directed wire between adjacent nodes.",
    intent: "create-edge",
  },
  surge: {
    type: "surge",
    name: "Surge",
    cost: 1,
    description: "Your Spark emits +2 power this execution.",
    intent: "instant",
  },
}

export const STARTER_DECK: CardType[] = [
  "amplifier",
  "amplifier",
  "amplifier",
  "splitter",
  "splitter",
  "shield_output",
  "shield_output",
  "wire",
  "wire",
  "wire",
  "surge",
  "surge",
]
