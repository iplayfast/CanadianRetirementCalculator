// src/components/ui/LoadPlanDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Divider,
  Alert,
  TextField,
  InputAdornment,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { 
  getSavedPlans, 
  SavedPlan, 
  deletePlan, 
  exportPlanToFile,
  importPlanFromFile
} from '../../services/saveLoadService';

interface LoadPlanDialogProps {
  open: boolean;
  onClose: () => void;
  onPlanLoad: (plan: SavedPlan) => void;
  onPlanEdit: (plan: SavedPlan) => void;
}

const LoadPlanDialog: React.FC<LoadPlanDialogProps> = ({
  open,
  onClose,
  onPlanLoad,
  onPlanEdit
}) => {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [importError, setImportError] = useState('');
  const [loadFromDisk, setLoadFromDisk] = useState(false);
  
  // Load saved plans when dialog opens
  useEffect(() => {
    if (open) {
      refreshPlans();
    }
  }, [open]);
  
  const refreshPlans = () => {
    setPlans(getSavedPlans());
  };
  
  const handleDeletePlan = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this plan?')) {
      deletePlan(id);
      refreshPlans();
    }
  };
  
  const handleEditPlan = (plan: SavedPlan, event: React.MouseEvent) => {
    event.stopPropagation();
    onPlanEdit(plan);
    onClose();
  };
  
  const handleExportPlan = (plan: SavedPlan, event: React.MouseEvent) => {
    event.stopPropagation();
    exportPlanToFile(plan);
  };

  const handleImportPlan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    try {
      const file = event.target.files[0];
      const importedPlan = await importPlanFromFile(file);
      
      if (importedPlan) {
        refreshPlans();
        
        // If loading from disk, automatically load the imported plan
        if (loadFromDisk) {
          onPlanLoad(importedPlan);
          onClose();
        }
      }
    } catch (error) {
      setImportError('Error importing plan. Please check file format.');
      console.error('Import error:', error);
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  // Filter plans based on search term
  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getDialogTitle = () => {
    return loadFromDisk ? 'Load Plan from File' : 'Load Plan from Browser Storage';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={loadFromDisk}
                onChange={(e) => setLoadFromDisk(e.target.checked)}
              />
            }
            label="Load from a file on your computer"
          />
          
          {loadFromDisk ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Select a previously exported plan file from your computer.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Load a plan saved in this browser's storage. Plans saved in other browsers or devices won't appear here.
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {loadFromDisk ? (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              component="label"
            >
              Select Plan File
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleImportPlan}
              />
            </Button>
            {importError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {importError}
              </Alert>
            )}
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            {importError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {importError}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                component="label"
              >
                Import Plan from File
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleImportPlan}
                />
              </Button>
            </Box>
            
            {plans.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ my: 3 }}>
                No saved plans found in this browser. Create a plan and save it to see it here,
                or use the "Import Plan from File" button above.
              </Typography>
            ) : filteredPlans.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ my: 3 }}>
                No plans match your search.
              </Typography>
            ) : (
              <List>
                {filteredPlans.map((plan) => (
                  <React.Fragment key={plan.id}>
                    <ListItem 
                      button 
                      onClick={() => {
                        onPlanLoad(plan);
                        onClose();
                      }}
                      sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                    >
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                        <ListItemText
                          primary={plan.name}
                          secondary={`Created: ${formatDate(plan.createdAt)} | Updated: ${formatDate(plan.updatedAt)}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            aria-label="export"
                            onClick={(e) => handleExportPlan(plan, e)}
                            title="Export to file"
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            aria-label="edit"
                            onClick={(e) => handleEditPlan(plan, e)}
                            title="Edit plan"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={(e) => handleDeletePlan(plan.id, e)}
                            title="Delete plan"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </Box>
                      {plan.description && (
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ mt: 1, alignSelf: 'flex-start', maxWidth: '90%' }}
                        >
                          {plan.description}
                        </Typography>
                      )}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoadPlanDialog;  