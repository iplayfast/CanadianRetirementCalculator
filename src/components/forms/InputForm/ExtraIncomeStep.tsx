// src/components/forms/InputForm/ExtraIncomeStep.tsx
import React, { useState } from 'react';
import { 
  Grid, 
  Typography, 
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { UserInput, ExtraIncomeStream } from '../../../models/types';

interface ExtraIncomeStepProps {
  userInput: UserInput;
  onInputChange: (field: keyof UserInput, value: any) => void;
}

const ExtraIncomeStep: React.FC<ExtraIncomeStepProps> = ({ 
  userInput, 
  onInputChange 
}) => {
  // Get names for primary and spouse
  const primaryName = userInput.name || 'Your';
  const spouseName = userInput.hasSpouse && userInput.spouseInfo ? (userInput.spouseInfo.name || 'Spouse\'s') : 'Spouse\'s';

  // Primary person state
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  
  // Spouse state
  const [isAddingSpouse, setIsAddingSpouse] = useState<boolean>(false);
  const [isEditingSpouse, setIsEditingSpouse] = useState<boolean>(false);
  const [currentSpouseEditId, setCurrentSpouseEditId] = useState<string | null>(null);
  
  // Form state for new/editing income stream (primary)
  const [description, setDescription] = useState<string>('');
  const [yearlyAmount, setYearlyAmount] = useState<number>(0);
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endYear, setEndYear] = useState<number | undefined>(undefined);
  const [hasInflation, setHasInflation] = useState<boolean>(true);
  
  // Form state for new/editing income stream (spouse)
  const [spouseDescription, setSpouseDescription] = useState<string>('');
  const [spouseYearlyAmount, setSpouseYearlyAmount] = useState<number>(0);
  const [spouseStartYear, setSpouseStartYear] = useState<number>(new Date().getFullYear());
  const [spouseEndYear, setSpouseEndYear] = useState<number | undefined>(undefined);
  const [spouseHasInflation, setSpouseHasInflation] = useState<boolean>(true);
  
  // Handle adding a new income stream for primary person
  const handleAddIncomeStream = () => {
    // Input validation
    if (!description.trim()) {
      alert("Please provide a description for the income stream");
      return;
    }
    
    if (yearlyAmount <= 0) {
      alert("Please enter a valid yearly amount greater than 0");
      return;
    }
    
    if (endYear !== undefined && startYear > endYear) {
      alert("End year must be after start year");
      return;
    }
    
    const newStream: ExtraIncomeStream = {
      id: generateId(),
      description: description.trim(),
      yearlyAmount,
      startYear,
      endYear,
      hasInflation
    };
    
    const updatedStreams = [...userInput.extraIncomeStreams, newStream];
    onInputChange('extraIncomeStreams', updatedStreams);
    
    // Reset form
    resetForm();
    setIsAdding(false);
  };
  
  // Handle adding a new income stream for spouse
  const handleAddSpouseIncomeStream = () => {
    // Guard clause for spouse data
    if (!userInput.hasSpouse || !userInput.spouseInfo) {
      return;
    }
    
    // Input validation
    if (!spouseDescription.trim()) {
      alert("Please provide a description for the spouse's income stream");
      return;
    }
    
    if (spouseYearlyAmount <= 0) {
      alert("Please enter a valid yearly amount greater than 0");
      return;
    }
    
    if (spouseEndYear !== undefined && spouseStartYear > spouseEndYear) {
      alert("End year must be after start year");
      return;
    }
    
    const newStream: ExtraIncomeStream = {
      id: generateId(),
      description: spouseDescription.trim(),
      yearlyAmount: spouseYearlyAmount,
      startYear: spouseStartYear,
      endYear: spouseEndYear,
      hasInflation: spouseHasInflation
    };
    
    // Create or update spouse extraIncomeStreams
    const spouseExtraIncomeStreams = userInput.spouseInfo.extraIncomeStreams || [];
    const updatedSpouseStreams = [...spouseExtraIncomeStreams, newStream];
    
    onInputChange('spouseInfo', {
      ...userInput.spouseInfo,
      extraIncomeStreams: updatedSpouseStreams
    });
    
    // Reset form
    resetSpouseForm();
    setIsAddingSpouse(false);
  };
  
  // Handle editing an existing income stream for primary person
  const handleEditIncomeStream = () => {
    if (!currentEditId) return;
    
    // Input validation similar to add
    if (!description.trim()) {
      alert("Please provide a description for the income stream");
      return;
    }
    
    if (yearlyAmount <= 0) {
      alert("Please enter a valid yearly amount greater than 0");
      return;
    }
    
    if (endYear !== undefined && startYear > endYear) {
      alert("End year must be after start year");
      return;
    }
    
    const updatedStreams = userInput.extraIncomeStreams.map(stream => {
      if (stream.id === currentEditId) {
        return {
          ...stream,
          description: description.trim(),
          yearlyAmount,
          startYear,
          endYear,
          hasInflation
        };
      }
      return stream;
    });
    
    onInputChange('extraIncomeStreams', updatedStreams);
    
    // Reset form and editing state
    resetForm();
    setIsEditing(false);
    setCurrentEditId(null);
  };
  
  // Handle editing an existing income stream for spouse
  const handleEditSpouseIncomeStream = () => {
    if (!currentSpouseEditId || !userInput.hasSpouse || !userInput.spouseInfo) return;
    
    // Input validation
    if (!spouseDescription.trim()) {
      alert("Please provide a description for the spouse's income stream");
      return;
    }
    
    if (spouseYearlyAmount <= 0) {
      alert("Please enter a valid yearly amount greater than 0");
      return;
    }
    
    if (spouseEndYear !== undefined && spouseStartYear > spouseEndYear) {
      alert("End year must be after start year");
      return;
    }
    
    const spouseExtraIncomeStreams = userInput.spouseInfo.extraIncomeStreams || [];
    const updatedStreams = spouseExtraIncomeStreams.map(stream => {
      if (stream.id === currentSpouseEditId) {
        return {
          ...stream,
          description: spouseDescription.trim(),
          yearlyAmount: spouseYearlyAmount,
          startYear: spouseStartYear,
          endYear: spouseEndYear,
          hasInflation: spouseHasInflation
        };
      }
      return stream;
    });
    
    onInputChange('spouseInfo', {
      ...userInput.spouseInfo,
      extraIncomeStreams: updatedStreams
    });
    
    // Reset form and editing state
    resetSpouseForm();
    setIsEditingSpouse(false);
    setCurrentSpouseEditId(null);
  };
  
  // Handle deleting an income stream for primary person
  const handleDeleteIncomeStream = (id: string) => {
    if (window.confirm("Are you sure you want to delete this income stream?")) {
      const updatedStreams = userInput.extraIncomeStreams.filter(stream => stream.id !== id);
      onInputChange('extraIncomeStreams', updatedStreams);
    }
  };
  
  // Handle deleting an income stream for spouse
  const handleDeleteSpouseIncomeStream = (id: string) => {
    if (!userInput.hasSpouse || !userInput.spouseInfo) return;
    
    if (window.confirm("Are you sure you want to delete this spouse income stream?")) {
      const spouseExtraIncomeStreams = userInput.spouseInfo.extraIncomeStreams || [];
      const updatedStreams = spouseExtraIncomeStreams.filter(stream => stream.id !== id);
      
      onInputChange('spouseInfo', {
        ...userInput.spouseInfo,
        extraIncomeStreams: updatedStreams
      });
    }
  };
  
  // Set up form for editing primary person's stream
  const handleStartEdit = (stream: ExtraIncomeStream) => {
    setDescription(stream.description);
    setYearlyAmount(stream.yearlyAmount);
    setStartYear(stream.startYear || new Date().getFullYear());
    setEndYear(stream.endYear);
    setHasInflation(stream.hasInflation);
    setCurrentEditId(stream.id);
    setIsEditing(true);
    setIsAdding(false);
    
    // Reset spouse editing
    setIsAddingSpouse(false);
    setIsEditingSpouse(false);
    setCurrentSpouseEditId(null);
  };
  
  // Set up form for editing spouse's stream
  const handleStartSpouseEdit = (stream: ExtraIncomeStream) => {
    setSpouseDescription(stream.description);
    setSpouseYearlyAmount(stream.yearlyAmount);
    setSpouseStartYear(stream.startYear || new Date().getFullYear());
    setSpouseEndYear(stream.endYear);
    setSpouseHasInflation(stream.hasInflation);
    setCurrentSpouseEditId(stream.id);
    setIsEditingSpouse(true);
    setIsAddingSpouse(false);
    
    // Reset primary editing
    setIsAdding(false);
    setIsEditing(false);
    setCurrentEditId(null);
  };
  
  // Reset form fields for primary person
  const resetForm = () => {
    setDescription('');
    setYearlyAmount(0);
    setStartYear(new Date().getFullYear());
    setEndYear(undefined);
    setHasInflation(true);
  };
  
  // Reset form fields for spouse
  const resetSpouseForm = () => {
    setSpouseDescription('');
    setSpouseYearlyAmount(0);
    setSpouseStartYear(new Date().getFullYear());
    setSpouseEndYear(undefined);
    setSpouseHasInflation(true);
  };
  
  // Generate a unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Helper to format year display
  const formatYear = (year?: number): string => {
    return year ? year.toString() : 'Indefinite';
  };
  
  return (
    <Grid container spacing={3}>
      {/* PRIMARY PERSON SECTION */}
      <Grid item xs={12}>
        <Typography variant="h6">{primaryName}'s Extra Income Streams</Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Add additional income sources like part-time work, rental income, solar panel revenue, etc.
        </Typography>
      </Grid>
      
      {/* Table of existing income streams for primary person */}
      <Grid item xs={12}>
        {userInput.extraIncomeStreams.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Yearly Amount</TableCell>
                  <TableCell align="right">Start Year</TableCell>
                  <TableCell align="right">End Year</TableCell>
                  <TableCell align="right">Inflation Adjusted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userInput.extraIncomeStreams.map((stream) => (
                  <TableRow key={stream.id}>
                    <TableCell>{stream.description}</TableCell>
                    <TableCell align="right">${stream.yearlyAmount.toLocaleString()}</TableCell>
                    <TableCell align="right">{stream.startYear || 'Current'}</TableCell>
                    <TableCell align="right">{formatYear(stream.endYear)}</TableCell>
                    <TableCell align="right">{stream.hasInflation ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => handleStartEdit(stream)}
                        disabled={isAdding || isEditing || isAddingSpouse || isEditingSpouse}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteIncomeStream(stream.id)}
                        disabled={isAdding || isEditing || isAddingSpouse || isEditingSpouse}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            No extra income streams added yet. Use the button below to add income sources.
          </Alert>
        )}
      </Grid>
      
      {/* Add/Edit form for primary person */}
      {(isAdding || isEditing) && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {isEditing ? 'Edit Income Stream' : 'Add New Income Stream'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Part-time consulting, Solar panels, Rental income"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Yearly Amount"
                  type="number"
                  value={yearlyAmount}
                  onChange={(e) => setYearlyAmount(parseFloat(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">/year</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Start Year"
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="End Year (Optional)"
                  type="number"
                  value={endYear || ''}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    setEndYear(value ? parseInt(value) : undefined);
                  }}
                  helperText="Leave empty if indefinite"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasInflation}
                      onChange={(e) => setHasInflation(e.target.checked)}
                    />
                  }
                  label="Adjust for inflation over time"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      resetForm();
                      setIsAdding(false);
                      setIsEditing(false);
                      setCurrentEditId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={isEditing ? handleEditIncomeStream : handleAddIncomeStream}
                  >
                    {isEditing ? 'Update' : 'Add'} Income Stream
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )}
      
      {/* Add button for primary person */}
      {!isAdding && !isEditing && !isAddingSpouse && !isEditingSpouse && (
        <Grid item xs={12}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
          >
            Add Income Stream
          </Button>
        </Grid>
      )}
      
      {/* SPOUSE SECTION */}
      {userInput.hasSpouse && userInput.spouseInfo && (
        <>
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6">{spouseName}'s Extra Income Streams</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Add additional income sources for {spouseName}.
            </Typography>
          </Grid>
          
          {/* Table of existing income streams for spouse */}
          <Grid item xs={12}>
            {userInput.spouseInfo.extraIncomeStreams && userInput.spouseInfo.extraIncomeStreams.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Yearly Amount</TableCell>
                      <TableCell align="right">Start Year</TableCell>
                      <TableCell align="right">End Year</TableCell>
                      <TableCell align="right">Inflation Adjusted</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userInput.spouseInfo.extraIncomeStreams.map((stream) => (
                      <TableRow key={stream.id}>
                        <TableCell>{stream.description}</TableCell>
                        <TableCell align="right">${stream.yearlyAmount.toLocaleString()}</TableCell>
                        <TableCell align="right">{stream.startYear || 'Current'}</TableCell>
                        <TableCell align="right">{formatYear(stream.endYear)}</TableCell>
                        <TableCell align="right">{stream.hasInflation ? 'Yes' : 'No'}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            onClick={() => handleStartSpouseEdit(stream)}
                            disabled={isAdding || isEditing || isAddingSpouse || isEditingSpouse}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteSpouseIncomeStream(stream.id)}
                            disabled={isAdding || isEditing || isAddingSpouse || isEditingSpouse}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                No extra income streams added yet for {spouseName}. Use the button below to add income sources.
              </Alert>
            )}
          </Grid>
          
          {/* Add/Edit form for spouse */}
          {(isAddingSpouse || isEditingSpouse) && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {isEditingSpouse ? `Edit ${spouseName} Income Stream` : `Add New ${spouseName} Income Stream`}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={spouseDescription}
                      onChange={(e) => setSpouseDescription(e.target.value)}
                      placeholder="e.g., Part-time teaching, Etsy shop, Dividend income"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Yearly Amount"
                      type="number"
                      value={spouseYearlyAmount}
                      onChange={(e) => setSpouseYearlyAmount(parseFloat(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/year</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Start Year"
                      type="number"
                      value={spouseStartYear}
                      onChange={(e) => setSpouseStartYear(parseInt(e.target.value))}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="End Year (Optional)"
                      type="number"
                      value={spouseEndYear || ''}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        setSpouseEndYear(value ? parseInt(value) : undefined);
                      }}
                      helperText="Leave empty if indefinite"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={spouseHasInflation}
                          onChange={(e) => setSpouseHasInflation(e.target.checked)}
                        />
                      }
                      label="Adjust for inflation over time"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          resetSpouseForm();
                          setIsAddingSpouse(false);
                          setIsEditingSpouse(false);
                          setCurrentSpouseEditId(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        onClick={isEditingSpouse ? handleEditSpouseIncomeStream : handleAddSpouseIncomeStream}
                      >
                        {isEditingSpouse ? 'Update' : 'Add'} {spouseName} Income Stream
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
          
          {/* Add button for spouse */}
          {!isAdding && !isEditing && !isAddingSpouse && !isEditingSpouse && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetSpouseForm();
                  setIsAddingSpouse(true);
                }}
              >
                Add {spouseName} Income Stream
              </Button>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

export default ExtraIncomeStep;