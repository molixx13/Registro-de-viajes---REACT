export type MapSnapshot = {
  width: number;
  height: number;
  toDataURL: (type?: string, quality?: number) => string;
};

export type MapLike = {
  getCanvas: () => MapSnapshot;
  triggerRepaint?: () => void;
  once: (event: string, listener: () => void) => unknown;
};

export async function captureMapAsDataURL(map: MapLike): Promise<string | null> {
  if (!map || typeof map.getCanvas !== "function") return null;

  map.triggerRepaint?.();
  await new Promise<void>((resolve) => {
    try {
      map.once("render", () => resolve());
    } catch {
      resolve();
    }
  });

  try {
    const canvas = map.getCanvas();
    if (!canvas || canvas.width === 0 || canvas.height === 0) return null;
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}
