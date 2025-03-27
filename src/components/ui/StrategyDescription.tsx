// src/components/ui/StrategyDescription.tsx
import React, { useState } from 'react';
import { getStrategyInfo } from '../../constants/optimizationStrategies';
import HintBox from './HintBox';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { UserInput } from '../../models/types';
import { TAX_CONSTANTS } from '../../constants/taxConstants';
import { Typography, Box, Button, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface StrategyDescriptionProps {
  strategyValue: string;
  userInput?: UserInput;
}

/**
 * Component to display the description of the selected optimization strategy
 * Uses the reusable HintBox component
 */
const StrategyDescription: React.FC<StrategyDescriptionProps> = ({ strategyValue, userInput }) => {
  const [showDescription, setShowDescription] = useState(false);
  const strategy = getStrategyInfo(strategyValue);

  if (!strategy) {
    return null;
  }

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  // For default plan, provide a more detailed description with user-specific values
  const getDescriptionContent = () => {
    if (strategyValue === 'default' && userInput) {
      const rrspLimit = TAX_CONSTANTS.RRSP_CONTRIBUTION_LIMIT.toLocaleString();
      const tfsaLimit = TAX_CONSTANTS.TFSA_CONTRIBUTION_LIMIT.toLocaleString();
      
      // Create formatted JSX content instead of a string
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Default Plan Rules</Typography>
          
          <Typography variant="subtitle1" gutterBottom>1. Expenses First Approach:</Typography>
          <Typography variant="body2" paragraph>
            • All income is first applied to cover expenses before any contributions are made to savings accounts.<br/>
            • This ensures basic living needs are met before saving for the future.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>2. Contribution Order (when income exceeds expenses):</Typography>
          <Typography variant="body2" paragraph>
            • RSP (Registered Savings Plan) contributions up to available room, which is:<br/>
            &nbsp;&nbsp;- Initially based on your provided RRSP room of ${userInput.rrspRoom.toLocaleString()}<br/>
            &nbsp;&nbsp;- In subsequent years, 18% of previous year's income up to the annual maximum (${rrspLimit} for 2025)<br/>
            &nbsp;&nbsp;- Unused contribution room carries forward<br/>
            • TFSA (Tax-Free Savings Account) contributions up to available room (${tfsaLimit} annually for 2025)<br/>
            • Other Investments for any remaining excess income
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>3. Withdrawal Strategy During Retirement:</Typography>
          <Typography variant="body2" paragraph>
            • Minimum required RRIF (Registered Retirement Income Fund) withdrawals are taken first (mandatory once RSP converts to RRIF at age 71)<br/>
            • For additional withdrawals, a balanced approach is used, considering:<br/>
            &nbsp;&nbsp;- Tax efficiency (withdrawing from accounts with lower tax impact first)<br/>
            &nbsp;&nbsp;- Preservation of tax-advantaged accounts<br/>
            &nbsp;&nbsp;- Proportional withdrawals based on account balances
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>4. Government Benefits:</Typography>
          <Typography variant="body2" paragraph>
            • CPP (Canada Pension Plan) starts by default at age 65 (standard retirement age)<br/>
            • OAS (Old Age Security) starts by default at age 65<br/>
            • Benefits are subject to clawbacks based on income levels (particularly OAS)
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>5. Growth Assumptions:</Typography>
          <Typography variant="body2" paragraph>
            • Each account type grows based on your specified rates (RSP: {userInput.rspGrowthRate}%, TFSA: {userInput.tfsaGrowthRate}%, Other Investments: {userInput.otherInvestmentsGrowthRate}%)<br/>
            • Inflation adjustment of {userInput.inflationRate}% applied to expenses and eligible income streams<br/>
            • RRIF minimum withdrawal rates increase with age according to Canadian regulations
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>6. Tax Considerations:</Typography>
          <Typography variant="body2" paragraph>
            • Income tax is calculated based on federal and provincial tax brackets for {userInput.province}<br/>
            • Capital gains tax applied to withdrawals from non-registered accounts (using 50% inclusion rate)<br/>
            • RSP/RRIF withdrawals are fully taxable as income<br/>
            • TFSA withdrawals are tax-free
          </Typography>
        </Box>
      );
    } else {
      // For other strategies, return the standard description
      return (
        <Typography variant="body2">
          {strategy.description}
        </Typography>
      );
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button 
        variant="outlined"
        onClick={toggleDescription}
        startIcon={showDescription ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ mb: 1 }}
      >
        {showDescription ? "Hide Details" : `Show Details about ${strategy.label}`}
      </Button>
      
      <Collapse in={showDescription}>
        <HintBox 
          text={getDescriptionContent()}
          title={`About ${strategy.label}`}
          variant="bordered"
          icon={<InfoOutlinedIcon color="primary" />}
        />
      </Collapse>
    </Box>
  );
};

export default StrategyDescription;