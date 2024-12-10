export interface Gasto {
  fechaVencimiento: any;
  id: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  categoria: string;
  medioPago: string;
  cuotas?: number;
  cuotaActual?: number;
  esFijo: boolean;
  estadoPago: 'pendiente' | 'parcial' | 'pagado';
  montoPagado: number;
  pagosParciales?: PagoParcial[];
}

export interface PagoParcial {
  id: string;
  fecha: Date;
  monto: number;
  cuentaOrigen: string;
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
  cuenta: string;
  saldoDisponible: number;
}

export interface CategoriaIngreso {
  id: string;
  nombre: string;
  saldo: number;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransferenciaCuenta {
  id: string;
  fecha: Date;
  cuentaOrigen: string;
  cuentaDestino: string;
  monto: number;
  userId?: string;
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

export interface Credito {
  id: string;
  montoSolicitado: number;
  entidadBancaria: string;
  tasaNominalAnual: number;
  mesesFinanciamiento: number;
  sistemaAmortizacion: 'frances' | 'aleman' | 'tasaFija';
  estado: 'simulacion' | 'activo';
  cuotas: CuotaCredito[];
  fechaSolicitud?: Date;
  montoRestante?: number;
  fechaUltimaCuota?: Date;
  adelantos?: {
    id: string;
    fecha: Date;
    monto: number;
    cuotasAdelantadas: number[];
  }[];
}