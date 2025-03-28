// src/components/charts/YearlyBreakdown.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { RetirementPlan } from '../../models/types';

interface YearlyBreakdownProps {
  retirementPlan: RetirementPlan;
  userInput?: any; // Add userInput for name access
}

// Helper function to format numbers as whole dollars
const formatDollar = (value: number): string => {
  return Math.round(value).toLocaleString();
};

// Helper to determine if a value should be displayed (non-zero)
const shouldDisplay = (value: number): boolean => {
  return Math.abs(value) >= 1;
};

// Helper to check if an income stream is active in the current year
const isIncomeStreamActive = (stream: any, currentYear: number): boolean => {
  const streamStartYear = stream.startYear || new Date().getFullYear();
  const streamEndYear = stream.endYear || Infinity;
  return currentYear >= streamStartYear && currentYear <= streamEndYear;
};

const YearlyBreakdown: React.FC<YearlyBreakdownProps> = ({ retirementPlan, userInput }) => {
  const hasSpouse = retirementPlan.years[0].spouseAge !== undefined;
  const hasFunMoney = retirementPlan.years.some(year => year.funMoney && year.funMoney > 0);
  
  // Get the names from userInput if available
  const primaryName = userInput?.name || "You";
  const spouseName = (hasSpouse && userInput?.spouseInfo?.name) ? userInput.spouseInfo.name : "Spouse";

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {/* Main column groups */}
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            {/* Primary person section */}
            <th colSpan={3} style={{ 
              padding: '8px', 
              textAlign: 'center', 
              backgroundColor: '#e3f2fd', 
              borderRight: '2px solid #90caf9' 
            }}>
              {primaryName}
            </th>
            
            {/* Spouse section */}
            {hasSpouse ? (
              <th colSpan={3} style={{ 
                padding: '8px', 
                textAlign: 'center', 
                backgroundColor: '#e8f5e9', 
                borderRight: '2px solid #a5d6a7' 
              }}>
                {spouseName}
              </th>
            ) : null}
            
            {/* Common section */}
            <th colSpan={3} style={{ 
              padding: '8px', 
              textAlign: 'center', 
              backgroundColor: '#fff3e0',
              width: '30%'
            }}>
              Common
            </th>
          </tr>
          
          {/* Column detail headers */}
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            {/* Primary person columns */}
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e3f2fd' }}>Income</th>
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e3f2fd' }}>Tax</th>
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e3f2fd', borderRight: '2px solid #90caf9' }}>
              Accounts (RSP/TFSA/Other)
            </th>
            
            {/* Spouse columns */}
            {hasSpouse ? (
              <>
                <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e8f5e9' }}>Income</th>
                <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e8f5e9' }}>Tax</th>
                <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e8f5e9', borderRight: '2px solid #a5d6a7' }}>
                  Accounts (RSP/TFSA/Other)
                </th>
              </>
            ) : null}
            
            {/* Common columns */}
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#fff3e0' }}>Year</th>
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#fff3e0' }}>Expenses</th>
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#fff3e0' }}>Net Worth</th>
          </tr>
        </thead>
        <tbody>
          {retirementPlan.years.map((year, index) => (
            <tr key={index} style={{ 
              borderBottom: '1px solid #ddd',
              backgroundColor: year.isRetired ? '#f5f5f5' : 'transparent'
            }}>
              {/* Income breakdown for primary person */}
              <td style={{ padding: '8px', verticalAlign: 'top' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {shouldDisplay(year.employmentIncome) && (
                      <tr>
                        <td>Employment</td>
                        <td style={{ textAlign: 'right' }}>${formatDollar(year.employmentIncome)}</td>
                      </tr>
                    )}
                    {shouldDisplay(year.cppIncome) && (
                      <tr>
                        <td>CPP</td>
                        <td style={{ textAlign: 'right' }}>${formatDollar(year.cppIncome)}</td>
                      </tr>
                    )}
                    {shouldDisplay(year.oasIncome) && (
                      <tr>
                        <td>OAS</td>
                        <td style={{ textAlign: 'right' }}>${formatDollar(year.oasIncome)}</td>
                      </tr>
                    )}
                    {year.extraIncomeStreams && year.extraIncomeStreams.length > 0 ? (
                      year.extraIncomeStreams
                      .filter(stream => isIncomeStreamActive(stream, year.year))
                      .map((stream, idx) => (
                        <tr key={`stream-${idx}`}>
                          <td>{stream.description || 'Extra Income'}</td>
                          <td style={{ textAlign: 'right' }}>${formatDollar(stream.yearlyAmount || 0)}</td>
                        </tr>
                      ))
                    ) : shouldDisplay(year.extraIncome) && (
                      <tr>
                        <td>Extra Income</td>
                        <td style={{ textAlign: 'right' }}>${formatDollar(year.extraIncome)}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>
                      <td>Total</td>
                      <td style={{ textAlign: 'right' }}>
                        ${formatDollar(year.employmentIncome + year.cppIncome + year.oasIncome + year.extraIncome)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', fontSize: '0.85em', color: '#666', paddingTop: '4px' }}>
                        Age {year.age} {year.isRetired ? '(Retired)' : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              
              {/* Tax */}
              <td style={{ padding: '8px', textAlign: 'right' }}>
                <div>Income: ${formatDollar(year.incomeTax)}</div>
                <div>Capital Gains: ${formatDollar(year.capitalGainsTax)}</div>
                <div style={{ fontWeight: 'bold', borderTop: '1px solid #ddd' }}>
                  Total: ${formatDollar(year.incomeTax + year.capitalGainsTax)}
                </div>
              </td>
              
              {/* Account balances for primary person */}
              <td style={{ padding: '8px', borderRight: '2px solid #90caf9', verticalAlign: 'top' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td>
                        RSP/RRIF
                        {shouldDisplay(year.rspContribution) && (
                          <span style={{ color: 'green', display: 'block', fontSize: '0.85em' }}>
                            +${formatDollar(year.rspContribution)}
                          </span>
                        )}
                        {shouldDisplay(year.rspWithdrawal) && (
                          <span style={{ color: 'red', display: 'block', fontSize: '0.85em' }}>
                            -${formatDollar(year.rspWithdrawal)}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>${formatDollar(year.rspBalance)}</td>
                    </tr>
                    <tr>
                      <td>
                        TFSA
                        {shouldDisplay(year.tfsaContribution) && (
                          <span style={{ color: 'green', display: 'block', fontSize: '0.85em' }}>
                            +${formatDollar(year.tfsaContribution)}
                          </span>
                        )}
                        {shouldDisplay(year.tfsaWithdrawal) && (
                          <span style={{ color: 'red', display: 'block', fontSize: '0.85em' }}>
                            -${formatDollar(year.tfsaWithdrawal)}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>${formatDollar(year.tfsaBalance)}</td>
                    </tr>
                    <tr>
                      <td>
                        Other
                        {shouldDisplay(year.otherInvestmentsContribution) && (
                          <span style={{ color: 'green', display: 'block', fontSize: '0.85em' }}>
                            +${formatDollar(year.otherInvestmentsContribution)}
                          </span>
                        )}
                        {shouldDisplay(year.otherInvestmentsWithdrawal) && (
                          <span style={{ color: 'red', display: 'block', fontSize: '0.85em' }}>
                            -${formatDollar(year.otherInvestmentsWithdrawal)}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>${formatDollar(year.otherInvestmentsBalance)}</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>
                      <td>Total</td>
                      <td style={{ textAlign: 'right' }}>
                        ${formatDollar(year.rspBalance + year.tfsaBalance + year.otherInvestmentsBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              
              {/* Spouse data */}
              {hasSpouse ? (
                <>
                  {/* Income breakdown for spouse */}
                  <td style={{ padding: '8px', verticalAlign: 'top' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {shouldDisplay(year.spouseEmploymentIncome || 0) && (
                          <tr>
                            <td>Employment</td>
                            <td style={{ textAlign: 'right' }}>${formatDollar(year.spouseEmploymentIncome || 0)}</td>
                          </tr>
                        )}
                        {shouldDisplay(year.spouseCppIncome || 0) && (
                          <tr>
                            <td>CPP</td>
                            <td style={{ textAlign: 'right' }}>${formatDollar(year.spouseCppIncome || 0)}</td>
                          </tr>
                        )}
                        {shouldDisplay(year.spouseOasIncome || 0) && (
                          <tr>
                            <td>OAS</td>
                            <td style={{ textAlign: 'right' }}>${formatDollar(year.spouseOasIncome || 0)}</td>
                          </tr>
                        )}
                        {year.spouseInfo && year.spouseInfo.extraIncomeStreams && year.spouseInfo.extraIncomeStreams.length > 0 ? (
                          year.spouseInfo.extraIncomeStreams
                          .filter(stream => isIncomeStreamActive(stream, year.year))
                          .map((stream, idx) => (
                            <tr key={`spouse-stream-${idx}`}>
                              <td>{stream.description || 'Extra Income'}</td>
                              <td style={{ textAlign: 'right' }}>${formatDollar(stream.yearlyAmount || 0)}</td>
                            </tr>
                          ))
                        ) : shouldDisplay(year.spouseExtraIncome || 0) && (
                          <tr>
                            <td>Extra Income</td>
                            <td style={{ textAlign: 'right' }}>${formatDollar(year.spouseExtraIncome || 0)}</td>
                          </tr>
                        )}
                        <tr style={{ borderTop: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>
                          <td>Total</td>
                          <td style={{ textAlign: 'right' }}>
                            ${formatDollar(
                              (year.spouseEmploymentIncome || 0) + 
                              (year.spouseCppIncome || 0) + 
                              (year.spouseOasIncome || 0) + 
                              (year.spouseExtraIncome || 0)
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ textAlign: 'center', fontSize: '0.85em', color: '#666', paddingTop: '4px' }}>
                            Age {year.spouseAge} {year.spouseIsRetired ? '(Retired)' : ''}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  
                  {/* Spouse tax - Updated to include spouse's capital gains tax */}
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    <div>Income: ${formatDollar(year.spouseIncomeTax || 0)}</div>
                    {/* Added capital gains tax for spouse */}
                    <div>Capital Gains: ${formatDollar(year.spouseCapitalGainsTax || 0)}</div>
                    <div style={{ fontWeight: 'bold', borderTop: '1px solid #ddd' }}>
                      Total: ${formatDollar((year.spouseIncomeTax || 0) + (year.spouseCapitalGainsTax || 0))}
                    </div>
                  </td>
                  
                  {/* Account balances for spouse */}
                  <td style={{ padding: '8px', borderRight: '2px solid #a5d6a7', verticalAlign: 'top' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td>
                            RSP/RRIF
                            {shouldDisplay(year.spouseRspContribution || 0) && (
                              <span style={{ color: 'green', display: 'block', fontSize: '0.85em' }}>
                                +${formatDollar(year.spouseRspContribution || 0)}
                              </span>
                            )}
                            {shouldDisplay(year.spouseRspWithdrawal || 0) && (
                              <span style={{ color: 'red', display: 'block', fontSize: '0.85em' }}>
                                -${formatDollar(year.spouseRspWithdrawal || 0)}
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>${formatDollar(year.spouseRspBalance || 0)}</td>
                        </tr>
                        <tr>
                          <td>
                            TFSA
                            {shouldDisplay(year.spouseTfsaContribution || 0) && (
                              <span style={{ color: 'green', display: 'block', fontSize: '0.85em' }}>
                                +${formatDollar(year.spouseTfsaContribution || 0)}
                              </span>
                            )}
                            {shouldDisplay(year.spouseTfsaWithdrawal || 0) && (
                              <span style={{ color: 'red', display: 'block', fontSize: '0.85em' }}>
                                -${formatDollar(year.spouseTfsaWithdrawal || 0)}
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>${formatDollar(year.spouseTfsaBalance || 0)}</td>
                        </tr>
                        <tr>
                          <td>
                            Other
                            {shouldDisplay(year.spouseOtherInvestmentsContribution || 0) && (
                              <span style={{ color: 'green', display: 'block', fontSize: '0.85em' }}>
                                +${formatDollar(year.spouseOtherInvestmentsContribution || 0)}
                              </span>
                            )}
                            {shouldDisplay(year.spouseOtherInvestmentsWithdrawal || 0) && (
                              <span style={{ color: 'red', display: 'block', fontSize: '0.85em' }}>
                                -${formatDollar(year.spouseOtherInvestmentsWithdrawal || 0)}
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>${formatDollar(year.spouseOtherInvestmentsBalance || 0)}</td>
                        </tr>
                        <tr style={{ borderTop: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>
                          <td>Total</td>
                          <td style={{ textAlign: 'right' }}>
                            ${formatDollar(
                              (year.spouseRspBalance || 0) + 
                              (year.spouseTfsaBalance || 0) + 
                              (year.spouseOtherInvestmentsBalance || 0)
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </>
              ) : null}
              
              {/* Common data */}
              <td style={{ padding: '8px', textAlign: 'center' }}>{year.year}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>${formatDollar(year.expenses)}</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>${formatDollar(year.totalNetWorth)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Fun Money Box */}
      {hasFunMoney && retirementPlan.summary.annualFunMoney && retirementPlan.summary.annualFunMoney > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'green' }}>
            Additional Spending Capacity
          </Typography>
          <Typography>
            Annual discretionary spending: ${formatDollar(retirementPlan.summary.annualFunMoney)}
          </Typography>
          {retirementPlan.summary.totalLifetimeFunMoney && retirementPlan.summary.totalLifetimeFunMoney > 0 && (
            <Typography>
              Total lifetime discretionary spending: ${formatDollar(retirementPlan.summary.totalLifetimeFunMoney)}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            This is additional money you can spend during retirement while still maintaining your basic retirement expenses.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default YearlyBreakdown;