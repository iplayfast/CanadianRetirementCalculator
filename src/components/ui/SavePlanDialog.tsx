// src/components/ui/SavePlanDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider
} from '@mui/material';
import { UserInput } from '../../models/types';
import { savePlan, updatePlan, exportPlanToFile } from '../../services/saveLoadService';

interface SavePlanDialogProps {
  open: boolean;
  onClose: () => void;
  userInput: UserInput;
  existingPlanId?: string;
  existingPlanName?: string;
  existingPlanDescription?: string;
  isSaveAs?: boolean;
  onSaveComplete?: () => void;
}

const SavePlanDialog: React.FC<SavePlanDialogProps> = ({
  open,
  onClose,
  userInput,
  existingPlanId,
  existingPlanName = '',
  existingPlanDescription = '',
  isSaveAs = false,
  onSaveComplete
}) => {
  const [name, setName] = useState(existingPlanName);
  const [description, setDescription] = useState(existingPlanDescription);
  const [nameError, setNameError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [saveToDisk, setSaveToDisk] = useState(false);

  // Reset the form when the dialog opens
  React.useEffect(() => {
    if (open) {
      setName(existingPlanName);
      setDescription(existingPlanDescription);
      setNameError('');
      setSaveToDisk(false);
    }
  }, [open, existingPlanName, existingPlanDescription]);

  const handleSave = () => {
    // Validate plan name
    if (!name.trim()) {
      setNameError('Plan name is required');
      return;
    }

    try {
      let savedPlanId: string | undefined;
      
      // If saving to disk, export the file directly
      if (saveToDisk) {
        // Create a temporary plan object for file export
        const tempPlan = {
          id: existingPlanId || `temp-${Date.now()}`,
          name,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          planData: userInput
        };
        
        exportPlanToFile(tempPlan);
        setSuccessMessage('Plan saved to file successfully!');
      } else {
        // Save or update plan in storage
        if (existingPlanId && !isSaveAs) {
          // Update existing plan
          updatePlan(existingPlanId, name, description, userInput);
          savedPlanId = existingPlanId;
          setSuccessMessage('Plan updated successfully in browser storage!');
        } else {
          // Save as new plan
          const newPlan = savePlan(name, description, userInput);
          savedPlanId = newPlan.id;
          setSuccessMessage('Plan saved successfully to browser storage!');
        }
      }

      // Show success message
      setShowSuccessAlert(true);
      
      // Reset and close dialog
      setTimeout(() => {
        if (onSaveComplete) onSaveComplete();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving plan:', error);
      setNameError('An error occurred while saving the plan');
    }
  };

  const getDialogTitle = () => {
    if (saveToDisk) {
      return 'Export Retirement Plan to File';
    } else if (isSaveAs) {
      return 'Save Retirement Plan Copy to Browser Storage';
    } else if (existingPlanId && !isSaveAs) {
      return 'Update Retirement Plan in Browser Storage';
    } else {
      return 'Save Retirement Plan to Browser Storage';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {getDialogTitle()}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={saveToDisk}
                  onChange={(e) => setSaveToDisk(e.target.checked)}
                />
              }
              label="Save to disk as a file (recommended for permanent storage)"
            />
            
            {saveToDisk ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                This will download a file to your computer that you can use to load your plan later on any device or browser.
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Your plan will be saved in this browser's storage. It will only be available on this device and browser. 
                The data may be lost if you clear your browser data or use private browsing.
              </Typography>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <TextField
              autoFocus
              margin="dense"
              label="Plan Name"
              fullWidth
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) {
                  setNameError('');
                }
              }}
              error={!!nameError}
              helperText={nameError}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {saveToDisk ? 'Export to File' : 
             existingPlanId && !isSaveAs ? 'Update in Browser' : 
             'Save to Browser'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={showSuccessAlert} 
        autoHideDuration={3000} 
        onClose={() => setShowSuccessAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SavePlanDialog;