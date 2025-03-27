import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment,
  Slider
} from '@mui/material';
import { UserInput } from '../../../models/types';

interface RatesStepProps {
  userInput: UserInput;
  onInputChange: (field: keyof UserInput, value: any) => void;
}

const RatesStep: React.FC<RatesStepProps> = ({ userInput, onInputChange }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6">Growth and Inflation Rates</Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography gutterBottom>Inflation Rate (%)</Typography>
        <Slider
          value={userInput.inflationRate}
          onChange={(_, value) => onInputChange('inflationRate', value as number)}
          aria-labelledby="inflation-rate-slider"
          step={0.1}
          min={0}
          max={10}
          valueLabelDisplay="auto"
        />
        <TextField
          fullWidth
          type="number"
          value={userInput.inflationRate}
          onChange={(e) => onInputChange('inflationRate', parseFloat(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography gutterBottom>RSP Growth Rate (%)</Typography>
        <Slider
          value={userInput.rspGrowthRate}
          onChange={(_, value) => onInputChange('rspGrowthRate', value as number)}
          aria-labelledby="rsp-growth-rate-slider"
          step={0.1}
          min={0}
          max={15}
          valueLabelDisplay="auto"
        />
        <TextField
          fullWidth
          type="number"
          value={userInput.rspGrowthRate}
          onChange={(e) => onInputChange('rspGrowthRate', parseFloat(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography gutterBottom>TFSA Growth Rate (%)</Typography>
        <Slider
          value={userInput.tfsaGrowthRate}
          onChange={(_, value) => onInputChange('tfsaGrowthRate', value as number)}
          aria-labelledby="tfsa-growth-rate-slider"
          step={0.1}
          min={0}
          max={15}
          valueLabelDisplay="auto"
        />
        <TextField
          fullWidth
          type="number"
          value={userInput.tfsaGrowthRate}
          onChange={(e) => onInputChange('tfsaGrowthRate', parseFloat(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography gutterBottom>Other Investments Growth Rate (%)</Typography>
        <Slider
          value={userInput.otherInvestmentsGrowthRate}
          onChange={(_, value) => onInputChange('otherInvestmentsGrowthRate', value as number)}
          aria-labelledby="other-investments-growth-rate-slider"
          step={0.1}
          min={0}
          max={15}
          valueLabelDisplay="auto"
        />
        <TextField
          fullWidth
          type="number"
          value={userInput.otherInvestmentsGrowthRate}
          onChange={(e) => onInputChange('otherInvestmentsGrowthRate', parseFloat(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </Grid>
    </Grid>
  );
};

export default RatesStep;
