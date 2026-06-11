import type { Trip } from "./types";

export const demoTrips: Trip[] = [
  {
    id: "demo-andes",
    title: "Ruta andina por Colombia",
    startDate: "2026-03-12",
    endDate: "2026-03-20",
    origin: {
      name: "Bogota",
      lat: 4.711,
      lng: -74.0721,
      description: "Punto de salida desde la capital, ideal para arrancar con museo y cafe."
    },
    destination: {
      name: "Medellin",
      lat: 6.2442,
      lng: -75.5812,
      description: "Llegada entre montañas, metro cable y barrios con mucha vida urbana."
    },
    stops: [
      {
        name: "Villa de Leyva",
        lat: 5.6341,
        lng: -73.5244,
        description: "Parada colonial para caminar la plaza y dormir con calma."
      },
      {
        name: "Manizales",
        lat: 5.0703,
        lng: -75.5138,
        description: "Base cafetera con miradores y clima fresco."
      }
    ],
    notes: "Cafes, museos y miradores de montaña entre capitales.",
    color: "#0f766e",
    createdAt: "2026-03-01T12:00:00.000Z",
    updatedAt: "2026-03-01T12:00:00.000Z"
  },
  {
    id: "demo-sur",
    title: "Escapada al cono sur",
    startDate: "2026-05-04",
    endDate: "2026-05-16",
    origin: {
      name: "Santiago",
      lat: -33.4489,
      lng: -70.6693,
      description: "Salida urbana con vista a la cordillera."
    },
    destination: {
      name: "Buenos Aires",
      lat: -34.6037,
      lng: -58.3816,
      description: "Cierre de ruta con arquitectura, librerias y vida nocturna."
    },
    stops: [
      {
        name: "Mendoza",
        lat: -32.8895,
        lng: -68.8458,
        description: "Parada de viñedos y montaña."
      },
      {
        name: "Cordoba",
        lat: -31.4201,
        lng: -64.1888,
        description: "Centro historico y descanso antes de llegar al Rio de la Plata."
      }
    ],
    notes: "Vino, arquitectura y trayectos largos para mirar el mapa como se debe.",
    color: "#d97706",
    createdAt: "2026-04-18T12:00:00.000Z",
    updatedAt: "2026-04-18T12:00:00.000Z"
  },
  {
    id: "demo-europa",
    title: "Ciudades de tren",
    startDate: "2026-07-02",
    endDate: "2026-07-13",
    origin: {
      name: "Madrid",
      lat: 40.4168,
      lng: -3.7038,
      description: "Inicio de viaje con estaciones grandes y barrios caminables."
    },
    destination: {
      name: "Paris",
      lat: 48.8566,
      lng: 2.3522,
      description: "Llegada para cerrar con museos, parques y trenes regionales."
    },
    stops: [
      {
        name: "Barcelona",
        lat: 41.3874,
        lng: 2.1686,
        description: "Arquitectura, costa y cambio de ritmo."
      },
      {
        name: "Lyon",
        lat: 45.764,
        lng: 4.8357,
        description: "Parada gastronomica antes de cruzar hacia Paris."
      }
    ],
    notes: "Ruta urbana para comparar estaciones, barrios y tiempos de viaje.",
    color: "#2563eb",
    createdAt: "2026-06-21T12:00:00.000Z",
    updatedAt: "2026-06-21T12:00:00.000Z"
  }
];
