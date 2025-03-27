// src/services/retirementOptimizer.ts
import { UserInput, RetirementPlan } from '../models/types';
import { generateRetirementPlan } from './retirement/retirementCalculator';
import { getWithdrawalStrategy, findOptimalBenefitTiming, OptimizationGoal } from './retirement/withdrawalStrategies';

// Interface for optimization options
export interface OptimizationOptions {
  optimizeFor?: OptimizationGoal;
  testMultipleCPPStartAges?: boolean;
  testMultipleOASStartAges?: boolean;
  testWithdrawalStrategies?: boolean;
  testContributionStrategies?: boolean;
}

/**
 * Generate optimized retirement plan based on selected strategy
 * @param userInput User input data
 * @param options Optimization options
 * @returns Optimized retirement plan
 */
export const generateOptimizedRetirementPlan = (
  userInput: UserInput,
  options: OptimizationOptions = {}
): RetirementPlan => {
  console.log('Generating optimized retirement plan with options:', options);
  
  const optimizeFor = options.optimizeFor || 'balanced';
  
  // Get the appropriate strategy
  const strategy = getWithdrawalStrategy(optimizeFor);
  
  // Find optimal benefit timing using the strategy
  const benefitTiming = findOptimalBenefitTiming(userInput, optimizeFor);
  
  // Generate the retirement plan with optimal benefit timing
  return generateRetirementPlan(userInput, {
    optimizationGoal: optimizeFor,
    cppStartAge: benefitTiming.cppStartAge,
    oasStartAge: benefitTiming.oasStartAge,
    spouseCppStartAge: benefitTiming.spouseCppStartAge,
    spouseOasStartAge: benefitTiming.spouseOasStartAge
  });
};

// The following optimization functions are kept for backward compatibility
// They now use the strategy pattern internally

/**
 * Generate an optimized retirement plan with lowest lifetime tax
 * @param userInput User input data
 * @returns Optimized retirement plan
 */
export const optimizeForLowestTax = (userInput: UserInput): RetirementPlan => {
  return generateOptimizedRetirementPlan(userInput, { optimizeFor: 'lowest-tax' });
};

/**
 * Generate an optimized retirement plan with maximum end net worth
 * @param userInput User input data
 * @returns Optimized retirement plan
 */
export const optimizeForMaxEndWorth = (userInput: UserInput): RetirementPlan => {
  return generateOptimizedRetirementPlan(userInput, { optimizeFor: 'max-end-worth' });
};

/**
 * Generate an optimized retirement plan for maximum enjoyment (spend-it-all)
 * @param userInput User input data
 * @returns Optimized retirement plan
 */
export const optimizeForMaximumEnjoyment = (userInput: UserInput): RetirementPlan => {
  return generateOptimizedRetirementPlan(userInput, { optimizeFor: 'spend-it-all' });
};

/**
 * Generate an optimized retirement plan with balanced tax and end worth
 * @param userInput User input data
 * @returns Optimized retirement plan
 */
export const optimizeForBalanced = (userInput: UserInput): RetirementPlan => {
  return generateOptimizedRetirementPlan(userInput, { optimizeFor: 'balanced' });
};