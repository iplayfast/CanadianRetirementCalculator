import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Alert,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  StorageType, 
  getStoragePreference, 
  setStoragePreference,
  migratePlans, 
  getSavedPlans
} from '../../services/storageProviders';

interface StorageSettingsProps {
  open: boolean;
  onClose: () => void;
}

const StorageSettings: React.FC<StorageSettingsProps> = ({
  open,
  onClose
}) => {
  const [storageType, setStorageType] = useState<StorageType>(getStoragePreference());
  const [planCount, setPlanCount] = useState<number>(0);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [migrationSuccess, setMigrationSuccess] = useState<boolean | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  
  // Get the current plan count when component mounts
  useEffect(() => {
    if (open) {
      updatePlanCount();
    }
  }, [open]);
  
  const updatePlanCount = async () => {
    const plans = await getSavedPlans();
    setPlanCount(plans.length);
  };
  
  const handleStorageTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStorageType(event.target.value as StorageType);
  };
  
  const handleSave = async () => {
    try {
      const previousType = getStoragePreference();
      
      // If storage type has changed, migrate plans
      if (previousType !== storageType) {
        setIsMigrating(true);
        setMigrationSuccess(null);
        setMigrationError(null);
        
        const success = await migratePlans(previousType, storageType);
        
        if (success) {
          // Update storage preference
          setStoragePreference(storageType);
          setMigrationSuccess(true);
        } else {
          setMigrationError('Failed to migrate plans. Please try again.');
          setMigrationSuccess(false);
        }
        
        setIsMigrating(false);
      } else {
        // No migration needed, just update preference
        setStoragePreference(storageType);
        onClose();
      }
    } catch (error) {
      console.error('Error saving storage settings:', error);
      setMigrationError('An unexpected error occurred. Please try again.');
      setMigrationSuccess(false);
      setIsMigrating(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Storage Settings</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          Choose where to store your retirement plans
        </Typography>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          You currently have {planCount} saved plan{planCount !== 1 ? 's' : ''}.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="storage-type"
              name="storage-type"
              value={storageType}
              onChange={handleStorageTypeChange}
            >
              <FormControlLabel 
                value="localStorage" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1">Browser Local Storage (Default)</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Plans are saved in your browser. They will be lost if you clear your browser data.
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel 
                value="indexedDB" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1">Browser IndexedDB</Typography>
                    <Typography variant="body2" color="textSecondary">
                      More robust browser storage with larger capacity. Still cleared if you clear browser data.
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel 
                value="file" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1">File System</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Plans are exported to your device as JSON files. You'll need to import them each time.
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>
        
        {isMigrating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Migrating your plans...</Typography>
          </Box>
        )}
        
        {migrationSuccess === true && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Plans successfully migrated to new storage!
          </Alert>
        )}
        
        {migrationSuccess === false && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {migrationError || 'Error migrating plans. Please try again.'}
          </Alert>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="textSecondary">
          Note: For maximum security and reliability, regularly export your plans to files as a backup.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isMigrating}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          disabled={isMigrating}
        >
          Save Preferences
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StorageSettings;