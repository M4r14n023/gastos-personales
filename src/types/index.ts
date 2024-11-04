export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  categoria: string;
  medioPago: string;
  cuotas?: number;
  cuotaActual?: number;
  esFijo: boolean;
}

export interface MedioPago {
  id: string;
  nombre: string;
  tipo: 'efectivo' | 'debito' | 'credito';
}

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Ingreso {
  id: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  categoria: string;
}

export interface CategoriaIngreso {
  id: string;
  nombre: string;
}

export interface Balance {
  id: string;
  fecha: Date;
  gastosFijos: number;
  gastosVariables: number;
  ingresos: number;
  saldoFinal: number;
}

export interface Credito {
  id: string;
  montoSolicitado: number;
  fechaSolicitud?: Date;
  entidadBancaria: string;
  tasaNominalAnual: number;
  mesesFinanciamiento: number;
  sistemaAmortizacion: 'frances' | 'aleman' | 'tasaFija';
  estado: 'simulacion' | 'activo';
  cuotas: CuotaCredito[];
  adelantos?: AdelantoCredito[];
  montoRestante?: number;
  fechaUltimaCuota?: Date;
}

export interface CuotaCredito {
  numero: number;
  fecha: Date;
  cuota: number;
  amortizacion: number;
  interes: number;
  saldoRestante: number;
  pagada: boolean;
}

export interface AdelantoCredito {
  id: string;
  fecha: Date;
  monto: number;
  cuotasAdelantadas: number[];
}