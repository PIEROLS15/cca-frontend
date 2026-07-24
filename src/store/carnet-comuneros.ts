import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CarnetComunero } from "@/types/carnet-comunero";

interface CarnetsState {
  items: CarnetComunero[];
  add: (dni: string, nroCarnet: string) => { ok: boolean; error?: string };
  remove: (id: number) => void;
  reset: () => void;
}

const MOCK_NAMES = [
  "JOSE MIGUEL SANCHEZ VEGA",
  "JUAN CARLOS PEREZ ROJAS",
  "MARIA FERNANDA QUISPE LOPEZ",
  "LUIS ALBERTO MENDOZA RIOS",
  "ANA LUCIA HUAMAN CASTRO",
  "WILLIAM ROBERT TACILLA LLANOS",
  "ELIAS AGUIRRE ASCATE",
  "CARMEN ROSA FLORES DIAZ",
];

function generateMockNombre(dni: string): string {
  const index = parseInt(dni.slice(-2), 10) % MOCK_NAMES.length;
  return MOCK_NAMES[index];
}

function generateMockFoto(dni: string): string | null {
  const lastDigit = parseInt(dni.slice(-1), 10);
  return lastDigit < 7 ? `https://i.pravatar.cc/300?u=${dni}` : null;
}

let nextId = 5;

const INITIAL_ITEMS: CarnetComunero[] = [
  {
    id: 1,
    dni: "22589370",
    nroCarnet: "1",
    nombre: "JOSE MIGUEL SANCHEZ VEGA",
    foto: "https://i.pravatar.cc/300?u=22589370",
    registrado: "2026-07-24T12:18:14.000Z",
  },
  {
    id: 2,
    dni: "25033158",
    nroCarnet: "2",
    nombre: "JUAN CARLOS PEREZ ROJAS",
    foto: null,
    registrado: "2026-07-24T12:27:16.000Z",
  },
  {
    id: 3,
    dni: "27454662",
    nroCarnet: "3",
    nombre: "JOSE MIGUEL SANCHEZ VEGA",
    foto: "https://i.pravatar.cc/300?u=27454662",
    registrado: "2026-07-24T12:29:53.000Z",
  },
  {
    id: 4,
    dni: "42847146",
    nroCarnet: "4",
    nombre: "JOSE MIGUEL SANCHEZ VEGA",
    foto: "https://i.pravatar.cc/300?u=42847146",
    registrado: "2026-07-24T12:30:04.000Z",
  },
];

export const useCarnetComuneros = create<CarnetsState>()(
  persist(
    (set, get) => ({
      items: INITIAL_ITEMS,

      add: (dni, nroCarnet) => {
        const d = dni.trim();
        const c = nroCarnet.trim();

        if (!/^\d{8}$/.test(d)) {
          return { ok: false, error: "El DNI debe tener 8 dígitos." };
        }

        if (!c) {
          return { ok: false, error: "Ingresa el N° de carnet." };
        }

        const exists = get().items.some((i) => i.dni === d || i.nroCarnet === c);
        if (exists) {
          return { ok: false, error: "Ya existe un registro con ese DNI o N° de carnet." };
        }

        const nombre = generateMockNombre(d);
        const foto = generateMockFoto(d);

        set((s) => ({
          items: [
            {
              id: nextId++,
              dni: d,
              nroCarnet: c,
              nombre,
              foto,
              registrado: new Date().toISOString(),
            },
            ...s.items,
          ],
        }));

        return { ok: true };
      },

      remove: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
        })),

      reset: () => {
        nextId = INITIAL_ITEMS.length + 1;
        set({ items: [...INITIAL_ITEMS] });
      },
    }),
    { name: "cca-carnet-comuneros" },
  ),
);
