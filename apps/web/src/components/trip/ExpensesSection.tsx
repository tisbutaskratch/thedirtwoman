import { useEffect, useState, type FormEvent } from "react";
import { createExpense, listExpenses } from "@/api/trips";
import type { Expense } from "@/api/types";

export default function ExpensesSection({ tripId }: { tripId: number }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listExpenses(tripId).then(setExpenses);
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!category.trim() || !amount || !date) return;
    setSubmitting(true);
    try {
      await createExpense(tripId, { category, amount: Number(amount), date });
      setCategory("");
      setAmount("");
      setDate("");
      refresh();
    } finally {
      setSubmitting(false);
    }
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
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between rounded-md border border-slate-800 px-4 py-2"
          >
            <span>
              <span className="mr-2 text-xs uppercase tracking-widest text-slate-500">
                {expense.category}
              </span>
              {expense.description}
            </span>
            <span className="text-sm text-slate-300">
              {expense.amount.toFixed(2)} {expense.currency}
            </span>
          </li>
        ))}
        {expenses.length === 0 && <p className="text-sm text-slate-500">No expenses yet.</p>}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </section>
  );
}
