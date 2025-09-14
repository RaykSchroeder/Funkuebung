let feedbacks = []; // Speicher im Arbeitsspeicher (flüchtig!)

export default function handler(req, res) {
  if (req.method === "POST") {
    const { message } = req.body;
    const entry = {
      id: feedbacks.length + 1,
      message,
      date: new Date().toISOString(),
    };
    feedbacks.push(entry);
    console.log("📩 Feedback empfangen:", entry);
    res.status(200).json({ success: true });
  } else if (req.method === "GET") {
    res.status(200).json(feedbacks);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
