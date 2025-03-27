import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>
}));

describe('Dashboard Component', () => {
  test('renders main heading', () => {
    render(<Dashboard />);
    const headingElement = screen.getByText(/Canadian Retirement Planner/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders welcome section', () => {
    render(<Dashboard />);
    const welcomeElement = screen.getByText(/Welcome to Your Retirement Planning Journey/i);
    expect(welcomeElement).toBeInTheDocument();
  });

  test('renders priorities list', () => {
    render(<Dashboard />);
    const expensesFirstElement = screen.getByText(/Pay expenses first/i);
    expect(expensesFirstElement).toBeInTheDocument();
  });

  test('renders start planning button', () => {
    render(<Dashboard />);
    const buttonElement = screen.getByText(/Start Planning/i);
    expect(buttonElement).toBeInTheDocument();
  });
});
