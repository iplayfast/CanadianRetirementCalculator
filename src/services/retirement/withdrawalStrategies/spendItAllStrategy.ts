// src/services/retirement/withdrawalStrategies/spendItAllStrategy.ts

import { RetirementData, WithdrawalAmounts } from './index';
import { WithdrawalStrategy } from './strategyInterface';
import { TAX_CONSTANTS } from '../../../constants/taxConstants';
import { calculateEffectiveTaxRate } from '../taxCalculator';
import { UserInput, RetirementPlan } from '../../../models/types';
import { generateRetirementPlan } from '../retirementCalculator';

/**
 * Strategy for maximizing spending in retirement
 */
export class SpendItAllStrategy implements WithdrawalStrategy {
  name = 'Spend It All Strategy';
  description = 'Optimizes withdrawals to maximize discretionary spending while ensuring funds last through retirement';

  determineWithdrawals(
    retirementData: RetirementData,
    remainingNeeded: number,
    rspWithdrawal: number,
    spouseRspWithdrawal: number,
    provincialBrackets: { threshold: number, rate: number }[]
  ): WithdrawalAmounts {
    console.log("Using SPEND IT ALL strategy");
    
    // For spend-it-all, we want a more aggressive withdrawal from registered accounts
    // especially in later years to avoid having excess money left unspent
    
    let tfsaWithdrawal = 0;
    let otherInvestmentsWithdrawal = 0;
    let spouseTfsaWithdrawal = 0;
    let spouseOtherInvestmentsWithdrawal = 0;
    let additionalRspWithdrawal = 0;
    let additionalSpouseRspWithdrawal = 0;
    
    let stillNeeded = remainingNeeded;
    
    // Estimate years left in retirement
    const yearsLeftInRetirement = Math.max(5, 95 - retirementData.age);
    
    // If fewer years left, prioritize registered accounts to avoid leaving money unspent
    if (yearsLeftInRetirement < 15) {
      // RSP/RRIF up to a reasonable tax bracket first
      const reasonableTaxThreshold = 80000; // Reasonable tax bracket threshold
      
      // Calculate headroom in RSP withdrawals before hitting high tax brackets
      const rspHeadroom = Math.max(0, reasonableTaxThreshold - retirementData.taxableIncome - rspWithdrawal);
      if (rspHeadroom > 0 && stillNeeded > 0) {
        additionalRspWithdrawal = Math.min(
          rspHeadroom,
          retirementData.rspBalance - rspWithdrawal,
          stillNeeded
        );
        stillNeeded -= additionalRspWithdrawal;
      }
      
      // Do the same for spouse if applicable
      if (retirementData.spouseTaxableIncome !== undefined && retirementData.spouseRspBalance !== undefined) {
        const spouseRspHeadroom = Math.max(0, reasonableTaxThreshold - retirementData.spouseTaxableIncome - spouseRspWithdrawal);
        if (spouseRspHeadroom > 0 && stillNeeded > 0) {
          additionalSpouseRspWithdrawal = Math.min(
            spouseRspHeadroom,
            retirementData.spouseRspBalance - spouseRspWithdrawal,
            stillNeeded
          );
          stillNeeded -= additionalSpouseRspWithdrawal;
        }
      }
      
      // Then use other investments
      if (stillNeeded > 0) {
        otherInvestmentsWithdrawal = Math.min(retirementData.otherInvestmentsBalance, stillNeeded);
        stillNeeded -= otherInvestmentsWithdrawal;
      }
      
      if (stillNeeded > 0 && retirementData.spouseOtherInvestmentsBalance !== undefined) {
        spouseOtherInvestmentsWithdrawal = Math.min(retirementData.spouseOtherInvestmentsBalance, stillNeeded);
        stillNeeded -= spouseOtherInvestmentsWithdrawal;
      }
      
      // Finally use TFSA
      if (stillNeeded > 0) {
        tfsaWithdrawal = Math.min(retirementData.tfsaBalance, stillNeeded);
        stillNeeded -= tfsaWithdrawal;
      }
      
      if (stillNeeded > 0 && retirementData.spouseTfsaBalance !== undefined) {
        spouseTfsaWithdrawal = Math.min(retirementData.spouseTfsaBalance, stillNeeded);
        stillNeeded -= spouseTfsaWithdrawal;
      }
      
      // If we still need more, take more from RSP even at higher tax rates
      if (stillNeeded > 0) {
        const extraRsp = Math.min(
          retirementData.rspBalance - rspWithdrawal - additionalRspWithdrawal,
          stillNeeded
        );
        additionalRspWithdrawal += extraRsp;
        stillNeeded -= extraRsp;
        
        if (stillNeeded > 0 && retirementData.spouseRspBalance !== undefined) {
          const extraSpouseRsp = Math.min(
            retirementData.spouseRspBalance - spouseRspWithdrawal - additionalSpouseRspWithdrawal,
            stillNeeded
          );
          additionalSpouseRspWithdrawal += extraSpouseRsp;
          stillNeeded -= extraSpouseRsp;
        }
      }
    } else {
      // For earlier retirement years, use a more tax-efficient approach
      // to balance tax efficiency with future spending needs
      
      // First use TFSAs
      if (stillNeeded > 0) {
        tfsaWithdrawal = Math.min(retirementData.tfsaBalance, stillNeeded);
        stillNeeded -= tfsaWithdrawal;
      }
      
      if (stillNeeded > 0 && retirementData.spouseTfsaBalance !== undefined) {
        spouseTfsaWithdrawal = Math.min(retirementData.spouseTfsaBalance, stillNeeded);
        stillNeeded -= spouseTfsaWithdrawal;
      }
      
      // Then use a tax-efficient mix of other accounts based on marginal rates
      if (stillNeeded > 0) {
        // Compare effective tax rates on different withdrawal options
        const effectiveTaxRateOther = calculateEffectiveTaxRate(
          retirementData.taxableIncome + rspWithdrawal,
          Math.min(retirementData.otherInvestmentsBalance, stillNeeded) * 0.5 * TAX_CONSTANTS.CAPITAL_GAINS_INCLUSION_RATE,
          provincialBrackets
        );
        
        const effectiveTaxRateRSP = calculateEffectiveTaxRate(
          retirementData.taxableIncome + rspWithdrawal,
          Math.min(retirementData.rspBalance - rspWithdrawal, stillNeeded),
          provincialBrackets
        );
        
        let effectiveTaxRateSpouseOther = 1;
        let effectiveTaxRateSpouseRSP = 1;
        
        if (retirementData.spouseTaxableIncome !== undefined) {
          effectiveTaxRateSpouseOther = calculateEffectiveTaxRate(
            retirementData.spouseTaxableIncome + spouseRspWithdrawal,
            Math.min(retirementData.spouseOtherInvestmentsBalance || 0, stillNeeded) * 0.5 * TAX_CONSTANTS.CAPITAL_GAINS_INCLUSION_RATE,
            provincialBrackets
          );
          
          effectiveTaxRateSpouseRSP = calculateEffectiveTaxRate(
            retirementData.spouseTaxableIncome + spouseRspWithdrawal,
            Math.min((retirementData.spouseRspBalance || 0) - spouseRspWithdrawal, stillNeeded),
            provincialBrackets
          );
        }
        
        // Choose the accounts with lowest tax rates
        const withdrawalOptions = [
          { type: 'other', rate: effectiveTaxRateOther, available: retirementData.otherInvestmentsBalance },
          { type: 'rsp', rate: effectiveTaxRateRSP, available: retirementData.rspBalance - rspWithdrawal },
          { type: 'spouseOther', rate: effectiveTaxRateSpouseOther, available: retirementData.spouseOtherInvestmentsBalance || 0 },
          { type: 'spouseRSP', rate: effectiveTaxRateSpouseRSP, available: (retirementData.spouseRspBalance || 0) - spouseRspWithdrawal }
        ].filter(option => option.available > 0)
         .sort((a, b) => a.rate - b.rate);
        
        // Withdraw from accounts in order of lowest tax rate
        for (const option of withdrawalOptions) {
          if (stillNeeded <= 0) break;
          
          const withdrawAmount = Math.min(option.available, stillNeeded);
          
          switch (option.type) {
            case 'other':
              otherInvestmentsWithdrawal = withdrawAmount;
              break;
            case 'rsp':
              additionalRspWithdrawal = withdrawAmount;
              break;
            case 'spouseOther':
              spouseOtherInvestmentsWithdrawal = withdrawAmount;
              break;
            case 'spouseRSP':
              additionalSpouseRspWithdrawal = withdrawAmount;
              break;
          }
          
          stillNeeded -= withdrawAmount;
        }
      }
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
   * Find optimal benefit timing for spend-it-all strategy
   */
  findOptimalBenefitTiming(userInput: UserInput): {
    cppStartAge: number;
    oasStartAge: number;
    spouseCppStartAge?: number;
    spouseOasStartAge?: number;
  } {
    // For spend-it-all strategy, we generally want to start benefits earlier
    // to maximize enjoyment during the early retirement years
    
    // Define possible claiming ages to test
    const cppAges = [60, 65, 70];
    const oasAges = [65, 70];
    
    // Array to store results of each simulation
    const simulations: {
      cppAge: number;
      oasAge: number;
      spouseCppAge?: number;
      spouseOasAge?: number;
      annualFunMoney: number;
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
                optimizationGoal: 'spend-it-all',
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
                annualFunMoney: plan.summary.annualFunMoney || 0
              });
            }
          }
        } else {
          // Without spouse, just test primary person claiming ages
          // Create a copy of userInput to avoid modifying the original
          const inputCopy = JSON.parse(JSON.stringify(userInput)) as UserInput;
          
          // Run simulation with these claiming ages
          const plan = generateRetirementPlan(inputCopy, {
            optimizationGoal: 'spend-it-all',
            cppStartAge: cppAge,
            oasStartAge: oasAge
          });
          
          // Store results
          simulations.push({
            cppAge,
            oasAge,
            annualFunMoney: plan.summary.annualFunMoney || 0
          });
        }
      }
    }
    
    // Find the simulation with the highest fun money
    let bestSimulation = simulations[0];
    for (const sim of simulations) {
      if (sim.annualFunMoney > bestSimulation.annualFunMoney) {
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
export const determineSpendItAllWithdrawals = (
  retirementData: RetirementData,
  remainingNeeded: number,
  rspWithdrawal: number,
  spouseRspWithdrawal: number,
  provincialBrackets: { threshold: number, rate: number }[]
): WithdrawalAmounts => {
  const strategy = new SpendItAllStrategy();
  return strategy.determineWithdrawals(
    retirementData,
    remainingNeeded,
    rspWithdrawal,
    spouseRspWithdrawal,
    provincialBrackets
  );
};