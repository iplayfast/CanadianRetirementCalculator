// src/components/charts/YearlyBreakdown.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { RetirementPlan } from '../../../models/types';

interface YearlyBreakdownProps {
  retirementPlan: RetirementPlan;
  userInput?: any; // Add userInput for name access
}

// Helper function to format numbers as whole dollars
const formatDollar = (value: number): string => {
  return Math.round(value).toLocaleString();
};

const YearlyBreakdown: React.FC<YearlyBreakdownProps> = ({ retirementPlan, userInput }) => {
  const hasSpouse = retirementPlan.years[0].spouseAge !== undefined;
  const hasFunMoney = retirementPlan.years.some(year => year.funMoney && year.funMoney > 0);
  
  // Get the names from userInput if available
  const primaryName = userInput?.name || "You";
  const spouseName = (hasSpouse && userInput?.spouseInfo?.name) ? userInput.spouseInfo.name : "Spouse";
  
  // Create the fun money box separately to avoid any issues
  const funMoneyBox = (hasFunMoney && 
                      retirementPlan.summary.annualFunMoney && 
                      retirementPlan.summary.annualFunMoney > 0) ? (
    <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>          
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'green' }}>
        Additional Spending Capacity
      </Typography>
      <Typography>
        Annual discretionary spending: ${formatDollar(retirementPlan.summary.annualFunMoney)}
      </Typography>
      {retirementPlan.summary.totalLifetimeFunMoney && retirementPlan.summary.totalLifetimeFunMoney > 0 ? (
        <Typography>
          Total lifetime discretionary spending: ${formatDollar(retirementPlan.summary.totalLifetimeFunMoney)}
        </Typography>
      ) : null}
      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
        This is additional money you can spend during retirement while still maintaining your basic retirement expenses.
      </Typography>
    </Box>
  ) : null;
  
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {/* Main column groups */}
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            {/* Primary person section */}
            <th colSpan={5} style={{ 
              padding: '8px', 
              textAlign: 'center', 
              backgroundColor: '#e3f2fd', 
              borderRight: '2px solid #90caf9' 
            }}>
              {primaryName}
            </th>
            
            {/* Spouse section */}
            {hasSpouse ? (
              <th colSpan={5} style={{ 
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
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e3f2fd' }}>Age</th>
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e3f2fd' }}>Status</th>
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e3f2fd' }}>Income</th>
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e3f2fd' }}>Tax</th>
            <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e3f2fd', borderRight: '2px solid #90caf9' }}>
              Accounts (RSP/TFSA/Other)
            </th>
            
            {/* Spouse columns */}
            {hasSpouse ? (
              <>
                <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e8f5e9' }}>Age</th>
                <th style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e8f5e9' }}>Status</th>
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
          {retirementPlan.years.map((year) => (
            <tr key={year.age} style={{ 
              borderBottom: '1px solid #ddd',
              backgroundColor: year.isRetired ? '#f5f5f5' : 'transparent'
            }}>
              {/* Primary person data */}
              <td style={{ padding: '8px', textAlign: 'center' }}>{year.age}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{year.isRetired ? 'Retired' : 'Working'}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                ${formatDollar(year.employmentIncome + year.cppIncome + year.oasIncome + year.extraIncome)}
              </td>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                ${formatDollar(year.incomeTax + year.capitalGainsTax)}
              </td>
              <td style={{ padding: '8px', textAlign: 'right', borderRight: '2px solid #90caf9' }}>
                ${formatDollar(year.rspBalance)} / 
                ${formatDollar(year.tfsaBalance)} / 
                ${formatDollar(year.otherInvestmentsBalance)}
                {(year.rspWithdrawal > 0 || year.tfsaWithdrawal > 0 || year.otherInvestmentsWithdrawal > 0) ? (
                  <span style={{ color: 'red', fontSize: '0.8em', display: 'block' }}>
                    -${formatDollar(year.rspWithdrawal)}/-${formatDollar(year.tfsaWithdrawal)}/-${formatDollar(year.otherInvestmentsWithdrawal)}
                  </span>
                ) : null}
                {(year.rspContribution > 0 || year.tfsaContribution > 0 || year.otherInvestmentsContribution > 0) ? (
                  <span style={{ color: 'green', fontSize: '0.8em', display: 'block' }}>
                    +${formatDollar(year.rspContribution)}/+${formatDollar(year.tfsaContribution)}/+${formatDollar(year.otherInvestmentsContribution)}
                  </span>
                ) : null}
              </td>
              
              {/* Spouse data */}
              {hasSpouse ? (
                <>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{year.spouseAge}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{year.spouseIsRetired ? 'Retired' : 'Working'}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ${formatDollar((year.spouseEmploymentIncome || 0) + (year.spouseCppIncome || 0) + 
                      (year.spouseOasIncome || 0) + (year.spouseExtraIncome || 0))}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ${formatDollar(year.spouseIncomeTax || 0)}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', borderRight: '2px solid #a5d6a7' }}>
                    ${formatDollar(year.spouseRspBalance || 0)} / 
                    ${formatDollar(year.spouseTfsaBalance || 0)} / 
                    ${formatDollar(year.spouseOtherInvestmentsBalance || 0)}
                    {((year.spouseRspWithdrawal || 0) > 0 || (year.spouseTfsaWithdrawal || 0) > 0 || 
                      (year.spouseOtherInvestmentsWithdrawal || 0) > 0) ? (
                      <span style={{ color: 'red', fontSize: '0.8em', display: 'block' }}>
                        -${formatDollar(year.spouseRspWithdrawal || 0)}/-${formatDollar(year.spouseTfsaWithdrawal || 0)}/
                        -${formatDollar(year.spouseOtherInvestmentsWithdrawal || 0)}
                      </span>
                    ) : null}
                    {((year.spouseRspContribution || 0) > 0 || (year.spouseTfsaContribution || 0) > 0 || 
                      (year.spouseOtherInvestmentsContribution || 0) > 0) ? (
                      <span style={{ color: 'green', fontSize: '0.8em', display: 'block' }}>
                        +${formatDollar(year.spouseRspContribution || 0)}/+${formatDollar(year.spouseTfsaContribution || 0)}/
                        +${formatDollar(year.spouseOtherInvestmentsContribution || 0)}
                      </span>
                    ) : null}
                  </td>
                </>
              ) : null}
              
              {/* Common data */}
              <td style={{ padding: '8px', textAlign: 'center' }}>{year.year}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>${formatDollar(year.expenses)}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>${formatDollar(year.totalNetWorth)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Show fun money box using the pre-created component */}
      {funMoneyBox}
    </Box>
  );
};

export default YearlyBreakdown;