// src/constants/optimizationStrategies.ts

/**
 * Descriptions of retirement optimization strategies
 */
export interface StrategyInfo {
  value: string;
  label: string;
  description: string;
}

export const OPTIMIZATION_STRATEGIES: StrategyInfo[] = [
  { 
    value: 'default', 
    label: 'Default Plan',
    description: 'A balanced approach that optimizes your retirement withdrawals using reasonable assumptions about inflation, investment growth, and living expenses. This strategy aims for sustainability through retirement while maintaining some asset growth.'
  },
  { 
    value: 'lowest-tax', 
    label: 'Minimize Lifetime Taxes',
    description: 'This strategy prioritizes tax efficiency by optimizing the sequence and amounts of withdrawals from different account types. It calculates the most tax-efficient timing for CPP and OAS benefits and prioritizes withdrawals from accounts with the lowest effective tax rate at any given time.'
  },
  { 
    value: 'max-end-worth', 
    label: 'Maximize End Net Worth',
    description: 'This strategy focuses on preserving and growing your wealth throughout retirement. It prioritizes maintaining tax-advantaged accounts (especially TFSAs) longer, withdrawing from non-registered accounts first, and optimizing investment growth to maximize your final net worth or estate value.'
  },
  { 
    value: 'spend-it-all', 
    label: 'Spend It All (Max Enjoyment)', 
    description: 'This strategy optimizes for maximum spending during retirement while ensuring you don\'t outlive your money. It calculates a sustainable amount of "fun money" you can spend each year beyond your basic expenses, potentially drawing down assets more aggressively in your later years.'
  },
  { 
    value: 'balanced', 
    label: 'Balanced Approach',
    description: 'A middle-ground strategy that balances tax efficiency, investment growth, and spending enjoyment. It aims to provide reasonable returns while minimizing tax, and ensures sustainable withdrawals with some preservation of capital through retirement.'
  }
];

/**
 * Get strategy info by value
 * @param value Strategy value
 * @returns Strategy info object
 */
export function getStrategyInfo(value: string): StrategyInfo | undefined {
  return OPTIMIZATION_STRATEGIES.find(strategy => strategy.value === value);
}
