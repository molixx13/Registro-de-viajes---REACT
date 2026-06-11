import { describe, expect, it, vi } from "vitest";
import { printPageWithMapCapture } from "./print";

describe("printPageWithMapCapture", () => {
  it("captures the map, waits one frame, then prints", async () => {
    const events: string[] = [];
    const print = vi.fn(() => events.push("print"));
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      events.push("frame");
      callback(0);
      return 1;
    });

    await printPageWithMapCapture({
      captureMapImage: () => {
        events.push("capture");
        return "data:image/png;base64,abc";
      },
      setPrintMapImage: (image) => events.push(`image:${Boolean(image)}`),
      setPrintMapError: (hasError) => events.push(`error:${hasError}`),
      requestFrame,
      print
    });

    expect(events).toEqual(["capture", "image:true", "error:false", "frame", "print"]);
    expect(print).toHaveBeenCalledTimes(1);
  });

  it("sets a printable fallback when capture fails", async () => {
    const errors: boolean[] = [];

    await printPageWithMapCapture({
      captureMapImage: () => null,
      setPrintMapImage: vi.fn(),
      setPrintMapError: (hasError) => errors.push(hasError),
      requestFrame: (callback) => {
        callback(0);
        return 1;
      },
      print: vi.fn()
    });

    expect(errors).toEqual([true]);
  });
});
