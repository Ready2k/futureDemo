import React from 'react';
import { useBanking } from '../context/BankingContext';
import { CreditCard, Wallet, TrendingUp, Building2 } from 'lucide-react';

export const FinancialSummaryCard = () => {
  const { profile, discretionaryIncome } = useBanking();
  const isa = profile.linked_accounts?.natwest_isa;
  const totalWealth = profile.accounts.current + profile.accounts.savings + (isa?.balance || 0);

  return (
    <div style={{ padding: '0 0 1rem 0', background: 'var(--brand-blue)', color: 'white', position: 'relative', zIndex: 10 }}>
      <div className="scroll-hide" style={{
        display: 'flex', gap: '1rem', overflowX: 'auto',
        paddingRight: '1.5rem', paddingLeft: '1.25rem',
        marginTop: '-5px', paddingTop: '20px', paddingBottom: '1.5rem',
      }}>

        {/* Current Account */}
        <div style={{ minWidth: '280px', background: 'white', color: 'var(--text-primary)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'var(--brand-cyan)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--brand-blue)', marginBottom: '0.2rem' }}>Current Account</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>20-00-00 | 12345678</p>
            </div>
            <Wallet size={24} color="var(--brand-cyan)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--brand-blue)', fontWeight: '700' }}>£{profile.accounts.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Available balance</p>
        </div>

        {/* Savings Account */}
        <div style={{ minWidth: '280px', background: 'white', color: 'var(--text-primary)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'var(--brand-blue)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--brand-blue)', marginBottom: '0.2rem' }}>Everyday Saver</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>20-00-00 | 87654321</p>
            </div>
            <TrendingUp size={24} color="var(--brand-blue)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--brand-blue)', fontWeight: '700' }}>£{profile.accounts.savings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Available balance</p>
        </div>

        {/* Linked NatWest ISA — the cross-bank moment */}
        {isa && (
          <div style={{ minWidth: '280px', background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #6b1f1f, #c0392b)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#6b1f1f', marginBottom: '2px' }}>{isa.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{isa.sort_code} | Linked account</p>
              </div>
              <Building2 size={24} color="#c0392b" />
            </div>
            <h3 style={{ fontSize: '1.8rem', color: '#6b1f1f', fontWeight: '700' }}>£{isa.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Earning {isa.rate}% AER</p>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', background: 'rgba(107,31,31,0.08)', color: '#6b1f1f', padding: '2px 8px', borderRadius: '100px' }}>{isa.institution}</span>
            </div>
          </div>
        )}

        {/* Safe-to-Spend */}
        <div style={{ minWidth: '280px', background: 'var(--brand-cyan)', color: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', marginBottom: '0.2rem' }}>Safe-to-Spend</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>For the rest of the month</p>
            </div>
            <CreditCard size={24} color="white" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'white', fontWeight: '700' }}>£{discretionaryIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem' }}>Bills and savings accounted for</p>
        </div>

      </div>

      {/* Cross-institution total — reframes this as a financial OS, not a banking app */}
      <div style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingBottom: '0.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Total across all accounts</span>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white' }}>£{totalWealth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
};
