// Constants for Canadian tax rules
export const TAX_CONSTANTS = {
  // Federal tax brackets and rates for 2025
  FEDERAL_TAX_BRACKETS: [
    { threshold: 0, rate: 0.15 },
    { threshold: 57375, rate: 0.205 },
    { threshold: 114750, rate: 0.26 },
    { threshold: 177882, rate: 0.29 },
    { threshold: 253414, rate: 0.33 }
  ],
  
  // Ontario provincial tax brackets and rates for 2025 (as an example)
  ONTARIO_TAX_BRACKETS: [
    { threshold: 0, rate: 0.0505 },
    { threshold: 52886, rate: 0.0915 },
    { threshold: 105775, rate: 0.1116 },
    { threshold: 150000, rate: 0.1216 },
    { threshold: 220000, rate: 0.1316 }
  ],
  
  // Capital gains inclusion rate
  CAPITAL_GAINS_INCLUSION_RATE: 0.5,
  
  // RRSP contribution limits
  RRSP_CONTRIBUTION_PERCENTAGE: 0.18,
  RRSP_CONTRIBUTION_LIMIT: 32490, // for 2025
  
  // TFSA contribution limit
  TFSA_CONTRIBUTION_LIMIT: 7000, // for 2025
  
  // CPP and OAS claiming ages
  CPP_EARLIEST_AGE: 60,
  CPP_STANDARD_AGE: 65,
  CPP_LATEST_AGE: 70,
  OAS_EARLIEST_AGE: 65,
  OAS_LATEST_AGE: 70,
  
  // CPP adjustment factors
  CPP_EARLY_REDUCTION_MONTHLY: 0.006, // 0.6% per month
  CPP_LATE_INCREASE_MONTHLY: 0.007, // 0.7% per month
  
  // OAS adjustment factors
  OAS_LATE_INCREASE_MONTHLY: 0.006, // 0.6% per month
  
  // OAS clawback threshold
  OAS_CLAWBACK_THRESHOLD: 142609, // for 2023
  OAS_CLAWBACK_RATE: 0.15 // 15% of income above threshold
};

// Default inflation and growth rates
export const DEFAULT_RATES = {
  INFLATION_RATE: 0.02, // 2%
  RSP_GROWTH_RATE: 0.05, // 5%
  TFSA_GROWTH_RATE: 0.05, // 5%
  OTHER_INVESTMENTS_GROWTH_RATE: 0.05 // 5%
};

// Retirement planning priorities
export const PRIORITIES = {
  EXPENSES_FIRST: true,
  CONTRIBUTION_ORDER: ['RSP', 'TFSA', 'OTHER'],
  WITHDRAWAL_ORDER: ['OTHER', 'RSP', 'TFSA'] // Default order, will be optimized
};
