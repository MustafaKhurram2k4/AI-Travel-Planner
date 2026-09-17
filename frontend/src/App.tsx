import { useEffect, useState } from "react";
import { apiFetch } from "./api/client";

export function App() {
  const [health, setHealth] = useState("Checking backend...");
  const [trips, setTrips] = useState<unknown[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/health")
      .then(r => r.json())
      .then(data => setHealth(data.status === "ok" ? "Backend connected" : "Backend error"))
      .catch(() => setHealth("Backend unavailable"));
  }, []);

  async function loadTrips() {
    try {
      const data = await apiFetch<{ trips: unknown[] }>("/trips");
      setTrips(data.trips);
    } catch {
      setTrips([]);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">AI TRAVEL PLANNER</p>
        <h1>Team integration starter</h1>
        <p>
          This is deliberately minimal. Aagam can replace this screen with the
          final React experience while using the API client underneath.
        </p>
        <div className="status">{health}</div>
        <button onClick={loadTrips}>Load my saved trips</button>
        <pre>{JSON.stringify(trips, null, 2)}</pre>
      </section>
    </main>
  );
}
