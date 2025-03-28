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
  extraIncomeStreams: ExtraIncomeStream[];
  
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
  
  // New fields for benefit start ages
  cppStartAge?: number;
  oasStartAge?: number;
  
  // For people already receiving government benefits
  currentCPP?: number;
  currentOAS?: number;
  
  // New flags for collecting status
  isCollectingCPP: boolean;
  isCollectingOAS: boolean;
  
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
  
  // New fields for benefit start ages
  cppStartAge?: number;
  oasStartAge?: number;
  
  // For spouses already receiving government benefits
  currentCPP?: number;
  currentOAS?: number;
  
  // New flags for collecting status
  isCollectingCPP: boolean;
  isCollectingOAS: boolean;
  
  // Extra income streams
  extraIncomeStreams: ExtraIncomeStream[];
}

export interface YearlyPlan {
  
  extraIncomeStreams?: ExtraIncomeStream[];
spouseInfo?: {
  extraIncomeStreams?: ExtraIncomeStream[];
};
  // Tax data
  incomeTax: number;
  spouseIncomeTax?: number;
  capitalGainsTax: number;
  spouseCapitalGainsTax?: number; // Add this property
  totalTax: number;
  
  
}