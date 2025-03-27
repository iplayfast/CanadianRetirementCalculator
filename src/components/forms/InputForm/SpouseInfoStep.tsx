// src/components/forms/InputForm/SpouseInfoStep.tsx
import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment,
  Divider,
  Alert,
  Box
} from '@mui/material';
import { UserInput, SpouseInfo } from '../../../models/types';

interface SpouseInfoStepProps {
  userInput: UserInput;
  onInputChange: (field: keyof UserInput, value: any) => void;
  onNestedInputChange: (parent: keyof UserInput, field: string, value: any) => void;
}

const SpouseInfoStep: React.FC<SpouseInfoStepProps> = ({ 
  userInput, 
  onInputChange, 
  onNestedInputChange 
}) => {
  // Initialize spouse info if it doesn't exist
  const initializeSpouseInfo = () => {
    if (!userInput.spouseInfo) {
      const defaultSpouseInfo: SpouseInfo = {
        name: '',
        age: userInput.age,
        retirementAge: userInput.retirementAge,
        lifeExpectancy: userInput.lifeExpectancy,
        currentRSP: 0,
        currentTFSA: 0,
        currentOtherInvestments: 0,
        rrspRoom: 0,
        tfsaRoom: 0,
        employmentIncome: 0,
        expectedCPP: {
          at60: 0,
          at65: 0,
          at70: 0
        },
        expectedOAS: {
          at65: 0,
          at70: 0
        },
        currentCPP: 0,
        currentOAS: 0,
        isCollectingCPP: false,
        isCollectingOAS: false,
        extraIncomeStreams: []
      };
      
      onInputChange('spouseInfo', defaultSpouseInfo);
    }
  };

  // Render nothing if spouse is not included
  if (!userInput.hasSpouse) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="info">
            Spouse information is not included in this retirement plan. If you'd like to add a spouse, 
            please go back to the Personal Information step and toggle the "Include Spouse" switch.
          </Alert>
        </Grid>
      </Grid>
    );
  }

  // Validate spouse info exists
  if (!userInput.spouseInfo) {
    initializeSpouseInfo();
    return null;
  }

  // Determine if spouse is currently retired (retirement age <= current age)
  const isSpouseRetired = userInput.spouseInfo.retirementAge <= userInput.spouseInfo.age;

  return (
    <Grid container spacing={3}>
      {/* ===== SPOUSE PERSONAL INFORMATION ===== */}
      <Grid item xs={12}>
        <Typography variant="h6">Spouse Information</Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Spouse's Name"
          type="text"
          value={userInput.spouseInfo?.name || ''}
          onChange={(e) => onInputChange('spouseInfo', {
            ...userInput.spouseInfo!,
            name: e.target.value
          })}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Spouse's Age"
          type="number"
          value={userInput.spouseInfo?.age || ''}
          onChange={(e) => onInputChange('spouseInfo', {
            ...userInput.spouseInfo!,
            age: parseInt(e.target.value)
          })}
          InputProps={{
            endAdornment: <InputAdornment position="end">years</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Spouse's Retirement Age"
          type="number"
          value={userInput.spouseInfo?.retirementAge || ''}
          onChange={(e) => onInputChange('spouseInfo', {
            ...userInput.spouseInfo!,
            retirementAge: parseInt(e.target.value)
          })}
          InputProps={{
            endAdornment: <InputAdornment position="end">years</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Spouse's Life Expectancy"
          type="number"
          value={userInput.spouseInfo?.lifeExpectancy || ''}
          onChange={(e) => onInputChange('spouseInfo', {
            ...userInput.spouseInfo!,
            lifeExpectancy: parseInt(e.target.value)
          })}
          InputProps={{
            endAdornment: <InputAdornment position="end">years</InputAdornment>,
          }}
        />
      </Grid>
      
      {/* ===== SPOUSE'S SAVINGS ===== */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Spouse's Current Savings</Typography>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Spouse's RSP Balance"
          type="number"
          value={userInput.spouseInfo?.currentRSP || ''}
          onChange={(e) => onInputChange('spouseInfo', {
            ...userInput.spouseInfo!,
            currentRSP: parseFloat(e.target.value)
          })}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Spouse's TFSA Balance"
          type="number"
          value={userInput.spouseInfo?.currentTFSA || ''}
          onChange={(e) => onInputChange('spouseInfo', {
            ...userInput.spouseInfo!,
            currentTFSA: parseFloat(e.target.value)
          })}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Spouse's Other Investments"
          type="number"
          value={userInput.spouseInfo?.currentOtherInvestments || ''}
          onChange={(e) => onInputChange('spouseInfo', {
            ...userInput.spouseInfo!,
            currentOtherInvestments: parseFloat(e.target.value)
          })}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Spouse's RSP room"
          type="number"
          value={userInput.spouseInfo?.rrspRoom || ''}
          onChange={(e) => onInputChange('spouseInfo', {
            ...userInput.spouseInfo!,
            rrspRoom: parseFloat(e.target.value)
          })}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Spouse's TFSA room"
          type="number"
          value={userInput.spouseInfo?.tfsaRoom || ''}
          onChange={(e) => onInputChange('spouseInfo', {
            ...userInput.spouseInfo!,
            tfsaRoom: parseFloat(e.target.value)
          })}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      {/* ===== SPOUSE'S INCOME ===== */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Spouse's Income</Typography>
      </Grid>

      {isSpouseRetired ? (
        <Grid item xs={12}>
          <Alert severity="info">
            Retired: Add part-time work, pension, or other income streams in the Extra Income step
          </Alert>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Spouse's Employment Income"
            type="number"
            value={userInput.spouseInfo?.employmentIncome || ''}
            onChange={(e) => onInputChange('spouseInfo', {
              ...userInput.spouseInfo!,
              employmentIncome: parseFloat(e.target.value)
            })}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              endAdornment: <InputAdornment position="end">/year</InputAdornment>,
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default SpouseInfoStep;