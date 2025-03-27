// src/services/retirement/rspContributionCalculator.ts

import { TAX_CONSTANTS } from '../../constants/taxConstants';
import { UserInput } from '../../models/types';

// Interface to track comprehensive RRSP contribution details
export interface RRSPContributionDetails {
  maxContribution: number;     // Maximum allowed contribution
  earnedIncomeBase: number;    // Base income used for calculation
  pensionAdjustment: number;   // Pension adjustments (PA)
  unusedContributionRoom: number; // Carried forward room
  pensionAdjustmentReversal: number; // PAR
  netPastServicePensionAdjustment: number; // PSPA
  availableContributionRoom: number; // Final available room
}

/**
 * Calculate RRSP contribution room based on comprehensive rules
 * @param userInput User input data
 * @param previousYearEarnedIncome Earned income from previous year
 * @param currentRRSPBalance Current RRSP balance
 * @returns Detailed RRSP contribution calculation
 */
export function calculateRRSPContributionRoom(
  userInput: UserInput, 
  previousYearEarnedIncome: number,
  currentRRSPBalance: number
): RRSPContributionDetails {
  // Calculate base contribution (18% of previous year's earned income)
  const earnedIncomeBase = Math.min(
    previousYearEarnedIncome * 0.18, 
    TAX_CONSTANTS.RRSP_CONTRIBUTION_LIMIT
  );

  // Default to user-provided RRSP room if available, otherwise calculate
  const unusedContributionRoom = userInput.rrspRoom > 0 
    ? userInput.rrspRoom 
    : Math.max(0, earnedIncomeBase - currentRRSPBalance);

  // Placeholder for more complex pension adjustment calculations
  // In a real-world scenario, this would come from T4 slips or pension statements
  const pensionAdjustment = 0; // Example: zero for self-employed or no pension
  const pensionAdjustmentReversal = 0;
  const netPastServicePensionAdjustment = 0;

  // Calculate available contribution room
  const availableContributionRoom = Math.max(0, 
    unusedContributionRoom 
    - pensionAdjustment 
    + pensionAdjustmentReversal 
    - netPastServicePensionAdjustment
  );

  return {
    maxContribution: earnedIncomeBase,
    earnedIncomeBase,
    pensionAdjustment,
    unusedContributionRoom,
    pensionAdjustmentReversal,
    netPastServicePensionAdjustment,
    availableContributionRoom
  };
}

/**
 * Validate RRSP contribution to prevent over-contribution penalties
 * @param contribution Proposed contribution amount
 * @param availableRoom Available RRSP contribution room
 * @returns Validated contribution amount
 */
export function validateRRSPContribution(
  contribution: number, 
  availableRoom: number
): number {
  // Penalty is 1% per month on excess over $2,000
  const safeContributionBuffer = 2000;
  
  // Ensure contribution does not exceed available room plus buffer
  return Math.min(
    contribution, 
    availableRoom + safeContributionBuffer
  );
}

/**
 * Track and update RRSP contribution room over time
 * This could be expanded to maintain a historical record of contributions
 */
export class RRSPContributionTracker {
  private historicalContributions: { year: number, amount: number }[] = [];
  private currentAvailableRoom: number;

  constructor(initialRoom: number) {
    this.currentAvailableRoom = initialRoom;
  }

  // Record a contribution and update available room
  recordContribution(year: number, amount: number): void {
    this.historicalContributions.push({ year, amount });
    this.currentAvailableRoom -= amount;
  }

  // Get current available contribution room
  getAvailableRoom(): number {
    return Math.max(0, this.currentAvailableRoom);
  }

  // Optionally, add method to recalculate room based on new earnings, etc.
}
