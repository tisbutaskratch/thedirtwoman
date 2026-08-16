import { apiRequest } from "@/api/client";
import type { Task, TaskCreate, TaskUpdate } from "@/api/types";

export const listTasks = (tripId: number) => apiRequest<Task[]>(`/trips/${tripId}/tasks`);

export const createTask = (tripId: number, payload: TaskCreate) =>
  apiRequest<Task>(`/trips/${tripId}/tasks`, { method: "POST", body: JSON.stringify(payload) });

export const updateTask = (id: number, payload: TaskUpdate) =>
  apiRequest<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteTask = (id: number) => apiRequest<void>(`/tasks/${id}`, { method: "DELETE" });
