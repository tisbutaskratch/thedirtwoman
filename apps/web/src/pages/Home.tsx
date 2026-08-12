import { useEffect, useState } from "react";
import { getHealth } from "@/api/client";

export default function Home() {
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("down"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
      <h1 className="text-4xl font-bold">Adventure Planner</h1>
      <p className="text-slate-400">Motocamping · Camping · Overlanding · Backpacking · International</p>
      <p className="text-sm">
        API status:{" "}
        <span
          className={
            apiStatus === "ok"
              ? "text-emerald-400"
              : apiStatus === "down"
                ? "text-red-400"
                : "text-slate-500"
          }
        >
          {apiStatus}
        </span>
      </p>
    </main>
  );
}
