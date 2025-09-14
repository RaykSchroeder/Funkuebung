import { useState } from 'react'
import ScenarioViewer from '../components/ScenarioViewer'
import FeedbackForm from '../components/FeedbackForm'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🚒 FF Imsum – Funkübung</h1>

        <form onSubmit={fetchScenario} className="flex gap-2 mb-6">
          <div className="flex-1">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Szenario-Code
            </label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="z. B. 1234"
              maxLength={4}
              className="w-full border px-3 py-3 rounded-lg text-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <button className="px-5 py-3 bg-red-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-red-700 flex items-center gap-2">
            🔍 Abrufen
          </button>
        </form>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-800 border border-red-300">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Lade …
          </div>
        )}

        {scenario ? (
          <ScenarioViewer scenario={scenario} onBack={() => setScenario(null)} />
        ) : (
          <p className="text-gray-500">Noch kein Szenario geladen</p>
        )}

        <FeedbackForm />
      </div>
    </div>
  )
}
