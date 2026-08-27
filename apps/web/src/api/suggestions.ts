import { apiRequest } from "@/api/client";

/**
 * Things you have typed before, across every trip you can see.
 *
 * The trip page already offers what is on the current trip; these are what
 * you brought on the last one, which is where "I always pack this" actually
 * lives.
 */
export function suggestGearNames(): Promise<string[]> {
  return apiRequest<string[]>("/suggestions/gear?limit=25");
}

export function suggestGearCategories(): Promise<string[]> {
  return apiRequest<string[]>("/suggestions/gear-categories?limit=25");
}

export function suggestTaskTitles(): Promise<string[]> {
  return apiRequest<string[]>("/suggestions/tasks?limit=25");
}
