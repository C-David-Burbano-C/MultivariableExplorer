'use server';

/**
 * @fileOverview Calculates the partial derivative of a given function.
 *
 * - calculatePartialDerivative - A function that calculates the partial derivative of a function.
 * - CalculatePartialDerivativeInput - The input type for the calculatePartialDerivative function.
 * - CalculatePartialDerivativeOutput - The return type for the calculatePartialDerivative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculatePartialDerivativeInputSchema = z.object({
  functionString: z.string().describe('The mathematical function to differentiate (e.g., x^2 + y^2).'),
  variable: z.string().describe('The variable with respect to which to take the derivative (e.g., x or y).'),
  point: z.record(z.number()).optional().describe('An optional JSON object specifying the point at which to evaluate the derivative, with variable names as keys and numeric values as values (e.g., { \"x\": 2, \"y\": 3 }).'),
});

export type CalculatePartialDerivativeInput = z.infer<
  typeof CalculatePartialDerivativeInputSchema
>;

const CalculatePartialDerivativeOutputSchema = z.object({
  derivative: z.string().describe('The partial derivative of the function with respect to the specified variable.'),
  evaluatedValue: z.number().optional().describe('The value of the derivative evaluated at the specified point, if provided.'),
  steps: z.string().describe('The steps involved in calculating the partial derivative.'),
  error: z.string().optional().describe('Any error messages encountered during the calculation.'),
});

export type CalculatePartialDerivativeOutput = z.infer<
  typeof CalculatePartialDerivativeOutputSchema
>;

export async function calculatePartialDerivative(
  input: CalculatePartialDerivativeInput
): Promise<CalculatePartialDerivativeOutput> {
  return calculatePartialDerivativeFlow(input);
}

const calculatePartialDerivativePrompt = ai.definePrompt({
  name: 'calculatePartialDerivativePrompt',
  input: {schema: CalculatePartialDerivativeInputSchema},
  output: {schema: CalculatePartialDerivativeOutputSchema},
  prompt: `You are a highly skilled mathematician capable of calculating partial derivatives of complex functions.

  Given the following function: {{{functionString}}}
  Calculate the partial derivative with respect to the variable: {{{variable}}}.

  If a point is provided: {{{point}}}, evaluate the derivative at that point. Return 'null' for the evaluatedValue if you can not evaluate the value.

  IMPORTANT: You MUST provide detailed steps in SPANISH showing how you calculated the partial derivative. Use proper mathematical notation:
  - Use ∂ for partial derivatives (e.g., ∂f/∂x)
  - Use sin(x), cos(y), √, etc. for mathematical functions
  - Show the rules you apply (power rule, product rule, chain rule, etc.)
  - Show intermediate calculations clearly
  - Format steps as a clear, educational sequence in SPANISH
  - ALWAYS include at least 2-3 steps explaining the process

  Example of good formatting in SPANISH:
  Función: f(x,y) = x² + 3xy + y³

  Paso 1: Aplicar la regla de la derivada parcial con respecto a x
  Tratando y como constante: ∂f/∂x = ∂(x²)/∂x + ∂(3xy)/∂x + ∂(y³)/∂x
  = 2x + 3y + 0 = 2x + 3y

  Paso 2: Si se evalúa en un punto, calcular el valor numérico
  Para el punto (1,2): ∂f/∂x|(1,2) = 2(1) + 3(2) = 2 + 6 = 8

  Another example:
  Función: f(x,y) = sin(x) * y²

  Paso 1: Aplicar regla del producto
  ∂f/∂x = [∂(sin(x))/∂x] * y² + sin(x) * [∂(y²)/∂x]
  = cos(x) * y² + sin(x) * 0
  = y²cos(x)

  Paso 2: Simplificar la expresión
  ∂f/∂x = y²cos(x)

  Ensure that the derivative is simplified and represented in a standard mathematical notation. If there are any errors, put the error message in the error field.

  Output the result as a JSON object with 'derivative', 'steps', 'evaluatedValue', and 'error' fields. The 'steps' field must contain detailed step-by-step explanation in Spanish.
  `,
});

const calculatePartialDerivativeFlow = ai.defineFlow(
  {
    name: 'calculatePartialDerivativeFlow',
    inputSchema: CalculatePartialDerivativeInputSchema,
    outputSchema: CalculatePartialDerivativeOutputSchema,
  },
  async input => {
    try {
      const {output} = await calculatePartialDerivativePrompt(input);
      return output!;
    } catch (error: any) {
      return {
        derivative: 'Error',
        steps: '',
        evaluatedValue: undefined,
        error: error.message,
      };
    }
  }
);
