import { useGameStore } from "./store"

export function App() {
  const hp = useGameStore((s) => s.hp)
  const maxHp = useGameStore((s) => s.maxHp)
  const inventoryOpen = useGameStore((s) => s.inventoryOpen)
  const toggleInventory = useGameStore((s) => s.toggleInventory)

  return (
    <div className="absolute inset-0 text-white">
      <div className="ui-panel absolute left-4 top-4">
        <strong>HP</strong> {hp}/{maxHp}
      </div>

      <button
        className="ui-button absolute right-4 top-4"
        onClick={toggleInventory}
      >
        Inventory
      </button>

      {inventoryOpen && (
        <div className="ui-panel absolute right-4 top-18 w-80">
          <h2 className="mb-2 text-xl font-bold">Inventory</h2>
          <p className="text-sm text-white/70">Nothing here yet.</p>
        </div>
      )}
    </div>
  )
}
