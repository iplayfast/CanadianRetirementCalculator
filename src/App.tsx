// src/App.tsx
import React, { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import Header from './components/ui/Header';
import Footer from './components/ui/Footer';
import { getStorageProvider } from './services/storageProviders';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  // Migrate old plans to new storage system
  const migrateOldPlans = async () => {
    try {
      // Check if migration has already been performed
      const migrationCompleted = localStorage.getItem('storage_migration_completed');
      if (migrationCompleted) {
        return;
      }
      
      // Check for old format plans
      const oldPlansJson = localStorage.getItem('canadian_retirement_plans');
      if (!oldPlansJson) {
        // No old plans found, mark migration as completed
        localStorage.setItem('storage_migration_completed', 'true');
        return;
      }
      
      // Parse old plans
      const oldPlans = JSON.parse(oldPlansJson);
      if (!Array.isArray(oldPlans) || oldPlans.length === 0) {
        // No valid plans found, mark migration as completed
        localStorage.setItem('storage_migration_completed', 'true');
        return;
      }
      
      console.log(`Migrating ${oldPlans.length} plans to new storage system...`);
      
      // Get the new storage provider
      const provider = getStorageProvider();
      
      // Migrate each plan
      for (const plan of oldPlans) {
        await provider.savePlan(plan);
      }
      
      // Mark migration as completed
      localStorage.setItem('storage_migration_completed', 'true');
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error migrating plans:', error);
    }
  };

  // Check for browser storage support on startup
  useEffect(() => {
    // Check localStorage support
    let localStorageSupported = false;
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      localStorageSupported = true;
    } catch (e) {
      console.warn('localStorage is not supported in this browser. Some features may not work properly.');
    }
    
    // Check IndexedDB support
    let indexedDBSupported = false;
    if (window.indexedDB) {
      indexedDBSupported = true;
    } else {
      console.warn('IndexedDB is not supported in this browser. Some storage options will not be available.');
    }
    
    // Log storage support for debugging
    console.info('Storage support:', {
      localStorage: localStorageSupported,
      indexedDB: indexedDBSupported
    });
    
    // Migrate old plans to new storage system
    if (localStorageSupported) {
      migrateOldPlans();
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Header />
        <main className="content">
          <RouterProvider router={router} />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
