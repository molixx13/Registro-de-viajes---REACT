import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlaceAutocomplete } from "./place-autocomplete";

vi.mock("@/hooks/use-place-search", () => ({
  usePlaceSearch: () => ({
    status: "success",
    options: [
      {
        name: "Bogota",
        label: "Bogota, Colombia",
        lat: 4.711,
        lng: -74.0721,
        description: "Bogota, Colombia"
      }
    ]
  })
}));

describe("PlaceAutocomplete", () => {
  it("fills name, latitude and longitude from the selected option", async () => {
    const onChange = vi.fn();

    render(
      <PlaceAutocomplete
        label="Origen"
        point={{ name: "Bog", lat: 0, lng: 0 }}
        onChange={onChange}
      />
    );

    fireEvent.focus(screen.getByLabelText("Origen"));
    fireEvent.click(screen.getByRole("option"));

    expect(onChange).toHaveBeenLastCalledWith({
      name: "Bogota",
      lat: 4.711,
      lng: -74.0721,
      description: "Bogota, Colombia"
    });
  });
});
