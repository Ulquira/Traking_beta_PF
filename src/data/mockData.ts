export type InstalacionStatus = 'programada' | 'asignado' | 'en_camino' | 'en_proceso' | 'finalizada' | 'cerrada';

export interface InstalacionData {
  status: InstalacionStatus;
  tecnico?: {
    nombre: string;
    cuadrilla: string;
    telefono: string;
  };
  eta?: string;
  trafico?: string;
}

export const mockInstallations: Record<string, InstalacionData> = {
  "12345678": { status: "programada" },
  "87654321": { status: "asignado", tecnico: { nombre: "Luis Gamarra", cuadrilla: "Cuadrilla Alpha 7", telefono: "987654321" } },
  "44556677": { status: "en_camino", tecnico: { nombre: "Carlos Rivas", cuadrilla: "Cuadrilla Beta 3", telefono: "912345678" }, eta: "Llega en 18 minutos", trafico: "Tráfico moderado en Av. Javier Prado" },
  "99887766": { status: "en_proceso", tecnico: { nombre: "Roberto Mendoza", cuadrilla: "Cuadrilla Gamma 5", telefono: "923456789" } },
  "22223333": { status: "finalizada", tecnico: { nombre: "Miguel Sánchez", cuadrilla: "Cuadrilla Delta 2", telefono: "934567890" } },
};