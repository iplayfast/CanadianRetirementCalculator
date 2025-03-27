#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the files to create
const files = [
  {
    path: 'src/services/retirement/withdrawalStrategies/strategyInterface.ts',
    content: `// src/services/retirement/withdrawalStrategies/strategyInterface.ts

import { UserInput, RetirementPlan } from '../../../models/types';
import { RetirementData, WithdrawalAmounts } from './index';

/**
 * Interface for withdrawal strategies
 */
export interface WithdrawalStrategy {
  name: string;
  description: string;
  determineWithdrawals(
    retirementData: RetirementData,
    remainingNeeded: number,
    rspWithdrawal: number,
    spouseRspWithdrawal: number,
    provincialBrackets: { threshold: number, rate: number }[]
  ): WithdrawalAmounts;
  
  // Optional methods for strategy-specific features
  findOptimalBenefitTiming?(userInput: UserInput): {
    cppStartAge: number;
    oasStartAge: number;
    spouseCppStartAge?: number;
    spouseOasStartAge?: number;
  };
  
  runMultiYearProjection?(userInput: UserInput): RetirementPlan;
}`
  },
  {
    path: 'src/services/retirement/withdrawalStrategies/index.ts',
    content: `// src/services/retirement/withdrawalStrategies/index.ts

import { determineTaxEfficientWithdrawals } from './taxEfficientStrategy';
import { determineMaxEndWorthWithdrawals } from './maxEndWorthStrategy';
import { determineSpendItAllWithdrawals } from './spendItAllStrategy';
import { determineBalancedWithdrawals } from './balancedStrategy';
import { calculateRRIFMinimumWithdrawal } from '../../rrif-min-withdrawal';
import { WithdrawalStrategy } from './strategyInterface';
import { TaxEfficientStrategy } from './taxEfficientStrategy';
import { MaxEndWorthStrategy } from './maxEndWorthStrategy';
import { SpendItAllStrategy } from './spendItAllStrategy';
import { BalancedStrategy } from './balancedStrategy';
import { UserInput } from '../../../models/types';

// Optimization type for withdrawal strategies
export type OptimizationGoal = 'lowest-tax' | 'max-end-worth' | 'spend-it-all' | 'balanced';

export interface WithdrawalAmounts {
  rspWithdrawal: number;
  tfsaWithdrawal: number;
  otherInvestmentsWithdrawal: number;
  spouseRspWithdrawal: number;
  spouseTfsaWithdrawal: number;
  spouseOtherInvestmentsWithdrawal: number;
}

export interface RetirementData {
  age: number;
  isRRIF: boolean;
  rspBalance: number;
  tfsaBalance: number;
  otherInvestmentsBalance: number;
  taxableIncome: number; // Income before withdrawals
  spouseAge?: number;
  isSpouseRRIF?: boolean;
  spouseRspBalance?: number;
  spouseTfsaBalance?: number;
  spouseOtherInvestmentsBalance?: number;
  spouseTaxableIncome?: number;
}

/**
 * Get the appropriate withdrawal strategy based on optimization goal
 * @param goal Optimization goal
 * @returns Withdrawal strategy implementation
 */
export function getWithdrawalStrategy(goal: OptimizationGoal): WithdrawalStrategy {
  switch(goal) {
    case 'lowest-tax':
      return new TaxEfficientStrategy();
    case 'max-end-worth':
      return new MaxEndWorthStrategy();
    case 'spend-it-all':
      return new SpendItAllStrategy();
    case 'balanced':
    default:
      return new BalancedStrategy();
  }
}

/**
 * Determine the optimal withdrawal amounts from different accounts
 * @param retirementData Current retirement data
 * @param withdrawalNeeded Total withdrawal needed for expenses
 * @param optimizationGoal Optimization strategy to use
 * @param provincialBrackets Provincial tax brackets
 * @returns Optimal withdrawal amounts from each account
 */
export const determineOptimalWithdrawals = (
  retirementData: RetirementData,
  withdrawalNeeded: number,
  optimizationGoal: OptimizationGoal,
  provincialBrackets: { threshold: number, rate: number }[]
): WithdrawalAmounts => {
  console.log(\`Using optimization strategy: \${optimizationGoal}\`);
  
  // Initial RRIF minimum withdrawals (these must be taken)
  const minRRIFWithdrawal = retirementData.isRRIF 
    ? calculateRRIFMinimumWithdrawal(retirementData.age, retirementData.rspBalance) 
    : 0;
  
  const minSpouseRRIFWithdrawal = retirementData.isSpouseRRIF && retirementData.spouseAge
    ? calculateRRIFMinimumWithdrawal(retirementData.spouseAge, retirementData.spouseRspBalance || 0) 
    : 0;
  
  // Start with minimum RRIF withdrawals
  let rspWithdrawal = minRRIFWithdrawal;
  let spouseRspWithdrawal = minSpouseRRIFWithdrawal;
  
  // Reduce needed amount by mandatory RRIF withdrawals
  let remainingNeeded = withdrawalNeeded - (minRRIFWithdrawal + minSpouseRRIFWithdrawal);
  
  if (remainingNeeded <= 0) {
    // Minimum RRIF withdrawals are enough
    return {
      rspWithdrawal,
      tfsaWithdrawal: 0,
      otherInvestmentsWithdrawal: 0,
      spouseRspWithdrawal,
      spouseTfsaWithdrawal: 0,
      spouseOtherInvestmentsWithdrawal: 0
    };
  }
  
  // Use the strategy factory to get the appropriate strategy
  const strategy = getWithdrawalStrategy(optimizationGoal);
  
  // Use the strategy to determine withdrawals
  return strategy.determineWithdrawals(
    retirementData,
    remainingNeeded,
    rspWithdrawal,
    spouseRspWithdrawal,
    provincialBrackets
  );
};

/**
 * Find optimal benefit timing based on the chosen strategy
 * @param userInput User input data
 * @param optimizationGoal Optimization goal
 * @returns Optimal benefit timing
 */
export const findOptimalBenefitTiming = (
  userInput: UserInput,
  optimizationGoal: OptimizationGoal
): {
  cppStartAge: number;
  oasStartAge: number;
  spouseCppStartAge?: number;
  spouseOasStartAge?: number;
} => {
  // Use the strategy factory to get the appropriate strategy
  const strategy = getWithdrawalStrategy(optimizationGoal);
  
  // If the strategy has the method, use it; otherwise, return default timing
  if (strategy.findOptimalBenefitTiming) {
    return strategy.findOptimalBenefitTiming(userInput);
  }
  
  // Default timing if strategy doesn't implement the method
  return {
    cppStartAge: 65,
    oasStartAge: 65,
    spouseCppStartAge: userInput.hasSpouse ? 65 : undefined,
    spouseOasStartAge: userInput.hasSpouse ? 65 : undefined
  };
};`
  },
  {
    path: 'src/services/retirementOptimizer.ts',
    content: `// src/services/retirementOptimizer.ts
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
};`
  }
];

// Function to ensure directory exists
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}