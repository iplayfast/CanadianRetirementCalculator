import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment 
} from '@mui/material';
import { UserInput } from '../../../models/types';

interface IncomeStepProps {
  userInput: UserInput;
  onInputChange: (field: keyof UserInput, value: any) => void;
}

const IncomeStep: React.FC<IncomeStepProps> = ({ userInput, onInputChange }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6">Income Sources</Typography>
      </Grid>
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
      {/* Additional other income fields could be added here */}
    </Grid>
  );
};

export default IncomeStep;
