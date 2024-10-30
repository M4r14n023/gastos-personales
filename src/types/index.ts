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