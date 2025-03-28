// src/components/forms/InputForm/BenefitsStep.tsx
import React, { useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment,
  Alert,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box
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
  // Set default benefit start ages if not provided
  useEffect(() => {
    // Default primary person benefit start ages
    if (!userInput.isCollectingCPP && userInput.cppStartAge === undefined) {
      onInputChange('cppStartAge', 65);
    }
    if (!userInput.isCollectingOAS && userInput.oasStartAge === undefined) {
      onInputChange('oasStartAge', 65);
    }
    
    // Default spouse benefit start ages if spouse exists
    if (userInput.hasSpouse && userInput.spouseInfo) {
      const updatedSpouseInfo = { ...userInput.spouseInfo };
      let needsUpdate = false;
      
      if (!updatedSpouseInfo.isCollectingCPP && updatedSpouseInfo.cppStartAge === undefined) {
        updatedSpouseInfo.cppStartAge = 65;
        needsUpdate = true;
      }
      if (!updatedSpouseInfo.isCollectingOAS && updatedSpouseInfo.oasStartAge === undefined) {
        updatedSpouseInfo.oasStartAge = 65;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        onInputChange('spouseInfo', updatedSpouseInfo);
      }
    }
  }, []);

  // Generate age options for dropdowns based on benefit type
  const generateAgeOptions = (minAge: number, currentAge: number) => {
    const options = [];
    
    options.push(
      <MenuItem key="currently-collecting" value="currently-collecting">
        Currently Collecting
      </MenuItem>
    );
    
    for (let age = Math.max(minAge, currentAge); age <= 70; age++) {
      options.push(
        <MenuItem key={`age-${age}`} value={age}>
          Age {age}
        </MenuItem>
      );
    }
    
    options.push(
      <MenuItem key="do-not-qualify" value="do-not-qualify">
        Do Not Qualify
      </MenuItem>
    );
    
    return options;
  };

  // Common handler for benefit start age changes
  const handleBenefitStartAgeChange = (
    isCollectingField: keyof UserInput | string,
    startAgeField: keyof UserInput | string,
    value: string | number,
    isSpouse: boolean = false
  ) => {
    if (isSpouse && userInput.spouseInfo) {
      // Handle spouse benefit start age change
      const updatedSpouseInfo = { ...userInput.spouseInfo };
      
      if (value === 'currently-collecting') {
        updatedSpouseInfo[isCollectingField as keyof typeof updatedSpouseInfo] = true;
      } else if (value === 'do-not-qualify') {
        updatedSpouseInfo[isCollectingField as keyof typeof updatedSpouseInfo] = false;
        updatedSpouseInfo[startAgeField as keyof typeof updatedSpouseInfo] = undefined;
      } else {
        updatedSpouseInfo[isCollectingField as keyof typeof updatedSpouseInfo] = false;
        updatedSpouseInfo[startAgeField as keyof typeof updatedSpouseInfo] = Number(value);
      }
      
      onInputChange('spouseInfo', updatedSpouseInfo);
    } else {
      // Handle primary person benefit start age change
      if (value === 'currently-collecting') {
        onInputChange(isCollectingField as keyof UserInput, true);
      } else if (value === 'do-not-qualify') {
        onInputChange(isCollectingField as keyof UserInput, false);
        onInputChange(startAgeField as keyof UserInput, undefined);
      } else {
        onInputChange(isCollectingField as keyof UserInput, false);
        onInputChange(startAgeField as keyof UserInput, Number(value));
      }
    }
  };

  // Handlers for primary person's benefit ages
  const handleCPPStartAgeChange = (event: SelectChangeEvent) => {
    handleBenefitStartAgeChange('isCollectingCPP', 'cppStartAge', event.target.value);
  };

  const handleOASStartAgeChange = (event: SelectChangeEvent) => {
    handleBenefitStartAgeChange('isCollectingOAS', 'oasStartAge', event.target.value);
  };

  // Handlers for spouse's benefit ages
  const handleSpouseCPPStartAgeChange = (event: SelectChangeEvent) => {
    handleBenefitStartAgeChange('isCollectingCPP', 'cppStartAge', event.target.value, true);
  };

  const handleSpouseOASStartAgeChange = (event: SelectChangeEvent) => {
    handleBenefitStartAgeChange('isCollectingOAS', 'oasStartAge', event.target.value, true);
  };

  // Reusable benefit start age selector component
  const BenefitStartAgeSelector = ({
    label,
    isCollecting,
    startAge,
    minAge,
    currentAge,
    onChange
  }: {
    label: string;
    isCollecting: boolean;
    startAge?: number;
    minAge: number;
    currentAge: number;
    onChange: (event: SelectChangeEvent) => void;
  }) => (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={isCollecting ? 'currently-collecting' : (startAge || 'do-not-qualify')}
        label={label}
        onChange={onChange}
      >
        {generateAgeOptions(minAge, currentAge)}
      </Select>
    </FormControl>
  );

  // Helper to handle spouse nested object updates
  const handleSpouseFieldUpdate = (field: string, value: any) => {
    if (!userInput.spouseInfo) return;
    
    const updatedSpouseInfo = {
      ...userInput.spouseInfo,
      [field]: value
    };
    
    onInputChange('spouseInfo', updatedSpouseInfo);
  };

  // Helper to handle spouse nested object with nested property updates
  const handleSpouseNestedUpdate = (parentField: string, field: string, value: any) => {
    if (!userInput.spouseInfo) return;
    
    const updatedSpouseInfo = {
      ...userInput.spouseInfo,
      [parentField]: {
        ...userInput.spouseInfo[parentField as keyof typeof userInput.spouseInfo] as Record<string, any>,
        [field]: value
      }
    };
    
    onInputChange('spouseInfo', updatedSpouseInfo);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6">Government Benefits</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Enter your government benefits and expected or current amounts
        </Typography>
      </Grid>

      {/* PRIMARY PERSON CPP */}
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1">Your CPP Benefits</Typography>
          
          <Grid container spacing={3}>
            {/* CPP Start Age Dropdown */}
            <Grid item xs={12}>
              <BenefitStartAgeSelector
                label="CPP Start Age"
                isCollecting={userInput.isCollectingCPP}
                startAge={userInput.cppStartAge}
                minAge={60}
                currentAge={userInput.age}
                onChange={handleCPPStartAgeChange}
              />
            </Grid>
            
            {/* CPP Benefit Amounts */}
            {userInput.isCollectingCPP ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={`Current CPP at Age ${userInput.age}`}
                  type="number"
                  value={userInput.currentCPP || 0}
                  onChange={(e) => onInputChange('currentCPP', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                  }}
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="CPP at Age 60"
                    type="number"
                    value={userInput.expectedCPP.at60}
                    onChange={(e) => onNestedInputChange('expectedCPP', 'at60', e.target.value === '' ? 0 : parseFloat(e.target.value))}
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
                    onChange={(e) => onNestedInputChange('expectedCPP', 'at65', e.target.value === '' ? 0 : parseFloat(e.target.value))}
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
                    onChange={(e) => onNestedInputChange('expectedCPP', 'at70', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </Grid>

      {/* PRIMARY PERSON OAS */}
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1">Your OAS Benefits</Typography>
          
          <Grid container spacing={3}>
            {/* OAS Start Age Dropdown */}
            <Grid item xs={12}>
              <BenefitStartAgeSelector
                label="OAS Start Age"
                isCollecting={userInput.isCollectingOAS}
                startAge={userInput.oasStartAge}
                minAge={65}
                currentAge={userInput.age}
                onChange={handleOASStartAgeChange}
              />
            </Grid>
            
            {/* OAS Benefit Amounts */}
            {userInput.isCollectingOAS ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={`Current OAS at Age ${userInput.age}`}
                  type="number"
                  value={userInput.currentOAS || 0}
                  onChange={(e) => onInputChange('currentOAS', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                  }}
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="OAS at Age 65"
                    type="number"
                    value={userInput.expectedOAS.at65}
                    onChange={(e) => onNestedInputChange('expectedOAS', 'at65', e.target.value === '' ? 0 : parseFloat(e.target.value))}
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
                    onChange={(e) => onNestedInputChange('expectedOAS', 'at70', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </Grid>

      {/* SPOUSE BENEFITS SECTION */}
      {userInput.hasSpouse && userInput.spouseInfo && (
        <>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Spouse Government Benefits</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Enter your spouse's government benefits and expected or current amounts
            </Typography>
          </Grid>
          
          {/* Spouse CPP */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1">Spouse's CPP Benefits</Typography>
              
              <Grid container spacing={3}>
                {/* Spouse CPP Start Age Dropdown */}
                <Grid item xs={12}>
                  <BenefitStartAgeSelector
                    label="Spouse's CPP Start Age"
                    isCollecting={userInput.spouseInfo.isCollectingCPP}
                    startAge={userInput.spouseInfo.cppStartAge}
                    minAge={60}
                    currentAge={userInput.spouseInfo.age}
                    onChange={handleSpouseCPPStartAgeChange}
                  />
                </Grid>
                
                {/* Spouse CPP Benefit Amounts */}
                {userInput.spouseInfo.isCollectingCPP ? (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={`Current CPP at Age ${userInput.spouseInfo.age}`}
                      type="number"
                      value={userInput.spouseInfo.currentCPP || 0}
                      onChange={(e) => handleSpouseFieldUpdate('currentCPP', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                      }}
                    />
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="CPP at Age 60"
                        type="number"
                        value={userInput.spouseInfo.expectedCPP.at60}
                        onChange={(e) => handleSpouseNestedUpdate('expectedCPP', 'at60', e.target.value === '' ? 0 : parseFloat(e.target.value))}
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
                        onChange={(e) => handleSpouseNestedUpdate('expectedCPP', 'at65', e.target.value === '' ? 0 : parseFloat(e.target.value))}
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
                        onChange={(e) => handleSpouseNestedUpdate('expectedCPP', 'at70', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Spouse OAS */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1">Spouse's OAS Benefits</Typography>
              
              <Grid container spacing={3}>
                {/* OAS Start Age Dropdown for Spouse */}
                <Grid item xs={12}>
                  <BenefitStartAgeSelector
                    label="Spouse's OAS Start Age"
                    isCollecting={userInput.spouseInfo.isCollectingOAS}
                    startAge={userInput.spouseInfo.oasStartAge}
                    minAge={65}
                    currentAge={userInput.spouseInfo.age}
                    onChange={handleSpouseOASStartAgeChange}
                  />
                </Grid>
                
                {/* Spouse OAS Benefit Amounts */}
                {userInput.spouseInfo.isCollectingOAS ? (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={`Current OAS at Age ${userInput.spouseInfo.age}`}
                      type="number"
                      value={userInput.spouseInfo.currentOAS || 0}
                      onChange={(e) => handleSpouseFieldUpdate('currentOAS', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                      }}
                    />
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="OAS at Age 65"
                        type="number"
                        value={userInput.spouseInfo.expectedOAS.at65}
                        onChange={(e) => handleSpouseNestedUpdate('expectedOAS', 'at65', e.target.value === '' ? 0 : parseFloat(e.target.value))}
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
                        onChange={(e) => handleSpouseNestedUpdate('expectedOAS', 'at70', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default BenefitsStep;