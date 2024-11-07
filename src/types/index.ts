export interface Balance {
  id: string;
  fecha: Date;
  gastosFijos: number;
  gastosVariables: number;
  ingresos: number;
  saldoFinal: number;
}

// ... rest of the types remain unchanged