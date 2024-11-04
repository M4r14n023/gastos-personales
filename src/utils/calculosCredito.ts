import { CuotaCredito } from '../types';
import { addMonths } from 'date-fns';

export const calcularCuotasFrances = (
  monto: number,
  tasaNominalAnual: number,
  meses: number
): CuotaCredito[] => {
  const tasaMensual = tasaNominalAnual / 12 / 100;
  const cuotaFija = monto * (tasaMensual * Math.pow(1 + tasaMensual, meses)) / (Math.pow(1 + tasaMensual, meses) - 1);
  let saldoRestante = monto;
  const cuotas: CuotaCredito[] = [];

  for (let i = 1; i <= meses; i++) {
    const interes = saldoRestante * tasaMensual;
    const amortizacion = cuotaFija - interes;
    saldoRestante -= amortizacion;

    cuotas.push({
      numero: i,
      fecha: addMonths(new Date(), i),
      cuota: cuotaFija,
      amortizacion,
      interes,
      saldoRestante: Math.max(0, saldoRestante),
      pagada: false
    });
  }

  return cuotas;
};

export const calcularCuotasAleman = (
  monto: number,
  tasaNominalAnual: number,
  meses: number
): CuotaCredito[] => {
  const tasaMensual = tasaNominalAnual / 12 / 100;
  const amortizacionFija = monto / meses;
  let saldoRestante = monto;
  const cuotas: CuotaCredito[] = [];

  for (let i = 1; i <= meses; i++) {
    const interes = saldoRestante * tasaMensual;
    const cuota = amortizacionFija + interes;
    saldoRestante -= amortizacionFija;

    cuotas.push({
      numero: i,
      fecha: addMonths(new Date(), i),
      cuota,
      amortizacion: amortizacionFija,
      interes,
      saldoRestante: Math.max(0, saldoRestante),
      pagada: false
    });
  }

  return cuotas;
};

export const calcularCuotasTasaFija = (
  monto: number,
  tasaNominalAnual: number,
  meses: number
): CuotaCredito[] => {
  const tasaMensual = tasaNominalAnual / 12 / 100;
  const interesMensual = monto * tasaMensual;
  const cuotas: CuotaCredito[] = [];

  for (let i = 1; i <= meses; i++) {
    const esUltimaCuota = i === meses;
    const amortizacion = esUltimaCuota ? monto : 0;
    const cuota = interesMensual + (esUltimaCuota ? monto : 0);

    cuotas.push({
      numero: i,
      fecha: addMonths(new Date(), i),
      cuota,
      amortizacion,
      interes: interesMensual,
      saldoRestante: esUltimaCuota ? 0 : monto,
      pagada: false
    });
  }

  return cuotas;
};