import type { CaptureMapImage } from "@/components/trip-map";

type PrintMapOptions = {
  captureMapImage: CaptureMapImage | null;
  setPrintMapImage: (image: string | null) => void;
  setPrintMapError: (hasError: boolean) => void;
  requestFrame?: (callback: FrameRequestCallback) => number;
  print?: () => void;
};

export async function printPageWithMapCapture({
  captureMapImage,
  setPrintMapImage,
  setPrintMapError,
  requestFrame = window.requestAnimationFrame.bind(window),
  print = window.print.bind(window)
}: PrintMapOptions) {
  let image: string | null = null;
  try {
    image = (await Promise.resolve(captureMapImage?.())) ?? null;
  } catch {
    image = null;
  }

  setPrintMapImage(image);
  setPrintMapError(!image);

  window.onafterprint = () => {
    setPrintMapImage(null);
    setPrintMapError(false);
    window.onafterprint = null;
  };

  await new Promise<void>((resolve) => {
    requestFrame(() => {
      setTimeout(() => {
        print();
        resolve();
      }, 150);
    });
  });
}
