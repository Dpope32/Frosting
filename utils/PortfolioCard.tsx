import React, { useEffect } from 'react';
import { StatusCard } from '@/components/status/StatusCard';
import { getValueColor } from '@/constants/valueHelper';
import { usePortfolioQuery, usePortfolioStore } from '@/store/PortfolioStore';

export function PortfolioCard() {
  const { isLoading, refetch } = usePortfolioQuery();
  const totalValue = usePortfolioStore((state: { totalValue: number | null }) => state.totalValue);

  useEffect(() => {
    console.log('[PortfolioCard] Component mounted, forcing refetch');
    refetch();
  }, [refetch]);

  const displayValue = isLoading
    ? 'Loading...'
    : totalValue !== null
    ? `$${Math.round(totalValue).toLocaleString()}`
    : '$0';

  const valueColor = getValueColor('portfolio', totalValue ?? 0, '');

  return (
    <StatusCard
      label="Portfolio"
      value={displayValue}
      color="#FF9800"
      valueColor={valueColor}
    />
  );
}
