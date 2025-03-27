// src/services/retirement/withdrawalStrategies/strategyInterface.ts

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
}