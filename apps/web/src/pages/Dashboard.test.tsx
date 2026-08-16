import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import { AuthProvider } from "@/lib/AuthContext";
import { clearAuthState, setAuthState } from "@/lib/authStore";
import * as tripsApi from "@/api/trips";
import type { Trip } from "@/api/types";

vi.mock("@/api/trips", () => ({
  listTrips: vi.fn(),
}));

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 1,
    user_id: 1,
    title: "Ride to Rivendell",
    trip_type: "motocamping",
    start_date: null,
    end_date: null,
    status: "planning",
    created_at: "2026-01-01",
    percent_planned: 0,
    ...overrides,
  };
}

function renderDashboard() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => {
  clearAuthState();
  localStorage.clear();
  vi.mocked(tripsApi.listTrips).mockReset();
});

describe("Dashboard", () => {
  it("shows a loading state, then the trip list", async () => {
    vi.mocked(tripsApi.listTrips).mockResolvedValue([makeTrip()]);

    renderDashboard();

    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(await screen.findByText("Ride to Rivendell")).toBeInTheDocument();
  });

  it("shows an empty state when there are no trips", async () => {
    vi.mocked(tripsApi.listTrips).mockResolvedValue([]);

    renderDashboard();

    expect(await screen.findByText(/no trips yet/i)).toBeInTheDocument();
  });

  it("shows an error message when trips fail to load", async () => {
    vi.mocked(tripsApi.listTrips).mockRejectedValue(new Error("network error"));

    renderDashboard();

    expect(await screen.findByText("Could not load trips.")).toBeInTheDocument();
  });

  it("marks trips owned by someone else as Shared, but not the viewer's own", async () => {
    setAuthState({
      accessToken: "token-1",
      user: { id: 1, email: "sam@bagend.dev", name: "Sam", created_at: "2026-01-01" },
    });
    vi.mocked(tripsApi.listTrips).mockResolvedValue([
      makeTrip({ id: 1, user_id: 1, title: "My own trip" }),
      makeTrip({ id: 2, user_id: 2, title: "Frodo's trip" }),
    ]);

    renderDashboard();

    const ownTripCard = (await screen.findByText("My own trip")).closest("a");
    const sharedTripCard = screen.getByText("Frodo's trip").closest("a");

    expect(ownTripCard).not.toHaveTextContent("Shared");
    expect(sharedTripCard).toHaveTextContent("Shared");
  });
});
