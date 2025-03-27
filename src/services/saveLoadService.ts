import { UserInput } from '../models/types';

// Key for local storage
const RETIREMENT_PLANS_KEY = 'canadian_retirement_plans';

// Plan structure with metadata
export interface SavedPlan {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  planData: UserInput;
}

// Get all saved plans
export const getSavedPlans = (): SavedPlan[] => {
  const savedPlansJson = localStorage.getItem(RETIREMENT_PLANS_KEY);
  if (!savedPlansJson) {
    return [];
  }
  
  try {
    return JSON.parse(savedPlansJson);
  } catch (error) {
    console.error('Error parsing saved plans:', error);
    return [];
  }
};

// Save a new plan
export const savePlan = (name: string, description: string, planData: UserInput): SavedPlan => {
  const plans = getSavedPlans();
  
  // Create a new plan with metadata
  const newPlan: SavedPlan = {
    id: generateId(),
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    planData
  };
  
  // Add to plans array and save to localStorage
  plans.push(newPlan);
  localStorage.setItem(RETIREMENT_PLANS_KEY, JSON.stringify(plans));
  
  return newPlan;
};

// Update an existing plan
export const updatePlan = (id: string, name: string, description: string, planData: UserInput): SavedPlan | null => {
  const plans = getSavedPlans();
  const planIndex = plans.findIndex(plan => plan.id === id);
  
  if (planIndex === -1) {
    return null;
  }
  
  // Update the plan with new data
  const updatedPlan: SavedPlan = {
    ...plans[planIndex],
    name,
    description,
    updatedAt: new Date().toISOString(),
    planData
  };
  
  plans[planIndex] = updatedPlan;
  localStorage.setItem(RETIREMENT_PLANS_KEY, JSON.stringify(plans));
  
  return updatedPlan;
};

// Delete a plan
export const deletePlan = (id: string): boolean => {
  const plans = getSavedPlans();
  const filteredPlans = plans.filter(plan => plan.id !== id);
  
  if (filteredPlans.length === plans.length) {
    return false; // Plan not found
  }
  
  localStorage.setItem(RETIREMENT_PLANS_KEY, JSON.stringify(filteredPlans));
  return true;
};

// Get a specific plan by ID
export const getPlanById = (id: string): SavedPlan | null => {
  const plans = getSavedPlans();
  return plans.find(plan => plan.id === id) || null;
};

// Export a plan to a file
export const exportPlanToFile = (plan: SavedPlan): void => {
  try {
    const planJson = JSON.stringify(plan, null, 2);
    const blob = new Blob([planJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.name.replace(/\s+/g, '_')}_retirement_plan.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error exporting plan to file:', error);
  }
};

// Import a plan from a file
export const importPlanFromFile = async (file: File): Promise<SavedPlan | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const planJson = event.target?.result as string;
        const plan = JSON.parse(planJson) as SavedPlan;
        
        // Validate the imported plan
        if (!plan || !plan.id || !plan.name || !plan.planData) {
          reject(new Error('Invalid plan format'));
          return;
        }
        
        // Save the imported plan
        const plans = getSavedPlans();
        
        // Check if a plan with this ID already exists
        const existingPlanIndex = plans.findIndex(p => p.id === plan.id);
        if (existingPlanIndex !== -1) {
          // Update the existing plan
          plans[existingPlanIndex] = {
            ...plan,
            updatedAt: new Date().toISOString()
          };
        } else {
          // Add the new plan
          plans.push({
            ...plan,
            updatedAt: new Date().toISOString()
          });
        }
        
        localStorage.setItem(RETIREMENT_PLANS_KEY, JSON.stringify(plans));
        resolve(plan);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

// Helper function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};