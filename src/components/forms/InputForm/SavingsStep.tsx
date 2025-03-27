import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment 
} from '@mui/material';
import { UserInput } from '../../../models/types';

interface SavingsStepProps {
  userInput: UserInput;
  onInputChange: (field: keyof UserInput, value: any) => void;
}

const SavingsStep: React.FC<SavingsStepProps> = ({ userInput, onInputChange }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6">Current Savings</Typography>
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
    </Grid>
  );
};

export default SavingsStep;
