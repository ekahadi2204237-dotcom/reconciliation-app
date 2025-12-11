import React from 'react';
import { TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function FinancialSummary({ data, mode = 'shopee' }) {
  const isShopee = mode === 'shopee';
  const platformLabel = isShopee ? 'Shopee' : 'TikTok';

  const totalPlatform = data.reduce((sum, item) => {
    return sum + (typeof item.platformAmount === 'number' ? item.platformAmount : 0);
  }, 0);

  const totalAccurate = data.reduce((sum, item) => {
    return sum + (typeof item.accurateAmount === 'number' ? item.accurateAmount : 0);
  }, 0);

  const totalMismatch = data.reduce((sum, item) => {
    if (item.status === 'Amount Difference' && typeof item.difference === 'number') {
      return sum + Math.abs(item.difference);
    }
    return sum;
  }, 0);

  const netDifference = totalPlatform - totalAccurate;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const summaryItems = [
    {
      label: `Total ${platformLabel}`,
      value: formatCurrency(totalPlatform),
      color: 'text-gray-900',
      bg: 'bg-gray-50'
    },
    {
      label: 'Total Accurate',
      value: formatCurrency(totalAccurate),
      color: 'text-gray-900',
      bg: 'bg-gray-50'
    },
    {
      label: 'Total Mismatch',
      value: formatCurrency(totalMismatch),
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      label: 'Net Difference',
      value: formatCurrency(Math.abs(netDifference)),
      color: netDifference > 0 ? 'text-blue-600' : 'text-gray-900',
      bg: netDifference > 0 ? 'bg-blue-50' : 'bg-gray-50'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-orange-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Financial Summary</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryItems.map((item, index) => (
          <div
            key={index}
            className={cn("rounded-xl p-4 border border-gray-200", item.bg)}
          >
            <p className="text-xs font-medium text-gray-600 mb-2">{item.label}</p>
            <p className={cn("text-lg md:text-xl font-bold font-mono", item.color)}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
