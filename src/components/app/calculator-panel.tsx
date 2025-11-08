'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState } from 'react';
import { Calculator, Delete, Equal } from 'lucide-react';

type DetailedResult = {
  result: string;
  explanation: string;
  steps?: string[];
  method?: string;
};

export function CalculatorPanel() {
  const [expression, setExpression] = useState('');
  const [detailedResult, setDetailedResult] = useState<{
    result: string;
    explanation: string;
    steps?: string[];
    method?: string;
  } | null>(null);

  const evaluateExpression = (expr: string): {
    result: string;
    explanation: string;
    steps?: string[];
    method?: string;
  } => {
    try {
      // Detectar si es una derivada o integral
      const derivativeMatch = expr.match(/^d\/dx\((.+)\)$/);
      const integralMatch = expr.match(/^∫\((.+?)\)\s*dx$/);

      if (derivativeMatch) {
        return evaluateDerivative(derivativeMatch[1]);
      }

      if (integralMatch) {
        return evaluateIntegral(integralMatch[1]);
      }

      // Procesar expresión normal
      let processedExpr = expr
        .replace(/π/g, 'Math.PI')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/\^/g, '**');

      // Convertir grados a radianes para funciones trigonométricas
      processedExpr = processedExpr.replace(/Math\.sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)');
      processedExpr = processedExpr.replace(/Math\.cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)');
      processedExpr = processedExpr.replace(/Math\.tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');

      // Evaluar la expresión de manera segura
      const result = Function('"use strict"; return (' + processedExpr + ')')();

      if (typeof result === 'number' && isFinite(result)) {
        // Redondear a 8 decimales para evitar errores de punto flotante
        const formattedResult = Number(result.toFixed(8)).toString();

        return {
          result: formattedResult,
          explanation: `Evaluación directa de la expresión: ${expr}`,
          method: 'Evaluación numérica directa'
        };
      } else {
        return {
          result: 'Error: Resultado inválido',
          explanation: 'La expresión produce un resultado no numérico o infinito',
          method: 'Error en evaluación'
        };
      }
    } catch (error) {
      return {
        result: 'Error: Expresión inválida',
        explanation: 'La expresión contiene errores de sintaxis o funciones no reconocidas',
        method: 'Error de sintaxis'
      };
    }
  };

  const evaluateDerivative = (expression: string): DetailedResult => {
    try {
      // Diferenciación simbólica simplificada con pasos en español
      const steps: string[] = [];
      let result = '';

      // Función simplificada para derivadas comunes
      if (expression.includes('^')) {
        // Regla de potencia: d/dx[x^n] = n*x^(n-1)
        const powerMatch = expression.match(/x\^(\d+)/);
        if (powerMatch) {
          const n = parseInt(powerMatch[1]);
          if (n > 1) {
            result = `${n}*x^${n-1}`;
            steps.push(`Función: f(x) = ${expression}`);
            steps.push(`Paso 1: Aplicar regla de la potencia`);
            steps.push(`d/dx[x^n] = n*x^(n-1)`);
            steps.push(`d/dx[x^${n}] = ${n}*x^${n-1}`);
          } else if (n === 1) {
            result = '1';
            steps.push(`Función: f(x) = ${expression}`);
            steps.push(`Paso 1: Aplicar regla de la potencia`);
            steps.push(`d/dx[x^1] = 1*x^0 = 1`);
          }
        }
      } else if (expression === 'x') {
        result = '1';
        steps.push(`Función: f(x) = x`);
        steps.push(`Paso 1: Derivada de x es 1`);
        steps.push(`d/dx[x] = 1`);
      } else if (expression.match(/^\d+$/)) {
        result = '0';
        steps.push(`Función: f(x) = ${expression}`);
        steps.push(`Paso 1: Derivada de una constante es 0`);
        steps.push(`d/dx[${expression}] = 0`);
      } else if (expression.includes('*x') || expression.includes('x*')) {
        // Caso simple: constante * x
        const constMatch = expression.match(/(\d+)\*x|x\*(\d+)/);
        if (constMatch) {
          const constant = constMatch[1] || constMatch[2];
          result = constant;
          steps.push(`Función: f(x) = ${expression}`);
          steps.push(`Paso 1: Aplicar regla de la potencia`);
          steps.push(`d/dx[${constant}*x] = ${constant}*d/dx[x] = ${constant}*1 = ${constant}`);
        }
      } else if (expression.includes('sin(x)')) {
        result = 'cos(x)';
        steps.push(`Función: f(x) = ${expression}`);
        steps.push(`Paso 1: Derivada de sin(x)`);
        steps.push(`d/dx[sin(x)] = cos(x)`);
      } else if (expression.includes('cos(x)')) {
        result = '-sin(x)';
        steps.push(`Función: f(x) = ${expression}`);
        steps.push(`Paso 1: Derivada de cos(x)`);
        steps.push(`d/dx[cos(x)] = -sin(x)`);
      } else {
        // Para expresiones más complejas, usar diferenciación numérica como fallback
        const h = 0.0001;
        const x = 0;
        const f = (val: number) => {
          try {
            return Function('"use strict"; const x = ' + val + '; return (' + expression.replace(/\^/g, '**') + ')')();
          } catch {
            return 0;
          }
        };
        const derivative = (f(x + h) - f(x - h)) / (2 * h);
        result = Number(derivative.toFixed(4)).toString();
        steps.push(`Función: f(x) = ${expression}`);
        steps.push(`Paso 1: Usando diferenciación numérica (expresión compleja)`);
        steps.push(`f'(${x}) ≈ [f(${x}+h) - f(${x}-h)] / (2h)`);
        steps.push(`Resultado aproximado: ${result}`);
      }

      return {
        result: result,
        explanation: `Derivada de ${expression} con respecto a x`,
        steps: steps,
        method: 'Cálculo simbólico simplificado'
      };
    } catch (error) {
      return {
        result: 'Error',
        explanation: 'Expresión de derivada inválida',
        steps: ['Verifique la sintaxis de la expresión matemática'],
        method: 'Error en cálculo'
      };
    }
  };

  const evaluateIntegral = (expression: string): DetailedResult => {
    try {
      // Integración numérica usando regla de Simpson
      const a = 0; // Límite inferior (podría hacerse configurable)
      const b = 1; // Límite superior (podría hacerse configurable)
      const n = 1000; // Número de intervalos

      let processedExpr = expression
        .replace(/π/g, 'Math.PI')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/\^/g, '**');

      processedExpr = processedExpr.replace(/Math\.sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)');
      processedExpr = processedExpr.replace(/Math\.cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)');
      processedExpr = processedExpr.replace(/Math\.tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');

      // Función f(x)
      const f = (val: number) => {
        try {
          return Function('"use strict"; const x = ' + val + '; return (' + processedExpr + ')')();
        } catch {
          return 0;
        }
      };

      // Regla de Simpson: ∫f(x)dx ≈ (h/3) * [f(a) + 4∑f(x_i) + 2∑f(x_j) + f(b)]
      const h = (b - a) / n;
      let sum = f(a) + f(b);

      for (let i = 1; i < n; i++) {
        const x = a + i * h;
        if (i % 2 === 0) {
          sum += 2 * f(x);
        } else {
          sum += 4 * f(x);
        }
      }

      const integral = (h / 3) * sum;

      if (isFinite(integral)) {
        const result = Number(integral.toFixed(6));
        return {
          result: result.toString(),
          explanation: `Integral definida de ${expression} desde ${a} hasta ${b}`,
          steps: [
            `Método: Regla de Simpson (integración numérica)`,
            `f(x) = ${expression}`,
            `Límites: a = ${a}, b = ${b}`,
            `Intervalos: n = ${n}`,
            `h = (b - a) / n = ${h}`,
            `∫f(x)dx ≈ (h/3) × [f(a) + 4∑f(x_i) + 2∑f(x_j) + f(b)]`,
            `Resultado aproximado: ${result}`
          ],
          method: 'Regla de Simpson (integración numérica)'
        };
      } else {
        return {
          result: 'Error',
          explanation: 'No se puede calcular la integral',
          steps: ['La función no es integrable en el intervalo dado'],
          method: 'Regla de Simpson'
        };
      }
    } catch (error) {
      return {
        result: 'Error',
        explanation: 'Expresión de integral inválida',
        steps: ['Verifique la sintaxis de la expresión matemática'],
        method: 'Regla de Simpson'
      };
    }
  };

  const calculate = () => {
    if (expression.trim()) {
      const calcResult = evaluateExpression(expression);
      setDetailedResult(calcResult);
    }
  };

  const clear = () => {
    setExpression('');
    setDetailedResult(null);
  };

  const addToExpression = (text: string) => {
    setExpression(prev => prev + text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculate();
    }
  };

  return (
    <Card className="shadow-modern-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora Científica
        </CardTitle>
        <CardDescription>
          Escribe expresiones matemáticas directamente
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Input de expresión */}
        <div className="mb-4">
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu expresión matemática..."
            className="text-lg font-mono h-12"
          />
        </div>

        {/* Resultado detallado */}
        {detailedResult && (
          <div className="mb-6 p-4 bg-muted rounded-lg space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Resultado:</div>
              <div className="text-xl font-mono text-primary">{detailedResult.result}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Explicación:</div>
              <div className="text-sm">{detailedResult.explanation}</div>
            </div>

            {detailedResult.method && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Método:</div>
                <div className="text-sm font-medium">{detailedResult.method}</div>
              </div>
            )}

            {detailedResult.steps && detailedResult.steps.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Pasos del cálculo:</div>
                <div className="space-y-1">
                  {detailedResult.steps.map((step, index) => (
                    <div key={index} className={`text-xs font-mono bg-background p-2 rounded border-l-2 ${step.startsWith('Paso') ? 'border-l-primary font-semibold' : 'border-l-primary/30'}`}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botones de funciones */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('d/dx(')}
            className="text-xs"
          >
            d/dx(
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('∫()dx')}
            className="text-xs"
          >
            ∫( )dx
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('sqrt(')}
            className="text-xs"
          >
            √(
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('sin(')}
            className="text-xs"
          >
            sin(
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('cos(')}
            className="text-xs"
          >
            cos(
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('tan(')}
            className="text-xs"
          >
            tan(
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('log(')}
            className="text-xs"
          >
            log(
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('ln(')}
            className="text-xs"
          >
            ln(
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('π')}
            className="text-xs"
          >
            π
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('e')}
            className="text-xs"
          >
            e
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('^')}
            className="text-xs"
          >
            ^
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('(')}
            className="text-xs"
          >
            (
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression(')')}
            className="text-xs"
          >
            )
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToExpression('x')}
            className="text-xs"
          >
            x
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clear}
            className="text-xs"
          >
            <Delete className="h-3 w-3" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={calculate}
            className="text-xs"
          >
            <Equal className="h-3 w-3" />
          </Button>
        </div>

        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>• Escribe números y operadores directamente con el teclado</p>
          <p>• <strong>Derivadas:</strong> d/dx(expresión) - Ej: d/dx(x^2 + 3*x)</p>
          <p>• <strong>Integrales:</strong> ∫(expresión)dx - Ej: ∫(x^2)dx (de 0 a 1)</p>
          <p>• Usa el botón ∫()dx y escribe la expresión dentro de los paréntesis</p>
          <p>• Funciones trigonométricas en grados</p>
          <p>• Presiona Enter para calcular</p>
        </div>
      </CardContent>
    </Card>
  );
}