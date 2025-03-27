// src/services/retirement/withdrawalStrategies/taxEfficientStrategy.ts

import { RetirementData, WithdrawalAmounts } from './index';
import { WithdrawalStrategy } from './strategyInterface';
import { TAX_CONSTANTS } from '../../../constants/taxConstants';
import { calculateIncomeTax, calculateCapitalGainsTax } from '../taxCalculator';
import { UserInput, RetirementPlan } from '../../../models/types';
import { generateRetirementPlan } from '../retirementCalculator';

/**
 * Strategy for minimizing lifetime tax burden
 */
export class TaxEfficientStrategy implements WithdrawalStrategy {
  name = 'Tax Efficient Strategy';
  description = 'Minimizes lifetime tax burden by optimizing withdrawals and government benefit claiming ages';

  determineWithdrawals(
    retirementData: RetirementData,
    remainingNeeded: number,
    rspWithdrawal: number,
    spouseRspWithdrawal: number,
    provincialBrackets: { threshold: number, rate: number }[]
  ): WithdrawalAmounts {
    console.log("Using LIFETIME TAX OPTIMIZATION strategy");
    
    // Always use TFSA first since it's tax-free
    let tfsaWithdrawal = Math.min(retirementData.tfsaBalance, remainingNeeded);
    remainingNeeded -= tfsaWithdrawal;
    
    // Then use spouse's TFSA if available and needed
    let spouseTfsaWithdrawal = 0;
    if (remainingNeeded > 0 && retirementData.spouseTfsaBalance !== undefined && retirementData.spouseTfsaBalance > 0) {
      spouseTfsaWithdrawal = Math.min(retirementData.spouseTfsaBalance, remainingNeeded);
      remainingNeeded -= spouseTfsaWithdrawal;
    }
    
    // Initialize best withdrawal amounts for the taxable accounts
    let bestRspWithdrawal = 0;
    let bestOtherWithdrawal = 0;
    let bestSpouseRspWithdrawal = 0;
    let bestSpouseOtherWithdrawal = 0;
    
    // If we still need more withdrawals after TFSAs
    if (remainingNeeded > 0) {
      // Define withdrawal strategies to test
      // 1: RSP-heavy
      // 2: Non-registered heavy
      // 3: Split between primary person and spouse
      // 4: Balanced across all accounts
      // 5: More from account with lower current balance
      
      const strategies = [
        // Strategy 1: RSP-heavy
        {
          rspRatio: 0.8,
          otherRatio: 0.2,
          spouseRspRatio: 0.0,
          spouseOtherRatio: 0.0
        },
        // Strategy 2: Non-registered heavy
        {
          rspRatio: 0.2,
          otherRatio: 0.8,
          spouseRspRatio: 0.0,
          spouseOtherRatio: 0.0
        },
        // Strategy 3: Split between primary and spouse
        {
          rspRatio: 0.4,
          otherRatio: 0.1,
          spouseRspRatio: 0.4,
          spouseOtherRatio: 0.1
        },
        // Strategy 4: Balanced across all accounts
        {
          rspRatio: 0.25,
          otherRatio: 0.25,
          spouseRspRatio: 0.25,
          spouseOtherRatio: 0.25
        },
        // Strategy 5: Based on account balance ratios
        this.calculateBalanceBasedRatios(
          retirementData.rspBalance - rspWithdrawal,
          retirementData.otherInvestmentsBalance,
          (retirementData.spouseRspBalance || 0) - spouseRspWithdrawal,
          retirementData.spouseOtherInvestmentsBalance || 0
        )
      ];
      
      let lowestMarginalTaxRate = Number.MAX_VALUE;
      
      // Test each strategy for this withdrawal
      for (const strategy of strategies) {
        // Calculate the withdrawal amount for each account based on ratios
        // but ensure we don't withdraw more than available or needed
        const availableRsp = Math.max(0, retirementData.rspBalance - rspWithdrawal);
        const availableOther = retirementData.otherInvestmentsBalance;
        const availableSpouseRsp = Math.max(0, (retirementData.spouseRspBalance || 0) - spouseRspWithdrawal);
        const availableSpouseOther = retirementData.spouseOtherInvestmentsBalance || 0;
        
        // Calculate initial withdrawal amounts based on ratios
        let strategyRspWithdrawal = strategy.rspRatio * remainingNeeded;
        let strategyOtherWithdrawal = strategy.otherRatio * remainingNeeded;
        let strategySpouseRspWithdrawal = strategy.spouseRspRatio * remainingNeeded;
        let strategySpouseOtherWithdrawal = strategy.spouseOtherRatio * remainingNeeded;
        
        // Adjust for available amounts
        strategyRspWithdrawal = Math.min(strategyRspWithdrawal, availableRsp);
        strategyOtherWithdrawal = Math.min(strategyOtherWithdrawal, availableOther);
        strategySpouseRspWithdrawal = Math.min(strategySpouseRspWithdrawal, availableSpouseRsp);
        strategySpouseOtherWithdrawal = Math.min(strategySpouseOtherWithdrawal, availableSpouseOther);
        
        // Calculate total withdrawal for this strategy
        const totalStrategyWithdrawal = strategyRspWithdrawal + strategyOtherWithdrawal + 
                                       strategySpouseRspWithdrawal + strategySpouseOtherWithdrawal;
        
        // If this strategy doesn't withdraw enough, redistribute the remaining
        if (totalStrategyWithdrawal < remainingNeeded - 0.01) {
          const shortfall = remainingNeeded - totalStrategyWithdrawal;
          
          // Distribute shortfall proportionally to remaining capacity
          const remainingCapacity = (availableRsp - strategyRspWithdrawal) + 
                                  (availableOther - strategyOtherWithdrawal) +
                                  (availableSpouseRsp - strategySpouseRspWithdrawal) +
                                  (availableSpouseOther - strategySpouseOtherWithdrawal);
          
          if (remainingCapacity > 0) {
            // Redistribute proportionally
            if (availableRsp > strategyRspWithdrawal) {
              const additionalRsp = shortfall * ((availableRsp - strategyRspWithdrawal) / remainingCapacity);
              strategyRspWithdrawal += additionalRsp;
            }
            
            if (availableOther > strategyOtherWithdrawal) {
              const additionalOther = shortfall * ((availableOther - strategyOtherWithdrawal) / remainingCapacity);
              strategyOtherWithdrawal += additionalOther;
            }
            
            if (availableSpouseRsp > strategySpouseRspWithdrawal) {
              const additionalSpouseRsp = shortfall * ((availableSpouseRsp - strategySpouseRspWithdrawal) / remainingCapacity);
              strategySpouseRspWithdrawal += additionalSpouseRsp;
            }
            
            if (availableSpouseOther > strategySpouseOtherWithdrawal) {
              const additionalSpouseOther = shortfall * ((availableSpouseOther - strategySpouseOtherWithdrawal) / remainingCapacity);
              strategySpouseOtherWithdrawal += additionalSpouseOther;
            }
          }
        }
        
        // Calculate marginal tax rates for this combination
        const primaryTaxableIncome = retirementData.taxableIncome + rspWithdrawal;
        const primaryMarginalRateForRsp = this.calculateMarginalRate(
          primaryTaxableIncome, 
          strategyRspWithdrawal,
          provincialBrackets
        );
        
        const primaryMarginalRateForOther = this.calculateMarginalRate(
          primaryTaxableIncome, 
          strategyOtherWithdrawal * TAX_CONSTANTS.CAPITAL_GAINS_INCLUSION_RATE,
          provincialBrackets
        );
        
        let spouseMarginalRateForRsp = 0;
        let spouseMarginalRateForOther = 0;
        
        if (retirementData.spouseTaxableIncome !== undefined) {
          const spouseTaxableIncome = retirementData.spouseTaxableIncome + spouseRspWithdrawal;
          spouseMarginalRateForRsp = this.calculateMarginalRate(
            spouseTaxableIncome,
            strategySpouseRspWithdrawal,
            provincialBrackets
          );
          
          spouseMarginalRateForOther = this.calculateMarginalRate(
            spouseTaxableIncome,
            strategySpouseOtherWithdrawal * TAX_CONSTANTS.CAPITAL_GAINS_INCLUSION_RATE,
            provincialBrackets
          );
        }
        
        // Calculate weighted average marginal tax rate for this strategy
        const totalMarginalTax = 
          (strategyRspWithdrawal * primaryMarginalRateForRsp) +
          (strategyOtherWithdrawal * primaryMarginalRateForOther) +
          (strategySpouseRspWithdrawal * spouseMarginalRateForRsp) +
          (strategySpouseOtherWithdrawal * spouseMarginalRateForOther);
        
        const weightedMarginalRate = totalMarginalTax / 
          (strategyRspWithdrawal + strategyOtherWithdrawal + strategySpouseRspWithdrawal + strategySpouseOtherWithdrawal || 1);
        
        // If this strategy has lower marginal tax rate, use it
        if (weightedMarginalRate < lowestMarginalTaxRate) {
          lowestMarginalTaxRate = weightedMarginalRate;
          bestRspWithdrawal = strategyRspWithdrawal;
          bestOtherWithdrawal = strategyOtherWithdrawal;
          bestSpouseRspWithdrawal = strategySpouseRspWithdrawal;
          bestSpouseOtherWithdrawal = strategySpouseOtherWithdrawal;
        }
      }
    }
    
    // Return the optimal withdrawal strategy
    return {
      rspWithdrawal: rspWithdrawal + bestRspWithdrawal,
      tfsaWithdrawal,
      otherInvestmentsWithdrawal: bestOtherWithdrawal,
      spouseRspWithdrawal: spouseRspWithdrawal + bestSpouseRspWithdrawal,
      spouseTfsaWithdrawal,
      spouseOtherInvestmentsWithdrawal: bestSpouseOtherWithdrawal
    };
  }

  /**
   * Calculate marginal tax rate for additional income
   */
  calculateMarginalRate(
    baseIncome: number,
    additionalIncome: number,
    provincialBrackets: { threshold: number, rate: number }[]
  ): number {
    if (additionalIncome <= 0) return 0;
    
    const baseTax = calculateIncomeTax(baseIncome, TAX_CONSTANTS.FEDERAL_TAX_BRACKETS) +
                    calculateIncomeTax(baseIncome, provincialBrackets);
    
    const totalTax = calculateIncomeTax(baseIncome + additionalIncome, TAX_CONSTANTS.FEDERAL_TAX_BRACKETS) +
                     calculateIncomeTax(baseIncome + additionalIncome, provincialBrackets);
    
    return (totalTax - baseTax) / additionalIncome;
  }

  /**
   * Calculate withdrawal ratios based on account balances
   */
  calculateBalanceBasedRatios(
    rspBalance: number,
    otherBalance: number,
    spouseRspBalance: number,
    spouseOtherBalance: number
  ): {
    rspRatio: number;
    otherRatio: number;
    spouseRspRatio: number;
    spouseOtherRatio: number;
  } {
    const totalBalance = rspBalance + otherBalance + spouseRspBalance + spouseOtherBalance;
    
    if (totalBalance <= 0) {
      return {
        rspRatio: 0.25,
        otherRatio: 0.25,
        spouseRspRatio: 0.25,
        spouseOtherRatio: 0.25
      };
    }
    
    return {
      rspRatio: rspBalance / totalBalance,
      otherRatio: otherBalance / totalBalance,
      spouseRspRatio: spouseRspBalance / totalBalance,
      spouseOtherRatio: spouseOtherBalance / totalBalance
    };
  };

/**
 * Find optimal benefit claiming ages that minimize lifetime tax
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
    totalTax: number;
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
              optimizationGoal: 'lowest-tax',
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
              totalTax: plan.summary.totalIncomeTaxPaid + plan.summary.totalCapitalGainsTaxPaid,
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
          optimizationGoal: 'lowest-tax',
          cppStartAge: cppAge,
          oasStartAge: oasAge
        });
        
        // Store results
        simulations.push({
          cppAge,
          oasAge,
          totalTax: plan.summary.totalIncomeTaxPaid + plan.summary.totalCapitalGainsTaxPaid,
          finalNetWorth: plan.summary.finalNetWorth
        });
      }
    }
  }
  
  // Find the simulation with the lowest lifetime tax
  let bestSimulation = simulations[0];
  for (const sim of simulations) {
    if (sim.totalTax < bestSimulation.totalTax) {
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

/**
 * Run a multi-year projection to minimize lifetime tax
 */
runMultiYearProjection(userInput: UserInput): RetirementPlan {
  // Find optimal benefit timing first
  const benefitTiming = this.findOptimalBenefitTiming(userInput);
  
  // Generate retirement plan with optimal benefit timing
  return generateRetirementPlan(userInput, {
    optimizationGoal: 'lowest-tax',
    cppStartAge: benefitTiming.cppStartAge,
    oasStartAge: benefitTiming.oasStartAge,
    spouseCppStartAge: benefitTiming.spouseCppStartAge,
    spouseOasStartAge: benefitTiming.spouseOasStartAge
  });
}
}

// Export the existing function for backward compatibility
export const determineTaxEfficientWithdrawals = (
  retirementData: RetirementData,
  remainingNeeded: number,
  rspWithdrawal: number,
  spouseRspWithdrawal: number,
  provincialBrackets: { threshold: number, rate: number }[]
): WithdrawalAmounts => {
  const strategy = new TaxEfficientStrategy();
  return strategy.determineWithdrawals(
    retirementData,
    remainingNeeded,
    rspWithdrawal,
    spouseRspWithdrawal,
    provincialBrackets
  );
};