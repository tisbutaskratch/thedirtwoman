import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MotocampingPanel from "./MotocampingPanel";
import * as motoApi from "@/modes/motocamping/api";
import type { MotocampingDetail } from "@/modes/motocamping/types";

vi.mock("@/modes/motocamping/api", () => ({
  getMotocampingDetail: vi.fn(),
  updateMotocampingDetail: vi.fn(),
}));

function makeDetail(overrides: Partial<MotocampingDetail> = {}): MotocampingDetail {
  return {
    trip_type: "motocamping",
    trip_id: 1,
    motorcycle_name: null,
    fuel_capacity_gal: null,
    fuel_economy_mpg: null,
    daily_ride_target_miles: null,
    est_range_miles: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(motoApi.getMotocampingDetail).mockReset();
  vi.mocked(motoApi.updateMotocampingDetail).mockReset();
});

describe("MotocampingPanel", () => {
  it("renders nothing until the detail loads, then shows the form", async () => {
    vi.mocked(motoApi.getMotocampingDetail).mockResolvedValue(makeDetail());

    render(<MotocampingPanel tripId={1} />);

    expect(await screen.findByText(/motocamping details/i)).toBeInTheDocument();
  });

  it("shows the estimated range once fuel fields are set", async () => {
    vi.mocked(motoApi.getMotocampingDetail).mockResolvedValue(
      makeDetail({ fuel_capacity_gal: 6.1, fuel_economy_mpg: 48, est_range_miles: 292.8 }),
    );

    render(<MotocampingPanel tripId={1} />);

    expect(await screen.findByText(/est\. range: 292\.8 mi/i)).toBeInTheDocument();
  });

  it("does not show a range until fuel fields are set", async () => {
    vi.mocked(motoApi.getMotocampingDetail).mockResolvedValue(makeDetail());

    render(<MotocampingPanel tripId={1} />);

    await screen.findByText(/motocamping details/i);
    expect(screen.queryByText(/est\. range/i)).not.toBeInTheDocument();
  });

  it("saves the form and calls onChange/onDetailChange with the updated detail", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onDetailChange = vi.fn();
    vi.mocked(motoApi.getMotocampingDetail).mockResolvedValue(makeDetail());
    vi.mocked(motoApi.updateMotocampingDetail).mockResolvedValue(
      makeDetail({
        motorcycle_name: "KLR650",
        fuel_capacity_gal: 6.1,
        fuel_economy_mpg: 48,
        est_range_miles: 292.8,
      }),
    );

    render(<MotocampingPanel tripId={1} onChange={onChange} onDetailChange={onDetailChange} />);

    await screen.findByText(/motocamping details/i);

    const textInput = screen.getByRole("textbox");
    await user.type(textInput, "KLR650");

    // DOM order: motorcycle (text), daily target, fuel capacity, fuel economy
    const numberInputs = screen.getAllByRole("spinbutton");
    await user.type(numberInputs[1], "6.1");
    await user.type(numberInputs[2], "48");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(motoApi.updateMotocampingDetail).toHaveBeenCalledWith(1, {
        motorcycle_name: "KLR650",
        fuel_capacity_gal: 6.1,
        fuel_economy_mpg: 48,
        daily_ride_target_miles: null,
      });
    });
    expect(onChange).toHaveBeenCalled();
    expect(onDetailChange).toHaveBeenCalledWith(
      expect.objectContaining({ est_range_miles: 292.8 }),
    );
    expect(await screen.findByText(/est\. range: 292\.8 mi/i)).toBeInTheDocument();
  });
});
