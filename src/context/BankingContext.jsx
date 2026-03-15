import React, { createContext, useState, useContext, useEffect } from 'react';
import { initialUserProfile, computeDiscretionaryIncome } from '../data/mockData';
import { evaluatePolicy } from '../services/policyEngine';

const BankingContext = createContext(null);

export const BankingProvider = ({ children }) => {
  const [profile, setProfile] = useState(initialUserProfile);
  const [discretionaryIncome, setDiscretionaryIncome] = useState(0);

  useEffect(() => {
    setDiscretionaryIncome(computeDiscretionaryIncome(profile));
  }, [profile]);

  // Execution Layer (Mock Banking APIs)
  const getBalances = () => {
    return profile.accounts;
  };

  const getTransactions = () => {
    // Mock for demo purposes
    return [
        { id: 1, account: 'current', amount: -45, date: 'Today', merchant: 'Tesco' },
        { id: 2, account: 'current', amount: 4500, date: '1st', merchant: 'Salary' }
    ];
  };

  const executeTransfer = (sourceAccount, destinationAccount, amount) => {
    setProfile(prev => {
      const _profile = { ...prev };
      _profile.accounts = { ...prev.accounts };
      _profile.accounts[sourceAccount] -= amount;
      _profile.accounts[destinationAccount] += amount;
      return _profile;
    });
  };

  const transferMoney = (sourceAccount, destinationAccount, amount) => {
    const action = {
        intent: 'transfer_money',
        source_account: sourceAccount,
        destination_account: destinationAccount,
        amount: amount
    };
    
    const policyResult = evaluatePolicy(action, profile);
    
    if (policyResult.status === 'approved') {
        executeTransfer(sourceAccount, destinationAccount, amount);
    }
    
    return policyResult;
  };

  const analyseMonthlyBudget = () => {
    return {
        income: profile.income,
        bills: Object.values(profile.expenses).reduce((a, b) => a + b, 0),
        savings_goal: profile.savings_goal,
        discretionaryIncome
    };
  };

  const checkAffordability = (cost) => {
    // evaluates disposable income
    // compares against spending forecast
    // explains impact on savings goal
    if (cost <= discretionaryIncome) {
        return {
            affordable: true,
            impact: `You can afford the £${cost} item using this month's discretionary budget. No impact on savings goal.`
        };
    } else {
        const deficit = cost - discretionaryIncome;
        const monthsDelayed = Math.ceil(deficit / profile.savings_goal);
        return {
            affordable: true, // Affordable technically, but with impact
            impact: `You can afford this, but it will delay your savings goal by approximately ${monthsDelayed} month(s) as it exceeds this month's discretionary budget by £${deficit}.`
        };
    }
  };

  return (
    <BankingContext.Provider value={{
      profile,
      discretionaryIncome,
      getBalances,
      getTransactions,
      transferMoney,
      executeTransfer,
      analyseMonthlyBudget,
      checkAffordability
    }}>
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => useContext(BankingContext);
