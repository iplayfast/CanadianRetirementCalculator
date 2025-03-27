// src/components/forms/InputForm/BenefitsStep.tsx
import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment,
  Alert,
  Paper,
  Box,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { UserInput } from '../../../models/types';

interface BenefitsStepProps {
  userInput: UserInput;
  onInputChange: (field: keyof UserInput, value: any) => void;
  onNestedInputChange: (parent: keyof UserInput, field: string, value: any) => void;
}

const BenefitsStep: React.FC<BenefitsStepProps> = ({ 
  userInput, 
  onInputChange, 
  onNestedInputChange 
}) => {
  // Get names for primary and spouse
  const primaryName = userInput.name || 'Your';
  const spouseName = userInput.hasSpouse && userInput.spouseInfo ? (userInput.spouseInfo.name || 'Spouse\'s') : 'Spouse\'s';


  // Utility function to determine benefits details
  
  const getBenefitsDetails = (
    currentAge: number, 
    isCollecting: boolean, 
    currentAmount: number | undefined, 
    expectedBenefits: { at60: number; at65: number; at70: number },
    type: 'CPP' | 'OAS'
  ) => {
    const isPastAge60 = currentAge >= 60;
    const isPastAge65 = currentAge >= 65;
    const isPastAge70 = currentAge >= 70;

    return {
      currentAge,
      isPastAge60,
      isPastAge65,
      isPastAge70,
      isCollecting,
      currentAmount,
      expectedBenefits,
      type
    };
  };

  // Prepare benefits details
  const primaryPersonCPPDetails = getBenefitsDetails(
    userInput.age, 
    userInput.isCollectingCPP || false, 
    userInput.currentCPP, 
    userInput.expectedCPP,
    'CPP'
  );

  const primaryPersonOASDetails = getBenefitsDetails(
    userInput.age, 
    userInput.isCollectingOAS || false, 
    userInput.currentOAS, 
    userInput.expectedOAS,
    'OAS'
  );

  // Spouse benefits details (if applicable)
  const spouseCPPDetails = userInput.hasSpouse && userInput.spouseInfo 
    ? getBenefitsDetails(
        userInput.spouseInfo.age, 
        userInput.spouseInfo.isCollectingCPP || false, 
        userInput.spouseInfo.currentCPP, 
        userInput.spouseInfo.expectedCPP,
        'CPP'
      )
    : null;

  const spouseOASDetails = userInput.hasSpouse && userInput.spouseInfo
    ? getBenefitsDetails(
        userInput.spouseInfo.age, 
        userInput.spouseInfo.isCollectingOAS || false, 
        userInput.spouseInfo.currentOAS, 
        userInput.spouseInfo.expectedOAS,
        'OAS'
      )
    : null;

  // Render benefits section for a specific person and benefit type
  const renderBenefitsSection = (
    details: ReturnType<typeof getBenefitsDetails>, 
    personType: 'primary' | 'spouse',
    onCollectingChange: (collecting: boolean) => void,
    onCurrentAmountChange: (amount: number) => void,
    onExpectedAmountChange: (age: number, amount: number) => void
  ) => {
    const { 
      currentAge,
      isPastAge60, 
      isPastAge65, 
      isPastAge70, 
      isCollecting, 
      currentAmount, 
      expectedBenefits,
      type 
    } = details;

    const personName = personType === 'primary' ? primaryName : spouseName;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1">{personName} {type} Benefits</Typography>
        </Grid>

        {/* Collection Status */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isCollecting}
                onChange={(e) => onCollectingChange(e.target.checked)}
              />
            }
            label={`${personName === 'Your' ? 'You are' : personName === 'Spouse\'s' ? `${personName} is` : `${personName} is`} Currently Collecting ${type}`}
          />
        </Grid>

        {/* Current Amount for Collecting Benefits */}
        {isCollecting && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={`Current Monthly ${type} Amount`}
              type="number"
              value={currentAmount || 0}
              onChange={(e) => onCurrentAmountChange(parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: <InputAdornment position="end">/month</InputAdornment>,
              }}
            />
          </Grid>
        )}

        {/* Expected Benefits for Non-Collecting Status */}
        {!isCollecting && (
          <>
            {/* CPP benefits */}
            {type === 'CPP' && (
              <>
                {/* User under 60 - show all standard options */}
                {!isPastAge60 && (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="CPP at Age 60"
                        type="number"
                        value={expectedBenefits.at60}
                        onChange={(e) => onExpectedAmountChange(60, parseFloat(e.target.value))}
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
                        value={expectedBenefits.at65}
                        onChange={(e) => onExpectedAmountChange(65, parseFloat(e.target.value))}
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
                        value={expectedBenefits.at70}
                        onChange={(e) => onExpectedAmountChange(70, parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* User between 60-65 */}
                {isPastAge60 && !isPastAge65 && (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={`CPP at Current Age (${currentAge})`}
                        type="number"
                        value={currentAmount || 0}
                        onChange={(e) => onCurrentAmountChange(parseFloat(e.target.value))}
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
                        value={expectedBenefits.at65}
                        onChange={(e) => onExpectedAmountChange(65, parseFloat(e.target.value))}
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
                        value={expectedBenefits.at70}
                        onChange={(e) => onExpectedAmountChange(70, parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* User between 65-70 */}
                {isPastAge65 && !isPastAge70 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={`CPP at Current Age (${currentAge})`}
                        type="number"
                        value={currentAmount || 0}
                        onChange={(e) => onCurrentAmountChange(parseFloat(e.target.value))}
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
                        value={expectedBenefits.at70}
                        onChange={(e) => onExpectedAmountChange(70, parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* User 70 or older */}
                {isPastAge70 && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={`CPP at Current Age (${currentAge})`}
                      type="number"
                      value={currentAmount || 0}
                      onChange={(e) => onCurrentAmountChange(parseFloat(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                      }}
                    />
                  </Grid>
                )}
              </>
            )}
            
            {/* OAS benefits */}
            {type === 'OAS' && (
              <>
                {/* User under 65 - show standard options */}
                {!isPastAge65 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="OAS at Age 65"
                        type="number"
                        value={expectedBenefits.at65}
                        onChange={(e) => onExpectedAmountChange(65, parseFloat(e.target.value))}
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
                        value={expectedBenefits.at70}
                        onChange={(e) => onExpectedAmountChange(70, parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* User between 65-70 */}
                {isPastAge65 && !isPastAge70 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={`OAS at Current Age (${currentAge})`}
                        type="number"
                        value={currentAmount || 0}
                        onChange={(e) => onCurrentAmountChange(parseFloat(e.target.value))}
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
                        value={expectedBenefits.at70}
                        onChange={(e) => onExpectedAmountChange(70, parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* User 70 or older */}
                {isPastAge70 && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={`OAS at Current Age (${currentAge})`}
                      type="number"
                      value={currentAmount || 0}
                      onChange={(e) => onCurrentAmountChange(parseFloat(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                      }}
                    />
                  </Grid>
                )}
              </>
            )}
          </>
        )}
        
        {/* Help messages for different age groups */}
        {!isCollecting && (
          <>
            {isPastAge60 && !isPastAge65 && type === 'CPP' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Since you are between ages 60-65, we're asking for your current CPP estimates and expected future benefits at ages 65 and 70.
                </Alert>
              </Grid>
            )}
            
            {isPastAge65 && !isPastAge70 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Since you are between ages 65-70, we're asking for your current {type} estimates and expected benefits at age 70.
                </Alert>
              </Grid>
            )}
            
            {isPastAge70 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Since you are 70 or older, we're only asking for your current {type} amount.
                </Alert>
              </Grid>
            )}
          </>
        )}
      </Grid>
    );
  };

  // Return the full benefits section
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6">Government Benefits</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Enter your government benefits and expected or current amounts
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          {renderBenefitsSection(
            primaryPersonCPPDetails,
            'primary',
            (collecting) => onInputChange('isCollectingCPP', collecting),
            (amount) => onInputChange('currentCPP', amount),
            (age, amount) => {
              switch(age) {
                case 60:
                  onNestedInputChange('expectedCPP', 'at60', amount);
                  break;
                case 65:
                  onNestedInputChange('expectedCPP', 'at65', amount);
                  break;
                case 70:
                  onNestedInputChange('expectedCPP', 'at70', amount);
                  break;
              }
            }
          )}
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          {renderBenefitsSection(
            primaryPersonOASDetails,
            'primary',
            (collecting) => onInputChange('isCollectingOAS', collecting),
            (amount) => onInputChange('currentOAS', amount),
            (age, amount) => {
              switch(age) {
                case 65:
                  onNestedInputChange('expectedOAS', 'at65', amount);
                  break;
                case 70:
                  onNestedInputChange('expectedOAS', 'at70', amount);
                  break;
              }
            }
          )}
        </Paper>
      </Grid>

      {/* Spouse Benefits Section - Only render if spouse is included */}
      {userInput.hasSpouse && userInput.spouseInfo && (
        <>

          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              {renderBenefitsSection(
                spouseCPPDetails!,
                'spouse',
                (collecting) => onInputChange('spouseInfo', {
                  ...userInput.spouseInfo!,
                  isCollectingCPP: collecting
                }),
                (amount) => onInputChange('spouseInfo', {
                  ...userInput.spouseInfo!,
                  currentCPP: amount
                }),
                (age, amount) => {
                  const updatedExpectedCPP = {
                    ...userInput.spouseInfo!.expectedCPP
                  };
                  
                  switch(age) {
                    case 60:
                      updatedExpectedCPP.at60 = amount;
                      break;
                    case 65:
                      updatedExpectedCPP.at65 = amount;
                      break;
                    case 70:
                      updatedExpectedCPP.at70 = amount;
                      break;
                  }
                  
                  onInputChange('spouseInfo', {
                    ...userInput.spouseInfo!,
                    expectedCPP: updatedExpectedCPP
                  });
                }
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              {renderBenefitsSection(
                spouseOASDetails!,
                'spouse',
                (collecting) => onInputChange('spouseInfo', {
                  ...userInput.spouseInfo!,
                  isCollectingOAS: collecting
                }),
                (amount) => onInputChange('spouseInfo', {
                  ...userInput.spouseInfo!,
                  currentOAS: amount
                }),
                (age, amount) => {
                  const updatedExpectedOAS = {
                    ...userInput.spouseInfo!.expectedOAS
                  };
                  
                  switch(age) {
                    case 65:
                      updatedExpectedOAS.at65 = amount;
                      break;
                    case 70:
                      updatedExpectedOAS.at70 = amount;
                      break;
                  }
                  
                  onInputChange('spouseInfo', {
                    ...userInput.spouseInfo!,
                    expectedOAS: updatedExpectedOAS
                  });
                }
              )}
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default BenefitsStep;
