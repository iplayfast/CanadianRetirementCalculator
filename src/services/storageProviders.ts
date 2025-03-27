import { UserInput } from '../models/types';

// Key for storage
const RETIREMENT_PLANS_KEY = 'canadian_retirement_plans';
const STORAGE_PREFERENCE_KEY = 'retirement_planner_storage_preference';

// Plan structure with metadata
export interface SavedPlan {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  planData: UserInput;
}

// Define available storage types
export type StorageType = 'localStorage' | 'indexedDB' | 'file';

// Interface for storage providers
export interface StorageProvider {
  getPlans(): Promise<SavedPlan[]>;
  savePlan(plan: SavedPlan): Promise<boolean>;
  updatePlan(plan: SavedPlan): Promise<boolean>;
  deletePlan(id: string): Promise<boolean>;
  exportToFile(plan: SavedPlan): Promise<boolean>;
  importFromFile(file: File): Promise<SavedPlan | null>;
}

// LocalStorage Provider
export class LocalStorageProvider implements StorageProvider {
  async getPlans(): Promise<SavedPlan[]> {
    try {
      const savedPlansJson = localStorage.getItem(RETIREMENT_PLANS_KEY);
      if (!savedPlansJson) {
        return [];
      }
      
      const plans = JSON.parse(savedPlansJson);
      
      if (!Array.isArray(plans)) {
        console.error('Saved plans is not an array, resetting to empty array');
        return [];
      }
      
      const validPlans = plans.filter(plan => 
        plan && 
        typeof plan.id === 'string' &&
        typeof plan.name === 'string' &&
        typeof plan.createdAt === 'string' &&
        plan.planData !== undefined
      );
      
      return validPlans;
    } catch (error) {
      console.error('Error retrieving plans from localStorage:', error);
      return [];
    }
  }
  
  async savePlan(plan: SavedPlan): Promise<boolean> {
    try {
      const plans = await this.getPlans();
      plans.push(plan);
      localStorage.setItem(RETIREMENT_PLANS_KEY, JSON.stringify(plans));
      return true;
    } catch (error) {
      console.error('Error saving plan to localStorage:', error);
      return false;
    }
  }
  
  async updatePlan(plan: SavedPlan): Promise<boolean> {
    try {
      const plans = await this.getPlans();
      const planIndex = plans.findIndex(p => p.id === plan.id);
      
      if (planIndex === -1) {
        return false;
      }
      
      plans[planIndex] = plan;
      localStorage.setItem(RETIREMENT_PLANS_KEY, JSON.stringify(plans));
      return true;
    } catch (error) {
      console.error('Error updating plan in localStorage:', error);
      return false;
    }
  }
  
  async deletePlan(id: string): Promise<boolean> {
    try {
      const plans = await this.getPlans();
      const filteredPlans = plans.filter(plan => plan.id !== id);
      
      if (filteredPlans.length === plans.length) {
        return false; // Plan not found
      }
      
      localStorage.setItem(RETIREMENT_PLANS_KEY, JSON.stringify(filteredPlans));
      return true;
    } catch (error) {
      console.error('Error deleting plan from localStorage:', error);
      return false;
    }
  }
  
  async exportToFile(plan: SavedPlan): Promise<boolean> {
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
      
      return true;
    } catch (error) {
      console.error('Error exporting plan to file:', error);
      return false;
    }
  }
  
  async importFromFile(file: File): Promise<SavedPlan | null> {
    return new Promise<SavedPlan | null>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const planJson = event.target?.result as string;
          const plan = JSON.parse(planJson) as SavedPlan;
          
          // Validate the imported plan
          if (!plan || !plan.id || !plan.name || !plan.planData) {
            reject(new Error('Invalid plan format'));
            return;
          }
          
          // Update timestamps
          plan.updatedAt = new Date().toISOString();
          
          // Save the imported plan
          const saved = await this.savePlan(plan);
          
          if (saved) {
            resolve(plan);
          } else {
            reject(new Error('Failed to save imported plan'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }
}

// IndexedDB Provider
export class IndexedDBProvider implements StorageProvider {
  private dbName = 'RetirementPlannerDB';
  private storeName = 'plans';
  private version = 1;
  
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }
  
  async getPlans(): Promise<SavedPlan[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(new Error('Failed to get plans from IndexedDB'));
        };
      });
    } catch (error) {
      console.error('Error retrieving plans from IndexedDB:', error);
      return [];
    }
  }
  
  async savePlan(plan: SavedPlan): Promise<boolean> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(plan);
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = () => {
          reject(new Error('Failed to save plan to IndexedDB'));
        };
      });
    } catch (error) {
      console.error('Error saving plan to IndexedDB:', error);
      return false;
    }
  }
  
  async updatePlan(plan: SavedPlan): Promise<boolean> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(plan);
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = () => {
          reject(new Error('Failed to update plan in IndexedDB'));
        };
      });
    } catch (error) {
      console.error('Error updating plan in IndexedDB:', error);
      return false;
    }
  }
  
  async deletePlan(id: string): Promise<boolean> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = () => {
          reject(new Error('Failed to delete plan from IndexedDB'));
        };
      });
    } catch (error) {
      console.error('Error deleting plan from IndexedDB:', error);
      return false;
    }
  }
  
  // Use the same file export/import methods as localStorage provider
  async exportToFile(plan: SavedPlan): Promise<boolean> {
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
      
      return true;
    } catch (error) {
      console.error('Error exporting plan to file:', error);
      return false;
    }
  }
  
  async importFromFile(file: File): Promise<SavedPlan | null> {
    return new Promise<SavedPlan | null>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const planJson = event.target?.result as string;
          const plan = JSON.parse(planJson) as SavedPlan;
          
          // Validate the imported plan
          if (!plan || !plan.id || !plan.name || !plan.planData) {
            reject(new Error('Invalid plan format'));
            return;
          }
          
          // Update timestamps
          plan.updatedAt = new Date().toISOString();
          
          // Save the imported plan
          const saved = await this.savePlan(plan);
          
          if (saved) {
            resolve(plan);
          } else {
            reject(new Error('Failed to save imported plan'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }
}

// File System Provider (just handles exports/imports, doesn't store plans)
export class FileSystemProvider implements StorageProvider {
  private localStorageFallback: LocalStorageProvider;
  
  constructor() {
    this.localStorageFallback = new LocalStorageProvider();
  }
  
  // For the file-only provider, we still use localStorage as a temporary cache
  async getPlans(): Promise<SavedPlan[]> {
    return this.localStorageFallback.getPlans();
  }
  
  async savePlan(plan: SavedPlan): Promise<boolean> {
    // Save to localStorage cache and export to file
    await this.localStorageFallback.savePlan(plan);
    return this.exportToFile(plan);
  }
  
  async updatePlan(plan: SavedPlan): Promise<boolean> {
    // Update in localStorage cache and export to file
    await this.localStorageFallback.updatePlan(plan);
    return this.exportToFile(plan);
  }
  
  async deletePlan(id: string): Promise<boolean> {
    return this.localStorageFallback.deletePlan(id);
  }
  
  async exportToFile(plan: SavedPlan): Promise<boolean> {
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
      
      return true;
    } catch (error) {
      console.error('Error exporting plan to file:', error);
      return false;
    }
  }
  
  async importFromFile(file: File): Promise<SavedPlan | null> {
    return this.localStorageFallback.importFromFile(file);
  }
}

// Factory function to get the appropriate storage provider
export function getStorageProvider(type: StorageType = getStoragePreference()): StorageProvider {
  switch (type) {
    case 'indexedDB':
      return new IndexedDBProvider();
    case 'file':
      return new FileSystemProvider();
    case 'localStorage':
    default:
      return new LocalStorageProvider();
  }
}

// Get the user's storage preference
export function getStoragePreference(): StorageType {
  try {
    const preference = localStorage.getItem(STORAGE_PREFERENCE_KEY);
    if (preference && ['localStorage', 'indexedDB', 'file'].includes(preference)) {
      return preference as StorageType;
    }
    return 'localStorage'; // Default
  } catch {
    return 'localStorage';
  }
}

// Set the user's storage preference
export function setStoragePreference(preference: StorageType): void {
  try {
    localStorage.setItem(STORAGE_PREFERENCE_KEY, preference);
  } catch (error) {
    console.error('Error saving storage preference:', error);
  }
}

// Helper function to generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Create a new plan
export async function createPlan(name: string, description: string, planData: UserInput): Promise<SavedPlan> {
  const newPlan: SavedPlan = {
    id: generateId(),
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    planData
  };
  
  const provider = getStorageProvider();
  await provider.savePlan(newPlan);
  
  return newPlan;
}

// Get all saved plans
export async function getSavedPlans(): Promise<SavedPlan[]> {
  const provider = getStorageProvider();
  return provider.getPlans();
}

// Save a new plan
export async function savePlan(name: string, description: string, planData: UserInput): Promise<SavedPlan> {
  const plan = await createPlan(name, description, planData);
  return plan;
}

// Update an existing plan
export async function updatePlan(id: string, name: string, description: string, planData: UserInput): Promise<SavedPlan | null> {
  const provider = getStorageProvider();
  const plans = await provider.getPlans();
  const planIndex = plans.findIndex(plan => plan.id === id);
  
  if (planIndex === -1) {
    return null;
  }
  
  // Update the plan
  const updatedPlan: SavedPlan = {
    ...plans[planIndex],
    name,
    description,
    updatedAt: new Date().toISOString(),
    planData
  };
  
  const success = await provider.updatePlan(updatedPlan);
  
  return success ? updatedPlan : null;
}

// Delete a plan
export async function deletePlan(id: string): Promise<boolean> {
  const provider = getStorageProvider();
  return provider.deletePlan(id);
}

// Get a specific plan by ID
export async function getPlanById(id: string): Promise<SavedPlan | null> {
  const provider = getStorageProvider();
  const plans = await provider.getPlans();
  return plans.find(plan => plan.id === id) || null;
}

// Export a plan to a file
export async function exportPlanToFile(plan: SavedPlan): Promise<boolean> {
  const provider = getStorageProvider();
  return provider.exportToFile(plan);
}

// Import a plan from a file
export async function importPlanFromFile(file: File): Promise<SavedPlan | null> {
  const provider = getStorageProvider();
  return provider.importFromFile(file);
}

// Migrate plans between storage providers
export async function migratePlans(fromType: StorageType, toType: StorageType): Promise<boolean> {
  try {
    const sourceProvider = getStorageProvider(fromType);
    const targetProvider = getStorageProvider(toType);
    
    const plans = await sourceProvider.getPlans();
    
    // Save each plan to the new storage
    for (const plan of plans) {
      await targetProvider.savePlan(plan);
    }
    
    return true;
  } catch (error) {
    console.error('Error migrating plans:', error);
    return false;
  }
}
