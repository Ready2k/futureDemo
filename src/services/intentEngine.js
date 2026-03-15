export const detectIntent = (text) => {
  const lowerText = text.toLowerCase();

  // Scene 2: Transfer Money
  if (lowerText.includes('move') || lowerText.includes('transfer')) {
    // Basic extraction for demo purposes
    const amountMatch = lowerText.match(/£?(\d+)/);
    const amount = amountMatch ? parseInt(amountMatch[1], 10) : 0;
    
    let source = 'savings';
    let dest = 'current';
    
    if (lowerText.includes('to savings')) {
      source = 'current';
      dest = 'savings';
    }

    return {
      intent: 'transfer_money',
      amount: amount,
      source_account: source,
      destination_account: dest
    };
  }

  // Scene 3: Affordability Check
  if (lowerText.includes('afford')) {
    const amountMatch = lowerText.match(/£?(\d+)/);
    const cost = amountMatch ? parseInt(amountMatch[1], 10) : 0;
    
    return {
      intent: 'affordability_check',
      cost: cost,
      item: 'holiday' // Hardcoded for demo scenario
    };
  }

  // Scene 1: Check balance / available spend
  if (lowerText.includes('spend') || lowerText.includes('money') || lowerText.includes('balance') || lowerText.includes('how much')) {
    return {
      intent: 'check_balance'
    };
  }

  // Scene: Analyse Spending
  if (lowerText.includes('spending') || lowerText.includes('where') || lowerText.includes('categor') || lowerText.includes('analysis') || lowerText.includes('analyse') || lowerText.includes('breakdown')) {
    return {
      intent: 'analyse_spending'
    };
  }

  // Scene 6: Intelligent Support
  if (lowerText.includes('northline') || lowerText.includes('charge') || lowerText.includes('what is this £85')) {
    return { intent: 'support_transaction_query' };
  }
  
  if (lowerText.includes('recognise') || lowerText.includes('recognize') || lowerText.includes('dispute')) {
    return { intent: 'support_dispute' };
  }

  if (lowerText.includes('specialist') || lowerText.includes('human') || lowerText.includes('chat with')) {
    return { intent: 'escalate_to_human' };
  }

  // Unknown
  return {
    intent: 'unknown'
  };
};
