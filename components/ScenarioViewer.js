export default function ScenarioViewer({ scenario, onBack }) {
  return (
    <article className="space-y-4">
      <h2 className="text-xl font-semibold">{scenario.title}</h2>
      <p className="text-slate-700">{scenario.description}</p>

      {scenario.fileType === 'image' && (
        <img
          src={scenario.file}
          alt={scenario.title}
          className="w-full max-w-md rounded shadow"
        />
      )}

      {scenario.fileType === 'pdf' && (
        <iframe
          src={scenario.file}
          title={scenario.title}
          className="w-full h-96 border rounded"
        />
      )}

      <ul className="mt-3 space-y-2">
        {scenario.tasks.map((t, i) => (
          <li key={i} className="bg-slate-100 p-2 rounded">
            {i + 1}. {t}
          </li>
        ))}
      </ul>

      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 border rounded bg-slate-100"
      >
        Neues Szenario
      </button>
    </article>
  )
}
