import { CARD_DEFINITIONS } from "../game/model/cards"
import { useGameStore } from "./store"

export function App() {
  const combat = useGameStore((s) => s.combat)
  const selection = useGameStore((s) => s.selection)
  const selectCard = useGameStore((s) => s.selectCard)
  const execute = useGameStore((s) => s.execute)
  const resetCombat = useGameStore((s) => s.resetCombat)

  const selectedCardId = selection.mode === "card" || selection.mode === "wire-source"
    ? selection.cardId
    : undefined

  return (
    <div className="pointer-events-none absolute inset-0 text-white">
      <header className="absolute left-4 top-4 flex gap-3">
        <div className="ui-panel min-w-40">
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">Player</div>
          <div className="mt-1 text-lg font-bold">
            {combat.playerHp}/{combat.playerMaxHp} HP
          </div>
          <div className="text-sm text-sky-200">{combat.playerBlock} Block</div>
        </div>

        <div className="ui-panel min-w-40">
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">Enemy</div>
          <div className="mt-1 text-lg font-bold">
            Dummy {combat.enemyHp}/{combat.enemyMaxHp}
          </div>
          <div className="text-sm text-rose-200">Intent: {combat.enemyAttack} damage</div>
        </div>

        <div className="ui-panel min-w-32">
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">Energy</div>
          <div className="mt-1 text-2xl font-black text-amber-200">
            {combat.energy}/{combat.maxEnergy}
          </div>
        </div>
      </header>

      <section className="ui-panel absolute right-4 top-4 w-96">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black">Orbs of Creation</h1>
            <p className="mt-1 text-sm text-white/60">
              Build a graph, route pulses, convert signal into damage and block.
            </p>
          </div>
          <button className="ui-button text-sm" onClick={resetCombat}>Reset</button>
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/70">
          {selection.mode === "none" && "Select a card, then click the graph."}
          {selection.mode === "card" && "Choose a valid graph target."}
          {selection.mode === "wire-source" && "Choose an adjacent target node for the wire."}
        </div>
      </section>

      <section className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
        <div className="flex flex-1 gap-3">
          {combat.hand.map((card) => {
            const definition = CARD_DEFINITIONS[card.type]
            const selected = card.id === selectedCardId
            const affordable = combat.energy >= definition.cost

            return (
              <button
                key={card.id}
                className={`pointer-events-auto flex h-40 w-44 flex-col rounded-2xl border p-4 text-left shadow-2xl transition ${
                  selected
                    ? "border-amber-200 bg-amber-300/20"
                    : affordable
                      ? "border-white/15 bg-slate-950/82 hover:-translate-y-1 hover:border-white/35"
                      : "border-white/10 bg-slate-950/45 opacity-50"
                }`}
                onClick={() => selectCard(card.id)}
                disabled={!affordable || combat.status !== "playing"}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-black">{definition.name}</h2>
                  <span className="rounded-full bg-amber-300 px-2 py-0.5 text-sm font-black text-slate-950">
                    {definition.cost}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-5 text-white/65">{definition.description}</p>
              </button>
            )
          })}
        </div>

        <div className="flex w-80 flex-col gap-3">
          <button
            className="ui-button bg-emerald-400/20 px-6 py-4 text-lg font-black hover:bg-emerald-400/30 disabled:opacity-50"
            onClick={execute}
            disabled={combat.status !== "playing"}
          >
            Execute
          </button>

          {combat.status !== "playing" && (
            <div className="ui-panel text-center text-lg font-black">
              {combat.status === "won" ? "Victory" : "Defeat"}
            </div>
          )}
        </div>
      </section>

      <section className="ui-panel absolute bottom-52 right-4 w-96">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-white/45">Combat Log</h2>
        <ol className="space-y-1 text-sm text-white/70">
          {combat.log.map((entry) => (
            <li key={entry.id}>{entry.message}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}
