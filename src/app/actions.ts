'use server';

import {
  analyzeDomainAndRange,
  AnalyzeDomainAndRangeInput,
  AnalyzeDomainAndRangeOutput,
} from '@/ai/flows/analyze-domain-and-range';
import {
  calculateMultipleIntegral,
  CalculateMultipleIntegralInput,
  CalculateMultipleIntegralOutput,
} from '@/ai/flows/calculate-multiple-integral';
import {
  calculatePartialDerivative,
  CalculatePartialDerivativeInput,
  CalculatePartialDerivativeOutput,
} from '@/ai/flows/calculate-partial-derivative';
import {
  calculateDerivative,
  CalculateDerivativeInput,
  CalculateDerivativeOutput,
} from '@/ai/flows/calculate-derivative';
import {
  parseAndNormalizeFunction,
  ParseAndNormalizeFunctionInput,
  ParseAndNormalizeFunctionOutput,
} from '@/ai/flows/parse-and-normalize-function';

export type {
  AnalyzeDomainAndRangeOutput,
  CalculateMultipleIntegralOutput,
  CalculatePartialDerivativeOutput,
  CalculateDerivativeOutput,
  ParseAndNormalizeFunctionOutput,
};

export async function parseFunctionAction(
  input: ParseAndNormalizeFunctionInput
): Promise<ParseAndNormalizeFunctionOutput> {
  return await parseAndNormalizeFunction(input);
}

export async function analyzeDomainAndRangeAction(
  input: AnalyzeDomainAndRangeInput
): Promise<AnalyzeDomainAndRangeOutput> {
  return await analyzeDomainAndRange(input);
}

export async function calculatePartialDerivativeAction(
  input: CalculatePartialDerivativeInput
): Promise<CalculatePartialDerivativeOutput> {
  try {
    console.log('calculatePartialDerivativeAction called with:', input);
    const result = await calculatePartialDerivative(input);
    console.log('calculatePartialDerivativeAction result:', result);
    return result;
  } catch (error) {
    console.error('Error in calculatePartialDerivativeAction:', error);
    return {
      derivative: 'Error',
      steps: '',
      evaluatedValue: undefined,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function calculateMultipleIntegralAction(
  input: CalculateMultipleIntegralInput
): Promise<CalculateMultipleIntegralOutput> {
  return await calculateMultipleIntegral(input);
}

export async function calculateDerivativeAction(
  input: CalculateDerivativeInput
): Promise<CalculateDerivativeOutput> {
  try {
    console.log('calculateDerivativeAction called with:', input);
    const result = await calculateDerivative(input);
    console.log('calculateDerivativeAction result:', result);
    return result;
  } catch (error) {
    console.error('Error in calculateDerivativeAction:', error);
    return {
      derivative: 'Error',
      steps: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
