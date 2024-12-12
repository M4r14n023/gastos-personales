export const evaluate = (expression: string): number => {
  // Validar la expresión
  if (!/^-?\d*\.?\d*(?:[-+*/]\d*\.?\d*)*$/.test(expression)) {
    throw new Error('Expresión inválida');
  }

  try {
    // Convertir la expresión a tokens
    const tokens = expression.match(/-?\d*\.?\d+|[+\-*/]/g) || [];
    
    // Validar que haya suficientes tokens
    if (tokens.length < 3 && !expression.startsWith('-')) {
      return parseFloat(expression);
    }

    // Realizar las operaciones siguiendo el orden de precedencia
    let result = parseFloat(tokens[0]);
    let currentOp = '';

    for (let i = 1; i < tokens.length; i++) {
      if (i % 2 === 1) {
        currentOp = tokens[i];
      } else {
        const num = parseFloat(tokens[i]);
        
        switch (currentOp) {
          case '*':
            result *= num;
            break;
          case '/':
            if (num === 0) throw new Error('División por cero');
            result /= num;
            break;
          case '+':
            result += num;
            break;
          case '-':
            result -= num;
            break;
        }
      }
    }

    // Validar el resultado
    if (isNaN(result) || !isFinite(result)) {
      throw new Error('Resultado inválido');
    }

    // Redondear a 8 decimales para evitar errores de punto flotante
    return Number(result.toFixed(8));
  } catch (error) {
    throw new Error('Error al evaluar la expresión');
  }
};