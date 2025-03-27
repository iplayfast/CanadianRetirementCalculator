import React from 'react';
import { Box, Typography, Paper, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RetirementPlan } from '../../../models/types';
import InfoIcon from '@mui/icons-material/Info';

interface NarrativeBreakdownProps {
  retirementPlan: RetirementPlan;
  userInput?: any; // Add userInput for name access
}

// Helper function to format numbers as whole dollars with commas
const formatDollar = (value: number): string => {
  return Math.round(value).toLocaleString();
};

// Determine if a value is significant enough to mention (over $100)
const isSignificant = (value: number): boolean => {
  return Math.abs(value) >= 100;
};

const NarrativeBreakdown: React.FC<NarrativeBreakdownProps> = ({ retirementPlan, userInput }) => {
  // Get the names from userInput if available
  const primaryName = userInput?.name || "You";
  const spouseName = (userInput?.hasSpouse && userInput?.spouseInfo?.name) ? userInput.spouseInfo.name : "Your spouse";
  
  const hasSpouse = retirementPlan.years[0].spouseAge !== undefined;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Year-by-Year Narrative</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A detailed explanation of what happens financially each year of your retirement plan.
      </Typography>

      {retirementPlan.years.map((year, index) => {
        // Calculate total withdrawals for this year
        const primaryWithdrawals = year.rspWithdrawal + year.tfsaWithdrawal + year.otherInvestmentsWithdrawal;
        const spouseWithdrawals = (year.spouseRspWithdrawal || 0) + (year.spouseTfsaWithdrawal || 0) + (year.spouseOtherInvestmentsWithdrawal || 0);
        
        // Calculate total contributions for this year
        const primaryContributions = year.rspContribution + year.tfsaContribution + year.otherInvestmentsContribution;
        const spouseContributions = (year.spouseRspContribution || 0) + (year.spouseTfsaContribution || 0) + (year.spouseOtherInvestmentsContribution || 0);
        
        // Calculate leftover money after expenses
        const totalIncome = year.employmentIncome + year.cppIncome + year.oasIncome + year.extraIncome + 
                            (year.spouseEmploymentIncome || 0) + (year.spouseCppIncome || 0) + 
                            (year.spouseOasIncome || 0) + (year.spouseExtraIncome || 0) + 
                            primaryWithdrawals + spouseWithdrawals;
        
        const leftoverBeforeTax = totalIncome - year.expenses;
        const leftoverAfterTax = leftoverBeforeTax - year.totalTax;
        
        return (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                <strong>{year.year}</strong> - Age {year.age} - {year.isRetired ? 'Retired' : 'Working'} 
                {hasSpouse && ` (${spouseName}: Age ${year.spouseAge} - ${year.spouseIsRetired ? 'Retired' : 'Working'})`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {/* Income Section */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Income</Typography>
                <Typography variant="body2">
                  {year.isRetired ? 
                    `${primaryName} is retired` : 
                    `${primaryName} earned $${formatDollar(year.employmentIncome)} from employment`}.
                  
                  {isSignificant(year.cppIncome) && ` ${primaryName} received $${formatDollar(year.cppIncome)} in CPP benefits.`}
                  {isSignificant(year.oasIncome) && ` ${primaryName} received $${formatDollar(year.oasIncome)} in OAS benefits.`}
                  {isSignificant(year.extraIncome) && ` ${primaryName} received $${formatDollar(year.extraIncome)} from other income sources.`}
                </Typography>
                
                {hasSpouse && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {year.spouseIsRetired ? 
                      `${spouseName} is retired` : 
                      `${spouseName} earned $${formatDollar(year.spouseEmploymentIncome || 0)} from employment`}.
                    
                    {isSignificant(year.spouseCppIncome || 0) && ` ${spouseName} received $${formatDollar(year.spouseCppIncome || 0)} in CPP benefits.`}
                    {isSignificant(year.spouseOasIncome || 0) && ` ${spouseName} received $${formatDollar(year.spouseOasIncome || 0)} in OAS benefits.`}
                    {isSignificant(year.spouseExtraIncome || 0) && ` ${spouseName} received $${formatDollar(year.spouseExtraIncome || 0)} from other income sources.`}
                  </Typography>
                )}
                
                {/* Withdrawals Section (if any) */}
                {(isSignificant(primaryWithdrawals) || isSignificant(spouseWithdrawals)) && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Withdrawals</Typography>
                    
                    {isSignificant(primaryWithdrawals) && (
                      <Typography variant="body2">
                        {primaryName} withdrew 
                        {isSignificant(year.rspWithdrawal) && ` $${formatDollar(year.rspWithdrawal)} from RSP/RRIF`}
                        {isSignificant(year.tfsaWithdrawal) && `${isSignificant(year.rspWithdrawal) ? ',' : ''} $${formatDollar(year.tfsaWithdrawal)} from TFSA`}
                        {isSignificant(year.otherInvestmentsWithdrawal) && `${(isSignificant(year.rspWithdrawal) || isSignificant(year.tfsaWithdrawal)) ? ',' : ''} $${formatDollar(year.otherInvestmentsWithdrawal)} from other investments`}.
                      </Typography>
                    )}
                    
                    {hasSpouse && isSignificant(spouseWithdrawals) && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {spouseName} withdrew 
                        {isSignificant(year.spouseRspWithdrawal || 0) && ` $${formatDollar(year.spouseRspWithdrawal || 0)} from RSP/RRIF`}
                        {isSignificant(year.spouseTfsaWithdrawal || 0) && `${isSignificant(year.spouseRspWithdrawal || 0) ? ',' : ''} $${formatDollar(year.spouseTfsaWithdrawal || 0)} from TFSA`}
                        {isSignificant(year.spouseOtherInvestmentsWithdrawal || 0) && `${(isSignificant(year.spouseRspWithdrawal || 0) || isSignificant(year.spouseTfsaWithdrawal || 0)) ? ',' : ''} $${formatDollar(year.spouseOtherInvestmentsWithdrawal || 0)} from other investments`}.
                      </Typography>
                    )}
                  </>
                )}
                
                {/* Expenses & Taxes Section */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Expenses & Taxes</Typography>
                <Typography variant="body2">
                  Household expenses were ${formatDollar(year.expenses)} for the year.
                  {' '}Total taxes paid were ${formatDollar(year.totalTax)}.
                </Typography>
                
                {/* Contributions Section (if any) */}
                {(isSignificant(primaryContributions) || isSignificant(spouseContributions)) && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Contributions</Typography>
                    
                    {isSignificant(primaryContributions) && (
                      <Typography variant="body2">
                        {primaryName} contributed 
                        {isSignificant(year.rspContribution) && ` $${formatDollar(year.rspContribution)} to RSP`}
                        {isSignificant(year.tfsaContribution) && `${isSignificant(year.rspContribution) ? ',' : ''} $${formatDollar(year.tfsaContribution)} to TFSA`}
                        {isSignificant(year.otherInvestmentsContribution) && `${(isSignificant(year.rspContribution) || isSignificant(year.tfsaContribution)) ? ',' : ''} $${formatDollar(year.otherInvestmentsContribution)} to other investments`}.
                      </Typography>
                    )}
                    
                    {hasSpouse && isSignificant(spouseContributions) && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {spouseName} contributed 
                        {isSignificant(year.spouseRspContribution || 0) && ` $${formatDollar(year.spouseRspContribution || 0)} to RSP`}
                        {isSignificant(year.spouseTfsaContribution || 0) && `${isSignificant(year.spouseRspContribution || 0) ? ',' : ''} $${formatDollar(year.spouseTfsaContribution || 0)} to TFSA`}
                        {isSignificant(year.spouseOtherInvestmentsContribution || 0) && `${(isSignificant(year.spouseRspContribution || 0) || isSignificant(year.spouseTfsaContribution || 0)) ? ',' : ''} $${formatDollar(year.spouseOtherInvestmentsContribution || 0)} to other investments`}.
                      </Typography>
                    )}
                  </>
                )}
                
                {/* Leftover Money & Fun Money */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Summary</Typography>
                <Typography variant="body2">
                  After expenses and taxes, the household had ${formatDollar(leftoverAfterTax)} remaining
                  {isSignificant(primaryContributions + spouseContributions) ? 
                    `, which was contributed to accounts as detailed above.` : 
                    `.`}
                  
                  {isSignificant(year.funMoney || 0) && (
                    ` This includes $${formatDollar(year.funMoney || 0)} in discretionary "fun money" that can be spent on non-essential items.`
                  )}
                </Typography>
                
                {/* Year-End Account Balances */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Year-End Account Balances</Typography>
                <Typography variant="body2">
                  {primaryName}'s accounts: RSP/RRIF ${formatDollar(year.rspBalance)}, 
                  TFSA ${formatDollar(year.tfsaBalance)}, 
                  Other investments ${formatDollar(year.otherInvestmentsBalance)}
                </Typography>
                
                {hasSpouse && (
                  <Typography variant="body2">
                    {spouseName}'s accounts: RSP/RRIF ${formatDollar(year.spouseRspBalance || 0)}, 
                    TFSA ${formatDollar(year.spouseTfsaBalance || 0)}, 
                    Other investments ${formatDollar(year.spouseOtherInvestmentsBalance || 0)}
                  </Typography>
                )}
                
                <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                  Total net worth: ${formatDollar(year.totalNetWorth)}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default NarrativeBreakdown;
