import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Filter, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, ShoppingBag, Database, Music2, FileSpreadsheet, FileText } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ReconciliationTable({ data, mode = 'shopee' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const isShopee = mode === 'shopee';
  const platformLabel = isShopee ? 'Shopee' : 'TikTok';

  const STATUS_CONFIG = {
    'Match': {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
      icon: CheckCircle2
    },
    'Amount Difference': {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      dotColor: 'bg-amber-500',
      icon: AlertTriangle
    },
    [`${platformLabel} Only`]: {
      color: isShopee ? 'bg-orange-50 text-[#FF6A00] border-orange-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200',
      dotColor: isShopee ? 'bg-[#FF6A00]' : 'bg-cyan-500',
      icon: isShopee ? ShoppingBag : Music2
    },
    'Accurate Only': {
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500',
      icon: Database
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.platformAmount?.toString().includes(searchTerm) ||
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
      [`${platformLabel} Amount`]: item.platformAmount !== '-' ? item.platformAmount : '',
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
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isShopee ? "bg-gradient-to-br from-[#FF6A00] to-[#FF8C40]" : "bg-gradient-to-br from-[#25F4EE] to-[#FE2C55]"
            )}>
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Reconciliation Results</h2>
              <p className="text-sm text-gray-500">{filteredData.length.toLocaleString()} records found</p>
            </div>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={() => handleExport('xlsx')}
              className={cn(
                "text-white font-semibold px-5 py-2.5 rounded-xl",
                "shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5",
                isShopee 
                  ? "bg-gradient-to-r from-[#FF6A00] to-[#FF8C40] hover:from-[#E55F00] hover:to-[#FF6A00] shadow-orange-500/20"
                  : "bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] shadow-cyan-500/20"
              )}
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button 
              onClick={() => handleExport('csv')}
              variant="outline"
              className="font-semibold px-5 py-2.5 rounded-xl border-gray-200 hover:border-gray-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search invoice number or amount..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={cn(
                "pl-11 h-11 rounded-xl border-gray-200",
                isShopee ? "focus:border-[#FF6A00] focus:ring-[#FF6A00]/20" : "focus:border-cyan-500 focus:ring-cyan-500/20"
              )}
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-52 h-11 rounded-xl border-gray-200">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Match">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" />Match</span>
              </SelectItem>
              <SelectItem value="Amount Difference">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" />Amount Difference</span>
              </SelectItem>
              <SelectItem value={`${platformLabel} Only`}>
                <span className="flex items-center gap-2"><span className={cn("w-2 h-2 rounded-full", isShopee ? "bg-[#FF6A00]" : "bg-cyan-500")} />{platformLabel} Only</span>
              </SelectItem>
              <SelectItem value="Accurate Only">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />Accurate Only</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="font-semibold text-[#1A1A1A] py-4 px-6">Invoice Number</TableHead>
              <TableHead className="font-semibold text-[#1A1A1A] text-right py-4 px-6">{platformLabel} Amount</TableHead>
              <TableHead className="font-semibold text-[#1A1A1A] text-right py-4 px-6">Accurate Amount</TableHead>
              <TableHead className="font-semibold text-[#1A1A1A] text-right py-4 px-6">Difference</TableHead>
              <TableHead className="font-semibold text-[#1A1A1A] py-4 px-6">Status</TableHead>
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
                      {data.length === 0 ? 'Upload both files to see results' : 'No results match your search'}
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
                    className={cn(
                      "transition-colors duration-200",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                      isShopee ? "hover:bg-[#FFF8F3]" : "hover:bg-cyan-50/50"
                    )}
                  >
                    <TableCell className="font-medium text-[#1A1A1A] py-4 px-6">{item.invoiceNumber}</TableCell>
                    <TableCell className="text-right text-gray-600 py-4 px-6 font-mono">{formatCurrency(item.platformAmount)}</TableCell>
                    <TableCell className="text-right text-gray-600 py-4 px-6 font-mono">{formatCurrency(item.accurateAmount)}</TableCell>
                    <TableCell className={cn(
                      "text-right font-medium py-4 px-6 font-mono",
                      item.difference > 0 ? "text-rose-600" : item.difference < 0 ? "text-amber-600" : "text-gray-400"
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
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-[#1A1A1A]">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium text-[#1A1A1A]">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{' '}
            <span className="font-medium text-[#1A1A1A]">{filteredData.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className={cn("rounded-lg border-gray-200 disabled:opacity-50", isShopee ? "hover:border-[#FF6A00] hover:text-[#FF6A00]" : "hover:border-cyan-500 hover:text-cyan-600")}>
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
                      ? (isShopee ? "bg-[#FF6A00] hover:bg-[#E55F00] text-white" : "bg-cyan-500 hover:bg-cyan-600 text-white")
                      : (isShopee ? "border-gray-200 hover:border-[#FF6A00] hover:text-[#FF6A00]" : "border-gray-200 hover:border-cyan-500 hover:text-cyan-600")
                    )}>
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className={cn("rounded-lg border-gray-200 disabled:opacity-50", isShopee ? "hover:border-[#FF6A00] hover:text-[#FF6A00]" : "hover:border-cyan-500 hover:text-cyan-600")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}