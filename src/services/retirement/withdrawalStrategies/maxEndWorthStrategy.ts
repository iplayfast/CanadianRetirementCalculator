// src/services/retirement/withdrawalStrategies/maxEndWorthStrategy.ts

import { RetirementData, WithdrawalAmounts } from './index';
import { WithdrawalStrategy } from './strategyInterface';
import { UserInput, RetirementPlan } from '../../../models/types';
import { generateRetirementPlan } from '../retirementCalculator';

/**
 * Strategy for maximizing ending net worth
 */
export class MaxEndWorthStrategy implements WithdrawalStrategy {
  name = 'Maximum Net Worth Strategy';
  description = 'Maximizes ending net worth by prioritizing tax-advantaged accounts and optimizing government benefit timing';

  determineWithdrawals(
    retirementData: RetirementData,
    remainingNeeded: number,
    rspWithdrawal: number,
    spouseRspWithdrawal: number
  ): WithdrawalAmounts {
    console.log("Using MAX NET WORTH strategy");
    
    // For max net worth, we prioritize preserving tax-advantaged accounts
    // Order of preference: Other investments, RSP/RRIF, TFSA
    
    // Initialize withdrawals
    let tfsaWithdrawal = 0;
    let otherInvestmentsWithdrawal = 0;
    let spouseTfsaWithdrawal = 0;
    let spouseOtherInvestmentsWithdrawal = 0;
    let additionalRspWithdrawal = 0;
    let additionalSpouseRspWithdrawal = 0;
    
    let stillNeeded = remainingNeeded;
    
    // 1. First, use other investments (taxable accounts)
    if (stillNeeded > 0) {
      otherInvestmentsWithdrawal = Math.min(retirementData.otherInvestmentsBalance, stillNeeded);
      stillNeeded -= otherInvestmentsWithdrawal;
    }
    
    // 2. Then, use spouse's other investments if available
    if (stillNeeded > 0 && retirementData.spouseOtherInvestmentsBalance) {
      spouseOtherInvestmentsWithdrawal = Math.min(retirementData.spouseOtherInvestmentsBalance, stillNeeded);
      stillNeeded -= spouseOtherInvestmentsWithdrawal;
    }
    
    // 3. Next, use RSP/RRIF beyond minimum withdrawals
    if (stillNeeded > 0) {
      additionalRspWithdrawal = Math.min(retirementData.rspBalance - rspWithdrawal, stillNeeded);
      stillNeeded -= additionalRspWithdrawal;
    }
    
    // 4. Use spouse's RSP/RRIF beyond minimum withdrawals
    if (stillNeeded > 0 && retirementData.spouseRspBalance) {
      additionalSpouseRspWithdrawal = Math.min(retirementData.spouseRspBalance - spouseRspWithdrawal, stillNeeded);
      stillNeeded -= additionalSpouseRspWithdrawal;
    }
    
    // 5. Finally, use TFSA as a last resort (preserve tax-free growth as long as possible)
    if (stillNeeded > 0) {
      tfsaWithdrawal = Math.min(retirementData.tfsaBalance, stillNeeded);
      stillNeeded -= tfsaWithdrawal;
    }
    
    // 6. Use spouse's TFSA if still needed
    if (stillNeeded > 0 && retirementData.spouseTfsaBalance) {
      spouseTfsaWithdrawal = Math.min(retirementData.spouseTfsaBalance, stillNeeded);
      stillNeeded -= spouseTfsaWithdrawal;
    }
    
    return {
      rspWithdrawal: rspWithdrawal + additionalRspWithdrawal,
      tfsaWithdrawal,
      otherInvestmentsWithdrawal,
      spouseRspWithdrawal: spouseRspWithdrawal + additionalSpouseRspWithdrawal,
      spouseTfsaWithdrawal,
      spouseOtherInvestmentsWithdrawal
    };
  }

  /**
   * Find optimal benefit claiming ages that maximize net worth
   */
  findOptimalBenefitTiming(userInput: UserInput): {
    cppStartAge: number;
    oasStartAge: number;
    spouseCppStartAge?: number;
    spouseOasStartAge?: number;
  } {
    // Define possible claiming ages to test
    const cppAges = [60, 65, 70];
    const oasAges = [65, 70];
    
    // Array to store results of each simulation
    const simulations: {
      cppAge: number;
      oasAge: number;
      spouseCppAge?: number;
      spouseOasAge?: number;
      finalNetWorth: number;
    }[] = [];
    
    // For each combination of claiming ages
    for (const cppAge of cppAges) {
      for (const oasAge of oasAges) {
        // Skip invalid combinations (e.g., OAS before 65)
        if (oasAge < 65) continue;
        
        if (userInput.hasSpouse && userInput.spouseInfo) {
          // With a spouse, we need to test spouse claiming ages too
          for (const spouseCppAge of cppAges) {
            for (const spouseOasAge of oasAges) {
              // Skip invalid combinations
              if (spouseOasAge < 65) continue;
              
              // Create a copy of userInput to avoid modifying the original
              const inputCopy = JSON.parse(JSON.stringify(userInput)) as UserInput;
              
              // Run simulation with these claiming ages
              const plan = generateRetirementPlan(inputCopy, {
                optimizationGoal: 'max-end-worth',
                cppStartAge: cppAge,
                oasStartAge: oasAge,
                spouseCppStartAge: spouseCppAge,
                spouseOasStartAge: spouseOasAge
              });
              
              // Store results
              simulations.push({
                cppAge,
                oasAge,
                spouseCppAge,
                spouseOasAge,
                finalNetWorth: plan.summary.finalNetWorth
              });
            }
          }
        } else {
          // Without spouse, just test primary person claiming ages
          // Create a copy of userInput to avoid modifying the original
          const inputCopy = JSON.parse(JSON.stringify(userInput)) as UserInput;
          
          // Run simulation with these claiming ages
          const plan = generateRetirementPlan(inputCopy, {
            optimizationGoal: 'max-end-worth',
            cppStartAge: cppAge,
            oasStartAge: oasAge
          });
          
          // Store results
          simulations.push({
            cppAge,
            oasAge,
            finalNetWorth: plan.summary.finalNetWorth
          });
        }
      }
    }
    
    // Find the simulation with the highest end net worth
    let bestSimulation = simulations[0];
    for (const sim of simulations) {
      if (sim.finalNetWorth > bestSimulation.finalNetWorth) {
        bestSimulation = sim;
      }
    }
    
    // Return the optimal benefit claiming ages
    return {
      cppStartAge: bestSimulation.cppAge,
      oasStartAge: bestSimulation.oasAge,
      spouseCppStartAge: bestSimulation.spouseCppAge,
      spouseOasStartAge: bestSimulation.spouseOasAge
    };
  }
}

// Export the existing function for backward compatibility
export const determineMaxEndWorthWithdrawals = (
  retirementData: RetirementData,
  remainingNeeded: number,
  rspWithdrawal: number,
  spouseRspWithdrawal: number
): WithdrawalAmounts => {
  const strategy = new MaxEndWorthStrategy();
  return strategy.determineWithdrawals(
    retirementData,
    remainingNeeded,
    rspWithdrawal,
    spouseRspWithdrawal
  );
};