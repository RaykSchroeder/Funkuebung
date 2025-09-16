import scenarios from '../../data/scenarios.js'

export default function handler(req, res) {
  const { code } = req.query
  if (!code) return res.status(400).json({ error: 'Code required' })

  const found = scenarios.find((s) => s.code === code)
  if (!found) return res.status(404).json({ error: 'Not found' })

  res.status(200).json(found)
}
