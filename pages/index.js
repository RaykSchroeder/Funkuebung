import { useState } from 'react'
import ScenarioViewer from '../components/ScenarioViewer'

export default function Home() {
  const [code, setCode] = useState('')
  const [scenario, setScenario] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetchScenario(e) {
    e.preventDefault()
    setError(null)
    setScenario(null)

    if (!/^\d{4}$/.test(code.trim())) {
      setError('Bitte 4-stelligen Code eingeben')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/scenarios?code=${code.trim()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setScenario(data)
    } catch {
      setError('Ungültiger Code oder Szenario nicht gefunden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">FF Imsum – Funkübung</h1>

        <form onSubmit={fetchScenario} className="flex gap-2 mb-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Szenario-Code eingeben"
            maxLength={4}
            className="flex-1 border px-3 py-2 rounded"
          />
          <button className="px-4 py-2 bg-slate-800 text-white rounded">
            Abrufen
          </button>
        </form>

        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading && <div className="text-slate-500 mb-4">Lade …</div>}

        {scenario ? (
          <ScenarioViewer scenario={scenario} onBack={() => setScenario(null)} />
        ) : (
          <p className="text-slate-500">Noch kein Szenario geladen</p>
        )}
      </div>
    </div>
  )
}
