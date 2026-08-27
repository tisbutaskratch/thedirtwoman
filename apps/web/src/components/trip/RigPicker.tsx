import { useEffect, useState } from "react";
import { listRigs } from "@/api/rigs";
import type { Rig } from "@/api/types";
import { inputClass } from "@/components/ui";

/**
 * "Pick one of yours", wherever a trip asks about a vehicle.
 *
 * Three different places used to ask for a rig's name, tank and mileage,
 * and none of them knew your saved rigs existed. This is one component so
 * that adding a fourth means using it rather than reimplementing it, and so
 * that "pick a rig" looks and behaves the same everywhere.
 *
 * What it hands back is the whole rig. Each caller decides which fields its
 * own form has, because the overlanding panel wants ground clearance and
 * the motocamping one does not.
 *
 * Renders nothing when there are no saved rigs: an empty dropdown teaches
 * nobody that the feature exists, and it would be one more control in the
 * way of somebody who just wants to type a name.
 */
export default function RigPicker({
  onPick,
  label = "Pick one of your rigs…",
  className = "",
}: {
  onPick: (rig: Rig) => void;
  label?: string;
  className?: string;
}) {
  const [rigs, setRigs] = useState<Rig[]>([]);

  useEffect(() => {
    // A failed lookup should never block the form it is decorating.
    listRigs()
      .then(setRigs)
      .catch(() => setRigs([]));
  }, []);

  if (rigs.length === 0) return null;

  return (
    <select
      aria-label="Pick a rig from your garage"
      // Always shows the prompt: this is an action, not a stored value, and
      // leaving a rig selected would imply the trip is linked to it when
      // picking only ever copies the details across.
      value=""
      onChange={(e) => {
        const rig = rigs.find((r) => r.id === Number(e.target.value));
        if (rig) onPick(rig);
      }}
      className={`${className || inputClass}`}
    >
      <option value="">{label}</option>
      {rigs.map((rig) => (
        <option key={rig.id} value={rig.id}>
          {rig.name}
          {rig.description ? ` · ${rig.description}` : ""}
        </option>
      ))}
    </select>
  );
}
