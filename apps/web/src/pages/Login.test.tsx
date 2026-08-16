import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "./Login";
import { AuthProvider } from "@/lib/AuthContext";
import { clearAuthState, getAuthState } from "@/lib/authStore";

function renderLogin(initialPath = "/login") {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/app/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => {
  clearAuthState();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("Login", () => {
  it("logs in and navigates to the dashboard on success", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: "access-1",
          refresh_token: "refresh-1",
          token_type: "bearer",
          user: { id: 1, email: "sam@bagend.dev", name: "Sam", created_at: "2026-01-01" },
        }),
      }),
    );

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), "sam@bagend.dev");
    await user.type(screen.getByLabelText(/password/i), "gardenpath1");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
    expect(getAuthState().accessToken).toBe("access-1");
  });

  it("shows the server's error message on failed login", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Incorrect email or password" }),
      }),
    );

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), "sam@bagend.dev");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Incorrect email or password")).toBeInTheDocument();
    expect(getAuthState().accessToken).toBeNull();
  });

  it("redirects back to the page named in location state after login", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: "access-1",
          refresh_token: "refresh-1",
          token_type: "bearer",
          user: { id: 1, email: "sam@bagend.dev", name: "Sam", created_at: "2026-01-01" },
        }),
      }),
    );

    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/login", state: { from: "/invite/abc123" } }]}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/invite/:token" element={<div>Invite page</div>} />
            <Route path="/app/dashboard" element={<div>Dashboard page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText(/email/i), "sam@bagend.dev");
    await user.type(screen.getByLabelText(/password/i), "gardenpath1");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Invite page")).toBeInTheDocument();
  });
});
