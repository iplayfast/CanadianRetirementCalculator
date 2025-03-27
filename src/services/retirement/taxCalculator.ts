// src/services/retirement/taxCalculator.ts
import { TAX_CONSTANTS } from '../../constants/taxConstants';
import { PROVINCIAL_TAX_RATES } from '../../constants/provincialTaxRates';

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
 * @param province Province code (e.g., 'ON')
 * @returns Capital gains tax amount
 */
export const calculateCapitalGainsTax = (
  capitalGains: number, 
  otherIncome: number,
  province: string = 'ON' // Default to Ontario if not specified
): number => {
  // Only 50% of capital gains are taxable in Canada
  const taxableCapitalGains = capitalGains * TAX_CONSTANTS.CAPITAL_GAINS_INCLUSION_RATE;
  
  // Get provincial tax brackets for the selected province
  const provincialBrackets = PROVINCIAL_TAX_RATES[province]?.brackets || PROVINCIAL_TAX_RATES.ON.brackets;
  
  // Calculate federal tax
  const federalTaxWithCapitalGains = calculateIncomeTax(
    otherIncome + taxableCapitalGains, 
    TAX_CONSTANTS.FEDERAL_TAX_BRACKETS
  );
  
  const federalTaxWithoutCapitalGains = calculateIncomeTax(
    otherIncome, 
    TAX_CONSTANTS.FEDERAL_TAX_BRACKETS
  );
  
  // Calculate provincial tax
  const provincialTaxWithCapitalGains = calculateIncomeTax(
    otherIncome + taxableCapitalGains, 
    provincialBrackets
  );
  
  const provincialTaxWithoutCapitalGains = calculateIncomeTax(
    otherIncome, 
    provincialBrackets
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
 * Calculate marginal tax rates at different income levels
 */
export const calculateMarginalTaxRates = (
  income: number,
  provincialBrackets: { threshold: number, rate: number }[]
): { income: number, marginalRate: number }[] => {
  const taxBrackets = [];
  
  // Add federal tax brackets with their marginal rates
  for (let i = 0; i < TAX_CONSTANTS.FEDERAL_TAX_BRACKETS.length; i++) {
    const currentBracket = TAX_CONSTANTS.FEDERAL_TAX_BRACKETS[i];
    const nextBracket = TAX_CONSTANTS.FEDERAL_TAX_BRACKETS[i + 1];
    
    const federalRate = currentBracket.rate;
    
    // Find applicable provincial rate
    let provincialRate = 0;
    for (let j = provincialBrackets.length - 1; j >= 0; j--) {
      if (currentBracket.threshold >= provincialBrackets[j].threshold) {
        provincialRate = provincialBrackets[j].rate;
        break;
      }
    }
    
    // Combined rate
    const combinedRate = federalRate + provincialRate;
    
    // Calculate bracket end
    const bracketEnd = nextBracket ? nextBracket.threshold : Infinity;
    
    taxBrackets.push({ 
      income: currentBracket.threshold,
      marginalRate: combinedRate
    });
  }
  
  return taxBrackets;
};

/**
 * Calculate effective tax rate for an additional amount of income
 */
export const calculateEffectiveTaxRate = (
  currentIncome: number,
  additionalIncome: number,
  provincialBrackets: { threshold: number, rate: number }[]
): number => {
  if (additionalIncome <= 0) return 0;
  
  const taxBefore = calculateIncomeTax(currentIncome, TAX_CONSTANTS.FEDERAL_TAX_BRACKETS) + 
                    calculateIncomeTax(currentIncome, provincialBrackets);
                    
  const taxAfter = calculateIncomeTax(currentIncome + additionalIncome, TAX_CONSTANTS.FEDERAL_TAX_BRACKETS) + 
                  calculateIncomeTax(currentIncome + additionalIncome, provincialBrackets);
  
  return (taxAfter - taxBefore) / additionalIncome;
};