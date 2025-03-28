// src/services/retirement/benefitCalculator.ts

import { TAX_CONSTANTS } from '../../constants/taxConstants';
import { ExtraIncomeStream } from '../../models/types';

/**
 * Calculate CPP income based on age and expected amounts
 * @param currentAge Current age
 * @param cppStartAge Age to start receiving CPP
 * @param expectedCpp Expected CPP amounts at different ages
 * @returns Monthly CPP income
 */
export const calculateCPPIncome = (
  currentAge: number,
  cppStartAge: number,
  expectedCpp: { at60: number; at65: number; at70: number }
): number => {
  if (currentAge < cppStartAge) {
    return 0;
  }

  // Determine which rate to use based on age
  if (cppStartAge === 60) {
    return expectedCpp.at60;
  } else if (cppStartAge === 65) {
    return expectedCpp.at65;
  } else if (cppStartAge === 70) {
    return expectedCpp.at70;
  } else {
    // Calculate interpolated values for other ages
    if (cppStartAge < 65) {
      // Between 60 and 65
      const rangeSize = expectedCpp.at65 - expectedCpp.at60;
      const ratio = (cppStartAge - 60) / 5;
      return expectedCpp.at60 + (rangeSize * ratio);
    } else {
      // Between 65 and 70
      const rangeSize = expectedCpp.at70 - expectedCpp.at65;
      const ratio = (cppStartAge - 65) / 5;
      return expectedCpp.at65 + (rangeSize * ratio);
    }
  }
};

/**
 * Calculate OAS income based on age and expected amounts
 * @param currentAge Current age
 * @param oasStartAge Age to start receiving OAS
 * @param expectedOas Expected OAS amounts at different ages
 * @returns Monthly OAS income before clawback
 */
// In src/services/retirement/benefitCalculator.ts


// Modified implementation to include 10% increase at age 75:
export const calculateOASIncome = (
  currentAge: number,
  oasStartAge: number,
  expectedOas: { at65: number; at70: number }
): number => {
  if (currentAge < oasStartAge || oasStartAge < 65) {
    return 0;
  }

  // First determine base OAS amount
  let baseAmount;
  if (oasStartAge === 65) {
    baseAmount = expectedOas.at65;
  } else if (oasStartAge === 70) {
    baseAmount = expectedOas.at70;
  } else {
    // Calculate interpolated values for ages between 65 and 70
    const rangeSize = expectedOas.at70 - expectedOas.at65;
    const ratio = (oasStartAge - 65) / 5;
    baseAmount = expectedOas.at65 + (rangeSize * ratio);
  }
  
  // Apply 10% increase for age 75 and older
  if (currentAge >= 75) {
    return baseAmount * 1.1; // 10% increase
  }
  
  return baseAmount;
};


/**
 * Calculate income from extra income streams
 * @param currentAge Current age
 * @param baseAge Base age (usually starting age)
 * @param inflationRate Annual inflation rate
 * @param extraIncomeStreams Array of extra income streams
 * @returns Total income from extra streams
 */
export const calculateExtraIncome = (
  currentAge: number,
  baseAge: number,
  inflationRate: number,
  extraIncomeStreams: ExtraIncomeStream[]
): number => {
  const currentYear = new Date().getFullYear() + (currentAge - baseAge);
  
  return extraIncomeStreams
    .filter(stream => {
      // Only include streams that have a start year less than or equal to the current year
      // and haven't reached their end year (if specified)
      const actualStartYear = stream.startYear || new Date().getFullYear();
      const actualEndYear = stream.endYear || Infinity;

      return currentYear >= actualStartYear && currentYear <= actualEndYear;
    })
    .reduce((total, stream) => {
      // Calculate years since the start of the stream for inflation adjustment
      const streamStartYear = stream.startYear || new Date().getFullYear();
      const yearsSinceStart = currentYear - streamStartYear;
      
      // Apply inflation if specified
      let amount = stream.yearlyAmount;
      if (stream.hasInflation && yearsSinceStart > 0) {
        // Convert percentage to decimal for calculation
        const inflationFactor = Math.pow(1 + (inflationRate / 100), yearsSinceStart);
        amount = amount * inflationFactor;
      }

      return total + amount;
    }, 0);
};

// src/services/retirement/benefitCalculator.ts

import { TAX_CONSTANTS } from '../../constants/taxConstants';
import { ExtraIncomeStream } from '../../models/types';

/**
 * Calculate adjusted benefit amount for CPP based on claiming age
 * @param currentBaseAmount Base monthly benefit amount
 * @param claimingAge Age at which benefit is claimed
 * @returns Adjusted monthly benefit amount
 */
export const calculateAdjustedCPPBenefit = (
  currentBaseAmount: number, 
  claimingAge: number
): number => {
  // Constants for CPP benefit adjustments
  const EARLY_REDUCTION_RATE = 0.006; // 0.6% per month before 65
  const LATE_INCREASE_RATE = 0.007;   // 0.7% per month after 65
  const STANDARD_AGE = 65;
  const MAX_EARLY_REDUCTION = 0.36;   // 36% reduction at age 60
  const MAX_LATE_INCREASE = 0.42;     // 42% increase at age 70

  // Calculate months difference from standard age
  const monthsDifference = (claimingAge - STANDARD_AGE) * 12;

  // Early claiming (before 65)
  if (claimingAge < STANDARD_AGE) {
    const reductionRate = Math.min(
      monthsDifference * -EARLY_REDUCTION_RATE, 
      -MAX_EARLY_REDUCTION
    );
    return currentBaseAmount * (1 + reductionRate);
  } 
  
  // Late claiming (after 65)
  if (claimingAge > STANDARD_AGE) {
    const increaseRate = Math.min(
      monthsDifference * LATE_INCREASE_RATE, 
      MAX_LATE_INCREASE
    );
    return currentBaseAmount * (1 + increaseRate);
  }

  // Claiming exactly at standard age
  return currentBaseAmount;
};

/**
 * Calculate adjusted benefit amount for OAS based on claiming age
 * @param currentBaseAmount Base monthly benefit amount
 * @param claimingAge Age at which benefit is claimed
 * @returns Adjusted monthly benefit amount
 */
export const calculateAdjustedOASBenefit = (
  currentBaseAmount: number, 
  claimingAge: number
): number => {
  // Constants for OAS benefit adjustments
  const LATE_INCREASE_RATE = 0.006;   // 0.6% per month after 65
  const STANDARD_AGE = 65;
  const MAX_LATE_INCREASE = 0.30;     // 30% increase possible

  // Calculate months difference from standard age
  const monthsDifference = (claimingAge - STANDARD_AGE) * 12;

  // Late claiming (after 65)
  if (claimingAge > STANDARD_AGE) {
    const increaseRate = Math.min(
      monthsDifference * LATE_INCREASE_RATE, 
      MAX_LATE_INCREASE
    );
    return currentBaseAmount * (1 + increaseRate);
  }

  // Claiming at or before standard age
  return currentBaseAmount;
};

interface BenefitOptions {
  baseAmount: number;
  earliestAge: number;
  standardAge: number;
  latestAge: number;
  monthlyReductionRate: number;
  monthlyIncreaseRate: number;
  maxReductionPercent: number;
  maxIncreasePercent: number;
}

const CPP_OPTIONS: BenefitOptions = {
  baseAmount: 0, // Will be set dynamically
  earliestAge: 60,
  standardAge: 65,
  latestAge: 70,
  monthlyReductionRate: 0.006, // 0.6% per month
  monthlyIncreaseRate: 0.007,  // 0.7% per month
  maxReductionPercent: 0.36,   // 36% reduction at age 60
  maxIncreasePercent: 0.42     // 42% increase at age 70
};

const OAS_OPTIONS: BenefitOptions = {
  baseAmount: 0, // Will be set dynamically (e.g., 727.67 for ages 65-74)
  earliestAge: 65,
  standardAge: 65,
  latestAge: 70,
  monthlyReductionRate: 0,     // No reduction before standard age
  monthlyIncreaseRate: 0.006,  // 0.6% per month
  maxReductionPercent: 0,      // No reduction
  maxIncreasePercent: 0.30     // 30% increase possible
};

/**
 * Calculate adjusted benefit amount based on claiming age
 * @param currentBaseAmount Base monthly benefit amount
 * @param claimingAge Age at which benefit is claimed
 * @param options Benefit calculation options
 * @returns Adjusted monthly benefit amount
 */
export const calculateAdjustedBenefit = (
  currentBaseAmount: number, 
  claimingAge: number, 
  options: BenefitOptions
): number => {
  // Can't claim before earliest age or after latest
  if (claimingAge < options.earliestAge || claimingAge > options.latestAge) {
    return 0;
  }

  // If claiming at standard age, return base amount
  if (claimingAge === options.standardAge) {
    return currentBaseAmount;
  }

  // Calculate months difference from standard age
  const monthsDifference = (claimingAge - options.standardAge) * 12;

  // Early claiming (before standard age)
  if (claimingAge < options.standardAge) {
    const reductionRate = Math.min(
      monthsDifference * options.monthlyReductionRate, 
      options.maxReductionPercent
    );
    return currentBaseAmount * (1 - reductionRate);
  }

  // Late claiming (after standard age)
  if (claimingAge > options.standardAge) {
    const increaseRate = Math.min(
      monthsDifference * options.monthlyIncreaseRate, 
      options.maxIncreasePercent
    );
    return currentBaseAmount * (1 + increaseRate);
  }

  return currentBaseAmount;
};

/**
 * Generate CPP or OAS benefit as an extra income stream
 * @param currentAge Current age
 * @param claimingAge Age at which benefit will be claimed
 * @param expectedBenefits Object with benefit amounts at different ages
 * @param benefitType 'CPP' or 'OAS'
 * @returns ExtraIncomeStream or null
 */
export const generateBenefitIncomeStream = (
  currentAge: number,
  claimingAge: number,
  expectedBenefits: { at60?: number; at65: number; at70?: number },
  benefitType: 'CPP' | 'OAS'
): ExtraIncomeStream | null => {
  // Validate input
  if (claimingAge < 60 || claimingAge > 70) {
    return null;
  }

  // Determine base amount based on available expected benefits
  let baseAmount: number;
  if (claimingAge === 60 && expectedBenefits.at60 !== undefined) {
    baseAmount = expectedBenefits.at60;
  } else if (claimingAge === 65) {
    baseAmount = expectedBenefits.at65;
  } else if (claimingAge === 70 && expectedBenefits.at70 !== undefined) {
    baseAmount = expectedBenefits.at70;
  } else {
    // Use the closest available age's benefit
    baseAmount = claimingAge <= 65 ? expectedBenefits.at65 : expectedBenefits.at70 || expectedBenefits.at65;
  }

  // Choose benefit options based on type
  const options = benefitType === 'CPP' ? CPP_OPTIONS : OAS_OPTIONS;
  options.baseAmount = baseAmount;

  // Adjust benefit amount
  const adjustedMonthlyBenefit = calculateAdjustedBenefit(baseAmount, claimingAge, options);

  // Create income stream
  return {
    id: `${benefitType.toLowerCase()}_benefit_${claimingAge}`,
    description: `${benefitType} Benefit (Started at Age ${claimingAge})`,    
    yearlyAmount: adjustedMonthlyBenefit * 12 * (benefitType === 'OAS' && currentAge >= 75 ? 1.1 : 1),
    startYear: new Date().getFullYear() + (claimingAge - currentAge),
    endYear: undefined, // Ongoing benefit
    hasInflation: true
  };
};

export const calculateBenefitIncome = (
  currentAge: number,
  claimingAge: number,
  expectedBenefits: { at60?: number; at65: number; at70?: number },
  benefitType: 'CPP' | 'OAS'
): number => {
  const stream = generateBenefitIncomeStream(currentAge, claimingAge, expectedBenefits, benefitType);
  return stream ? stream.yearlyAmount : 0;
};