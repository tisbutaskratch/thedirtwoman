import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createExpense, deleteExpense, listExpenses, settleMyExpenseShare } from "@/api/trips";
import type { Collaborator, Expense } from "@/api/types";
import { AddForm, Badge, EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";
import { useAuth } from "@/lib/AuthContext";

export default function ExpensesSection({ tripId }: { tripId: number }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [roster, setRoster] = useState<Collaborator[]>([]);
  const [showAdd, setShowAdd] = useState(false);
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

  async function handleDelete(id: number) {
    await deleteExpense(id);
    refresh();
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const owedByMe = expenses.reduce((sum, e) => {
    const mine = e.participants.find((p) => p.user_id === user?.id && !p.settled);
    return sum + (mine?.share ?? 0);
  }, 0);

  return (
    <Section
      glyph={SECTION_META.expenses.glyph}
      title="Expenses"
      tone={SECTION_META.expenses.tone}
      actions={
        !showAdd && (
          <IconButton onClick={() => setShowAdd(true)} title="Add expense" icon="add" />
        )
      }
    >
      {expenses.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-card border border-edge bg-surface-raised p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
              Trip total
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-400">
              {total.toFixed(2)}
            </p>
          </div>
          <div className="rounded-card border border-edge bg-surface-raised p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
              You owe
            </p>
            <p
              className={`mt-1 text-xl font-semibold tabular-nums ${owedByMe > 0 ? "text-amber-400" : "text-emerald-400"}`}
            >
              {owedByMe.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {showAdd && (
        <AddForm onSubmit={handleSubmit} onClose={() => setShowAdd(false)} submitting={submitting}>
          <div className="grid gap-2 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <input
              type="text"
              autoFocus
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)]">
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
            <input
              type="date"
              aria-label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
            <select
              value={paidBy}
              aria-label="Paid by"
              onChange={(e) => setPaidBy(e.target.value)}
              className={inputClass}
            >
              <option value="">Who paid?</option>
              {roster.map((c) => (
                <option key={c.user_id} value={c.user_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-content-muted">
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
        </AddForm>
      )}

      {expenses.length === 0 ? (
        <EmptyState glyph="💰" message="No expenses yet." />
      ) : (
        <ul className="flex flex-col gap-2">
          {expenses.map((expense) => {
            const myShare = expense.participants.find((p) => p.user_id === user?.id);
            return (
              <li
                key={expense.id}
                className="flex flex-col gap-2 rounded-card border border-edge bg-surface-raised px-3 py-2.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-content-subtle">
                      {expense.category}
                    </p>
                    <p className="text-sm text-content">{expense.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tabular-nums text-content">
                      {expense.amount.toFixed(2)}
                      <span className="ml-1 text-xs font-normal text-content-subtle">
                        {expense.currency}
                      </span>
                    </span>
                    <IconButton
                      onClick={() => handleDelete(expense.id)}
                      title="Remove"
                      variant="danger"
                      icon="remove"
                    />
                  </div>
                </div>

                {(expense.paid_by_user_id !== null || expense.participants.length > 0) && (
                  <p className="text-xs text-content-subtle">
                    {expense.paid_by_user_id !== null &&
                      `Paid by ${nameByUserId.get(expense.paid_by_user_id) ?? "someone"}`}
                    {expense.participants.length > 0 &&
                      ` · split ${expense.participants.length} ways (${expense.participants[0]?.share.toFixed(2)} each)`}
                  </p>
                )}

                {expense.participants.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {expense.participants.map((p) => (
                      <Badge key={p.user_id} tone={p.settled ? "emerald" : "amber"}>
                        {nameByUserId.get(p.user_id) ?? "Someone"} {p.settled ? "✓" : "owes"}
                      </Badge>
                    ))}
                    {myShare && (
                      <button
                        onClick={() => toggleSettled(expense, !myShare.settled)}
                        className="rounded-full border border-edge px-2 py-0.5 text-xs text-content-muted transition-colors hover:border-accent hover:text-accent"
                      >
                        {myShare.settled ? "Mark unpaid" : "Mark mine paid"}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
