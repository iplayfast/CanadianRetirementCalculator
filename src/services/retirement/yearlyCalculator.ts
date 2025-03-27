// src/services/retirement/yearlyCalculator.ts

import { UserInput, YearlyPlan } from '../../models/types';
import { TAX_CONSTANTS } from '../../constants/taxConstants';
import { shouldConvertRRSPtoRRIF } from '../rrif-min-withdrawal';
import { calculateIncomeTax, calculateCapitalGainsTax, calculateOASClawback } from './taxCalculator';
import { determineOptimalWithdrawals, OptimizationGoal } from './withdrawalStrategies';
import { calculateCPPIncome, calculateOASIncome, calculateExtraIncome } from './benefitCalculator';
import { calculateRRSPContributionRoom, validateRRSPContribution } from './rspContributionCalculator';

/**
 * Interface for account balances
 */
export interface AccountBalances {
  rspBalance: number;
  tfsaBalance: number;
  otherInvestmentsBalance: number;
  spouseRspBalance: number;
  spouseTfsaBalance: number;
  spouseOtherInvestmentsBalance: number;
}

/**
 * Interface for tracking contribution room
 */
export interface ContributionRoom {
  rrspRoom: number;
  tfsaRoom: number;
  tfsaWithdrawalsLastYear: number;
  spouseRrspRoom?: number;
  spouseTfsaRoom?: number;
  spouseTfsaWithdrawalsLastYear?: number;
}

/**
 * Calculate a single year in the retirement plan
 * @param userInput User input data
 * @param currentAge Current age
 * @param accountBalances Current account balances
 * @param contributionRoom Current contribution room
 * @param optimizationGoal Optimization goal
 * @param provincialBrackets Provincial tax brackets
 * @param benefitOptions CPP and OAS start ages
 * @param previousYearIncome Previous year's employment income (for RRSP room calculation)
 * @returns Yearly plan, updated account balances, and updated contribution room
 */
export function calculateYearlyPlan(
  userInput: UserInput,
  currentAge: number,
  accountBalances: AccountBalances,
  contributionRoom: ContributionRoom,
  optimizationGoal: OptimizationGoal,
  provincialBrackets: { threshold: number, rate: number }[],
  benefitOptions: {
    cppStartAge: number;
    oasStartAge: number;
    spouseCppStartAge: number;
    spouseOasStartAge: number;
  },
  previousYearIncome: {
    primary: number;
    spouse?: number;
  },
  isFirstYear: boolean = false
): { 
  yearlyPlan: YearlyPlan; 
  updatedBalances: AccountBalances; 
  updatedContributionRoom: ContributionRoom;
  taxData: { incomeTax: number; capitalGainsTax: number } 
} {
  // Destructure account balances
  let {
    rspBalance,
    tfsaBalance, 
    otherInvestmentsBalance,
    spouseRspBalance,
    spouseTfsaBalance,
    spouseOtherInvestmentsBalance
  } = accountBalances;
  
  // Destructure contribution room
  let {
    rrspRoom,
    tfsaRoom,
    tfsaWithdrawalsLastYear,
    spouseRrspRoom,
    spouseTfsaRoom,
    spouseTfsaWithdrawalsLastYear
  } = contributionRoom;
  
  // Add TFSA withdrawals from last year back to contribution room (available in the new year)
  tfsaRoom += tfsaWithdrawalsLastYear;
  if (userInput.hasSpouse && userInput.spouseInfo && spouseTfsaWithdrawalsLastYear !== undefined) {
    if (spouseTfsaRoom !== undefined) {
      spouseTfsaRoom += spouseTfsaWithdrawalsLastYear;
    }
  }
  
  // Reset the TFSA withdrawals tracking for the current year
  tfsaWithdrawalsLastYear = 0;
  if (spouseTfsaWithdrawalsLastYear !== undefined) {
    spouseTfsaWithdrawalsLastYear = 0;
  }
  
  // Add annual TFSA room increase ($7,000 for 2025 and beyond)
  const annualTfsaRoomIncrease = 7000;
  tfsaRoom += annualTfsaRoomIncrease;
  if (spouseTfsaRoom !== undefined) {
    spouseTfsaRoom += annualTfsaRoomIncrease;
  }
  
  // For RRSP, we only add new room in subsequent years based on previous year's income
  // Don't add additional room in the first year as the user-provided room already includes
  // the contribution room from the previous year's income
  if (previousYearIncome.primary > 0 && !isFirstYear) {
    const newRrspRoom = Math.min(
      previousYearIncome.primary * 0.18,
      TAX_CONSTANTS.RRSP_CONTRIBUTION_LIMIT
    );
    rrspRoom += newRrspRoom;
  }
  
  // Add spouse's RRSP contribution room if applicable, following the same logic
  if (userInput.hasSpouse && userInput.spouseInfo && 
      previousYearIncome.spouse !== undefined && previousYearIncome.spouse > 0 && 
      !isFirstYear) {
    const newSpouseRrspRoom = Math.min(
      previousYearIncome.spouse * 0.18,
      TAX_CONSTANTS.RRSP_CONTRIBUTION_LIMIT
    );
    if (spouseRrspRoom !== undefined) {
      spouseRrspRoom += newSpouseRrspRoom;
    } else {
      spouseRrspRoom = newSpouseRrspRoom;
    }
  }
  
  // Calculate spouse's age if applicable
  const spouseAge = userInput.hasSpouse && userInput.spouseInfo 
    ? userInput.spouseInfo.age + (currentAge - userInput.age)
    : undefined;
    
  // Determine if retired
  const isRetired = currentAge >= userInput.retirementAge;
  const isSpouseRetired = userInput.hasSpouse && userInput.spouseInfo && spouseAge
    ? spouseAge >= userInput.spouseInfo.retirementAge
    : false;

  // Calculate income sources
  let employmentIncome = isRetired ? 0 : userInput.employmentIncome;
  let spouseEmploymentIncome = 0;
  
  if (userInput.hasSpouse && userInput.spouseInfo) {
    spouseEmploymentIncome = isSpouseRetired ? 0 : userInput.spouseInfo.employmentIncome;
  }
  
  // CPP and OAS calculations
  let cppIncome = calculateCPPIncome(
    currentAge,
    benefitOptions.cppStartAge,
    userInput.expectedCPP
  );
  
  let oasIncome = calculateOASIncome(
    currentAge,
    benefitOptions.oasStartAge,
    userInput.expectedOAS
  );
  
  // Spouse CPP and OAS
  let spouseCppIncome = 0;
  let spouseOasIncome = 0;
  
  if (userInput.hasSpouse && userInput.spouseInfo && spouseAge) {
    spouseCppIncome = calculateCPPIncome(
      spouseAge,
      benefitOptions.spouseCppStartAge,
      userInput.spouseInfo.expectedCPP
    );
    
    spouseOasIncome = calculateOASIncome(
      spouseAge,
      benefitOptions.spouseOasStartAge,
      userInput.spouseInfo.expectedOAS
    );
  }
  
  // Calculate extra income streams
  const extraIncome = calculateExtraIncome(
    currentAge,
    userInput.age,
    userInput.inflationRate,
    userInput.extraIncomeStreams
  );
  
  // Spouse extra income streams
  let spouseExtraIncome = 0;
  if (userInput.hasSpouse && userInput.spouseInfo) {
    spouseExtraIncome = calculateExtraIncome(
      spouseAge || 0,
      userInput.spouseInfo.age,
      userInput.inflationRate,
      userInput.spouseInfo.extraIncomeStreams || []
    );
  }
  
  // Calculate total income before withdrawals
  const totalIncomeBeforeWithdrawals = employmentIncome + cppIncome + oasIncome + extraIncome;
  const spouseTotalIncomeBeforeWithdrawals = spouseEmploymentIncome + spouseCppIncome + spouseOasIncome + spouseExtraIncome;
  
  // Apply OAS clawback
  const oasClawback = calculateOASClawback(totalIncomeBeforeWithdrawals);
  const spouseOasClawback = userInput.hasSpouse && userInput.spouseInfo 
    ? calculateOASClawback(spouseTotalIncomeBeforeWithdrawals)
    : 0;
  
  // Adjust OAS income
  oasIncome = Math.max(0, oasIncome - oasClawback);
  spouseOasIncome = Math.max(0, spouseOasIncome - spouseOasClawback);
  
  // Recalculate total income after clawbacks
  const totalIncome = employmentIncome + cppIncome + oasIncome + extraIncome;
  const spouseTotalIncome = spouseEmploymentIncome + spouseCppIncome + spouseOasIncome + spouseExtraIncome;

  // Determine expenses (adjusted for inflation)
  const inflationFactor = Math.pow(1 + userInput.inflationRate / 100, currentAge - userInput.age);
  const expenses = isRetired 
    ? userInput.retirementAnnualExpenses * inflationFactor
    : userInput.currentAnnualExpenses * inflationFactor;

  // Track contributions
  let rspContribution = 0;
  let tfsaContribution = 0;
  let otherInvestmentsContribution = 0;
  let spouseRspContribution = 0;
  let spouseTfsaContribution = 0;
  let spouseOtherInvestmentsContribution = 0;

  // Adjusted withdrawal needed
  const totalCombinedIncome = totalIncome + spouseTotalIncome;
  let adjustedWithdrawalNeeded = Math.max(0, expenses - totalCombinedIncome);

  // If not retired and income exceeds expenses, contribute to accounts
  if (!isRetired && totalCombinedIncome > expenses) {
    // Calculate excess income that can be saved
    let excessIncome = totalCombinedIncome - expenses;
    
    // Prioritize RSP contributions
    if (excessIncome > 0 && rrspRoom > 0) {
      // Limit RSP contribution to available room and income
      rspContribution = Math.min(rrspRoom, excessIncome);
      
      // Update account and reduce excess income
      rspBalance += rspContribution;
      excessIncome -= rspContribution;
      
      // Reduce RRSP room by the contribution
      rrspRoom -= rspContribution;
    }
    
    // Next priority: TFSA
    if (excessIncome > 0 && tfsaRoom > 0) {
      tfsaContribution = Math.min(tfsaRoom, excessIncome);
      
      // Update account and reduce excess income
      tfsaBalance += tfsaContribution;
      excessIncome -= tfsaContribution;
      
      // Reduce TFSA room by the contribution
      tfsaRoom -= tfsaContribution;
    }
    
    // Last priority: Other investments
    if (excessIncome > 0) {
      otherInvestmentsContribution = excessIncome;
      otherInvestmentsBalance += otherInvestmentsContribution;
    }
  }

  // Convert RRSP to RRIF if needed
  const isRRIF = shouldConvertRRSPtoRRIF(currentAge);
  const isSpouseRRIF = userInput.hasSpouse && userInput.spouseInfo && spouseAge 
    ? shouldConvertRRSPtoRRIF(spouseAge)
    : false;

  // Determine optimal withdrawals
  const withdrawals = determineOptimalWithdrawals(
    {
      age: currentAge,
      isRRIF,
      rspBalance,
      tfsaBalance,
      otherInvestmentsBalance,
      taxableIncome: totalIncome,
      spouseAge,
      isSpouseRRIF,
      spouseRspBalance,
      spouseTfsaBalance,
      spouseOtherInvestmentsBalance,
      spouseTaxableIncome: spouseTotalIncome
    },
    adjustedWithdrawalNeeded,
    optimizationGoal,
    provincialBrackets
  );

  // Track TFSA withdrawals for next year's contribution room
  tfsaWithdrawalsLastYear = withdrawals.tfsaWithdrawal;
  if (withdrawals.spouseTfsaWithdrawal > 0) {
    spouseTfsaWithdrawalsLastYear = withdrawals.spouseTfsaWithdrawal;
  }

  // Calculate taxes for primary person
  const incomeTax = calculateIncomeTax(
    totalIncome + withdrawals.rspWithdrawal,
    TAX_CONSTANTS.FEDERAL_TAX_BRACKETS
  ) + calculateIncomeTax(
    totalIncome + withdrawals.rspWithdrawal,
    provincialBrackets
  );

  const capitalGainsTax = calculateCapitalGainsTax(
    withdrawals.otherInvestmentsWithdrawal,
    totalIncome + withdrawals.rspWithdrawal,
    userInput.province
  );
  
  // Calculate taxes for spouse if applicable
  let spouseIncomeTax = 0;
  let spouseCapitalGainsTax = 0;
  
  if (userInput.hasSpouse && userInput.spouseInfo) {
    spouseIncomeTax = calculateIncomeTax(
      spouseTotalIncome + withdrawals.spouseRspWithdrawal,
      TAX_CONSTANTS.FEDERAL_TAX_BRACKETS
    ) + calculateIncomeTax(
      spouseTotalIncome + withdrawals.spouseRspWithdrawal,
      provincialBrackets
    );
    
    spouseCapitalGainsTax = calculateCapitalGainsTax(
      withdrawals.spouseOtherInvestmentsWithdrawal,
      spouseTotalIncome + withdrawals.spouseRspWithdrawal,
      userInput.province
    );
  }

  // Update account balances after withdrawals
  rspBalance -= withdrawals.rspWithdrawal;
  tfsaBalance -= withdrawals.tfsaWithdrawal;
  otherInvestmentsBalance -= withdrawals.otherInvestmentsWithdrawal;
  
  if (userInput.hasSpouse && userInput.spouseInfo) {
    spouseRspBalance -= withdrawals.spouseRspWithdrawal;
    spouseTfsaBalance -= withdrawals.spouseTfsaWithdrawal;
    spouseOtherInvestmentsBalance -= withdrawals.spouseOtherInvestmentsWithdrawal;
  }

  // Apply growth to account balances
  rspBalance *= (1 + userInput.rspGrowthRate / 100);
  tfsaBalance *= (1 + userInput.tfsaGrowthRate / 100);
  otherInvestmentsBalance *= (1 + userInput.otherInvestmentsGrowthRate / 100);
  
  if (userInput.hasSpouse && userInput.spouseInfo) {
    spouseRspBalance *= (1 + userInput.rspGrowthRate / 100);
    spouseTfsaBalance *= (1 + userInput.tfsaGrowthRate / 100);
    spouseOtherInvestmentsBalance *= (1 + userInput.otherInvestmentsGrowthRate / 100);
  }

  // Calculate total taxes
  const totalTax = incomeTax + capitalGainsTax + spouseIncomeTax + spouseCapitalGainsTax;

  // Calculate total withdrawals
  const totalWithdrawals = withdrawals.rspWithdrawal + 
                          withdrawals.tfsaWithdrawal + 
                          withdrawals.otherInvestmentsWithdrawal +
                          withdrawals.spouseRspWithdrawal +
                          withdrawals.spouseTfsaWithdrawal +
                          withdrawals.spouseOtherInvestmentsWithdrawal;

  // Calculate potential discretionary spending (fun money)
  const funMoney = totalIncome + spouseTotalIncome + totalWithdrawals - expenses - totalTax;

  // Calculate total net worth
  const totalNetWorth = rspBalance + tfsaBalance + otherInvestmentsBalance +
                        spouseRspBalance + spouseTfsaBalance + spouseOtherInvestmentsBalance;

  
  // Prepare yearly plan
  const yearlyPlan: YearlyPlan = {
    age: currentAge,
    year: new Date().getFullYear() + (currentAge - userInput.age),
    isRetired,
    employmentIncome,
    cppIncome,
    oasIncome,
    rspWithdrawal: withdrawals.rspWithdrawal,
    tfsaWithdrawal: withdrawals.tfsaWithdrawal,
    otherInvestmentsWithdrawal: withdrawals.otherInvestmentsWithdrawal,
    extraIncome,
    spouseAge,
    spouseIsRetired: isSpouseRetired,
    spouseEmploymentIncome,
    spouseCppIncome,
    spouseOasIncome,
    spouseRspWithdrawal: withdrawals.spouseRspWithdrawal,
    spouseTfsaWithdrawal: withdrawals.spouseTfsaWithdrawal,
    spouseOtherInvestmentsWithdrawal: withdrawals.spouseOtherInvestmentsWithdrawal,
    spouseExtraIncome,
    totalIncome: totalIncome + spouseTotalIncome + totalWithdrawals,
    expenses,
    funMoney: funMoney > 0 ? funMoney : undefined,
    incomeTax,
    spouseIncomeTax,
    capitalGainsTax,
    totalTax,
    rspContribution,
    tfsaContribution,
    otherInvestmentsContribution,
    spouseRspContribution,
    spouseTfsaContribution,
    spouseOtherInvestmentsContribution,
    rspBalance,
    tfsaBalance,
    otherInvestmentsBalance,
    spouseRspBalance,
    spouseTfsaBalance,
    spouseOtherInvestmentsBalance,
    totalNetWorth
  };

  // Return the yearly plan, updated balances, and updated contribution room
  return {
    yearlyPlan,
    updatedBalances: {
      rspBalance,
      tfsaBalance,
      otherInvestmentsBalance,
      spouseRspBalance,
      spouseTfsaBalance,
      spouseOtherInvestmentsBalance
    },
    updatedContributionRoom: {
      rrspRoom,
      tfsaRoom,
      tfsaWithdrawalsLastYear,
      spouseRrspRoom,
      spouseTfsaRoom,
      spouseTfsaWithdrawalsLastYear
    },
    taxData: {
      incomeTax: incomeTax + spouseIncomeTax,
      capitalGainsTax: capitalGainsTax + spouseCapitalGainsTax
    }
  };
}