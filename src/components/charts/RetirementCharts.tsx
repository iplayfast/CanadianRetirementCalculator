import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import { RetirementPlan, YearlyPlan } from '../../models/types';

interface ChartProps {
  retirementPlan: RetirementPlan;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const NetWorthChart: React.FC<ChartProps> = ({ retirementPlan }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Net Worth Projection</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={retirementPlan.years}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Net Worth']} />
          <Legend />
          <Line type="monotone" dataKey="totalNetWorth" name="Net Worth" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const AccountBalancesChart: React.FC<ChartProps> = ({ retirementPlan }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Account Balances Over Time</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={retirementPlan.years}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
          <Legend />
          <Area type="monotone" dataKey="rspBalance" name="RSP" stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey="tfsaBalance" name="TFSA" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          <Area type="monotone" dataKey="otherInvestmentsBalance" name="Other Investments" stackId="1" stroke="#ffc658" fill="#ffc658" />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const IncomeVsExpensesChart: React.FC<ChartProps> = ({ retirementPlan }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Income vs. Expenses</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={retirementPlan.years}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
          <Legend />
          <Bar dataKey="totalIncome" name="Total Income" fill="#8884d8" />
          <Bar dataKey="expenses" name="Expenses" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const IncomeSourcesChart: React.FC<ChartProps> = ({ retirementPlan }) => {
  // Find the first retirement year
  const firstRetirementYear = retirementPlan.years.find(year => year.isRetired);
  
  if (!firstRetirementYear) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Retirement Income Sources</Typography>
        <Typography>No retirement years in plan</Typography>
      </Paper>
    );
  }
  
  const data = [
    { name: 'CPP', value: firstRetirementYear.cppIncome },
    { name: 'OAS', value: firstRetirementYear.oasIncome },
    { name: 'RSP', value: firstRetirementYear.rspWithdrawal },
    { name: 'TFSA', value: firstRetirementYear.tfsaWithdrawal },
    { name: 'Other', value: firstRetirementYear.otherInvestmentsWithdrawal }
  ].filter(item => item.value > 0);
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>First Year Retirement Income Sources</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const TaxAnalysisChart: React.FC<ChartProps> = ({ retirementPlan }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Tax Analysis</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={retirementPlan.years}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
          <Legend />
          <Area type="monotone" dataKey="incomeTax" name="Income Tax" stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey="capitalGainsTax" name="Capital Gains Tax" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const RetirementCharts: React.FC<ChartProps> = ({ retirementPlan }) => {
  return (
    <Box>
      <NetWorthChart retirementPlan={retirementPlan} />
      <AccountBalancesChart retirementPlan={retirementPlan} />
      <IncomeVsExpensesChart retirementPlan={retirementPlan} />
      <IncomeSourcesChart retirementPlan={retirementPlan} />
      <TaxAnalysisChart retirementPlan={retirementPlan} />
    </Box>
  );
};
