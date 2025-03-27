/**
 * Calculate minimum required RRIF withdrawal based on age
 * @param age Account holder's age
 * @param balance RRIF balance at the beginning of the year
 * @returns Minimum required withdrawal amount
 */
export const calculateRRIFMinimumWithdrawal = (age: number, balance: number): number => {
  if (age < 71) {
    // RRSP hasn't been converted to RRIF yet, no minimum withdrawal
    return 0;
  }

  // RRIF minimum withdrawal factors based on age
  // These rates are from the Canada Revenue Agency for 2023
  const withdrawalFactors: {[key: number]: number} = {
    71: 0.0528,
    72: 0.0540,
    73: 0.0553,
    74: 0.0567,
    75: 0.0582,
    76: 0.0598,
    77: 0.0617,
    78: 0.0636,
    79: 0.0658,
    80: 0.0682,
    81: 0.0708,
    82: 0.0738,
    83: 0.0771,
    84: 0.0808,
    85: 0.0851,
    86: 0.0899,
    87: 0.0955,
    88: 0.1021,
    89: 0.1099,
    90: 0.1192,
    91: 0.1306,
    92: 0.1449,
    93: 0.1634,
    94: 0.1879,
    95: 0.2000,
    // For ages 95 and above, the factor is fixed at 0.2000 (20%)
  };

  // Get the appropriate withdrawal factor
  const factor = age >= 95 ? 0.2000 : withdrawalFactors[age] || 0.0528;
  
  // Calculate minimum withdrawal
  return balance * factor;
};

/**
 * Check if RRSP should be converted to RRIF
 * @param age Account holder's age
 * @returns True if RRSP should be converted to RRIF this year
 */
export const shouldConvertRRSPtoRRIF = (age: number): boolean => {
  // RRSP must be converted to RRIF by the end of the year the account holder turns 71
  return age === 71;
};

/**
 * Get total withdrawals from RSP/RRIF based on need and minimum requirement
 * @param age Account holder's age
 * @param rspBalance RSP/RRIF balance at the beginning of the year
 * @param neededWithdrawal Withdrawal needed for expenses
 * @returns Actual withdrawal amount (never less than minimum required)
 */
export const getRSPWithdrawal = (age: number, rspBalance: number, neededWithdrawal: number): number => {
  // Calculate minimum required withdrawal
  const minimumWithdrawal = calculateRRIFMinimumWithdrawal(age, rspBalance);
  
  // Return the greater of needed withdrawal and minimum required withdrawal
  return Math.max(neededWithdrawal, minimumWithdrawal);
};
