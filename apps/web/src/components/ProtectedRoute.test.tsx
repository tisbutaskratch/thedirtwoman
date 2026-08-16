import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "@/lib/AuthContext";
import { clearAuthState, setAuthState } from "@/lib/authStore";

function renderWithRouter(initialPath: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app/dashboard" element={<div>Dashboard page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => {
  clearAuthState();
  localStorage.clear();
});

describe("ProtectedRoute", () => {
  it("redirects to /login when not authenticated", () => {
    renderWithRouter("/app/dashboard");

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard page")).not.toBeInTheDocument();
  });

  it("renders the protected content when authenticated", () => {
    setAuthState({
      accessToken: "token-1",
      user: { id: 1, email: "sam@bagend.dev", name: "Sam", created_at: "2026-01-01" },
    });

    renderWithRouter("/app/dashboard");

    expect(screen.getByText("Dashboard page")).toBeInTheDocument();
  });
});
