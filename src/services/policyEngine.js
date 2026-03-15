export const evaluatePolicy = (action, profile) => {
  if (action.intent === 'transfer_money') {
    const minCurrentBalance = 1000;
    const confirmationThreshold = 500;
    
    // Check if drawing from current account
    if (action.source_account === 'current') {
      const resultingBalance = profile.accounts.current - action.amount;
      if (resultingBalance < minCurrentBalance) {
        return {
          status: 'declined',
          reason: `Transfer declined. Current account balance would drop below £${minCurrentBalance} minimum.`
        };
      }
    } else {
      // Check if drawing from savings account
      if (profile.accounts[action.source_account] < action.amount) {
        return {
          status: 'declined',
          reason: 'Transfer declined. Insufficient funds in savings account.'
        };
      }
    }

    if (action.amount > confirmationThreshold) {
      return {
        status: 'confirmation_required',
        reason: 'User confirmation required for transfers above £500.'
      };
    }

    return {
      status: 'approved',
      reason: 'Transaction approved. Fraud Risk Level: Low.'
    };
  }

  // Not a risky action
  return {
    status: 'approved',
    reason: 'Policy check not required for this action.'
  };
};
