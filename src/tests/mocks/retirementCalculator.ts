import { UserInput, RetirementPlan, YearlyPlan, PlanSummary } from '../../models/types';
import { TAX_CONSTANTS, DEFAULT_RATES, PRIORITIES } from '../mocks/taxConstants';

/**
 * Calculate income tax based on income and tax brackets
 * @param income Annual income
 * @param taxBrackets Tax brackets and rates
 * @returns Tax amount
 */
export const calculateIncomeTax = (income: number, taxBrackets: { threshold: number, rate: number }[]): number => {
  let tax = 0;
  
  for (let i = 0; i < taxBrackets.length; i++) {
    const currentBracket = taxBrackets[i];
    const nextBracket = taxBrackets[i + 1];
    
    if (nextBracket) {
      // If income is in this bracket
      if (income > currentBracket.threshold) {
        const bracketIncome = Math.min(income, nextBracket.threshold) - currentBracket.threshold;
        tax += bracketIncome * currentBracket.rate;
      }
    } else {
      // Top bracket
      if (income > currentBracket.threshold) {
        tax += (income - currentBracket.threshold) * currentBracket.rate;
      }
    }
  }
  
  return tax;
};

/**
 * Calculate capital gains tax
 * @param capitalGains Total capital gains
 * @param otherIncome Other income for the year
 * @returns Capital gains tax amount
 */
export const calculateCapitalGainsTax = (
  capitalGains: number, 
  otherIncome: number
): number => {
  if (capitalGains === 0) return 0;
  
  // Only 50% of capital gains are taxable in Canada
  const taxableCapitalGains = capitalGains * TAX_CONSTANTS.CAPITAL_GAINS_INCLUSION_RATE;
  
  // Calculate federal tax on taxable capital gains
  const federalTaxWithCapitalGains = calculateIncomeTax(
    otherIncome + taxableCapitalGains, 
    TAX_CONSTANTS.FEDERAL_TAX_BRACKETS
  );
  
  // Calculate federal tax without capital gains
  const federalTaxWithoutCapitalGains = calculateIncomeTax(
    otherIncome, 
    TAX_CONSTANTS.FEDERAL_TAX_BRACKETS
  );
  
  // Calculate provincial tax on taxable capital gains (using Ontario as example)
  const provincialTaxWithCapitalGains = calculateIncomeTax(
    otherIncome + taxableCapitalGains, 
    TAX_CONSTANTS.ONTARIO_TAX_BRACKETS
  );
  
  // Calculate provincial tax without capital gains
  const provincialTaxWithoutCapitalGains = calculateIncomeTax(
    otherIncome, 
    TAX_CONSTANTS.ONTARIO_TAX_BRACKETS
  );
  
  // The capital gains tax is the difference between tax with and without capital gains
  return (
    (federalTaxWithCapitalGains - federalTaxWithoutCapitalGains) +
    (provincialTaxWithCapitalGains - provincialTaxWithoutCapitalGains)
  );
};

/**
 * Calculate OAS clawback amount
 * @param income Annual income
 * @returns OAS clawback amount
 */
export const calculateOASClawback = (income: number): number => {
  if (income <= TAX_CONSTANTS.OAS_CLAWBACK_THRESHOLD) {
    return 0;
  }
  
  return Math.min(
    (income - TAX_CONSTANTS.OAS_CLAWBACK_THRESHOLD) * TAX_CONSTANTS.OAS_CLAWBACK_RATE,
    12 * 727.67 // Maximum monthly OAS payment for 65-74 age group (2025)
  );
};

/**
 * Calculate maximum RRSP contribution
 * @param income Employment income
 * @returns Maximum RRSP contribution
 */
export const calculateMaxRRSPContribution = (income: number): number => {
  return Math.min(
    income * TAX_CONSTANTS.RRSP_CONTRIBUTION_PERCENTAGE,
    TAX_CONSTANTS.RRSP_CONTRIBUTION_LIMIT
  );
};

/**
 * Generate a retirement plan based on user input
 * @param userInput User input data
 * @returns Complete retirement plan
 */
export const generateRetirementPlan = (userInput: UserInput): RetirementPlan => {
  const years: YearlyPlan[] = [];
  let totalIncomeTaxPaid = 0;
  let totalCapitalGainsTaxPaid = 0;
  
  // Current balances
  let rspBalance = userInput.currentRSP;
  let tfsaBalance = userInput.currentTFSA;
  let otherInvestmentsBalance = userInput.currentOtherInvestments;
  
  // Calculate plan for each year from current age to life expectancy
  for (let i = 0; i <= userInput.lifeExpectancy - userInput.age; i++) {
    const currentAge = userInput.age + i;
    const currentYear = new Date().getFullYear() + i;
    const isRetired = currentAge >= userInput.retirementAge;
    
    // Apply inflation to expenses
    const inflationFactor = Math.pow(1 + (userInput.inflationRate / 100), i);
    const expenses = isRetired 
      ? userInput.retirementAnnualExpenses * inflationFactor 
      : userInput.currentAnnualExpenses * inflationFactor;
    
    // Calculate income
    let employmentIncome = 0;
    let cppIncome = 0;
    let oasIncome = 0;
    
    if (!isRetired) {
      // Working years
      employmentIncome = userInput.employmentIncome * inflationFactor;
    } else {
      // Retirement years - calculate government benefits
      if (currentAge >= 65) {
        // CPP income (simplified - would use actual claiming strategy in full implementation)
        cppIncome = userInput.expectedCPP.at65 * 12 * inflationFactor;
        
        // OAS income (simplified - would use actual claiming strategy in full implementation)
        oasIncome = userInput.expectedOAS.at65 * 12 * inflationFactor;
      } else if (currentAge >= 60) {
        // Early CPP (reduced)
        const reductionMonths = (65 - currentAge) * 12;
        const reductionFactor = 1 - (reductionMonths * TAX_CONSTANTS.CPP_EARLY_REDUCTION_MONTHLY);
        cppIncome = userInput.expectedCPP.at65 * 12 * reductionFactor * inflationFactor;
      }
    }
    
    // Calculate withdrawals needed in retirement
    let rspWithdrawal = 0;
    let tfsaWithdrawal = 0;
    let otherInvestmentsWithdrawal = 0;
    
    if (isRetired) {
      // Calculate how much we need to withdraw to cover expenses
      const incomeBeforeWithdrawals = employmentIncome + cppIncome + oasIncome;
      const withdrawalNeeded = Math.max(0, expenses - incomeBeforeWithdrawals);
      
      // Implement withdrawal strategy (simplified - would optimize in full implementation)
      // This follows the PRIORITIES.WITHDRAWAL_ORDER
      let remainingWithdrawalNeeded = withdrawalNeeded;
      
      // First withdraw from other investments
      otherInvestmentsWithdrawal = Math.min(otherInvestmentsBalance, remainingWithdrawalNeeded);
      remainingWithdrawalNeeded -= otherInvestmentsWithdrawal;
      
      // Then withdraw from RSP
      if (remainingWithdrawalNeeded > 0) {
        rspWithdrawal = Math.min(rspBalance, remainingWithdrawalNeeded);
        remainingWithdrawalNeeded -= rspWithdrawal;
      }
      
      // Finally withdraw from TFSA
      if (remainingWithdrawalNeeded > 0) {
        tfsaWithdrawal = Math.min(tfsaBalance, remainingWithdrawalNeeded);
      }
    }
    
    // Calculate total income
    const totalIncome = employmentIncome + cppIncome + oasIncome + rspWithdrawal + otherInvestmentsWithdrawal;
    
    // Calculate taxes
    // Note: TFSA withdrawals are not taxable
    const incomeTax = calculateIncomeTax(employmentIncome + cppIncome + oasIncome + rspWithdrawal, TAX_CONSTANTS.FEDERAL_TAX_BRACKETS) +
                      calculateIncomeTax(employmentIncome + cppIncome + oasIncome + rspWithdrawal, TAX_CONSTANTS.ONTARIO_TAX_BRACKETS);
    
    // Simplified capital gains calculation - in reality would be more complex
    // Assuming 2% of other investments balance is realized capital gains each year
    const realizedCapitalGains = otherInvestmentsWithdrawal * 0.2; // Assuming 20% of withdrawal is capital gains
    const capitalGainsTax = calculateCapitalGainsTax(realizedCapitalGains, employmentIncome + cppIncome + oasIncome + rspWithdrawal);
    
    const totalTax = incomeTax + capitalGainsTax;
    
    // Calculate contributions during working years
    let rspContribution = 0;
    let tfsaContribution = 0;
    let otherInvestmentsContribution = 0;
    
    if (!isRetired) {
      // Calculate available income after expenses and taxes
      const availableForSavings = Math.max(0, employmentIncome - expenses - totalTax);
      
      // Implement contribution strategy following PRIORITIES.CONTRIBUTION_ORDER
      let remainingForContributions = availableForSavings;
      
      // First contribute to RSP
      const maxRspContribution = calculateMaxRRSPContribution(employmentIncome);
      rspContribution = Math.min(maxRspContribution, remainingForContributions);
      remainingForContributions -= rspContribution;
      
      // Then contribute to TFSA
      tfsaContribution = Math.min(TAX_CONSTANTS.TFSA_CONTRIBUTION_LIMIT, remainingForContributions);
      remainingForContributions -= tfsaContribution;
      
      // Finally contribute to other investments
      otherInvestmentsContribution = remainingForContributions;
    }
    
    // Update account balances
    // RSP
    rspBalance = rspBalance * (1 + (userInput.rspGrowthRate / 100)) + rspContribution - rspWithdrawal;
    
    // TFSA
    tfsaBalance = tfsaBalance * (1 + (userInput.tfsaGrowthRate / 100)) + tfsaContribution - tfsaWithdrawal;
    
    // Other investments
    otherInvestmentsBalance = otherInvestmentsBalance * (1 + (userInput.otherInvestmentsGrowthRate / 100)) + 
                             otherInvestmentsContribution - otherInvestmentsWithdrawal;
    
    // Calculate total net worth
    const totalNetWorth = rspBalance + tfsaBalance + otherInvestmentsBalance;
    
    // Add year to plan
    years.push({
      age: currentAge,
      year: currentYear,
      isRetired,
      employmentIncome,
      cppIncome,
      oasIncome,
      rspWithdrawal,
      tfsaWithdrawal,
      otherInvestmentsWithdrawal,
      totalIncome,
      expenses,
      incomeTax,
      capitalGainsTax,
      totalTax,
      rspContribution,
      tfsaContribution,
      otherInvestmentsContribution,
      rspBalance,
      tfsaBalance,
      otherInvestmentsBalance,
      totalNetWorth
    });
    
    // Update totals
    totalIncomeTaxPaid += incomeTax;
    totalCapitalGainsTaxPaid += capitalGainsTax;
  }
  
  // Create summary
  const finalYear = years[years.length - 1];
  const summary: PlanSummary = {
    yearsOfRetirement: Math.max(0, userInput.lifeExpectancy - userInput.retirementAge),
    totalIncomeTaxPaid,
    totalCapitalGainsTaxPaid,
    finalNetWorth: finalYear.totalNetWorth,
    successfulRetirement: finalYear.totalNetWorth > 0
  };
  
  return {
    years,
    summary
  };
};
