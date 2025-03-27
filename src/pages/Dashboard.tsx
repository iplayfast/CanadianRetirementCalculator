import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Stepper, 
  Step, 
  StepLabel,
  Button,
  ButtonGroup
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// Import save/load dialogs
import SavePlanDialog from '../components/ui/SavePlanDialog';
import LoadPlanDialog from '../components/ui/LoadPlanDialog';

// Import service and types
import { SavedPlan } from '../services/saveLoadService';
import { UserInput } from '../models/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  
  // Mock user input for saving functionality from dashboard
  const mockUserInput: UserInput = {
    age: 35,
    retirementAge: 65,
    lifeExpectancy: 90,
    hasSpouse: false,
    currentRSP: 50000,
    currentTFSA: 25000,
    currentOtherInvestments: 30000,
    employmentIncome: 85000,
    otherIncome: [],
    expectedCPP: {
      at60: 700,
      at65: 1000,
      at70: 1400,
    },
    expectedOAS: {
      at65: 600,
      at70: 800,
    },
    currentAnnualExpenses: 60000,
    retirementAnnualExpenses: 48000,
    inflationRate: 2.0,
    rspGrowthRate: 5.0,
    tfsaGrowthRate: 5.0,
    otherInvestmentsGrowthRate: 5.0,
  };

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
  };

  const handleLoadClick = () => {
    setLoadDialogOpen(true);
  };
  
  const handlePlanLoad = (plan: SavedPlan) => {
    // Navigate to input form with loaded plan
    navigate('/input', { state: { userInput: plan.planData } });
  };

  const handlePlanEdit = (plan: SavedPlan) => {
    // Navigate to input form with loaded plan (same behavior for now)
    navigate('/input', { state: { userInput: plan.planData } });
  };

  const steps = ['Personal Information', 'Current Savings', 'Income Sources', 'Expenses', 'Review'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Canadian Retirement Planner
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
          Plan your retirement with our comprehensive calculator that follows Canadian tax rules
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Your Retirement Planning Journey
          </Typography>
          <Typography paragraph>
            This retirement planner helps you create a personalized retirement strategy following Canadian tax rules and optimizing your savings across different account types.
          </Typography>
          <Typography paragraph>
            Our planner follows these priorities:
          </Typography>
          <Typography component="div">
            <ul>
              <li>Pay expenses first before any contributions</li>
              <li>Optimize contributions: RSP (up to $25,000) → TFSA (up to $5,000) → Other Investments</li>
              <li>Optimize withdrawals to minimize taxes</li>
              <li>Account for government benefits (CPP and OAS) at optimal claiming ages</li>
              <li>Support for couples planning retirement together</li>
            </ul>
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              href="/input"
              startIcon={<SaveIcon />}
            >
              Start New Plan
            </Button>
            
            <ButtonGroup variant="outlined" color="primary" sx={{ mt: 2 }}>
              <Button 
                onClick={handleSaveClick}
                startIcon={<SaveIcon />}
              >
                Save Current Plan
              </Button>
              <Button 
                onClick={handleLoadClick}
                startIcon={<FolderOpenIcon />}
              >
                Load Saved Plan
              </Button>
            </ButtonGroup>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            How It Works
          </Typography>
          <Stepper activeStep={-1} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Typography paragraph>
            Our retirement planner takes into account:
          </Typography>
          <Typography component="div">
            <ul>
              <li>Canadian income tax rates and capital gains tax rules</li>
              <li>RRSP and TFSA contribution limits and rules</li>
              <li>CPP and OAS benefits and optimal claiming strategies</li>
              <li>Inflation adjustments for expenses and income</li>
              <li>Different growth rates for each investment type</li>
              <li>Spouse information for household retirement planning</li>
            </ul>
          </Typography>
        </Paper>
      </Box>
      
      {/* Save/Load Dialogs */}
      <SavePlanDialog 
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        userInput={mockUserInput}
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

export default Dashboard;
