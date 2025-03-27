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
import ExtraIncomeStep from '../components/forms/InputForm/ExtraIncomeStep'; // New component
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
      // Ensure the loaded data has all the required fields
      const loadedInput = {
        ...initialUserInput,
        ...location.state.userInput,
        // Add any missing fields that might not be in older saved plans
        extraIncomeStreams: location.state.userInput.extraIncomeStreams || [],
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
  
  // Updated steps with new ExtraIncomeStep
  const steps = [
    'Personal Information',
    'Spouse Information',
    'Government Benefits',
    'Extra Income',  // New step
    'Growth Rates',
    'Review'
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Submit form and navigate to results
      navigate('/results', { state: { userInput } });
    } else {
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
      loadedInput.spouseInfo = {
        ...loadedInput.spouseInfo,
        extraIncomeStreams: loadedInput.spouseInfo.extraIncomeStreams || [],
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