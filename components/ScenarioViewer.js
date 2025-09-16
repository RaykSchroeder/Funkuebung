import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function ScenarioViewer({ scenario, onBack, mode = "team", teamId }) {
  const [openImage, setOpenImage] = useState(null);

  const [checkedTasks, setCheckedTasks] = useState(scenario.tasks.map(() => false));
  const [checkedSolutions, setCheckedSolutions] = useState(
    scenario.solutionTasks ? scenario.solutionTasks.map(() => false) : []
  );

  // ✅ Admin-Passwort aus .env
  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS;

  // Fortschritt laden (nur Admin)
  useEffect(() => {
    if (mode !== "admin") return;

    async function loadProgress() {
      const res = await fetch(
        `/api/task-progress?teamId=${teamId}&scenarioCode=${scenario.code}`,
        {
          headers: { "x-admin-pass": adminPass },
        }
      );
      if (!res.ok) return;
      const data = await res.json();

      // normale Tasks
      const tasksState = [...checkedTasks];
      data.filter((d) => d.type === "task").forEach((d) => {
        if (tasksState[d.task_index] !== undefined) tasksState[d.task_index] = d.done;
      });
      setCheckedTasks(tasksState);

      // Lösungstasks
      const solState = [...checkedSolutions];
      data.filter((d) => d.type === "solution").forEach((d) => {
        if (solState[d.task_index] !== undefined) solState[d.task_index] = d.done;
      });
      setCheckedSolutions(solState);
    }

    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.code, teamId, mode]);

  // Fortschritt speichern
  const saveProgress = async (taskIndex, type, done) => {
    await fetch("/api/task-progress", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pass": adminPass,
      },
      body: JSON.stringify({
        teamId,
        scenarioCode: scenario.code,
        taskIndex,
        type,
        done,
      }),
    });
  };

  const toggleTask = (index) => {
    if (mode !== "admin") return;
    const newVal = !checkedTasks[index];
    setCheckedTasks((prev) => prev.map((v, i) => (i === index ? newVal : v)));
    saveProgress(index, "task", newVal);
  };

  const toggleSolution = (index) => {
    if (mode !== "admin") return;
    const newVal = !checkedSolutions[index];
    setCheckedSolutions((prev) => prev.map((v, i) => (i === index ? newVal : v)));
    saveProgress(index, "solution", newVal);
  };

  return (
    <article className="space-y-4">
      <h2 className="text-xl font-semibold">{scenario.title}</h2>
      <p className="text-slate-700">{scenario.description}</p>

      {scenario.fileType === "image" && (
        <img
          src={scenario.file}
          alt={scenario.title}
          className="w-full max-w-md rounded shadow cursor-zoom-in"
          onClick={() => setOpenImage(scenario.file)}
        />
      )}

      {scenario.fileType === "pdf" && (
        <iframe
          src={scenario.file}
          title={scenario.title}
          className="w-full h-96 border rounded"
        />
      )}

      {/* Aufgaben */}
      <div>
        <h3 className="font-semibold mt-4">Aufgaben</h3>
        <ul className="mt-2 space-y-2">
          {scenario.tasks.map((t, i) => (
            <li
              key={i}
              className="flex items-center gap-2 bg-slate-100 p-2 rounded cursor-pointer"
              onClick={() => toggleTask(i)}
            >
              {mode === "admin" && (
                <input type="checkbox" checked={checkedTasks[i]} readOnly />
              )}
              <span
                className={
                  mode === "admin" && checkedTasks[i]
                    ? "line-through text-gray-500"
                    : ""
                }
              >
                {i + 1}. {t}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lösungstasks */}
      {mode === "admin" && scenario.solutionTasks && (
        <div>
          <h3 className="font-semibold mt-4 text-green-700">Lösungstasks</h3>
          <ul className="mt-2 space-y-2">
            {scenario.solutionTasks.map((t, i) => (
              <li
                key={i}
                className="flex items-center gap-2 bg-green-100 p-2 rounded cursor-pointer"
                onClick={() => toggleSolution(i)}
              >
                <input type="checkbox" checked={checkedSolutions[i]} readOnly />
                <span
                  className={checkedSolutions[i] ? "line-through text-gray-500" : ""}
                >
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 border rounded bg-slate-100"
      >
        Neues Szenario
      </button>

      {openImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setOpenImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white p-2 bg-black/50 rounded-full hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation();
              setOpenImage(null);
            }}
            aria-label="Schließen"
          >
            <X size={28} />
          </button>

          <img
            src={openImage}
            alt="Zoom"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
