import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InputForm from './pages/InputForm';
import Results from './pages/Results';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/input',
    element: <InputForm />,
  },
  {
    path: '/results',
    element: <Results />,
  },
]);

export default router;
