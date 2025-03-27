// src/components/forms/InputForm/PersonalInfoStep.tsx
import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment,
  Divider,
  Box,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { UserInput, SpouseInfo } from '../../../models/types';
// Import the provinces data
import { PROVINCES } from '../../../constants/provincialTaxRates';

interface PersonalInfoStepProps {
  userInput: UserInput;
  onInputChange: (field: keyof UserInput, value: any) => void;
  onNestedInputChange: (parent: keyof UserInput, field: string, value: any) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ 
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

  // Handle spouse info toggle
  const handleSpouseToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hasSpouse = event.target.checked;
    onInputChange('hasSpouse', hasSpouse);
    
    if (hasSpouse) {
      initializeSpouseInfo();
    }
  };

  // Handle province change
  const handleProvinceChange = (event: SelectChangeEvent<string>) => {
    onInputChange('province', event.target.value);
  };

  // Determine if currently retired (retirement age <= current age)
  const isRetired = userInput.retirementAge <= userInput.age;

  return (
    <Grid container spacing={3}>
      {/* ===== YOUR PERSONAL INFORMATION ===== */}
      <Grid item xs={12}>
        <Typography variant="h6">Personal Information</Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Your Name"
          type="text"
          value={userInput.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Current Age"
          type="number"
          value={userInput.age}
          onChange={(e) => onInputChange('age', parseInt(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">years</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Retirement Age"
          type="number"
          value={userInput.retirementAge}
          onChange={(e) => onInputChange('retirementAge', parseInt(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">years</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Life Expectancy"
          type="number"
          value={userInput.lifeExpectancy}
          onChange={(e) => onInputChange('lifeExpectancy', parseInt(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">years</InputAdornment>,
          }}
        />
      </Grid>
      
      {/* Province Selection */}
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel id="province-select-label">Province</InputLabel>
          <Select
            labelId="province-select-label"
            id="province-select"
            value={userInput.province || 'ON'}
            label="Province"
            onChange={handleProvinceChange}
          >
            {PROVINCES.map(province => (
              <MenuItem key={province.code} value={province.code}>
                {province.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      {/* ===== YOUR SAVINGS ===== */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Your Current Savings</Typography>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Current RSP Balance"
          type="number"
          value={userInput.currentRSP}
          onChange={(e) => onInputChange('currentRSP', parseFloat(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Current TFSA Balance"
          type="number"
          value={userInput.currentTFSA}
          onChange={(e) => onInputChange('currentTFSA', parseFloat(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Current Other Investments"
          type="number"
          value={userInput.currentOtherInvestments}
          onChange={(e) => onInputChange('currentOtherInvestments', parseFloat(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Current RSP room"
          type="number"
          value={userInput.rrspRoom}
          onChange={(e) => onInputChange('rrspRoom', parseFloat(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Current TFSA room"
          type="number"
          value={userInput.tfsaRoom}
          onChange={(e) => onInputChange('tfsaRoom', parseFloat(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      {/* ===== YOUR INCOME ===== */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Your Income</Typography>
      </Grid>

      {isRetired ? (
        <Grid item xs={12}>
          <Alert severity="info">
            Retired: Add part-time work, pension, or other income streams in the Extra Income step
          </Alert>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Employment Income"
            type="number"
            value={userInput.employmentIncome}
            onChange={(e) => onInputChange('employmentIncome', parseFloat(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              endAdornment: <InputAdornment position="end">/year</InputAdornment>,
            }}
          />
        </Grid>
      )}
      
      {/* ===== EXPENSES ===== */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Household Expenses</Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Current Annual Expenses"
          type="number"
          value={userInput.currentAnnualExpenses}
          onChange={(e) => onInputChange('currentAnnualExpenses', parseFloat(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            endAdornment: <InputAdornment position="end">/year</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Retirement Annual Expenses"
          type="number"
          value={userInput.retirementAnnualExpenses}
          onChange={(e) => onInputChange('retirementAnnualExpenses', parseFloat(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            endAdornment: <InputAdornment position="end">/year</InputAdornment>,
          }}
        />
      </Grid>
      
      {/* ===== SPOUSE TOGGLE ===== */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <FormControlLabel
          control={
            <Switch
              checked={userInput.hasSpouse || false}
              onChange={handleSpouseToggle}
              color="primary"
            />
          }
          label="Include Spouse in Retirement Plan"
        />
      </Grid>
    </Grid>
  );
};

export default PersonalInfoStep;