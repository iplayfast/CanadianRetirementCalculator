// src/components/forms/InputForm/ReviewStep.tsx
import React from 'react';
import { 
  Grid, 
  Typography, 
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { UserInput, ExtraIncomeStream } from '../../../models/types';

interface ReviewStepProps {
  userInput: UserInput;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ userInput }) => {
  const spouseName = userInput.spouseInfo?.name || 'Your spouse';

  // Helper function to format year
  const formatYear = (year?: number): string => {
    return year ? year.toString() : 'Indefinite';
  };

  // Helper function to safely format numbers
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6">Review Your Information</Typography>
      </Grid>
      
      {/* Primary Person Information */}
      <Grid item xs={12} md={userInput.hasSpouse ? 6 : 12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Your Personal Information</Typography>
          {userInput.name && <Typography>Name: {userInput.name}</Typography>}
          <Typography>Current Age: {userInput.age} years</Typography>
          <Typography>Retirement Age: {userInput.retirementAge} years</Typography>
          <Typography>Life Expectancy Age: {userInput.lifeExpectancy}</Typography>
          {userInput.province && <Typography>Province: {userInput.province}</Typography>}
        </Paper>
      </Grid>
      
      {/* Spouse Personal Information */}
      {userInput.hasSpouse && userInput.spouseInfo && (
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">{spouseName}'s Personal Information</Typography>
            {userInput.spouseInfo.name && <Typography>Name: {userInput.spouseInfo.name}</Typography>}
            <Typography>Current Age: {userInput.spouseInfo.age} years</Typography>
            <Typography>Retirement Age: {userInput.spouseInfo.retirementAge} years</Typography>
            <Typography>Life Expectancy Age: {userInput.spouseInfo.lifeExpectancy}</Typography>
          </Paper>
        </Grid>
      )}
      
      {/* Primary Person Savings and Income */}
      <Grid item xs={12} md={userInput.hasSpouse ? 6 : 12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Your Financial Information</Typography>
          <Typography variant="subtitle2">Current Savings</Typography>
          <Typography>RSP Balance: ${formatNumber(userInput.currentRSP)}</Typography>
          <Typography>TFSA Balance: ${formatNumber(userInput.currentTFSA)}</Typography>
          <Typography>Other Investments: ${formatNumber(userInput.currentOtherInvestments)}</Typography>
          <Typography>RSP Room: ${formatNumber(userInput.rrspRoom)}</Typography>
          <Typography>TFSA Room: ${formatNumber(userInput.tfsaRoom)}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2">Income</Typography>
          <Typography>Employment Income: ${formatNumber(userInput.employmentIncome)}/year</Typography>
        </Paper>
      </Grid>
      
      {/* Spouse Financial Information (if available) */}
      {userInput.hasSpouse && userInput.spouseInfo && (
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">{spouseName}'s Financial Information</Typography>
            <Typography variant="subtitle2">Current Savings</Typography>
            <Typography>RSP Balance: ${formatNumber(userInput.spouseInfo.currentRSP)}</Typography>
            <Typography>TFSA Balance: ${formatNumber(userInput.spouseInfo.currentTFSA)}</Typography>
            <Typography>Other Investments: ${formatNumber(userInput.spouseInfo.currentOtherInvestments)}</Typography>
            <Typography>RSP Room: ${formatNumber(userInput.spouseInfo.rrspRoom)}</Typography>
            <Typography>TFSA Room: ${formatNumber(userInput.spouseInfo.tfsaRoom)}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Income</Typography>
            <Typography>Employment Income: ${formatNumber(userInput.spouseInfo.employmentIncome)}/year</Typography>
          </Paper>
        </Grid>
      )}
      
      {/* Expenses */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Household Expenses</Typography>
          <Typography>Current Annual Expenses: ${formatNumber(userInput.currentAnnualExpenses)}/year</Typography>
          <Typography>Retirement Annual Expenses: ${formatNumber(userInput.retirementAnnualExpenses)}/year</Typography>
        </Paper>
      </Grid>
      
      {/* Government Benefits - Primary Person */}
      <Grid item xs={12} md={userInput.hasSpouse ? 6 : 12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Your Government Benefits</Typography>
          
          {/* Display differently based on collection status */}
          {userInput.isCollectingCPP ? (
            <Typography>Currently Collecting CPP: ${formatNumber(userInput.currentCPP)}/month</Typography>
          ) : (
            <>
              <Typography variant="subtitle2">CPP Benefits</Typography>
              <Typography>At Age 60: ${formatNumber(userInput.expectedCPP?.at60)}/month</Typography>
              <Typography>At Age 65: ${formatNumber(userInput.expectedCPP?.at65)}/month</Typography>
              <Typography>At Age 70: ${formatNumber(userInput.expectedCPP?.at70)}/month</Typography>
            </>
          )}
          
          {userInput.isCollectingOAS ? (
            <Typography>Currently Collecting OAS: ${formatNumber(userInput.currentOAS)}/month</Typography>
          ) : (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>OAS Benefits</Typography>
              <Typography>At Age 65: ${formatNumber(userInput.expectedOAS?.at65)}/month</Typography>
              <Typography>At Age 70: ${formatNumber(userInput.expectedOAS?.at70)}/month</Typography>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Government Benefits - Spouse */}
      {userInput.hasSpouse && userInput.spouseInfo && (
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">{spouseName}'s Government Benefits</Typography>
            
            {/* Display differently based on collection status */}
            {userInput.spouseInfo.isCollectingCPP ? (
              <Typography>Currently Collecting CPP: ${formatNumber(userInput.spouseInfo.currentCPP)}/month</Typography>
            ) : (
              <>
                <Typography variant="subtitle2">CPP Benefits</Typography>
                <Typography>At Age 60: ${formatNumber(userInput.spouseInfo.expectedCPP?.at60)}/month</Typography>
                <Typography>At Age 65: ${formatNumber(userInput.spouseInfo.expectedCPP?.at65)}/month</Typography>
                <Typography>At Age 70: ${formatNumber(userInput.spouseInfo.expectedCPP?.at70)}/month</Typography>
              </>
            )}
            
            {userInput.spouseInfo.isCollectingOAS ? (
              <Typography>Currently Collecting OAS: ${formatNumber(userInput.spouseInfo.currentOAS)}/month</Typography>
            ) : (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>OAS Benefits</Typography>
                <Typography>At Age 65: ${formatNumber(userInput.spouseInfo.expectedOAS?.at65)}/month</Typography>
                <Typography>At Age 70: ${formatNumber(userInput.spouseInfo.expectedOAS?.at70)}/month</Typography>
              </>
            )}
          </Paper>
        </Grid>
      )}
      
      {/* Extra Income Streams */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Extra Income Streams</Typography>
          
          {userInput.extraIncomeStreams && userInput.extraIncomeStreams.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Start Year</TableCell>
                    <TableCell align="right">End Year</TableCell>
                    <TableCell align="right">Inflation Adjusted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userInput.extraIncomeStreams.map((stream: ExtraIncomeStream) => (
                    <TableRow key={stream.id}>
                      <TableCell>{stream.description}</TableCell>
                      <TableCell align="right">${formatNumber(stream.yearlyAmount)}/year</TableCell>
                      <TableCell align="right">{stream.startYear || 'Current'}</TableCell>
                      <TableCell align="right">{formatYear(stream.endYear)}</TableCell>
                      <TableCell align="right">{stream.hasInflation ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No extra income streams added.</Typography>
          )}
          
          {/* Spouse Extra Income Streams (if applicable) */}
          {userInput.hasSpouse && userInput.spouseInfo && userInput.spouseInfo.extraIncomeStreams && userInput.spouseInfo.extraIncomeStreams.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2">{spouseName}'s Extra Income Streams</Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Start Year</TableCell>
                      <TableCell align="right">End Year</TableCell>
                      <TableCell align="right">Inflation Adjusted</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userInput.spouseInfo.extraIncomeStreams.map((stream: ExtraIncomeStream) => (
                      <TableRow key={stream.id}>
                        <TableCell>{stream.description}</TableCell>
                        <TableCell align="right">${formatNumber(stream.yearlyAmount)}/year</TableCell>
                        <TableCell align="right">{stream.startYear || 'Current'}</TableCell>
                        <TableCell align="right">{formatYear(stream.endYear)}</TableCell>
                        <TableCell align="right">{stream.hasInflation ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Growth and Inflation Rates */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Growth and Inflation Rates</Typography>
          <Typography>Inflation Rate: {formatNumber(userInput.inflationRate)}%</Typography>
          <Typography>RSP Growth Rate: {formatNumber(userInput.rspGrowthRate)}%</Typography>
          <Typography>TFSA Growth Rate: {formatNumber(userInput.tfsaGrowthRate)}%</Typography>
          <Typography>Other Investments Growth Rate: {formatNumber(userInput.otherInvestmentsGrowthRate)}%</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ReviewStep;