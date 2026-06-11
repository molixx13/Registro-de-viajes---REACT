export type TripPoint = {
  name: string;
  lat: number;
  lng: number;
  description?: string;
};

export type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  origin: TripPoint;
  destination: TripPoint;
  stops: TripPoint[];
  notes: string;
  color: string;
  routeGeometry?: [number, number][];
  distance?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
};

export type TripDraft = Omit<Trip, "id" | "createdAt" | "updatedAt">;

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export type Bounds = [[number, number], [number, number]];
