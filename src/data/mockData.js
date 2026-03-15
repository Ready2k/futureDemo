export const initialUserProfile = {
  user: "Demo Customer",
  accounts: {
    current: 1420,
    savings: 3900
  },
  linked_accounts: {
    natwest_isa: {
      name: 'NatWest Cash ISA',
      institution: 'NatWest',
      sort_code: '60-00-01',
      balance: 2920,
      rate: 4.5
    }
  },
  income: 4500,
  expenses: {
    mortgage: 1200,
    utilities: 350,
    food: 450,
    transport: 220,
    subscriptions: 120
  },
  savings_goal: 1000,
  // Recent behaviour data for proactive insights
  recent_spending: {
    restaurants: { this_month: 420, avg_3month: 286 },
    transport: { this_month: 210, avg_3month: 220 }
  }
};


export const computeDiscretionaryIncome = (profile) => {
  const totalExpenses = Object.values(profile.expenses).reduce((a, b) => a + b, 0);
  return profile.income - totalExpenses - profile.savings_goal;
};
