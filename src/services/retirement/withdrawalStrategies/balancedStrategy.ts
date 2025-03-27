// src/services/retirement/withdrawalStrategies/balancedStrategy.ts

import { RetirementData, WithdrawalAmounts } from './index';
import { WithdrawalStrategy } from './strategyInterface';
import { TAX_CONSTANTS } from '../../../constants/taxConstants';
import { calculateEffectiveTaxRate } from '../taxCalculator';
import { UserInput, RetirementPlan } from '../../../models/types';
import { generateRetirementPlan } from '../retirementCalculator';

/**
 * Strategy for balancing tax efficiency and growth potential
 */
export class BalancedStrategy implements WithdrawalStrategy {
  name = 'Balanced Strategy';
  description = 'Balances tax efficiency with growth potential for a well-rounded retirement plan';

  determineWithdrawals(
    retirementData: RetirementData,
    remainingNeeded: number,
    rspWithdrawal: number,
    spouseRspWithdrawal: number,
    provincialBrackets: { threshold: number, rate: number }[]
  ): WithdrawalAmounts {
    console.log("Using BALANCED strategy");
    
    // For balanced approach, we withdraw proportionally from different accounts
    // while still being mindful of tax efficiency
    
    let tfsaWithdrawal = 0;
    let otherInvestmentsWithdrawal = 0;
    let spouseTfsaWithdrawal = 0;
    let spouseOtherInvestmentsWithdrawal = 0;
    let additionalRspWithdrawal = 0;
    let additionalSpouseRspWithdrawal = 0;
    
    // Calculate total available assets (excluding minimum required RRIF withdrawals)
    const availableRSP = Math.max(0, retirementData.rspBalance - rspWithdrawal);
    const availableTFSA = retirementData.tfsaBalance;
    const availableOther = retirementData.otherInvestmentsBalance;
    
    const availableSpouseRSP = Math.max(0, (retirementData.spouseRspBalance || 0) - spouseRspWithdrawal);
    const availableSpouseTFSA = retirementData.spouseTfsaBalance || 0;
    const availableSpouseOther = retirementData.spouseOtherInvestmentsBalance || 0;
    
    const totalAssets = availableRSP + availableTFSA + availableOther + 
                       availableSpouseRSP + availableSpouseTFSA + availableSpouseOther;
    
    if (totalAssets === 0) {
      // No assets available for withdrawal
      return {
        rspWithdrawal,
        tfsaWithdrawal: 0,
        otherInvestmentsWithdrawal: 0,
        spouseRspWithdrawal,
        spouseTfsaWithdrawal: 0,
        spouseOtherInvestmentsWithdrawal: 0
      };
    }
    
    // Calculate withdrawal proportions but adjust for tax efficiency
    // Calculate tax rate of additional RSP withdrawal
    const rspTaxRate = calculateEffectiveTaxRate(
      retirementData.taxableIncome + rspWithdrawal,
      Math.min(10000, availableRSP), // Sample amount for tax rate calculation
      provincialBrackets
    );
    
    // Tax rate for other investments (50% of capital gains are taxable)
    const otherTaxRate = calculateEffectiveTaxRate(
      retirementData.taxableIncome + rspWithdrawal,
      Math.min(10000, availableOther) * 0.5 * TAX_CONSTANTS.CAPITAL_GAINS_INCLUSION_RATE,
      provincialBrackets
    );
    
    // Calculate tax rate for spouse if applicable
    let spouseRspTaxRate = 0;
    let spouseOtherTaxRate = 0;
    
    if (retirementData.spouseTaxableIncome !== undefined) {
      spouseRspTaxRate = calculateEffectiveTaxRate(
        retirementData.spouseTaxableIncome + spouseRspWithdrawal,
        Math.min(10000, availableSpouseRSP),
        provincialBrackets
      );
      
      spouseOtherTaxRate = calculateEffectiveTaxRate(
        retirementData.spouseTaxableIncome + spouseRspWithdrawal,
        Math.min(10000, availableSpouseOther) * 0.5 * TAX_CONSTANTS.CAPITAL_GAINS_INCLUSION_RATE,
        provincialBrackets
      );
    }
    
    // TFSA is always tax-free (0% tax rate)
    const tfsaTaxRate = 0;
    const spouseTfsaTaxRate = 0;
    
    // Calculate tax-adjusted proportions (invert the tax rates)
    const taxAdjuster = (rate: number) => 1 - Math.min(0.5, rate); // Cap the adjustment
    
    const rspProportion = (availableRSP / totalAssets) * taxAdjuster(rspTaxRate);
    const tfsaProportion = (availableTFSA / totalAssets) * taxAdjuster(tfsaTaxRate);
    const otherProportion = (availableOther / totalAssets) * taxAdjuster(otherTaxRate);
    
    const spouseRspProportion = (availableSpouseRSP / totalAssets) * taxAdjuster(spouseRspTaxRate);
    const spouseTfsaProportion = (availableSpouseTFSA / totalAssets) * taxAdjuster(spouseTfsaTaxRate);
    const spouseOtherProportion = (availableSpouseOther / totalAssets) * taxAdjuster(spouseOtherTaxRate);
    
    // Normalize proportions
    const totalProportion = rspProportion + tfsaProportion + otherProportion + 
                         spouseRspProportion + spouseTfsaProportion + spouseOtherProportion;
    
    // Distribute withdrawals according to these proportions
    if (totalProportion > 0) {
      additionalRspWithdrawal = Math.min(
        availableRSP,
        remainingNeeded * (rspProportion / totalProportion)
      );
      
      tfsaWithdrawal = Math.min(
        availableTFSA,
        remainingNeeded * (tfsaProportion / totalProportion)
      );
      
      otherInvestmentsWithdrawal = Math.min(
        availableOther,
        remainingNeeded * (otherProportion / totalProportion)
      );
      
      additionalSpouseRspWithdrawal = Math.min(
        availableSpouseRSP,
        remainingNeeded * (spouseRspProportion / totalProportion)
      );
      
      spouseTfsaWithdrawal = Math.min(
        availableSpouseTFSA,
        remainingNeeded * (spouseTfsaProportion / totalProportion)
      );
      
      spouseOtherInvestmentsWithdrawal = Math.min(
        availableSpouseOther,
        remainingNeeded * (spouseOtherProportion / totalProportion)
      );
    }
    
    // Check if we've met the required withdrawal amount
    const totalWithdrawal = additionalRspWithdrawal + tfsaWithdrawal + otherInvestmentsWithdrawal +
                          additionalSpouseRspWithdrawal + spouseTfsaWithdrawal + spouseOtherInvestmentsWithdrawal;
    
    // If we're short, take more from available funds, prioritizing tax efficiency
    if (totalWithdrawal < remainingNeeded) {
      const shortfall = remainingNeeded - totalWithdrawal;
      
      // Prioritize in this order: TFSA, other investments, then RSP
      const withdrawalOptions = [
        { type: 'tfsa', available: availableTFSA - tfsaWithdrawal, taxRate: tfsaTaxRate },
        { type: 'spouseTfsa', available: availableSpouseTFSA - spouseTfsaWithdrawal, taxRate: spouseTfsaTaxRate },
        { type: 'other', available: availableOther - otherInvestmentsWithdrawal, taxRate: otherTaxRate },
        { type: 'spouseOther', available: availableSpouseOther - spouseOtherInvestmentsWithdrawal, taxRate: spouseOtherTaxRate },
        { type: 'rsp', available: availableRSP - additionalRspWithdrawal, taxRate: rspTaxRate },
        { type: 'spouseRsp', available: availableSpouseRSP - additionalSpouseRspWithdrawal, taxRate: spouseRspTaxRate }
      ].filter(option => option.available > 0)
       .sort((a, b) => a.taxRate - b.taxRate);
      
      let remainingShortfall = shortfall;
      
      for (const option of withdrawalOptions) {
        if (remainingShortfall <= 0) break;
        
        const additionalWithdrawal = Math.min(option.available, remainingShortfall);
        
        switch (option.type) {
          case 'tfsa':
            tfsaWithdrawal += additionalWithdrawal;
            break;
          case 'spouseTfsa':
            spouseTfsaWithdrawal += additionalWithdrawal;
            break;
          case 'other':
            otherInvestmentsWithdrawal += additionalWithdrawal;
            break;
          case 'spouseOther':
            spouseOtherInvestmentsWithdrawal += additionalWithdrawal;
            break;
          case 'rsp':
            additionalRspWithdrawal += additionalWithdrawal;
            break;
          case 'spouseRsp':
            additionalSpouseRspWithdrawal += additionalWithdrawal;
            break;
        }
        
        remainingShortfall -= additionalWithdrawal;
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
   * Find optimal benefit timing for balanced strategy
   */
  findOptimalBenefitTiming(userInput: UserInput): {
    cppStartAge: number;
    oasStartAge: number;
    spouseCppStartAge?: number;
    spouseOasStartAge?: number;
  } {
    // For balanced strategy, we'll use 65 for both CPP and OAS
    // This is a simple default implementation - a real optimization would test multiple combinations
    return {
      cppStartAge: 65,
      oasStartAge: 65,
      spouseCppStartAge: userInput.hasSpouse ? 65 : undefined,
      spouseOasStartAge: userInput.hasSpouse ? 65 : undefined
    };
  }
}

// Export the existing function for backward compatibility
export const determineBalancedWithdrawals = (
  retirementData: RetirementData,
  remainingNeeded: number,
  rspWithdrawal: number,
  spouseRspWithdrawal: number,
  provincialBrackets: { threshold: number, rate: number }[]
): WithdrawalAmounts => {
  const strategy = new BalancedStrategy();
  return strategy.determineWithdrawals(
    retirementData,
    remainingNeeded,
    rspWithdrawal,
    spouseRspWithdrawal,
    provincialBrackets
  );
};