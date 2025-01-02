export const evaluate = (expression: string): number => {
  // Validar que la expresión no esté vacía
  if (!expression.trim()) {
    throw new Error('La expresión está vacía');
  }

  // Eliminar espacios y agregar un operador al final si no existe
  expression = expression.replace(/\s+/g, '');
  if (!/[+\-*/]/.test(expression[expression.length - 1])) {
    expression += '+0';
  }

  // Pila para almacenar números y operadores
  const numbers: number[] = [];
  const operators: string[] = [];
  let num = '';

  // Recorremos cada carácter de la expresión
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    // Si es un número o punto decimal, lo agregamos al número en construcción
    if (/\d|\./.test(char)) {
      num += char;
    } else if (/[+\-*/]/.test(char)) {
      // Si encontramos un operador, lo procesamos
      if (num) {
        numbers.push(parseFloat(num));
        num = '';
      }

      // Si hay operadores previos, aplicar la precedencia de operaciones
      while (operators.length > 0 && precedence(operators[operators.length - 1]) >= precedence(char)) {
        const operator = operators.pop();
        const right = numbers.pop()!;
        const left = numbers.pop()!;
        numbers.push(operate(left, right, operator!));
      }

      // Agregar el operador actual a la pila
      operators.push(char);
    }
  }

  // Función para determinar la precedencia de los operadores
  function precedence(operator: string): number {
    return operator === '+' || operator === '-' ? 1 : 2;
  }

  // Función para realizar las operaciones básicas
  function operate(left: number, right: number, operator: string): number {
    switch (operator) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        if (right === 0) throw new Error('División por cero');
        return left / right;
      default:
        throw new Error(`Operador no soportado: ${operator}`);
    }
  }

  // Si quedó algún número sin procesar, agregarlo a la pila
  if (num) {
    numbers.push(parseFloat(num));
  }

  // Aplicar las operaciones restantes
  while (operators.length > 0) {
    const operator = operators.pop()!;
    const right = numbers.pop()!;
    const left = numbers.pop()!;
    numbers.push(operate(left, right, operator));
  }

  // El resultado final será el único número en la pila
  return numbers[0];
};

