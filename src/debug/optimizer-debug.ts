// src/debug/optimizer-debug.ts
// A standalone test file to debug optimization strategies

import { UserInput, RetirementPlan } from '../models/types';
import { generateRetirementPlan } from '../services/retirement/retirementCalculator';

// Sample user input data for testing
const sampleUserInput: UserInput = {
  name: 'Test User',
  age: 50,
  retirementAge: 65,
  lifeExpectancy: 90,
  province: 'ON',
  hasSpouse: true,
  spouseInfo: {
    name: 'Test Spouse',
    age: 48,
    retirementAge: 63,
    lifeExpectancy: 92,
    currentRSP: 300000,
    currentTFSA: 100000,
    currentOtherInvestments: 150000,
    employmentIncome: 80000,
    expectedCPP: {
      at60: 700,
      at65: 1000,
      at70: 1400
    },
    expectedOAS: {
      at65: 615,
      at70: 836
    },
    currentCPP: 0,
    currentOAS: 0,
    isCollectingCPP: false,
    isCollectingOAS: false,
    extraIncomeStreams: []
  },
  currentRSP: 500000,
  currentTFSA: 150000,
  currentOtherInvestments: 250000,
  employmentIncome: 120000,
  otherIncome: [],
  expectedCPP: {
    at60: 800,
    at65: 1200,
    at70: 1700
  },
  expectedOAS: {
    at65: 615,
    at70: 836
  },
  currentCPP: 0,
  currentOAS: 0,
  isCollectingCPP: false,
  isCollectingOAS: false,
  extraIncomeStreams: [],
  currentAnnualExpenses: 70000,
  retirementAnnualExpenses: 60000,
  inflationRate: 0.02,
  rspGrowthRate: 0.05,
  tfsaGrowthRate: 0.05,
  otherInvestmentsGrowthRate: 0.05
};

// Function to test different CPP/OAS claiming ages for max net worth
function findOptimalBenefitTimingForMaxNetWorth(userInput: UserInput): {
  cppStartAge: number;
  oasStartAge: number;
  spouseCppAge?: number;
  spouseOasAge?: number;
  finalNetWorth: number;
  plan: RetirementPlan;
} {
  console.log('Testing benefit timing optimization for max net worth...');

  // Define possible claiming ages to test
  const cppAges = [60, 65, 70];
  const oasAges = [65, 70];
  
  // Array to store results of each simulation
  const simulations: {
    cppAge: number;
    oasAge: number;
    spouseCppAge?: number;
    spouseOasAge?: number;
    finalNetWorth: number;
    plan: RetirementPlan;
  }[] = [];
  
  // For each combination of claiming ages
  for (const cppAge of cppAges) {
    for (const oasAge of oasAges) {
      // Skip invalid combinations (e.g., OAS before 65)
      if (oasAge < 65) continue;
      
      if (userInput.hasSpouse && userInput.spouseInfo) {
        // With a spouse, we need to test spouse claiming ages too
        for (const spouseCppAge of cppAges) {
          for (const spouseOasAge of oasAges) {
            // Skip invalid combinations
            if (spouseOasAge < 65) continue;
            
            console.log(`Testing: CPP ${cppAge}, OAS ${oasAge}, Spouse CPP ${spouseCppAge}, Spouse OAS ${spouseOasAge}...`);
            
            // Create a copy of userInput to avoid modifying the original
            const inputCopy = JSON.parse(JSON.stringify(userInput)) as UserInput;
            
            // Run simulation with these claiming ages
            const plan = generateRetirementPlan(inputCopy, {
              optimizationGoal: 'max-end-worth',
              cppStartAge: cppAge,
              oasStartAge: oasAge,
              spouseCppStartAge: spouseCppAge,
              spouseOasStartAge: spouseOasAge
            });
            
            console.log(`  - Final Net Worth: $${Math.round(plan.summary.finalNetWorth).toLocaleString()}`);
            
            // Store results
            simulations.push({
              cppAge,
              oasAge,
              spouseCppAge,
              spouseOasAge,
              finalNetWorth: plan.summary.finalNetWorth,
              plan
            });
          }
        }
      } else {
        // Without spouse, just test primary person claiming ages
        console.log(`Testing: CPP ${cppAge}, OAS ${oasAge}...`);
        
        // Create a copy of userInput to avoid modifying the original
        const inputCopy = JSON.parse(JSON.stringify(userInput)) as UserInput;
        inputCopy.hasSpouse = false;
        inputCopy.spouseInfo = undefined;
        
        // Run simulation with these claiming ages
        const plan = generateRetirementPlan(inputCopy, {
          optimizationGoal: 'max-end-worth',
          cppStartAge: cppAge,
          oasStartAge: oasAge
        });
        
        console.log(`  - Final Net Worth: $${Math.round(plan.summary.finalNetWorth).toLocaleString()}`);
        
        // Store results
        simulations.push({
          cppAge,
          oasAge,
          finalNetWorth: plan.summary.finalNetWorth,
          plan
        });
      }
    }
  }
  
  // Find the simulation with the highest end net worth
  let bestSimulation = simulations[0];
  for (const sim of simulations) {
    if (sim.finalNetWorth > bestSimulation.finalNetWorth) {
      bestSimulation = sim;
    }
  }
  
  console.log('\nBest benefit timing for max net worth:');
  console.log(`- Primary: CPP at ${bestSimulation.cppAge}, OAS at ${bestSimulation.oasAge}`);
  if (bestSimulation.spouseCppAge) {
    console.log(`- Spouse: CPP at ${bestSimulation.spouseCppAge}, OAS at ${bestSimulation.spouseOasAge}`);
  }
  console.log(`- Final Net Worth: $${Math.round(bestSimulation.finalNetWorth).toLocaleString()}`);
  
  return bestSimulation;
}

// Function to test different CPP/OAS claiming ages for lowest tax
function findOptimalBenefitTimingForLowestTax(userInput: UserInput): {
  cppStartAge: number;
  oasStartAge: number;
  spouseCppAge?: number;
  spouseOasAge?: number;
  totalTax: number;
  plan: RetirementPlan;
} {
  console.log('Testing benefit timing optimization for lowest tax...');

  // Define possible claiming ages to test
  const cppAges = [60, 65, 70];
  const oasAges = [65, 70];
  
  // Array to store results of each simulation
  const simulations: {
    cppAge: number;
    oasAge: number;
    spouseCppAge?: number;
    spouseOasAge?: number;
    totalTax: number;
    plan: RetirementPlan;
  }[] = [];
  
  // For each combination of claiming ages
  for (const cppAge of cppAges) {
    for (const oasAge of oasAges) {
      // Skip invalid combinations (e.g., OAS before 65)
      if (oasAge < 65) continue;
      
      if (userInput.hasSpouse && userInput.spouseInfo) {
        // With a spouse, we need to test spouse claiming ages too
        for (const spouseCppAge of cppAges) {
          for (const spouseOasAge of oasAges) {
            // Skip invalid combinations
            if (spouseOasAge < 65) continue;
            
            console.log(`Testing: CPP ${cppAge}, OAS ${oasAge}, Spouse CPP ${spouseCppAge}, Spouse OAS ${spouseOasAge}...`);
            
            // Create a copy of userInput to avoid modifying the original
            const inputCopy = JSON.parse(JSON.stringify(userInput)) as UserInput;
            
            // Run simulation with these claiming ages
            const plan = generateRetirementPlan(inputCopy, {
              optimizationGoal: 'lowest-tax',
              cppStartAge: cppAge,
              oasStartAge: oasAge,
              spouseCppStartAge: spouseCppAge,
              spouseOasStartAge: spouseOasAge
            });
            
            const totalTax = plan.summary.totalIncomeTaxPaid + plan.summary.totalCapitalGainsTaxPaid;
            console.log(`  - Total Lifetime Tax: $${Math.round(totalTax).toLocaleString()}`);
            
            // Store results
            simulations.push({
              cppAge,
              oasAge,
              spouseCppAge,
              spouseOasAge,
              totalTax,
              plan
            });
          }
        }
      } else {
        // Without spouse, just test primary person claiming ages
        console.log(`Testing: CPP ${cppAge}, OAS ${oasAge}...`);
        
        // Create a copy of userInput to avoid modifying the original
        const inputCopy = JSON.parse(JSON.stringify(userInput)) as UserInput;
        inputCopy.hasSpouse = false;
        inputCopy.spouseInfo = undefined;
        
        // Run simulation with these claiming ages
        const plan = generateRetirementPlan(inputCopy, {
          optimizationGoal: 'lowest-tax',
          cppStartAge: cppAge,
          oasStartAge: oasAge
        });
        
        const totalTax = plan.summary.totalIncomeTaxPaid + plan.summary.totalCapitalGainsTaxPaid;
        console.log(`  - Total Lifetime Tax: $${Math.round(totalTax).toLocaleString()}`);
        
        // Store results
        simulations.push({
          cppAge,
          oasAge,
          totalTax,
          plan
        });
      }
    }
  }
  
  // Find the simulation with the lowest total tax
  let bestSimulation = simulations[0];
  for (const sim of simulations) {
    if (sim.totalTax < bestSimulation.totalTax) {
      bestSimulation = sim;
    }
  }
  
  console.log('\nBest benefit timing for lowest tax:');
  console.log(`- Primary: CPP at ${bestSimulation.cppAge}, OAS at ${bestSimulation.oasAge}`);
  if (bestSimulation.spouseCppAge) {
    console.log(`- Spouse: CPP at ${bestSimulation.spouseCppAge}, OAS at ${bestSimulation.spouseOasAge}`);
  }
  console.log(`- Total Lifetime Tax: $${Math.round(bestSimulation.totalTax).toLocaleString()}`);
  
  return bestSimulation;
}

// Function to compare different optimization strategies
function compareOptimizationStrategies(userInput: UserInput): void {
  console.log('Comparing different optimization strategies...');
  
  // Define strategies to test
  const strategies = ['lowest-tax', 'max-end-worth', 'spend-it-all', 'balanced'];
  
  // Results array
  const results: {
    strategy: string;
    finalNetWorth: number;
    totalTax: number;
    successfulRetirement: boolean;
    annualFunMoney?: number;
  }[] = [];
  
  // Test each strategy
  for (const strategy of strategies) {
    console.log(`\nTesting "${strategy}" strategy...`);
    
    // Create a copy of userInput
    const inputCopy = JSON.parse(JSON.stringify(userInput)) as UserInput;
    
    // Run simulation with this strategy
    const plan = generateRetirementPlan(inputCopy, {
      optimizationGoal: strategy as any,
      cppStartAge: 65,
      oasStartAge: 65,
      spouseCppStartAge: 65,
      spouseOasStartAge: 65
    });
    
    const totalTax = plan.summary.totalIncomeTaxPaid + plan.summary.totalCapitalGainsTaxPaid;
    console.log(`- Final Net Worth: $${Math.round(plan.summary.finalNetWorth).toLocaleString()}`);
    console.log(`- Total Lifetime Tax: $${Math.round(totalTax).toLocaleString()}`);
    console.log(`- Successful Retirement: ${plan.summary.successfulRetirement}`);
    if (plan.summary.annualFunMoney !== undefined) {
      console.log(`- Annual Fun Money: $${Math.round(plan.summary.annualFunMoney).toLocaleString()}/year`);
    }
    
    // Store results
    results.push({
      strategy,
      finalNetWorth: plan.summary.finalNetWorth,
      totalTax,
      successfulRetirement: plan.summary.successfulRetirement,
      annualFunMoney: plan.summary.annualFunMoney
    });
  }
  
  // Display comparison
  console.log('\nStrategy Comparison Summary:');
  console.log('--------------------------------------------------');
  console.log('Strategy | Net Worth | Tax | Fun Money | Success');
  console.log('--------------------------------------------------');
  
  for (const result of results) {
    console.log(`${result.strategy.padEnd(10)} | $${Math.round(result.finalNetWorth).toLocaleString().padEnd(10)} | $${Math.round(result.totalTax).toLocaleString().padEnd(10)} | ${result.annualFunMoney ? '$' + Math.round(result.annualFunMoney).toLocaleString() : 'N/A'.padEnd(10)} | ${result.successfulRetirement ? 'Yes' : 'No'}`);
  }
}

// Function to test withdrawal strategies in isolation
function testWithdrawalStrategies(): void {
  console.log('Testing withdrawal strategies directly...');
  
  // Basic test data
  const testRetirementData = {
    age: 70,
    isRRIF: true,
    rspBalance: 500000,
    tfsaBalance: 200000,
    otherInvestmentsBalance: 300000,
    taxableIncome: 20000,
    spouseAge: 68,
    isSpouseRRIF: true,
    spouseRspBalance: 400000,
    spouseTfsaBalance: 150000,
    spouseOtherInvestmentsBalance: 200000,
    spouseTaxableIncome: 15000
  };
  
  // Let's test by directly importing the withdrawal strategy functions
  try {
    // We would import the actual functions here
    // For now, we'll simulate them

    // Test max-end-worth strategy
    console.log('\nMax End Worth Strategy');
    console.log('----------------------');
    
    // Simulate the withdrawal calculation
    const maxNetWorthWithdrawals = {
      rspWithdrawal: 20000, // RRIF minimum
      tfsaWithdrawal: 0,
      otherInvestmentsWithdrawal: 30000,
      spouseRspWithdrawal: 18500, // RRIF minimum
      spouseTfsaWithdrawal: 0,
      spouseOtherInvestmentsWithdrawal: 31500
    };
    
    console.log('Withdrawal priority: Other investments → RSP → TFSA');
    console.log('Withdrawal amounts:', maxNetWorthWithdrawals);
    
    // Test lowest-tax strategy
    console.log('\nLowest Tax Strategy');
    console.log('-------------------');
    
    // Simulate the withdrawal calculation
    const lowestTaxWithdrawals = {
      rspWithdrawal: 30000, // More than minimum
      tfsaWithdrawal: 30000,
      otherInvestmentsWithdrawal: 15000,
      spouseRspWithdrawal: 25000, // More than minimum
      spouseTfsaWithdrawal: 15000,
      spouseOtherInvestmentsWithdrawal: 10000
    };
    
    console.log('Withdrawal priority: TFSA → Lower taxable income person → Lower tax account');
    console.log('Withdrawal amounts:', lowestTaxWithdrawals);
  } catch (error) {
    console.error('Error testing withdrawal strategies:', error);
  }
}

// Run the tests
function runAll(): void {
  console.log('=====================================================');
  console.log('RETIREMENT OPTIMIZATION STRATEGY TESTING');
  console.log('=====================================================\n');
  
  // First, compare basic optimization strategies
  compareOptimizationStrategies(sampleUserInput);
  
  // Test finding optimal benefit timing for max net worth
  console.log('\n=====================================================');
  const maxNetWorthOptimal = findOptimalBenefitTimingForMaxNetWorth(sampleUserInput);
  
  // Test finding optimal benefit timing for lowest tax
  console.log('\n=====================================================');
  const lowestTaxOptimal = findOptimalBenefitTimingForLowestTax(sampleUserInput);
  
  // Compare the two optimal strategies
  console.log('\n=====================================================');
  console.log('COMPARISON OF OPTIMAL STRATEGIES');
  console.log('=====================================================');
  console.log('Max Net Worth Strategy:');
  console.log(`- Final Net Worth: ${Math.round(maxNetWorthOptimal.finalNetWorth).toLocaleString()}`);
  console.log(`- Total Tax: ${Math.round(maxNetWorthOptimal.plan.summary.totalIncomeTaxPaid + maxNetWorthOptimal.plan.summary.totalCapitalGainsTaxPaid).toLocaleString()}`);
  console.log(`- CPP/OAS Ages: ${maxNetWorthOptimal.cppStartAge}/${maxNetWorthOptimal.oasStartAge}`);
  if (maxNetWorthOptimal.spouseCppAge) {
    console.log(`- Spouse CPP/OAS Ages: ${maxNetWorthOptimal.spouseCppAge}/${maxNetWorthOptimal.spouseOasAge}`);
  }
  
  console.log('\nLowest Tax Strategy:');
  console.log(`- Final Net Worth: ${Math.round(lowestTaxOptimal.plan.summary.finalNetWorth).toLocaleString()}`);
  console.log(`- Total Tax: ${Math.round(lowestTaxOptimal.totalTax).toLocaleString()}`);
  console.log(`- CPP/OAS Ages: ${lowestTaxOptimal.cppStartAge}/${lowestTaxOptimal.oasStartAge}`);
  if (lowestTaxOptimal.spouseCppAge) {
    console.log(`- Spouse CPP/OAS Ages: ${lowestTaxOptimal.spouseCppAge}/${lowestTaxOptimal.spouseOasAge}`);
  }
  
  // Test withdrawal strategies directly
  console.log('\n=====================================================');
  testWithdrawalStrategies();
}

// Execute all tests
runAll();