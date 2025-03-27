import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { UserInput, RetirementPlan } from '../models/types';
import { generateOptimizedRetirementPlan } from '../services/retirementOptimizer';

/**
 * Custom hook to calculate retirement plan based on user input
 * @param userInput User input data
 * @returns Retirement plan and loading state
 */
export const useRetirementCalculator = (userInput: UserInput | null) => {
  const [retirementPlan, setRetirementPlan] = useState<RetirementPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userInput) {
      setRetirementPlan(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this might be an async operation
      // that calls an API, so we'll simulate that with setTimeout
      setTimeout(() => {
        const plan = generateOptimizedRetirementPlan(userInput);
        setRetirementPlan(plan);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Error calculating retirement plan. Please check your inputs and try again.');
      setIsLoading(false);
    }
  }, [userInput]);

  return { retirementPlan, isLoading, error };
};

/**
 * Custom hook to get user input from location state
 * @returns User input from location state
 */
export const useUserInputFromLocation = () => {
  const location = useLocation();
  return location.state?.userInput as UserInput | null;
};
