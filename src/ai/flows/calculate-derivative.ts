'use server';

/**
 * @fileOverview Calculates the derivative of a given function.
 *
 * - calculateDerivative - A function that calculates the derivative of a function.
 * - CalculateDerivativeInput - The input type for the calculateDerivative function.
 * - CalculateDerivativeOutput - The return type for the calculateDerivative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateDerivativeInputSchema = z.object({
  functionString: z.string().describe('The mathematical function to differentiate (e.g., x^2 + 3*x).'),
});

export type CalculateDerivativeInput = z.infer<
  typeof CalculateDerivativeInputSchema
>;

const CalculateDerivativeOutputSchema = z.object({
  derivative: z.string().describe('The derivative of the function with respect to x.'),
  steps: z.string().describe('The steps involved in calculating the derivative.'),
  error: z.string().optional().describe('Any error messages encountered during the calculation.'),
});

export type CalculateDerivativeOutput = z.infer<
  typeof CalculateDerivativeOutputSchema
>;

export async function calculateDerivative(
  input: CalculateDerivativeInput
): Promise<CalculateDerivativeOutput> {
  return calculateDerivativeFlow(input);
}

const calculateDerivativePrompt = ai.definePrompt({
  name: 'calculateDerivativePrompt',
  input: {schema: CalculateDerivativeInputSchema},
  output: {schema: CalculateDerivativeOutputSchema},
  prompt: `You are a highly skilled mathematician capable of calculating derivatives of functions.

  Given the following function: {{{functionString}}}
  Calculate the derivative with respect to x.

  IMPORTANT: Provide detailed steps in SPANISH showing how you calculated the derivative. Use proper mathematical notation:
  - Use d/dx for derivatives (e.g., d/dx[x²] = 2x)
  - Use sin(x), cos(y), √, etc. for mathematical functions
  - Show the rules you apply (power rule, product rule, chain rule, etc.)
  - Show intermediate calculations clearly
  - Format steps as a clear, educational sequence in SPANISH

  Example of good formatting in SPANISH:
  Función: f(x) = x² + 3x + 5

  Paso 1: Aplicar la regla de la potencia y constantes
  d/dx[x²] = 2x
  d/dx[3x] = 3
  d/dx[5] = 0

  Paso 2: Suma de derivadas
  d/dx[x² + 3x + 5] = 2x + 3 + 0 = 2x + 3

  Another example:
  Función: f(x) = sin(x) * x²

  Paso 1: Aplicar regla del producto
  d/dx[u*v] = u'v + uv'
  u = sin(x), v = x²
  u' = cos(x), v' = 2x

  Paso 2: Calcular cada término
  Primer término: cos(x) * x² = x²cos(x)
  Segundo término: sin(x) * 2x = 2x sin(x)

  Paso 3: Suma de términos
  d/dx[sin(x)x²] = x²cos(x) + 2x sin(x)

  Ensure that the derivative is simplified and represented in a standard mathematical notation. If there are any errors, put the error message in the error field.

  Output the result as a JSON object with 'derivative', 'steps', and 'error' fields.
  `,
});

const calculateDerivativeFlow = ai.defineFlow(
  {
    name: 'calculateDerivativeFlow',
    inputSchema: CalculateDerivativeInputSchema,
    outputSchema: CalculateDerivativeOutputSchema,
  },
  async input => {
    try {
      const {output} = await calculateDerivativePrompt(input);
      return output!;
    } catch (error: any) {
      return {
        derivative: 'Error',
        steps: '',
        error: error.message,
      };
    }
  }
);