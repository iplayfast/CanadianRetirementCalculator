import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment 
} from '@mui/material';
import { UserInput } from '../../../models/types';

interface ExpensesStepProps {
  userInput: UserInput;
  onInputChange: (field: keyof UserInput, value: any) => void;
}

const ExpensesStep: React.FC<ExpensesStepProps> = ({ userInput, onInputChange }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6">Expenses</Typography>
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
    </Grid>
  );
};

export default ExpensesStep;
