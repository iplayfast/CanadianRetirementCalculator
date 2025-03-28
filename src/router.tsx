// src/router.tsx
import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InputForm from './pages/InputForm';
import Results from './pages/Results';

// Root layout component
const RootLayout = () => {
  return (
    <div className="content-container">
      <Outlet />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'input',
        element: <InputForm />,
      },
      {
        path: 'results',
        element: <Results />,
      },
    ],
  },
]);

export default router;
