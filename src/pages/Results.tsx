import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserInput, RetirementPlan } from '../models/types';
import { useRetirementCalculator, useUserInputFromLocation } from '../hooks/useRetirementCalculator';
import { 
  RetirementCharts,
  NetWorthChart,
  AccountBalancesChart,
  IncomeVsExpensesChart,
  IncomeSourcesChart,
  TaxAnalysisChart
} from '../components/charts/RetirementCharts';
import { generateOptimizedRetirementPlan } from '../services/retirementOptimizer';
import YearlyBreakdown from '../components/charts/YearlyBreakdown';
import NarrativeBreakdown from '../components/charts/NarrativeBreakdown';
import StrategyDescription from '../components/ui/StrategyDescription';
import { OPTIMIZATION_STRATEGIES } from '../constants/optimizationStrategies';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const userInput = useUserInputFromLocation();
  const { retirementPlan: initialPlan, isLoading: initialLoading, error: initialError } = useRetirementCalculator(userInput);
  
  const [tabValue, setTabValue] = useState(0);
  const [optimizationStrategy, setOptimizationStrategy] = useState('default');
  const [retirementPlan, setRetirementPlan] = useState<RetirementPlan | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationMessage, setOptimizationMessage] = useState('');

  useEffect(() => {
    if (initialPlan) {
      setRetirementPlan(initialPlan);
    }
  }, [initialPlan]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOptimizationChange = async (event: SelectChangeEvent<string>) => {
    const strategy = event.target.value;
    setOptimizationStrategy(strategy);
    
    if (!userInput) return;
    
    // Only optimize if not using default strategy
    if (strategy !== 'default') {
      setIsOptimizing(true);
      setOptimizationMessage(`Optimizing for ${OPTIMIZATION_STRATEGIES.find(s => s.value === strategy)?.label}...`);
      
      try {
        // Small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Generate optimized plan based on selected strategy
        const optimizedPlan = await generateOptimizedPlanForStrategy(userInput, strategy);
        setRetirementPlan(optimizedPlan);
        
        // Special message for the spend-it-all strategy
        if (strategy === 'spend-it-all' && optimizedPlan.summary.annualFunMoney) {
          setOptimizationMessage(
            `Plan optimized to provide an extra $${Math.round(optimizedPlan.summary.annualFunMoney).toLocaleString()} per year in discretionary spending during retirement.`
          );
        } else {
          setOptimizationMessage(`Plan optimized for ${OPTIMIZATION_STRATEGIES.find(s => s.value === strategy)?.label}`);
        }
      } catch (error) {
        console.error('Optimization error:', error);
        setOptimizationMessage('Error during optimization. Using default plan.');
        // Revert to default plan
        if (initialPlan) {
          setRetirementPlan(initialPlan);
        }
      } finally {
        setIsOptimizing(false);
      }
    } else {
      // Reset to initial plan
      if (initialPlan) {
        setRetirementPlan(initialPlan);
        setOptimizationMessage('');
      }
    }
  };

  // Function to generate optimized plan based on selected strategy
  const generateOptimizedPlanForStrategy = async (input: UserInput, strategy: string): Promise<RetirementPlan> => {
    // Create a deep copy of user input to avoid modifying the original
    const inputCopy = JSON.parse(JSON.stringify(input)) as UserInput;
    
    switch (strategy) {
      case 'lowest-tax':
        // Modify input to optimize for lowest total tax
        return generateOptimizedRetirementPlan(inputCopy, { 
          optimizeFor: 'lowest-tax',
        });
      
      case 'max-end-worth':
        // Modify input to optimize for maximum end net worth
        return generateOptimizedRetirementPlan(inputCopy, {
          optimizeFor: 'max-end-worth',
        });
      
      case 'spend-it-all':
        // New strategy to optimize for maximum enjoyment while ending with near-zero
        return generateOptimizedRetirementPlan(inputCopy, {
          optimizeFor: 'spend-it-all',
        });
      
      case 'balanced':
        // Optimize for a balance of tax efficiency and end net worth
        return generateOptimizedRetirementPlan(inputCopy, {
          optimizeFor: 'balanced',
        });
      
      default:
        // Return the original plan
        if (initialPlan) return initialPlan;
        return generateOptimizedRetirementPlan(inputCopy);
    }
  };

  if (!userInput) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            No Input Data
          </Typography>
          <Typography paragraph align="center">
            Please go back and enter your retirement planning information.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/input')}
            >
              Go to Input Form
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (initialLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5">Calculating Your Retirement Plan...</Typography>
        </Box>
      </Container>
    );
  }

  if (initialError) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>{initialError}</Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/input')}
          >
            Back to Input Form
          </Button>
        </Box>
      </Container>
    );
  }

  if (!retirementPlan) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>Unable to generate retirement plan. Please try again.</Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/input')}
          >
            Back to Input Form
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Your Retirement Plan Results
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          {/* Optimization Strategy Selector */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Optimization Strategy
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="optimization-strategy-label">Optimize For</InputLabel>
                  <Select
                    labelId="optimization-strategy-label"
                    id="optimization-strategy"
                    value={optimizationStrategy}
                    label="Optimize For"
                    onChange={handleOptimizationChange}
                    disabled={isOptimizing}
                  >
                    {OPTIMIZATION_STRATEGIES.map((strategy) => (
                      <MenuItem key={strategy.value} value={strategy.value}>
                        {strategy.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                {isOptimizing ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography>Optimizing plan...</Typography>
                  </Box>
                ) : (
                  optimizationMessage && (
                    <Alert severity="info">{optimizationMessage}</Alert>
                  )
                )}
              </Grid>
            </Grid>
            
            {/* Strategy Description */}            
            <StrategyDescription strategyValue={optimizationStrategy} userInput={userInput} />
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" gutterBottom>
            Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: retirementPlan.summary.successfulRetirement ? 'success.light' : 'error.light', 
                color: retirementPlan.summary.successfulRetirement ? 'success.contrastText' : 'error.contrastText' 
              }}>
                <Typography variant="h6" gutterBottom>
                  Retirement Status
                </Typography>
                <Typography variant="h4">
                  {retirementPlan.summary.successfulRetirement ? 'On Track' : 'Needs Attention'}
                </Typography>
                <Typography variant="body2">
                  {retirementPlan.summary.successfulRetirement 
                    ? 'Based on your inputs, your retirement plan is projected to be successful.'
                    : 'Your current plan may not sustain you through retirement. Consider adjusting your strategy.'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">Years in Retirement: {retirementPlan.summary.yearsOfRetirement}</Typography>
                <Typography variant="subtitle1">Final Net Worth: ${Math.round(retirementPlan.summary.finalNetWorth).toLocaleString()}</Typography>
                <Typography variant="subtitle1">Total Income Tax Paid: ${Math.round(retirementPlan.summary.totalIncomeTaxPaid).toLocaleString()}</Typography>
                <Typography variant="subtitle1">Total Capital Gains Tax Paid: ${Math.round(retirementPlan.summary.totalCapitalGainsTaxPaid).toLocaleString()}</Typography>
              </Paper>
            </Grid>            
            {/* Display Fun Money information if available */}
             {retirementPlan.summary.annualFunMoney >0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: 'success.light', 
                  color: 'success.contrastText' 
                }}>
                  <Typography variant="h6" gutterBottom>
                    Discretionary Spending
                  </Typography>
                  <Typography variant="h4">
                    ${Math.round(retirementPlan.summary.annualFunMoney).toLocaleString()}/year
                  </Typography>
                  <Typography variant="body1">
                    Extra money you can spend each year during retirement while still covering your basic needs.
                  </Typography>
                  {retirementPlan.summary.totalLifetimeFunMoney && (
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                      Total lifetime: ${Math.round(retirementPlan.summary.totalLifetimeFunMoney).toLocaleString()}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Paper>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="retirement plan tabs">
              <Tab label="Net Worth" />
              <Tab label="Account Balances" />
              <Tab label="Income vs. Expenses" />
              <Tab label="Income Sources" />
              <Tab label="Tax Analysis" />
              <Tab label="Yearly Breakdown" />
              <Tab label="Narrative View" />
            </Tabs>
          </Box>
          
          {tabValue === 0 && <NetWorthChart retirementPlan={retirementPlan} />}
          {tabValue === 1 && <AccountBalancesChart retirementPlan={retirementPlan} />}
          {tabValue === 2 && <IncomeVsExpensesChart retirementPlan={retirementPlan} />}
          {tabValue === 3 && <IncomeSourcesChart retirementPlan={retirementPlan} />}
          {tabValue === 4 && <TaxAnalysisChart retirementPlan={retirementPlan} />}
          {tabValue === 5 && <YearlyBreakdown retirementPlan={retirementPlan} />}
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Back to Input
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Start Over
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Results;