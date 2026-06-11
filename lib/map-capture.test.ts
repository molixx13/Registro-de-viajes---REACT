import { describe, expect, it, vi } from "vitest";
import { captureMapAsDataURL } from "./map-capture";

function createFakeMap(toDataURL: (type?: string) => string, width = 800, height = 600) {
  return {
    triggerRepaint: vi.fn(),
    once: vi.fn((_event: string, listener: () => void) => {
      queueMicrotask(listener);
      return undefined;
    }),
    getCanvas: () => ({ width, height, toDataURL })
  };
}

describe("captureMapAsDataURL", () => {
  it("returns a data URL after waiting for the next render", async () => {
    const toDataURL = vi.fn(() => "data:image/png;base64,FAKE");
    const map = createFakeMap(toDataURL);

    const result = await captureMapAsDataURL(map as never);

    expect(map.triggerRepaint).toHaveBeenCalled();
    expect(toDataURL).toHaveBeenCalledWith("image/png");
    expect(result).toBe("data:image/png;base64,FAKE");
  });

  it("returns null when the canvas has zero dimensions", async () => {
    const map = createFakeMap(() => "data:image/png;base64,FAKE", 0, 0);
    const result = await captureMapAsDataURL(map as never);
    expect(result).toBeNull();
  });

  it("returns null when toDataURL throws (e.g. context lost)", async () => {
    const map = createFakeMap(() => {
      throw new Error("context lost");
    });
    const result = await captureMapAsDataURL(map as never);
    expect(result).toBeNull();
  });

  it("returns null when map is missing", async () => {
    const result = await captureMapAsDataURL(null as never);
    expect(result).toBeNull();
  });
});
