# Optimization Strategy Analysis

## Current Implementation Issues

After reviewing the codebase, I've identified several issues with how the optimization strategies are currently implemented:

### 1. Inconsistent Strategy Implementation

Each strategy is implemented differently, with varying approaches to the problem:

- **Balanced Strategy**: Uses a proportion-based approach with tax adjustment factors, but doesn't consistently follow the optimization goal.
- **Tax Efficient Strategy**: Has sophisticated tax calculations but doesn't fully leverage multi-year projections.
- **Max End Worth Strategy**: Uses a simplistic approach prioritizing accounts in a fixed order.
- **Spend It All Strategy**: Has age-based logic but doesn't consistently maximize "fun money".

### 2. Parameter Handling Problems

- The `optimizationGoal` parameter is passed through multiple functions but not consistently used.
- The optimization goal from `retirementOptimizer.ts` sometimes gets lost by the time it reaches the individual strategy implementations.
- Debug logging is inconsistent, making it difficult to trace how decisions are made.

### 3. Optimization Approach Issues

- Current implementations focus on single-year optimizations rather than multi-year projections.
- The brute force method described in `bugs.md` is not implemented in any strategy.
- Benefit timing optimization (CPP/OAS start ages) is attempted but not consistently applied.

## Proposed Implementation Changes

### 1. Standardize Strategy Interface

Create a consistent interface for all strategies:

```typescript
interface WithdrawalStrategy {
  name: string;
  description: string;
  determineWithdrawals(
    retirementData: RetirementData,
    remainingNeeded: number,
    rspWithdrawal: number,
    spouseRspWithdrawal: number,
    provincialBrackets: { threshold: number, rate: number }[]
  ): WithdrawalAmounts;
  
  // Optional methods for strategy-specific features
  findOptimalBenefitTiming?(userInput: UserInput): BenefitTiming;
  runMultiYearProjection?(userInput: UserInput): OptimizedResults;
}
```

### 2. Implement Strategy Factory Pattern

```typescript
function getWithdrawalStrategy(goal: OptimizationGoal): WithdrawalStrategy {
  switch(goal) {
    case 'lowest-tax':
      return new TaxEfficientStrategy();
    case 'max-end-worth':
      return new MaxEndWorthStrategy();
    case 'spend-it-all':
      return new SpendItAllStrategy();
    case 'balanced':
    default:
      return new BalancedStrategy();
  }
}
```

### 3. Properly Implement Multi-Year Projection

For each strategy, implement the brute force optimization described in `bugs.md`:

```typescript
// Pseudocode for multi-year projection
function runMultiYearProjection(userInput: UserInput): OptimizedResults {
  const results = [];
  
  // For various benefit timing combinations
  for (const cppAge of [60, 65, 70]) {
    for (const oasAge of [65, 70]) {
      // Skip invalid combinations
      if (oasAge < 65) continue;
      
      // With spouse, additional combinations
      if (userInput.hasSpouse) {
        for (const spouseCppAge of [60, 65, 70]) {
          for (const spouseOasAge of [65, 70]) {
            if (spouseOasAge < 65) continue;
            
            // Run full simulation with these parameters
            const result = simulateRetirement(userInput, {
              cppStartAge: cppAge,
              oasStartAge: oasAge,
              spouseCppStartAge: spouseCppAge,
              spouseOasStartAge: spouseOasAge
            });
            
            results.push(result);
          }
        }
      } else {
        // Run simulation without spouse
        const result = simulateRetirement(userInput, {
          cppStartAge: cppAge,
          oasStartAge: oasAge
        });
        
        results.push(result);
      }
    }
  }
  
  // Find optimal result based on strategy goals
  return findOptimalResult(results);
}
```

### 4. Strategy-Specific Optimizations

#### Lowest Tax Strategy
- Calculate lifetime tax burden for all benefit timing combinations
- Consider tax bracket smoothing across years
- Leverage income splitting between spouses when applicable

#### Max End Worth Strategy
- Prioritize tax-advantaged accounts (TFSA) for long-term growth
- Withdraw from non-registered accounts first to preserve tax-free and tax-deferred growth
- Delay CPP/OAS as much as possible if growth rates exceed benefit increase rates
- Consider sequence of returns risk and implement a safety margin

#### Spend It All Strategy
- Balance tax efficiency with ensuring all assets are depleted by end of life
- Calculate sustainable "fun money" withdrawal rates that gradually deplete assets
- Use dynamic withdrawal rate adjustments based on remaining years
- Prioritize RSP/RRIF withdrawals in later years to avoid large estate tax burdens

#### Balanced Strategy
- Combine elements of both tax-efficiency and growth preservation
- Consider tax bracket thresholds when determining withdrawal amounts
- Use proportional withdrawals based on account size with tax adjustments
- Optimize for both lifetime tax burden and ending net worth

## Implementation Plan for Rules

### RSP Rules Implementation
- Track RSP contribution room annually
- If working with income and extra funds available after expenses:
  - Contribute to RSP up to available room or extra income (whichever is less)
  - Reduce taxable income by contribution amount
  - Calculate tax savings from RSP contributions
  - Track contribution room for subsequent years

### TFSA Rules Implementation
- Track TFSA contribution room annually
- After RSP contributions, if additional funds available:
  - Contribute to TFSA up to available room or remaining extra income
  - No tax implications for contributions or growth
  - Track contribution room for subsequent years

### Other Investments Implementation
- After both RSP and TFSA contributions:
  - Any remaining excess income goes to Other Investments
  - Track capital gains for eventual withdrawal tax calculations
  - Apply appropriate growth rates

### Expense Handling Update
- Apply expenses at the beginning of each year (from salary and withdrawals if needed)
- Only calculate growth on remaining balances after expenses are paid
- Ensure inflation adjustments to expenses happen at the start of each year

## Debugging and Verification System

To verify the strategies are working correctly, implement:

1. Detailed logging that can be enabled for each optimization strategy
2. Breakdown of year-by-year decisions showing:
   - Income from all sources
   - Expenses (inflation-adjusted)
   - Withdrawals from each account
   - Growth in each account
   - Tax calculations
   - Benefit timing decisions
   
3. Comparative analysis tool showing outcomes of different strategies:
   - Total lifetime tax paid
   - Final net worth
   - Annual "fun money" available
   - Sustainability score
   
4. Sensitivity analysis for different input parameters:
   - Growth rates
   - Inflation rates
   - Expense levels
   - Benefit claiming ages