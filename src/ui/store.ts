import { create } from "zustand"

type GameStore = {
  hp: number
  maxHp: number
  gold: number
  paused: boolean
  inventoryOpen: boolean

  setHp: (hp: number) => void
  togglePaused: () => void
  toggleInventory: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  hp: 100,
  maxHp: 100,
  gold: 0,
  paused: false,
  inventoryOpen: false,

  setHp: (hp) => set({ hp }),
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  toggleInventory: () => set((s) => ({ inventoryOpen: !s.inventoryOpen })),
}))
