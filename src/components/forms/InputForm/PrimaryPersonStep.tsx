import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment,
  Divider,
  Alert,
} from '@mui/material';
import { UserInput } from '../../../models/types';

interface PrimaryPersonStepProps {
  userInput: UserInput;
  onInputChange: (field: keyof UserInput, value: any) => void;
  onNestedInputChange: (parent: keyof UserInput, field: string, value: any) => void;
}

const PrimaryPersonStep: React.FC<PrimaryPersonStepProps> = ({ 
  userInput, 
  onInputChange, 
  onNestedInputChange 
}) => {
  // Helper to determine what CPP and OAS fields to show based on age
  const currentAge = userInput.age || 0;
  const isPastAge60 = currentAge >= 60;
  const isPastAge65 = currentAge >= 65;
  const isPastAge70 = currentAge >= 70;
  const isBetween60And65 = currentAge >= 60 && currentAge < 65;
  const isBetween65And70 = currentAge >= 65 && currentAge < 70;

  return (
    <Grid container spacing={3}>
      {/* ===== PERSONAL INFORMATION ===== */}
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
      
      {/* ===== CURRENT SAVINGS ===== */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
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
      
      {/* ===== INCOME ===== */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Income</Typography>
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

      {/* ===== EXPENSES ===== */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
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
      
      {/* ===== GOVERNMENT BENEFITS ===== */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Government Benefits</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Enter your expected or current government benefits
        </Typography>
      </Grid>
      
      {isPastAge70 && (
        <Grid item xs={12}>
          <Alert severity="info">
            Since you are already 70 or older, please enter your current CPP and OAS benefits.
          </Alert>
        </Grid>
      )}

      {/* CPP Benefits Section */}
      <Grid item xs={12}>
        <Typography variant="subtitle1">CPP Benefits</Typography>
      </Grid>
      
      {/* Current CPP for those already receiving it */}
      {isPastAge60 && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={`Current CPP at Age ${currentAge}`}
            type="number"
            value={userInput.currentCPP || 0}
            onChange={(e) => onInputChange('currentCPP', parseFloat(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              endAdornment: <InputAdornment position="end">/month</InputAdornment>,
            }}
          />
        </Grid>
      )}
      
      {/* Future CPP projections */}
      {!isPastAge60 && (
        <>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="CPP at Age 60"
              type="number"
              value={userInput.expectedCPP.at60}
              onChange={(e) => onNestedInputChange('expectedCPP', 'at60', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: <InputAdornment position="end">/month</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="CPP at Age 65"
              type="number"
              value={userInput.expectedCPP.at65}
              onChange={(e) => onNestedInputChange('expectedCPP', 'at65', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: <InputAdornment position="end">/month</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="CPP at Age 70"
              type="number"
              value={userInput.expectedCPP.at70}
              onChange={(e) => onNestedInputChange('expectedCPP', 'at70', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: <InputAdornment position="end">/month</InputAdornment>,
              }}
            />
          </Grid>
        </>
      )}
      
      {/* For those between 60-65, also ask about future benefits at 65 and 70 */}
      {isBetween60And65 && (
        <>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Expected CPP at Age 65"
              type="number"
              value={userInput.expectedCPP.at65}
              onChange={(e) => onNestedInputChange('expectedCPP', 'at65', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: <InputAdornment position="end">/month</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Expected CPP at Age 70"
              type="number"
              value={userInput.expectedCPP.at70}
              onChange={(e) => onNestedInputChange('expectedCPP', 'at70', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: <InputAdornment position="end">/month</InputAdornment>,
              }}
            />
          </Grid>
        </>
      )}
      
      {/* For those between 65-70, also ask about future benefit at 70 */}
      {isBetween65And70 && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Expected CPP at Age 70"
            type="number"
            value={userInput.expectedCPP.at70}
            onChange={(e) => onNestedInputChange('expectedCPP', 'at70', parseFloat(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              endAdornment: <InputAdornment position="end">/month</InputAdornment>,
            }}
          />
        </Grid>
      )}
        
      {/* OAS Benefits Section */}
      <Grid item xs={12}>
        <Typography variant="subtitle1">OAS Benefits</Typography>
      </Grid>
      
      {/* Current OAS for those already receiving it */}
      {isPastAge65 && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={`Current OAS at Age ${currentAge}`}
            type="number"
            value={userInput.currentOAS || 0}
            onChange={(e) => onInputChange('currentOAS', parseFloat(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              endAdornment: <InputAdornment position="end">/month</InputAdornment>,
            }}
          />
        </Grid>
      )}
      
      {/* Future OAS projections */}
      {!isPastAge65 && (
        <>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="OAS at Age 65"
              type="number"
              value={userInput.expectedOAS.at65}
              onChange={(e) => onNestedInputChange('expectedOAS', 'at65', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: <InputAdornment position="end">/month</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="OAS at Age 70"
              type="number"
              value={userInput.expectedOAS.at70}
              onChange={(e) => onNestedInputChange('expectedOAS', 'at70', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: <InputAdornment position="end">/month</InputAdornment>,
              }}
            />
          </Grid>
        </>
      )}
      
      {/* For those between 65-70, also ask about future benefit at 70 */}
      {isBetween65And70 && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Expected OAS at Age 70"
            type="number"
            value={userInput.expectedOAS.at70}
            onChange={(e) => onNestedInputChange('expectedOAS', 'at70', parseFloat(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              endAdornment: <InputAdornment position="end">/month</InputAdornment>,
            }}
          />
        </Grid>
      )}
      
      {/* Help messages for different age groups */}
      {isBetween60And65 && (
        <Grid item xs={12}>
          <Alert severity="info">
            Since you are between ages 60-65, we're asking for your current CPP benefit and your expected benefits at ages 65 and 70.
          </Alert>
        </Grid>
      )}
      
      {isBetween65And70 && (
        <Grid item xs={12}>
          <Alert severity="info">
            Since you are between ages 65-70, we're asking for your current CPP and OAS benefits, and your expected benefits at age 70.
          </Alert>
        </Grid>
      )}
      
      {isPastAge70 && (
        <Grid item xs={12}>
          <Alert severity="info">
            Since you are 70 or older, we're only asking for your current CPP and OAS benefits.
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default PrimaryPersonStep;