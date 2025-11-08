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

Make sure to use JavaScript math functions (Math.sin, Math.cos, Math.sqrt, etc.) in your calculations.
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
