// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [teamId, setTeamId] = useState("");
  const [role, setRole] = useState("GF1");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamId) return alert("Bitte Team eingeben!");
    router.push(`/team?team=${teamId}&role=${role}`);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">🚒 Funkübung Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Gruppe</label>
          <input
            type="number"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="z.B. 1"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Rolle</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="GF1">Gruppenführer</option>
            <option value="AT1">Angriffstrupp</option>
            <option value="WT1">Wassertrupp</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded w-full"
        >
          Start
        </button>
      </form>
    </div>
  );
}
