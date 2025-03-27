import { calculateIncomeTax, calculateCapitalGainsTax, calculateOASClawback, calculateMaxRRSPContribution } from './mocks/retirementCalculator';
import { TAX_CONSTANTS } from './mocks/taxConstants';

describe('Tax Calculation Functions', () => {
  describe('calculateIncomeTax', () => {
    test('should calculate federal tax correctly for income in first bracket', () => {
      const income = 50000;
      const tax = calculateIncomeTax(income, TAX_CONSTANTS.FEDERAL_TAX_BRACKETS);
      // 50000 * 0.15 = 7500
      expect(tax).toBeCloseTo(7500, 0);
    });

    test('should calculate federal tax correctly for income spanning multiple brackets', () => {
      const income = 100000;
      const tax = calculateIncomeTax(income, TAX_CONSTANTS.FEDERAL_TAX_BRACKETS);
      // First bracket: 57375 * 0.15 = 8606.25
      // Second bracket: (100000 - 57375) * 0.205 = 8738.13
      // Total: 8606.25 + 8738.13 = 17344.38
      expect(tax).toBeCloseTo(17344.38, 0);
    });
  });

  describe('calculateCapitalGainsTax', () => {
    test('should calculate capital gains tax correctly', () => {
      const capitalGains = 20000;
      const otherIncome = 80000;
      const tax = calculateCapitalGainsTax(capitalGains, otherIncome);
      // Taxable capital gains: 20000 * 0.5 = 10000
      // Tax on income + capital gains - tax on income only
      expect(tax).toBeGreaterThan(0);
    });

    test('should return 0 for 0 capital gains', () => {
      const capitalGains = 0;
      const otherIncome = 80000;
      const tax = calculateCapitalGainsTax(capitalGains, otherIncome);
      expect(tax).toBe(0);
    });
  });

  describe('calculateOASClawback', () => {
    test('should return 0 for income below threshold', () => {
      const income = 100000;
      const clawback = calculateOASClawback(income);
      expect(clawback).toBe(0);
    });

    test('should calculate clawback for income above threshold', () => {
      const income = 150000;
      const clawback = calculateOASClawback(income);
      // (150000 - 142609) * 0.15 = 1108.65
      expect(clawback).toBeCloseTo(1108.65, 0);
    });
  });

  describe('calculateMaxRRSPContribution', () => {
    test('should calculate RRSP contribution limit correctly for income below max', () => {
      const income = 100000;
      const contribution = calculateMaxRRSPContribution(income);
      // 100000 * 0.18 = 18000
      expect(contribution).toBe(18000);
    });

    test('should cap RRSP contribution at maximum limit', () => {
      const income = 200000;
      const contribution = calculateMaxRRSPContribution(income);
      // 200000 * 0.18 = 36000, but max is 32490
      expect(contribution).toBe(32490);
    });
  });
});
