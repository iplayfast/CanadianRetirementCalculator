import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { UserInput } from '../../../models/types';

interface SpouseBenefitsStepProps {
  userInput: UserInput;
  onInputChange: (field: keyof UserInput, value: any) => void;
  onNestedInputChange: (parent: keyof UserInput, field: string, value: any) => void;
}

const SpouseBenefitsStep: React.FC<SpouseBenefitsStepProps> = ({ 
  userInput, 
  onInputChange, 
  onNestedInputChange 
}) => {
  // Skip this step if there's no spouse
  if (!userInput.hasSpouse || !userInput.spouseInfo) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="info">
            This step is for spouse benefits. Since you haven't included a spouse in your plan, you can proceed to the next step.
          </Alert>
        </Grid>
      </Grid>
    );
  }

  const spouseAge = userInput.spouseInfo.age || 0;
  const isPastAge60 = spouseAge >= 60;
  const isPastAge65 = spouseAge >= 65;
  const isPastAge70 = spouseAge >= 70;
  const spouseName = userInput.spouseInfo.name || 'Your spouse';

  // Update spouse nested field
  const handleSpouseFieldChange = (field: string, value: any) => {
    onInputChange('spouseInfo', {
      ...userInput.spouseInfo!,
      [field]: value
    });
  };

  // Handle nested CPP/OAS changes for spouse
  const handleNestedSpouseFieldChange = (
    parent: 'expectedCPP' | 'expectedOAS', 
    field: string, 
    value: number
  ) => {
    onInputChange('spouseInfo', {
      ...userInput.spouseInfo!,
      [parent]: {
        ...userInput.spouseInfo![parent],
        [field]: value
      }
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6">Spouse Government Benefits</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Enter {spouseName}'s expected or current government benefits
        </Typography>
      </Grid>
      
      {/* Spouse CPP/OAS Collection Status */}
      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={userInput.spouseInfo.isCollectingCPP || false}
              onChange={(e) => handleSpouseFieldChange('isCollectingCPP', e.target.checked)}
            />
          }
          label={`${spouseName} is Currently Collecting CPP`}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={userInput.spouseInfo.isCollectingOAS || false}
              onChange={(e) => handleSpouseFieldChange('isCollectingOAS', e.target.checked)}
            />
          }
          label={`${spouseName} is Currently Collecting OAS`}
        />
      </Grid>
      
      {isPastAge70 && !userInput.spouseInfo.isCollectingCPP && !userInput.spouseInfo.isCollectingOAS && (
        <Grid item xs={12}>
          <Alert severity="warning">
            Since {spouseName} is already 70 or older, they should check the "Currently Collecting" boxes above if they are receiving CPP and OAS.
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          {/* CPP Benefits Section */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">{spouseName}'s CPP Benefits</Typography>
            </Grid>
            
            {/* If spouse is currently collecting CPP, show field for current amount */}
            {userInput.spouseInfo.isCollectingCPP ? (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Monthly CPP Amount"
                  type="number"
                  value={userInput.spouseInfo.currentCPP || 0}
                  onChange={(e) => handleSpouseFieldChange('currentCPP', parseFloat(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                  }}
                />
              </Grid>
            ) : (
              // If spouse is NOT currently collecting CPP, show expected benefit amounts
              <>
                {/* For spouses under 60, show all three claiming ages */}
                {!isPastAge60 && (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="CPP at Age 60"
                        type="number"
                        value={userInput.spouseInfo.expectedCPP.at60}
                        onChange={(e) => handleNestedSpouseFieldChange('expectedCPP', 'at60', parseFloat(e.target.value))}
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
                        value={userInput.spouseInfo.expectedCPP.at65}
                        onChange={(e) => handleNestedSpouseFieldChange('expectedCPP', 'at65', parseFloat(e.target.value))}
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
                        value={userInput.spouseInfo.expectedCPP.at70}
                        onChange={(e) => handleNestedSpouseFieldChange('expectedCPP', 'at70', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* For spouses between 60-65, show current age CPP and future amounts */}
                {isPastAge60 && !isPastAge65 && (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={`CPP at Current Age (${spouseAge})`}
                        type="number"
                        value={userInput.spouseInfo.currentCPP || 0}
                        onChange={(e) => handleSpouseFieldChange('currentCPP', parseFloat(e.target.value))}
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
                        value={userInput.spouseInfo.expectedCPP.at65}
                        onChange={(e) => handleNestedSpouseFieldChange('expectedCPP', 'at65', parseFloat(e.target.value))}
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
                        value={userInput.spouseInfo.expectedCPP.at70}
                        onChange={(e) => handleNestedSpouseFieldChange('expectedCPP', 'at70', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* For spouses between 65-70, show current age CPP and age 70 amount */}
                {isPastAge65 && !isPastAge70 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={`CPP at Current Age (${spouseAge})`}
                        type="number"
                        value={userInput.spouseInfo.currentCPP || 0}
                        onChange={(e) => handleSpouseFieldChange('currentCPP', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="CPP at Age 70"
                        type="number"
                        value={userInput.spouseInfo.expectedCPP.at70}
                        onChange={(e) => handleNestedSpouseFieldChange('expectedCPP', 'at70', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* For spouses 70+ who aren't collecting, just show expected amount at current age */}
                {isPastAge70 && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={`CPP at Current Age (${spouseAge})`}
                      type="number"
                      value={userInput.spouseInfo.currentCPP || 0}
                      onChange={(e) => handleSpouseFieldChange('currentCPP', parseFloat(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                      }}
                    />
                  </Grid>
                )}
              </>
            )}
              
            {/* OAS Benefits Section for spouse */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>{spouseName}'s OAS Benefits</Typography>
            </Grid>
            
            {/* If spouse is currently collecting OAS, show field for current amount */}
            {userInput.spouseInfo.isCollectingOAS ? (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Monthly OAS Amount"
                  type="number"
                  value={userInput.spouseInfo.currentOAS || 0}
                  onChange={(e) => handleSpouseFieldChange('currentOAS', parseFloat(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                  }}
                />
              </Grid>
            ) : (
              // If spouse is NOT currently collecting OAS, show expected benefit amounts
              <>
                {/* OAS can only be collected starting at 65 */}
                {!isPastAge65 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="OAS at Age 65"
                        type="number"
                        value={userInput.spouseInfo.expectedOAS.at65}
                        onChange={(e) => handleNestedSpouseFieldChange('expectedOAS', 'at65', parseFloat(e.target.value))}
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
                        value={userInput.spouseInfo.expectedOAS.at70}
                        onChange={(e) => handleNestedSpouseFieldChange('expectedOAS', 'at70', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* For spouses between 65-70, show current age OAS and age 70 amount */}
                {isPastAge65 && !isPastAge70 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={`OAS at Current Age (${spouseAge})`}
                        type="number"
                        value={userInput.spouseInfo.currentOAS || 0}
                        onChange={(e) => handleSpouseFieldChange('currentOAS', parseFloat(e.target.value))}
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
                        value={userInput.spouseInfo.expectedOAS.at70}
                        onChange={(e) => handleNestedSpouseFieldChange('expectedOAS', 'at70', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* For spouses 70+ who aren't collecting, just show expected amount at current age */}
                {isPastAge70 && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={`OAS at Current Age (${spouseAge})`}
                      type="number"
                      value={userInput.spouseInfo.currentOAS || 0}
                      onChange={(e) => handleSpouseFieldChange('currentOAS', parseFloat(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                      }}
                    />
                  </Grid>
                )}
              </>
            )}
            
            {/* Help messages for different age groups */}
            {isPastAge60 && !isPastAge65 && !userInput.spouseInfo.isCollectingCPP && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Since {spouseName} is between ages 60-65, we're showing options for their current CPP benefit and potential benefits if they wait until ages 65 or 70.
                </Alert>
              </Grid>
            )}
            
            {isPastAge65 && !isPastAge70 && (!userInput.spouseInfo.isCollectingCPP || !userInput.spouseInfo.isCollectingOAS) && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Since {spouseName} is between ages 65-70, we're showing options for their current CPP and OAS benefits and potential benefits if they wait until age 70.
                </Alert>
              </Grid>
            )}
            
            {isPastAge70 && (!userInput.spouseInfo.isCollectingCPP || !userInput.spouseInfo.isCollectingOAS) && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Since {spouseName} is 70 or older, they should be eligible for the maximum CPP and OAS benefits. If they are already collecting benefits, check the "Currently Collecting" boxes above.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SpouseBenefitsStep;