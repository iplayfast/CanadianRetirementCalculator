# Canadian Retirement Planner - Todo List

## Research Phase
- [x] Research Canadian income tax rules
- [x] Research Canadian capital gains tax rules
- [x] Research RSP (Registered Savings Plan) rules and limits
- [x] Research TFSA (Tax-Free Savings Account) rules and limits
- [x] Research CPP (Canada Pension Plan) benefits and claiming strategies
- [x] Research OAS (Old Age Security) benefits and claiming strategies
- [x] Research inflation adjustment considerations

## Development Phase
- [x] Set up React project structure
- [x] Design user interface components
- [x] Implement calculation logic for retirement planning
- [x] Create visualization components for financial projections
- [x] Implement tax optimization algorithms
- [x] Test application functionality
- [ ] Add explanation of the algorithm for each strategy in a hint format. (button popup?)
- [ ] Add option to save or load from disk as well as in browser
- [ ] Add option to print reports
- [ ] Finalize and deploy application

## Bug Fixes and Improvements

### Critical Bugs
- [ ] Fix percentage-to-decimal conversion in `yearlyCalculator.ts` - growth rates are currently being applied incorrectly (using raw percentage values instead of divided by 100)
- [ ] Fix age calculation in ReviewStep.tsx to display "Life Expectancy Age: xx" instead of "Life Expectancy: xx years"
- [ ] Fix the interest calculation timing to properly follow the rule that interest is calculated at the end of the year, not beginning
- [ ] Correct the age-based calculations to ensure the first year calculation starts at age+1, not the current age
- [ ] Fix the "Back to Input" functionality to navigate to the previous page instead of resetting state

### Optimization Strategy Bugs
- [ ] Ensure all withdrawal strategy implementations (`balancedStrategy.ts`, `taxEfficientStrategy.ts`, `maxEndWorthStrategy.ts`, `spendItAllStrategy.ts`) consistently pass and use the `optimizationGoal` parameter
- [ ] Harmonize logging across strategy implementations to facilitate debugging
- [ ] Fix `retirementOptimizer.ts` to correctly use the optimization goal in all strategy functions
- [ ] Implement consistent debugging logs in each optimization strategy to trace execution flow

### RSP/TFSA Rule Implementation
- [ ] Calculate and track RSP contribution room for the current year
- [ ] Implement proper RSP contribution logic following RSP_Rules (prioritize contributions to reduce tax when working)
- [ ] Implement proper TFSA contribution logic following TFSA_Rules (contribute after RSP if room allows)
- [ ] Implement Other_Investments logic (contribute after TFSA if more income than expenses)

### Expense Handling
- [ ] Modify expense calculation to ensure expenses are deducted at the beginning of the year
- [ ] Update withdrawal calculations to account for expense timing (expense deduction before investment returns)

### Optimization Enhancements
- [ ] Implement brute force optimization method for finding optimal withdrawal strategies
- [ ] Add configurable withdrawal priorities for each strategy
- [ ] Create multi-year projection for optimization strategies to consider long-term impact
- [ ] Implement option to prioritize account growth vs. tax efficiency

### UI/UX Improvements
- [ ] Add web-based spreadsheet functionality to allow manual modifications of calculated values
- [ ] Implement recalculation functionality from any age onward after manual modifications
- [ ] Add visualizations for different optimization strategies' outcomes for comparison
- [ ] Create detailed explanation panels for each optimization strategy

## Technical Debt
- [ ] Refactor withdrawal strategies to use a consistent interface
- [ ] Consolidate duplicate code across optimization implementations
- [ ] Add comprehensive unit tests for optimization algorithms
- [ ] Implement error boundaries to prevent calculation failures
- [ ] Add validation for user inputs to prevent invalid scenarios
- [ ] Improve type safety across the codebase
