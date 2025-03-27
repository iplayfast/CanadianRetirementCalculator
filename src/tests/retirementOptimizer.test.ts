import { UserInput } from '../../models/types';
import { createRetirementPlan, generateOptimizedRetirementPlan } from './mocks/retirementOptimizer';

describe('Retirement Plan Generation', () => {
  const mockUserInput: UserInput = {
    // Personal Information
    age: 35,
    retirementAge: 65,
    lifeExpectancy: 90,
    
    // Current Savings
    currentRSP: 50000,
    currentTFSA: 25000,
    currentOtherInvestments: 30000,
    
    // Income Sources
    employmentIncome: 85000,
    otherIncome: [],
    
    // Government Benefits
    expectedCPP: {
      at60: 700,
      at65: 1000,
      at70: 1400,
    },
    expectedOAS: {
      at65: 600,
      at70: 800,
    },
    
    // Expenses
    currentAnnualExpenses: 60000,
    retirementAnnualExpenses: 50000,
    
    // Growth and Inflation Rates
    inflationRate: 2.0,
    rspGrowthRate: 5.0,
    tfsaGrowthRate: 5.0,
    otherInvestmentsGrowthRate: 5.0,
  };

  test('createRetirementPlan should return a valid plan', () => {
    const plan = createRetirementPlan(mockUserInput);
    
    // Check plan structure
    expect(plan).toHaveProperty('years');
    expect(plan).toHaveProperty('summary');
    expect(Array.isArray(plan.years)).toBe(true);
    
    // Check years length matches life expectancy - current age + 1
    expect(plan.years.length).toBe(mockUserInput.lifeExpectancy - mockUserInput.age + 1);
    
    // Check first year data
    const firstYear = plan.years[0];
    expect(firstYear.age).toBe(mockUserInput.age);
    expect(firstYear.isRetired).toBe(false);
    
    // Check retirement transition
    const preRetirementYear = plan.years[mockUserInput.retirementAge - mockUserInput.age - 1];
    const retirementYear = plan.years[mockUserInput.retirementAge - mockUserInput.age];
    expect(preRetirementYear.isRetired).toBe(false);
    expect(retirementYear.isRetired).toBe(true);
    
    // Check summary data
    expect(plan.summary.yearsOfRetirement).toBe(mockUserInput.lifeExpectancy - mockUserInput.retirementAge);
    expect(typeof plan.summary.finalNetWorth).toBe('number');
  });

  test('generateOptimizedRetirementPlan should return a valid optimized plan', () => {
    const plan = generateOptimizedRetirementPlan(mockUserInput);
    
    // Check plan structure
    expect(plan).toHaveProperty('years');
    expect(plan).toHaveProperty('summary');
    
    // The optimized plan should have the same basic structure as the regular plan
    expect(Array.isArray(plan.years)).toBe(true);
    expect(plan.years.length).toBe(mockUserInput.lifeExpectancy - mockUserInput.age + 1);
  });
});
