export function validarRut(rutCompleto: string): boolean {
  if (!rutCompleto || typeof rutCompleto !== 'string') {
    return false;
  }

  const rutParaValidar = rutCompleto.replace(/[.-]/g, '').toUpperCase();
  
  const cuerpoValidacion = rutParaValidar.slice(0, -1);
  const dvValidacion = rutParaValidar.slice(-1);

  if (!/^\d+$/.test(cuerpoValidacion)) { 
      return false;
  }
  if (cuerpoValidacion.length < 1 || cuerpoValidacion.length > 8) {
      return false;
  }
  if (!/^[0-9K]$/.test(dvValidacion)) { 
      return false;
  }


  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpoValidacion.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpoValidacion.charAt(i), 10) * multiplo;
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

  return dvValidacion === dvEsperado;
}

/**
 * Formatea un RUT de entrada (que puede tener puntos o no, y guion o no)
 * No valida el dígito verificador, solo formatea.
 * @param rutEntrada El RUT en cualquier formato.
 * @returns El RUT formateado como 'CUERPO-DV' o una cadena vacía si la entrada es inválida.
 */
export function formatearRut(rutEntrada: string): string {
  if (!rutEntrada || typeof rutEntrada !== 'string') {
    return ''; 
  }

  // 1. Limpiar completamente: quitar todo excepto números y K, y convertir a mayúsculas.
  const rutLimpioTotal = rutEntrada.replace(/[^0-9kK]+/g, '').toUpperCase();

  // 2. Verificar longitud mínima (al menos 1 dígito para cuerpo y 1 para DV)
  if (rutLimpioTotal.length < 2) {
    return ''; 
  }

  // 3. Separar cuerpo y DV
  const cuerpo = rutLimpioTotal.slice(0, -1);
  const dv = rutLimpioTotal.slice(-1);

  // 4. Devolver en el formato deseado
  return `${cuerpo}-${dv}`;
}