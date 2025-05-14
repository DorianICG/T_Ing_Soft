export function validarRut(rutCompleto: string): boolean {
  if (!rutCompleto || typeof rutCompleto !== 'string') {
    return false;
  }

  const rutLimpio = rutCompleto.replace(/[^0-9kK]+/g, '').toUpperCase();

  if (rutLimpio.length < 8) { 
    return false;
  }

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  if (!/^\d+$/.test(cuerpo)) {
      return false;
  }

  if (cuerpo.length < 7 || cuerpo.length > 8) {
      return false;
  }

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvEsperadoCalculado = 11 - (suma % 11);
  let dvEsperado: string;

  if (dvEsperadoCalculado === 11) {
    dvEsperado = '0';
  } else if (dvEsperadoCalculado === 10) {
    dvEsperado = 'K';
  } else {
    dvEsperado = dvEsperadoCalculado.toString();
  }

  return dv === dvEsperado;
}

/**
 * Limpia el RUT de caracteres no deseados.
 * @param rutEntrada El RUT en cualquier formato aceptado.
 * @returns El RUT formateado como 'CUERPO-DV' o el RUT limpio si no se puede formatear.
 */
export function formatearRut(rutEntrada: string): string {
  if (!rutEntrada || typeof rutEntrada !== 'string') {
    return typeof rutEntrada === 'string' ? rutEntrada : '';
  }

  const rutLimpio = rutEntrada.replace(/[^0-9kK]+/g, '').toUpperCase();

  
  if (rutLimpio.length >= 2) { 
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    if (cuerpo.length >= 7 && cuerpo.length <= 8 && dv.length === 1) {
        return `${cuerpo}-${dv}`;
    }
  }

  return rutLimpio;
}