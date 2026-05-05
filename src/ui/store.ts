import { create } from "zustand"
import {
  createInitialCombat,
  executeTurn,
  playCardAtCell,
  playInstantCard,
  playWire,
} from "../game/model/combat"
import { CARD_DEFINITIONS } from "../game/model/cards"
import type { CardId, CombatState, NodeId } from "../game/model/types"

type Selection =
  | { mode: "none" }
  | { mode: "card"; cardId: CardId }
  | { mode: "wire-source"; cardId: CardId; fromNodeId: NodeId }

type GameStore = {
  combat: CombatState
  selection: Selection

  selectCard: (cardId: CardId) => void
  clickCell: (x: number, y: number) => void
  clickNode: (nodeId: NodeId) => void
  execute: () => void
  resetCombat: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  combat: createInitialCombat(),
  selection: { mode: "none" },

  selectCard: (cardId) => {
    const { combat } = get()
    const card = combat.hand.find((item) => item.id === cardId)
    if (!card) return

    const definition = CARD_DEFINITIONS[card.type]

    if (definition.intent === "instant") {
      set({
        combat: playInstantCard(combat, cardId),
        selection: { mode: "none" },
      })
      return
    }

    set({ selection: { mode: "card", cardId } })
  },

  clickCell: (x, y) => {
    const { combat, selection } = get()
    if (selection.mode !== "card") return

    const card = combat.hand.find((item) => item.id === selection.cardId)
    if (!card) return

    const definition = CARD_DEFINITIONS[card.type]
    if (definition.intent !== "place-node") return

    set({
      combat: playCardAtCell(combat, selection.cardId, x, y),
      selection: { mode: "none" },
    })
  },

  clickNode: (nodeId) => {
    const { combat, selection } = get()

    if (selection.mode === "card") {
      const card = combat.hand.find((item) => item.id === selection.cardId)
      if (!card) return

      const definition = CARD_DEFINITIONS[card.type]
      if (definition.intent === "create-edge") {
        set({ selection: { mode: "wire-source", cardId: selection.cardId, fromNodeId: nodeId } })
      }
      return
    }

    if (selection.mode === "wire-source") {
      set({
        combat: playWire(combat, selection.cardId, selection.fromNodeId, nodeId),
        selection: { mode: "none" },
      })
    }
  },

  execute: () => {
    const { combat } = get()
    set({ combat: executeTurn(combat), selection: { mode: "none" } })
  },

  resetCombat: () => {
    set({ combat: createInitialCombat(), selection: { mode: "none" } })
  },
}))
