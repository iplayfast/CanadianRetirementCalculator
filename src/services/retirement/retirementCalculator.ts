// src/services/retirement/retirementCalculator.ts

import { UserInput, RetirementPlan, YearlyPlan, PlanSummary } from '../../models/types';
import { PROVINCIAL_TAX_RATES } from '../../constants/provincialTaxRates';
import { calculateYearlyPlan, AccountBalances, ContributionRoom } from './yearlyCalculator';
import { OptimizationGoal } from './withdrawalStrategies';

/**
 * Generate a comprehensive retirement plan based on user input and optimization goals
 * @param userInput Detailed user retirement input
 * @param options Optimization configuration options
 * @returns A full retirement plan projection
 */
export function generateRetirementPlan(
  userInput: UserInput, 
  options: {
    optimizationGoal?: OptimizationGoal;
    cppStartAge?: number;
    oasStartAge?: number;
    spouseCppStartAge?: number;
    spouseOasStartAge?: number;
  } = {}
): RetirementPlan {
  // Set default optimization goal
  const optimizationGoal = options.optimizationGoal || 'balanced';

  // Prepare provincial tax brackets based on user's province
  const provincialBrackets = PROVINCIAL_TAX_RATES[userInput.province]?.brackets || 
                              PROVINCIAL_TAX_RATES.ON.brackets;

  // Initialize retirement plan
  const years: YearlyPlan[] = [];
  
  // Initialize tracking variables
  let totalIncomeTaxPaid = 0;
  let totalCapitalGainsTaxPaid = 0;
  let yearsOfRetirement = 0;
  let successfulRetirement = true;
  let annualFunMoney = 0;
  let totalLifetimeFunMoney = 0;

  // Initialize account balances
  const accountBalances: AccountBalances = {
    rspBalance: userInput.currentRSP,
    tfsaBalance: userInput.currentTFSA,
    otherInvestmentsBalance: userInput.currentOtherInvestments,
    spouseRspBalance: userInput.hasSpouse && userInput.spouseInfo 
      ? userInput.spouseInfo.currentRSP 
      : 0,
    spouseTfsaBalance: userInput.hasSpouse && userInput.spouseInfo 
      ? userInput.spouseInfo.currentTFSA 
      : 0,
    spouseOtherInvestmentsBalance: userInput.hasSpouse && userInput.spouseInfo 
      ? userInput.spouseInfo.currentOtherInvestments 
      : 0
  };

  // Initialize contribution room
  const contributionRoom: ContributionRoom = {
    rrspRoom: userInput.rrspRoom,
    tfsaRoom: userInput.tfsaRoom,
    tfsaWithdrawalsLastYear: 0,
    spouseRrspRoom: userInput.hasSpouse && userInput.spouseInfo ? userInput.spouseInfo.rrspRoom : undefined,
    spouseTfsaRoom: userInput.hasSpouse && userInput.spouseInfo ? userInput.spouseInfo.tfsaRoom : undefined,
    spouseTfsaWithdrawalsLastYear: userInput.hasSpouse && userInput.spouseInfo ? 0 : undefined
  };

  // Track previous year's income for RSP contribution room calculation
  let previousYearIncome = {
    primary: userInput.employmentIncome,
    spouse: userInput.hasSpouse && userInput.spouseInfo ? userInput.spouseInfo.employmentIncome : undefined
  };

  // Determine benefit start ages
  const benefitOptions = {
    cppStartAge: options.cppStartAge || 65,
    oasStartAge: options.oasStartAge || 65,
    spouseCppStartAge: options.spouseCppStartAge || 65,
    spouseOasStartAge: options.spouseOasStartAge || 65
  };

   
  

  // Project from current age to life expectancy
  for (let currentAge = userInput.age; currentAge <= userInput.lifeExpectancy; currentAge++) {
    // Calculate year's data using the yearly calculator
    const { yearlyPlan, updatedBalances, updatedContributionRoom, taxData } = calculateYearlyPlan(
      userInput,
      currentAge,
      accountBalances,
      contributionRoom,
      optimizationGoal,
      provincialBrackets,
      benefitOptions,
      previousYearIncome,
      currentAge === userInput.age // isFirstYear flag: true only for the first iteration
    );
    

    // Update account balances and contribution room for next year
    Object.assign(accountBalances, updatedBalances);
    Object.assign(contributionRoom, updatedContributionRoom);
    
    // Update previous year's income for next iteration
    previousYearIncome = {
      primary: yearlyPlan.employmentIncome,
      spouse: yearlyPlan.spouseEmploymentIncome
    };
    
    // Track retirement status
    const isRetired = yearlyPlan.isRetired;
    
    // Accumulate total taxes
    totalIncomeTaxPaid += taxData.incomeTax;
    totalCapitalGainsTaxPaid += taxData.capitalGainsTax;
    
    // Track fun money in retirement
    if (isRetired) {
      yearsOfRetirement++;
      if (yearlyPlan.funMoney) {
        annualFunMoney += yearlyPlan.funMoney;
        totalLifetimeFunMoney += yearlyPlan.funMoney;
      }
    }
    
    // Check for successful retirement
    if (isRetired && yearlyPlan.totalIncome < yearlyPlan.expenses) {
      successfulRetirement = false;
    }
    
    // Add this year to the plan
    years.push(yearlyPlan);
  }
  
  // Calculate average annual fun money
  if (yearsOfRetirement > 0) {
    annualFunMoney /= yearsOfRetirement;
  }
  
  // Get final net worth from the last year
  const finalNetWorth = years[years.length - 1].totalNetWorth;

  // Prepare plan summary
  const summary: PlanSummary = {
    yearsOfRetirement,
    totalIncomeTaxPaid,
    totalCapitalGainsTaxPaid,
    finalNetWorth,
    successfulRetirement,
    annualFunMoney: yearsOfRetirement > 0 ? annualFunMoney : undefined,
    totalLifetimeFunMoney: totalLifetimeFunMoney > 0 ? totalLifetimeFunMoney : undefined
  };

  return {
    years,
    summary
  };
}