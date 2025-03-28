// src/pages/InputForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  ButtonGroup,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// Import step components
import PersonalInfoStep from '../components/forms/InputForm/PersonalInfoStep';
import SpouseInfoStep from '../components/forms/InputForm/SpouseInfoStep';
import BenefitsStep from '../components/forms/InputForm/BenefitsStep';
import ExtraIncomeStep from '../components/forms/InputForm/ExtraIncomeStep';
import RatesStep from '../components/forms/InputForm/RatesStep';
import ReviewStep from '../components/forms/InputForm/ReviewStep';

// Import save/load dialogs
import SavePlanDialog from '../components/ui/SavePlanDialog';
import LoadPlanDialog from '../components/ui/LoadPlanDialog';

// Import types and services
import { UserInput, ExtraIncomeStream } from '../models/types';
import { SavedPlan } from '../services/saveLoadService';

// Initial form state - updated to include new fields
const initialUserInput: UserInput = {
  // Personal Information
  name: '',
  age: 30,
  retirementAge: 65,
  lifeExpectancy: 90,
  province: 'ON', // Default to Ontario
  
  // Spouse Information
  hasSpouse: false,
  spouseInfo: undefined,
  
  // Current Savings
  currentRSP: 0,
  currentTFSA: 0,
  currentOtherInvestments: 0,
  // Contribution Room
  rrspRoom: 0,
  tfsaRoom: 0,
  // Income Sources
  employmentIncome: 0,
  otherIncome: [],
  extraIncomeStreams: [], // New field
  
  // Government Benefits
  expectedCPP: {
    at60: 0,
    at65: 0,
    at70: 0,
  },
  expectedOAS: {
    at65: 0,
    at70: 0,
  },
  
  cppStartAge: 65,   // Default to standard retirement age
  oasStartAge: 65,   // Default to standard retirement age
  currentCPP: 0,
  currentOAS: 0,
  // New government benefit status flags
  isCollectingCPP: false,
  isCollectingOAS: false,
  
  // Expenses
  currentAnnualExpenses: 0,
  retirementAnnualExpenses: 0,
  
  // Growth and Inflation Rates
  inflationRate: 2.0,
  rspGrowthRate: 5.0,
  tfsaGrowthRate: 5.0,
  otherInvestmentsGrowthRate: 5.0,
};

const InputForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [userInput, setUserInput] = useState<UserInput>(initialUserInput);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>(undefined);
  const [currentPlanName, setCurrentPlanName] = useState<string>('');
  const [currentPlanDescription, setCurrentPlanDescription] = useState<string>('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Load user input from location state if available
  useEffect(() => {
    if (location.state?.userInput) {
      let startage = 65;
      if (userInput.age > startage)
        startage = userInput.age;

      // Ensure the loaded data has all the required fields
      const loadedInput = {
        ...initialUserInput,
        ...location.state.userInput,
        // Add any missing fields that might not be in older saved plans
        extraIncomeStreams: location.state.userInput.extraIncomeStreams || [],
        cppStartAge: location.state.userInput.cppStartAge || startage,
        oasStartAge: location.state.userInput.oasStartAge || startage,
        isCollectingCPP: location.state.userInput.isCollectingCPP || false,
        isCollectingOAS: location.state.userInput.isCollectingOAS || false
      };
      
      // If there's a spouse, ensure their data has all required fields too
      if (loadedInput.hasSpouse && loadedInput.spouseInfo) {
        loadedInput.spouseInfo = {
          ...loadedInput.spouseInfo,
          extraIncomeStreams: loadedInput.spouseInfo.extraIncomeStreams || [],
          isCollectingCPP: loadedInput.spouseInfo.isCollectingCPP || false,
          isCollectingOAS: loadedInput.spouseInfo.isCollectingOAS || false
        };
      }
      
      setUserInput(loadedInput);
    }
  }, [location.state]);
  
  useEffect(() => {
  // Check if we're coming back from Results page with a specific step
    if (location.state?.activeStep === 5) {
      setActiveStep(5);
    }
  }, [location.state]);
  
  // Updated steps with new ExtraIncomeStep
  const steps = [
    'Personal Information',
    'Spouse Information',
    'Government Benefits',
    'Extra Income',  // New step
    'Growth Rates',
    'Review'
  ];

  // Helper function to decide if a benefit should be added
  const shouldAddBenefit = (startAge?: number, isCollecting?: boolean): boolean => {
    // If currently collecting, definitely add
    if (isCollecting) {
      return true;
    }
    
    // If start age is defined (not undefined) and not "do not qualify", add
    if (startAge !== undefined) {
      return true;
    }
    
    // Otherwise, don't add
    return false;
  };

  // Helper function to remove all government benefit streams
  const removeGovBenefitStreams = (streams: ExtraIncomeStream[]): ExtraIncomeStream[] => {
    // IDs for government benefit streams
    const govBenefitIds = [
      'primary_cpp_benefit', 'primary_oas_benefit', 
      'spouse_cpp_benefit', 'spouse_oas_benefit',
      // Legacy IDs
      'cpp_benefit', 'oas_benefit'
    ];
    
    // Filter out government benefit streams
    const filteredStreams = streams.filter(stream => !govBenefitIds.includes(stream.id));
    
    console.log(`Removed ${streams.length - filteredStreams.length} government benefit streams`);
    return filteredStreams;
  };

  // Function to create a benefit stream
  const createGovBenefitStream = (
    id: string,
    description: string,
    amount: number,
    startYear: number,
    hasInflation: boolean = true
  ): ExtraIncomeStream | null => {
    // Only create stream if amount is positive
    if (amount <= 0) {
      console.log(`Not adding ${description} - amount is ${amount}`);
      return null;
    }
    
    const stream: ExtraIncomeStream = {
      id,
      description,
      yearlyAmount: amount * 12, // Convert monthly to yearly
      startYear,
      endYear: undefined, // Government benefits continue until death
      hasInflation
    };
    
    console.log(`Created benefit stream: ${id} - ${description}, $${stream.yearlyAmount}/year starting ${startYear}`);
    return stream;
  };

  // Calculate the benefit amount based on age and collecting status
  const calculateBenefitAmount = (
    isCollecting: boolean,
    currentAmount: number,
    startAge?: number,
    expectedAmounts?: { at60?: number, at65: number, at70?: number }
  ): number => {
    // If currently collecting, use current amount
    if (isCollecting) {
      return currentAmount;
    }
    
    // If no start age or no expected amounts, return 0
    if (startAge === undefined || !expectedAmounts) {
      return 0;
    }
    
    // Return amount based on start age
    if (startAge === 60 && expectedAmounts.at60 !== undefined) {
      return expectedAmounts.at60;
    } else if (startAge === 65) {
      return expectedAmounts.at65;
    } else if (startAge === 70 && expectedAmounts.at70 !== undefined) {
      return expectedAmounts.at70;
    } else if (startAge < 65 && expectedAmounts.at60 !== undefined) {
      // Interpolate between 60 and 65
      const ratio = (startAge - 60) / 5;
      return expectedAmounts.at60 + (expectedAmounts.at65 - expectedAmounts.at60) * ratio;
    } else if (startAge > 65 && expectedAmounts.at70 !== undefined) {
      // Interpolate between 65 and 70
      const ratio = (startAge - 65) / 5;
      return expectedAmounts.at65 + (expectedAmounts.at70 - expectedAmounts.at65) * ratio;
    }
    
    // Default fallback to age 65 amount
    return expectedAmounts.at65;
  };

  // Calculate the start year for a benefit
  const calculateStartYear = (
    isCollecting: boolean,
    currentAge: number,
    startAge?: number
  ): number => {
    const currentYear = new Date().getFullYear();
    
    // If currently collecting, start in current year
    if (isCollecting) {
      return currentYear;
    }
    
    // If no start age, return undefined (shouldn't happen due to prior checks)
    if (startAge === undefined) {
      console.warn("Warning: Attempting to calculate start year with undefined start age");
      return currentYear;
    }
    
    // Calculate years until start age
    const yearsUntilStartAge = startAge - currentAge;
    // Only return future year if start age is in the future
  return yearsUntilStartAge > 0 
    ? currentYear + yearsUntilStartAge 
    : currentYear + (startAge - currentAge);
    
    
  };

  // Create primary person's CPP stream
  const createPrimaryCppStream = (input: UserInput): ExtraIncomeStream | null => {
    const primaryName = input.name || 'Primary';
    
    // Calculate benefit amount
    const amount = calculateBenefitAmount(
      input.isCollectingCPP,
      input.currentCPP || 0,
      input.cppStartAge,
      input.expectedCPP
    );
    
    // Calculate start year
    const startYear = calculateStartYear(
      input.isCollectingCPP,
      input.age,
      input.cppStartAge
    );
    
    // Create stream
    return createGovBenefitStream(
      'primary_cpp_benefit',
      `${primaryName}'s CPP Benefit`,
      amount,
      startYear
    );
  };

  // Create primary person's OAS stream
  const createPrimaryOasStream = (input: UserInput): ExtraIncomeStream | null => {
    const primaryName = input.name || 'Primary';
    
    // Calculate benefit amount
    const amount = calculateBenefitAmount(
      input.isCollectingOAS,
      input.currentOAS || 0,
      input.oasStartAge,
      input.expectedOAS
    );
    
    // Calculate start year
    const startYear = calculateStartYear(
      input.isCollectingOAS,
      input.age,
      input.oasStartAge
    );
    
    // Create stream
    return createGovBenefitStream(
      'primary_oas_benefit',
      `${primaryName}'s OAS Benefit`,
      amount,
      startYear
    );
  };

  // Create spouse's CPP stream
  const createSpouseCppStream = (input: UserInput): ExtraIncomeStream | null => {
    // Safety check
    if (!input.hasSpouse || !input.spouseInfo) {
      return null;
    }
    
    const spouse = input.spouseInfo;
    const spouseName = spouse.name ? `${spouse.name}'s` : "Spouse's";
    
    // Calculate benefit amount
    const amount = calculateBenefitAmount(
      spouse.isCollectingCPP,
      spouse.currentCPP || 0,
      spouse.cppStartAge,
      spouse.expectedCPP
    );
    
    // Calculate start year
    const startYear = calculateStartYear(
      spouse.isCollectingCPP,
      spouse.age,
      spouse.cppStartAge
    );
    
    // Create stream
    return createGovBenefitStream(
      'spouse_cpp_benefit',
      `${spouseName} CPP Benefit`,
      amount,
      startYear
    );
  };

  // Create spouse's OAS stream
  const createSpouseOasStream = (input: UserInput): ExtraIncomeStream | null => {
    // Safety check
    if (!input.hasSpouse || !input.spouseInfo) {
      return null;
    }
    
    const spouse = input.spouseInfo;
    const spouseName = spouse.name ? `${spouse.name}'s` : "Spouse's";
    
    // Calculate benefit amount
    const amount = calculateBenefitAmount(
      spouse.isCollectingOAS,
      spouse.currentOAS || 0,
      spouse.oasStartAge,
      spouse.expectedOAS
    );
    
    // Calculate start year
    const startYear = calculateStartYear(
      spouse.isCollectingOAS,
      spouse.age,
      spouse.oasStartAge
    );
    
    // Create stream
    return createGovBenefitStream(
      'spouse_oas_benefit',
      `${spouseName} OAS Benefit`,
      amount,
      startYear
    );
  };

  // Debug function to log the final streams
  const logStreamsDebugInfo = (streams: ExtraIncomeStream[]): void => {
    console.log("Final extra income streams:");
    streams.forEach((stream, index) => {
      console.log(`${index + 1}. ${stream.id}: ${stream.description}, $${stream.yearlyAmount}/year starting ${stream.startYear}`);
    });
    
    // Check for duplicates
    const ids = {};
    let hasDuplicates = false;
    streams.forEach(stream => {
      if (ids[stream.id]) {
        console.error(`DUPLICATE ID FOUND: ${stream.id}`);
        hasDuplicates = true;
      }
      ids[stream.id] = true;
    });
    
    if (hasDuplicates) {
      console.error("WARNING: Duplicate IDs found in the final streams array!");
    } else {
      console.log("No duplicate IDs found - array looks good");
    }
  };

// Function for InputForm.tsx - Keep primary and spouse benefit streams separate

// Main function that coordinates the update of government benefits
const updateGovBenefitsAsIncomeStreams = () => {
  console.log("==== UPDATING GOVERNMENT BENEFITS ====");
  
  // Get a copy of the current income streams excluding government benefits
  let primaryStreams = removeGovBenefitStreams(userInput.extraIncomeStreams);
  
  // Process primary person's CPP
  if (shouldAddBenefit(userInput.cppStartAge, userInput.isCollectingCPP)) {
    const primaryCppStream = createPrimaryCppStream(userInput);
    if (primaryCppStream) {
      primaryStreams.push(primaryCppStream);
    }
  }
  
  // Process primary person's OAS
  if (shouldAddBenefit(userInput.oasStartAge, userInput.isCollectingOAS)) {
    const primaryOasStream = createPrimaryOasStream(userInput);
    if (primaryOasStream) {
      primaryStreams.push(primaryOasStream);
    }
  }
  
  // Update the primary person's income streams
  let updatedUserInput = {
    ...userInput,
    extraIncomeStreams: primaryStreams
  };
  
  // Process spouse benefits if applicable
  if (userInput.hasSpouse && userInput.spouseInfo) {
    // Start with the spouse's existing non-government benefit streams
    let spouseStreams = userInput.spouseInfo.extraIncomeStreams 
      ? removeGovBenefitStreams(userInput.spouseInfo.extraIncomeStreams) 
      : [];
      
    // Process spouse CPP
    if (shouldAddBenefit(userInput.spouseInfo.cppStartAge, userInput.spouseInfo.isCollectingCPP)) {
      const spouseCppStream = createSpouseCppStream(userInput);
      if (spouseCppStream) {
        spouseStreams.push(spouseCppStream);
      }
    }
    
    // Process spouse OAS
    if (shouldAddBenefit(userInput.spouseInfo.oasStartAge, userInput.spouseInfo.isCollectingOAS)) {
      const spouseOasStream = createSpouseOasStream(userInput);
      if (spouseOasStream) {
        spouseStreams.push(spouseOasStream);
      }
    }
    
    // Update spouse's income streams separately
    updatedUserInput = {
      ...updatedUserInput,
      spouseInfo: {
        ...updatedUserInput.spouseInfo!,
        extraIncomeStreams: spouseStreams
      }
    };
  }
  
  // Debug summary
  console.log("Primary person's income streams:", updatedUserInput.extraIncomeStreams);
  if (updatedUserInput.spouseInfo) {
    console.log("Spouse's income streams:", updatedUserInput.spouseInfo.extraIncomeStreams);
  }
  
  // Update the input with the finalized data
  setUserInput(updatedUserInput);
  
  console.log("==== GOVERNMENT BENEFITS UPDATE COMPLETE ====");
};


  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Submit form and navigate to results
      navigate('/results', { state: { userInput } });
    } else {
      // If moving from Benefits step (2) to Extra Income step (3)
      if (activeStep === 2) {
        // Add or update government benefits as income streams
        updateGovBenefitsAsIncomeStreams();
      }
      
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handler for updating the form data
  const handleInputChange = (field: keyof UserInput, value: any) => {
    setUserInput({
      ...userInput,
      [field]: value
    });
  };

  // Handler for nested fields
  const handleNestedInputChange = (parent: keyof UserInput, field: string, value: any) => {
    setUserInput({
      ...userInput,
      [parent]: {
        ...userInput[parent] as any,
        [field]: value
      }
    });
  };

  // Save/Load handlers
  const handleSaveClick = () => {
    setSaveAsMode(false);
    setSaveDialogOpen(true);
  };

  const handleSaveAsClick = () => {
    setSaveAsMode(true);
    setSaveDialogOpen(true);
  };

  const handleLoadClick = () => {
    setLoadDialogOpen(true);
  };

  const handlePlanLoad = (plan: SavedPlan) => {
    // Similar to the useEffect above, ensure all required fields are present
    const loadedInput = {
      ...initialUserInput,
      ...plan.planData,
      extraIncomeStreams: plan.planData.extraIncomeStreams || [],
      isCollectingCPP: plan.planData.isCollectingCPP || false,
      isCollectingOAS: plan.planData.isCollectingOAS || false
    };
    
    if (loadedInput.hasSpouse && loadedInput.spouseInfo) {
      let startage = 65;
      if (loadedInput.spouseInfo.age > startage)
        startage = loadedInput.spouseInfo.age;
      loadedInput.spouseInfo = {
        ...loadedInput.spouseInfo,
        extraIncomeStreams: loadedInput.spouseInfo.extraIncomeStreams || [],
        cppStartAge: loadedInput.spouseInfo.cppStartAge || startage,
        oasStartAge: loadedInput.spouseInfo.oasStartAge || startage,
        isCollectingCPP: loadedInput.spouseInfo.isCollectingCPP || false,
        isCollectingOAS: loadedInput.spouseInfo.isCollectingOAS || false
      };
    }
    
    setUserInput(loadedInput);
    setCurrentPlanId(plan.id);
    setCurrentPlanName(plan.name);
    setCurrentPlanDescription(plan.description);
  };

  const handlePlanEdit = (plan: SavedPlan) => {
    handlePlanLoad(plan);
    setSaveAsMode(false);
    setSaveDialogOpen(true);
  };

  // Render current step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PersonalInfoStep 
            userInput={userInput} 
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        );
      case 1:
        return (
          <SpouseInfoStep 
            userInput={userInput} 
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        );
      case 2:
        return (
          <BenefitsStep 
            userInput={userInput} 
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        );
      case 3:
        return (
          <ExtraIncomeStep 
            userInput={userInput} 
            onInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <RatesStep 
            userInput={userInput} 
            onInputChange={handleInputChange} 
          />
        );
      case 5:
        return (
          <ReviewStep 
            userInput={userInput} 
          />
        );
      default:
        return null;
    }
  };

  // Calculate step title to display
  const getStepTitle = (step: number): string => {
    switch (step) {
      case 0:
        return 'Enter Your Personal Information';
      case 1:
        return 'Enter Spouse Information (Optional)';
      case 2:
        return 'Government Benefits';
      case 3:
        return 'Extra Income Streams';
      case 4:
        return 'Growth and Inflation Rates';
      case 5:
        return 'Review Your Information';
      default:
        return 'Complete Your Retirement Plan';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Canadian Retirement Planner
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
          Enter your information to create your personalized retirement plan
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {getStepTitle(activeStep)}
            </Typography>
            
            <ButtonGroup variant="outlined">
              <Button
                onClick={handleSaveClick}
                startIcon={<SaveIcon />}
              >
                Save Plan
              </Button>
              
              {currentPlanId && (
                <Button
                  onClick={handleSaveAsClick}
                  startIcon={<SaveAsIcon />}
                >
                  Save As
                </Button>
              )}
              
              <Button
                onClick={handleLoadClick}
                startIcon={<FolderOpenIcon />}
              >
                Load Plan
              </Button>
            </ButtonGroup>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleNext}
            >
              {activeStep === steps.length - 1 ? 'Calculate Plan' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Box>
      
      {/* Save/Load Dialogs */}
      <SavePlanDialog 
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        userInput={userInput}
        existingPlanId={saveAsMode ? undefined : currentPlanId}
        existingPlanName={currentPlanName}
        existingPlanDescription={currentPlanDescription}
        isSaveAs={saveAsMode}
        onSaveComplete={() => {
          // Show success message or notification if needed
        }}
      />
      
      <LoadPlanDialog
        open={loadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
        onPlanLoad={handlePlanLoad}
        onPlanEdit={handlePlanEdit}
      />
    </Container>
  );
};

export default InputForm;