// src/services/retirement/withdrawalStrategies/index.ts

import { determineTaxEfficientWithdrawals, TaxEfficientStrategy } from './taxEfficientStrategy';
import { determineMaxEndWorthWithdrawals, MaxEndWorthStrategy } from './maxEndWorthStrategy';
import { determineSpendItAllWithdrawals, SpendItAllStrategy } from './spendItAllStrategy';
import { determineBalancedWithdrawals, BalancedStrategy } from './balancedStrategy';
import { calculateRRIFMinimumWithdrawal } from '../../rrif-min-withdrawal';
import { WithdrawalStrategy } from './strategyInterface';
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
  console.log(`Using optimization strategy: ${optimizationGoal}`);
  
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
};