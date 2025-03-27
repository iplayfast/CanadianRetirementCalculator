import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { UserInput } from '../models/types';
import SavePlanDialog from './ui/SavePlanDialog';

interface SaveButtonProps {
  userInput: UserInput;
  buttonText?: string;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  fullWidth?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ 
  userInput, 
  buttonText = 'Save Plan',
  variant = 'contained',
  color = 'primary',
  fullWidth = false
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      <Button
        variant={variant}
        color={color}
        startIcon={<SaveIcon />}
        onClick={() => setDialogOpen(true)}
        fullWidth={fullWidth}
      >
        {buttonText}
      </Button>
      
      <SavePlanDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        userInput={userInput}
        onSaveComplete={() => {
          console.log('Plan saved successfully');
        }}
      />
    </Box>
  );
};

export default SaveButton;
