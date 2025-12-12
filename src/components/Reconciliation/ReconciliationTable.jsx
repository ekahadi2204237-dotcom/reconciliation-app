import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Filter, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, ShoppingBag, Database, Music2, FileSpreadsheet, FileText, Package } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ReconciliationTable({ data, mode = 'shopee' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const platformConfig = {
    shopee: { label: 'Shopee', icon: ShoppingBag, color: 'bg-orange-50 text-orange-700 border-orange-200', dotColor: 'bg-orange-500' },
    tiktok: { label: 'TikTok', icon: Music2, color: 'bg-cyan-50 text-cyan-700 border-cyan-200', dotColor: 'bg-cyan-500' },
    lazada: { label: 'Lazada', icon: Package, color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' }
  };

  const config = platformConfig[mode] || platformConfig.shopee;
  const platformLabel = config.label;

  const STATUS_CONFIG = {
    'Match': {
      color: 'bg-green-50 text-green-700 border-green-200',
      dotColor: 'bg-green-500',
      icon: CheckCircle2
    },
    'Amount Difference': {
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      dotColor: 'bg-yellow-500',
      icon: AlertTriangle
    },
    [`${platformLabel} Only`]: {
      color: config.color,
      dotColor: config.dotColor,
      icon: config.icon
    },
    'Accurate Only': {
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      dotColor: 'bg-purple-500',
      icon: Database
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        item.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.marketplaceAmount?.toString().includes(searchTerm) ||
        item.accurateAmount?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '-') return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  const handleExport = async (format = 'xlsx') => {
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
      document.head.appendChild(script);
      await new Promise((resolve) => { script.onload = resolve; });
    }
    const XLSX = window.XLSX;

    const exportData = filteredData.map(item => ({
      'Invoice Number': item.invoiceNumber,
      [`${platformLabel} Amount`]: item.marketplaceAmount !== '-' ? item.marketplaceAmount : '',
      'Accurate Amount': item.accurateAmount !== '-' ? item.accurateAmount : '',
      'Difference': item.difference !== '-' ? item.difference : '',
      'Status': item.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reconciliation');
    ws['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 20 }];

    const fileName = `${platformLabel}_Reconciliation_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      XLSX.writeFile(wb, `${fileName}.csv`, { bookType: 'csv' });
    } else {
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Reconciliation Results</h2>
              <p className="text-sm text-gray-600">{filteredData.length.toLocaleString()} records found</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('xlsx')}
              className="text-white font-medium px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              className="font-medium px-4 py-2 rounded-xl border-gray-200 hover:border-gray-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search invoice..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-11 h-11 rounded-xl border-gray-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-52 h-11 rounded-xl border-gray-200">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Match">Match</SelectItem>
              <SelectItem value="Amount Difference">Amount Difference</SelectItem>
              <SelectItem value={`${platformLabel} Only`}>{platformLabel} Only</SelectItem>
              <SelectItem value="Accurate Only">Accurate Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-900 py-4 px-6">Invoice Number</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right py-4 px-6">{platformLabel}</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right py-4 px-6">Accurate</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right py-4 px-6">Difference</TableHead>
              <TableHead className="font-semibold text-gray-900 py-4 px-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      {data.length === 0 ? 'Upload files to see results' : 'No results match your search'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => {
                const statusConfig = STATUS_CONFIG[item.status];
                return (
                  <TableRow
                    key={`${item.invoiceNumber}-${index}`}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 py-4 px-6">{item.invoiceNumber}</TableCell>
                    <TableCell className="text-right text-gray-600 py-4 px-6 font-mono">{formatCurrency(item.marketplaceAmount)}</TableCell>
                    <TableCell className="text-right text-gray-600 py-4 px-6 font-mono">{formatCurrency(item.accurateAmount)}</TableCell>
                    <TableCell className={cn(
                      "text-right font-medium py-4 px-6 font-mono",
                      item.difference > 0 ? "text-red-600" : item.difference < 0 ? "text-yellow-600" : "text-gray-400"
                    )}>
                      {item.difference !== '-' && item.difference !== 0 ? formatCurrency(Math.abs(item.difference)) : '-'}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge variant="outline" className={cn("font-medium flex items-center gap-1.5 w-fit px-3 py-1 rounded-lg", statusConfig?.color)}>
                        <span className={cn("w-2 h-2 rounded-full", statusConfig?.dotColor)} />
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{' '}
            <span className="font-medium text-gray-900">{filteredData.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="rounded-lg border-gray-200 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(pageNum)}
                    className={cn("w-9 h-9 rounded-lg", currentPage === pageNum
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "border-gray-200 hover:border-gray-300"
                    )}>
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="rounded-lg border-gray-200 disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
