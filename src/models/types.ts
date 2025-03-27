// src/models/types.ts
export interface UserInput {
  // Personal Information
  name?: string;
  age: number;
  retirementAge: number;
  lifeExpectancy: number;
  province: string; // Province code (e.g., 'ON' for Ontario)
  
  // Spouse Information (new section)
  hasSpouse: boolean;
  spouseInfo?: SpouseInfo;
  
  // Current Savings
  currentRSP: number;
  currentTFSA: number;
  currentOtherInvestments: number;
  
  // Contribution Room
  rrspRoom: number;
  tfsaRoom: number;

  // Income Sources
  employmentIncome: number;
  otherIncome: number[];
  
  // Government Benefits
  expectedCPP: {
    at60: number;
    at65: number;
    at70: number;
  
  };
  expectedOAS: {
    at65: number;
    at70: number;
  };
  // For people already receiving government benefits
  currentCPP?: number;
  currentOAS?: number;
  
  // New flags for collecting status
  isCollectingCPP: boolean;
  isCollectingOAS: boolean;
  
  // Extra income streams
  extraIncomeStreams: ExtraIncomeStream[];
  
  // Expenses
  currentAnnualExpenses: number;
  retirementAnnualExpenses: number;
  
  // Growth and Inflation Rates
  inflationRate: number;
  rspGrowthRate: number;
  tfsaGrowthRate: number;
  otherInvestmentsGrowthRate: number;
}

export interface SpouseInfo {
  name?: string;
  age: number;
  retirementAge: number;
  lifeExpectancy: number;
  
  // Spouse's Current Savings
  currentRSP: number;
  currentTFSA: number;
  currentOtherInvestments: number;
  // Contribution Room
  rrspRoom: number;
  tfsaRoom: number;
  // Spouse's Income
  employmentIncome: number;
  
  // Spouse's Government Benefits
  expectedCPP: {
    at60: number;
    at65: number;
    at70: number;  
  };
  expectedOAS: {
    at65: number;
    at70: number;
  };
  // For spouses already receiving government benefits
  currentCPP?: number;
  currentOAS?: number;
  
  // New flags for collecting status
  isCollectingCPP: boolean;
  isCollectingOAS: boolean;
  
  // Extra income streams
  extraIncomeStreams: ExtraIncomeStream[];
}

// New interface for extra income streams
export interface ExtraIncomeStream {
  id: string;          // Unique identifier
  description: string; // Description of income source (e.g., "Solar panels", "Part-time job")
  yearlyAmount: number; // Annual income amount
  startYear?: number;   // Optional start year (defaults to current year)
  endYear?: number;     // Optional end year (undefined means indefinite)
  hasInflation: boolean; // Whether this income stream is affected by inflation
}

export interface RetirementPlan {
  years: YearlyPlan[];
  summary: PlanSummary;
}

export interface YearlyPlan {
  age: number;
  year: number;
  isRetired: boolean;
  
  // Primary person's information
  employmentIncome: number;
  cppIncome: number;
  oasIncome: number;
  rspWithdrawal: number;
  tfsaWithdrawal: number;
  otherInvestmentsWithdrawal: number;
  extraIncome: number; // New field for extra income streams
  
  // Spouse's information (new fields)
  spouseAge?: number;
  spouseIsRetired?: boolean;
  spouseEmploymentIncome?: number;
  spouseCppIncome?: number;
  spouseOasIncome?: number;
  spouseRspWithdrawal?: number;
  spouseTfsaWithdrawal?: number;
  spouseOtherInvestmentsWithdrawal?: number;
  spouseExtraIncome?: number; // New field for spouse extra income streams
  
  // Combined totals
  totalIncome: number;
  
  // Expenses
  expenses: number;
  
  // Optional fun money (additional discretionary spending)
  funMoney?: number;
  
  // Taxes
  incomeTax: number;
  spouseIncomeTax?: number;
  capitalGainsTax: number;
  totalTax: number;
  
  // Savings
  rspContribution: number;
  tfsaContribution: number;
  otherInvestmentsContribution: number;
  spouseRspContribution?: number;
  spouseTfsaContribution?: number;
  spouseOtherInvestmentsContribution?: number;
  
  // End of Year Balances
  rspBalance: number;
  tfsaBalance: number;
  otherInvestmentsBalance: number;
  spouseRspBalance?: number;
  spouseTfsaBalance?: number;
  spouseOtherInvestmentsBalance?: number;
  totalNetWorth: number;
}

export interface PlanSummary {
  yearsOfRetirement: number;
  totalIncomeTaxPaid: number;
  totalCapitalGainsTaxPaid: number;
  finalNetWorth: number;
  successfulRetirement: boolean;
  
  // Optional fun money summary fields
  annualFunMoney?: number;
  totalLifetimeFunMoney?: number;
}