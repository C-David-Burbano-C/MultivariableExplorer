'use server';

/**
 * @fileOverview A flow for calculating multiple integrals of a given function.
 *
 * - calculateMultipleIntegral - A function that calculates the multiple integral.
 * - CalculateMultipleIntegralInput - The input type for the calculateMultipleIntegral function.
 * - CalculateMultipleIntegralOutput - The return type for the calculateMultipleIntegral function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateMultipleIntegralInputSchema = z.object({
  functionString: z.string().describe('The function to integrate, e.g., x**2 + y**2'),
  integrationRegion: z
    .string()
    .describe(
      'The region over which to integrate, defined as inequalities, e.g., 0 < x < 1, 0 < y < 1'
    ),
  variableOrder: z
    .string()
    .describe('The order of variables to integrate with respect to, e.g., x, y or x, y, z'),
});

export type CalculateMultipleIntegralInput = z.infer<
  typeof CalculateMultipleIntegralInputSchema
>;

const CalculateMultipleIntegralOutputSchema = z.object({
  result: z
    .number()
    .describe('The calculated value of the multiple integral, or NaN if not computable'),
  steps: z.string().describe('The steps involved in calculating the multiple integral.'),
});

export type CalculateMultipleIntegralOutput = z.infer<
  typeof CalculateMultipleIntegralOutputSchema
>;

export async function calculateMultipleIntegral(
  input: CalculateMultipleIntegralInput
): Promise<CalculateMultipleIntegralOutput> {
  return calculateMultipleIntegralFlow(input);
}

const calculateMultipleIntegralPrompt = ai.definePrompt({
  name: 'calculateMultipleIntegralPrompt',
  input: {schema: CalculateMultipleIntegralInputSchema},
  output: {schema: CalculateMultipleIntegralOutputSchema},
  prompt: `You are an expert in multivariable calculus. Given a function, 
a region defined by inequalities, and the order of integration variables, 
you will calculate the definite multiple integral. You must provide the steps 
you took in the 'steps' output field, and the final result in the 'result' 
output field. If the integral cannot be computed, set result to NaN.

Function: {{{functionString}}}
Integration Region: {{{integrationRegion}}}
Variable Order: {{{variableOrder}}}

IMPORTANT: Present all steps using proper mathematical notation in SPANISH, not JavaScript code:
- Use ∫ for integrals (e.g., ∫∫ f(x,y) dx dy)
- Use sin(x), cos(y), √, etc. for mathematical functions
- Use proper integral notation with limits
- Show intermediate calculations clearly
- Use ≈ for approximations
- Format steps as a clear, educational sequence in SPANISH

Example of good formatting in SPANISH:
La integral a calcular es: ∫∫ sin(x)cos(y) dx dy desde x=0 hasta 1, y=0 hasta 1

Paso 1: Integrar con respecto a x tratando cos(y) como constante
∫ sin(x)cos(y) dx = cos(y) ∫ sin(x) dx = cos(y) [-cos(x)]
Evaluar desde x=0 hasta x=1: cos(y)[-cos(1)] - cos(y)[-cos(0)] = cos(y)(1 - cos(1))

Paso 2: Integrar el resultado con respecto a y
∫ cos(y)(1 - cos(1)) dy desde y=0 hasta 1 = (1 - cos(1)) ∫ cos(y) dy = (1 - cos(1))[sin(y)]
Evaluar desde y=0 hasta y=1: (1 - cos(1))(sin(1) - sin(0)) = (1 - cos(1))sin(1)

Paso 3: Calcular el valor numérico
sin(1) ≈ 0.8415, cos(1) ≈ 0.5403
Resultado = 0.8415 × (1 - 0.5403) = 0.8415 × 0.4597 ≈ 0.3869

Make sure to use JavaScript math functions (Math.sin, Math.cos, Math.sqrt, etc.) ONLY for the actual calculations, but present the steps in mathematical notation in SPANISH.
`,
});

const calculateMultipleIntegralFlow = ai.defineFlow(
  {
    name: 'calculateMultipleIntegralFlow',
    inputSchema: CalculateMultipleIntegralInputSchema,
    outputSchema: CalculateMultipleIntegralOutputSchema,
  },
  async input => {
    const {output} = await calculateMultipleIntegralPrompt(input);
    return output!;
  }
);
