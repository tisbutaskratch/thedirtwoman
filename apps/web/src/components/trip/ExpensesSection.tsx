import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createExpense, listExpenses, settleMyExpenseShare } from "@/api/trips";
import type { Collaborator, Expense } from "@/api/types";
import { useAuth } from "@/lib/AuthContext";

export default function ExpensesSection({ tripId }: { tripId: number }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [roster, setRoster] = useState<Collaborator[]>([]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [participantIds, setParticipantIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listExpenses(tripId).then(setExpenses);
    listCollaborators(tripId).then(setRoster);
  }

  useEffect(refresh, [tripId]);

  const nameByUserId = useMemo(() => {
    const map = new Map<number, string>();
    roster.forEach((c) => map.set(c.user_id, c.name));
    return map;
  }, [roster]);

  function toggleParticipant(userId: number) {
    setParticipantIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!category.trim() || !amount || !date) return;
    setSubmitting(true);
    try {
      await createExpense(tripId, {
        category,
        description: description.trim() || null,
        amount: Number(amount),
        date,
        paid_by_user_id: paidBy ? Number(paidBy) : null,
        participant_user_ids: Array.from(participantIds),
      });
      setCategory("");
      setDescription("");
      setAmount("");
      setDate("");
      setPaidBy("");
      setParticipantIds(new Set());
      refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleSettled(expense: Expense, settled: boolean) {
    await settleMyExpenseShare(expense.id, { settled });
    refresh();
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Expenses</h2>
        {expenses.length > 0 && (
          <span className="text-sm text-slate-500">Total: {total.toFixed(2)}</span>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {expenses.map((expense) => {
          const myShare = expense.participants.find((p) => p.user_id === user?.id);
          return (
            <li
              key={expense.id}
              className="flex flex-col gap-2 rounded-md border border-slate-800 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <span className="mr-2 text-xs uppercase tracking-widest text-slate-500">
                    {expense.category}
                  </span>
                  {expense.description}
                </span>
                <span className="text-sm text-slate-300">
                  {expense.amount.toFixed(2)} {expense.currency}
                </span>
              </div>

              {(expense.paid_by_user_id !== null || expense.participants.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {expense.paid_by_user_id !== null && (
                    <span>Paid by {nameByUserId.get(expense.paid_by_user_id) ?? "someone"}</span>
                  )}
                  {expense.participants.length > 0 && (
                    <span>
                      · Split {expense.participants.length} ways (
                      {expense.participants[0]?.share.toFixed(2)} each)
                    </span>
                  )}
                </div>
              )}

              {expense.participants.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {expense.participants.map((p) => (
                    <span
                      key={p.user_id}
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        p.settled
                          ? "border-emerald-900 bg-emerald-950/40 text-emerald-300"
                          : "border-slate-700 bg-slate-800/60 text-slate-400"
                      }`}
                    >
                      {nameByUserId.get(p.user_id) ?? "Someone"} {p.settled ? "✓ paid" : "owes"}
                    </span>
                  ))}
                  {myShare && (
                    <button
                      onClick={() => toggleSettled(expense, !myShare.settled)}
                      className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:border-emerald-600 hover:text-emerald-300"
                    >
                      {myShare.settled ? "Mark my share unpaid" : "Mark my share paid"}
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
        {expenses.length === 0 && <p className="text-sm text-slate-500">No expenses yet.</p>}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
      >
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-32 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-28 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          >
            <option value="">Who paid?</option>
            {roster.map((c) => (
              <option key={c.user_id} value={c.user_id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Split with:</span>
            {roster.map((c) => (
              <label key={c.user_id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={participantIds.has(c.user_id)}
                  onChange={() => toggleParticipant(c.user_id)}
                  className="h-3.5 w-3.5 accent-emerald-500"
                />
                {c.name}
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="ml-auto rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>
    </section>
  );
}
