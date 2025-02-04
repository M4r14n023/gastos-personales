// Add these new types to the existing types/index.ts
export interface MovimientoDolar {
  id: string;
  tipo: 'compra' | 'venta' | 'pago';
  montoDolares: number;
  cotizacion?: number;
  montoPesos?: number;
  cuenta?: string;
  descripcion: string;
  fecha: Date;
}

export interface ComprarDolaresParams {
  montoDolares: number;
  cotizacion: number;
  cuenta: string;
}

export interface VenderDolaresParams {
  montoDolares: number;
  cotizacion: number;
  cuenta: string;
}

export interface PagarDolaresParams {
  montoDolares: number;
  descripcion: string;
}