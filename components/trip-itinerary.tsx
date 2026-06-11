import type { Trip, TripPoint } from "@/lib/types";

type TripItineraryProps = {
  trip: Trip;
};

function formatCoordinate(value: number) {
  return value.toFixed(5);
}

function ItineraryPoint({
  point,
  role,
  index
}: {
  point: TripPoint;
  role: "Salida" | "Parada" | "Llegada";
  index?: number;
}) {
  return (
    <li className="itinerary-point">
      <div className="itinerary-badge">{role === "Parada" ? index : role[0]}</div>
      <div>
        <div className="itinerary-heading">
          <span>{role === "Parada" ? `Parada ${index}` : role}</span>
          <strong>{point.name}</strong>
        </div>
        {point.description?.trim() && <p>{point.description}</p>}
        <dl>
          <div>
            <dt>Latitud</dt>
            <dd>{formatCoordinate(point.lat)}</dd>
          </div>
          <div>
            <dt>Longitud</dt>
            <dd>{formatCoordinate(point.lng)}</dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

export function TripItinerary({ trip }: TripItineraryProps) {
  return (
    <section className="itinerary" aria-label="Itinerario completo">
      <h3>Itinerario</h3>
      <ol>
        <ItineraryPoint point={trip.origin} role="Salida" />
        {trip.stops.map((stop, index) => (
          <ItineraryPoint
            key={`${stop.name}-${stop.lat}-${stop.lng}-${index}`}
            point={stop}
            role="Parada"
            index={index + 1}
          />
        ))}
        <ItineraryPoint point={trip.destination} role="Llegada" />
      </ol>
    </section>
  );
}
