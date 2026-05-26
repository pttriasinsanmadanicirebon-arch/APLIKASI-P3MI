/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { CPMI, Transaction } from "../types";
import { formatRupiah } from "../data/seedData";
import { 
  BarChart, TrendingUp, Download, Printer, Percent, BadgeAlert, Coins, 
  HelpCircle, Search, Filter, AlertCircle, Sparkles, LayoutGrid, ListFilter
} from "lucide-react";

interface Props {
  cpmis: CPMI[];
  transactions: Transaction[];
}

interface CpmiCostSummary {
  id: string;
  name: string;
  recruiter: string;
  status: string;
  totalSpent: number;
  categoryAmounts: Record<string, number>;
  txCount: number;
}

export default function LaporanKeuangan({ cpmis, transactions }: Props) {
  // Filtration inside reporting page
  const [reportSearch, setReportSearch] = useState("");
  const [minSpentFilter, setMinSpentFilter] = useState("0");
  const [statusFilter, setStatusFilter] = useState("");

  // 1. Calculate and map sum spent per CPMI
  const cpmiSummaries = useMemo((): CpmiCostSummary[] => {
    return cpmis.map((c) => {
      // Find matching transactions for CPMI code e.g. "TS 6317"
      const matchedTx = transactions.filter((t) => {
        const normRef1 = t.pmiRef.replace(/\s+/g, "").toUpperCase();
        const normRef2 = c.id.replace(/\s+/g, "").toUpperCase();
        return normRef1 === normRef2;
      });

      const catAmounts: Record<string, number> = {};
      let totalSpent = 0;
      matchedTx.forEach((t) => {
        const cat = t.category || "Keterangan Lain";
        catAmounts[cat] = (catAmounts[cat] || 0) + t.value;
        totalSpent += t.value;
      });

      return {
        id: c.id,
        name: c.name,
        recruiter: c.recruiter,
        status: c.status,
        totalSpent,
        categoryAmounts: catAmounts,
        txCount: matchedTx.length
      };
    }).sort((a,b) => b.totalSpent - a.totalSpent); // Sort by highest outlay
  }, [cpmis, transactions]);

  // General office costs unconnected to a specific candidate (OPERASIONAL / Non-Kandidat)
  const generalOfficeCosts = useMemo(() => {
    return transactions
      .filter((t) => {
        // Find if pmiRef matches OPERASIONAL or isn't inside cpmi ids list
        const refUpper = t.pmiRef.toUpperCase();
        if (refUpper.includes("OPERASIONAL") || refUpper.includes("KETERANGAN")) return true;
        
        const matchesAnyCpmi = cpmis.some(c => {
          const normRef = t.pmiRef.replace(/\s+/g, "").toUpperCase();
          const normCpmi = c.id.replace(/\s+/g, "").toUpperCase();
          return normRef === normCpmi;
        });

        return !matchesAnyCpmi;
      })
      .reduce((sum, t) => sum + t.value, 0);
  }, [transactions, cpmis]);

  // Highly spent category rankings
  const categorySummary = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalAll = 0;
    transactions.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + t.value;
      totalAll += t.value;
    });

    return Object.entries(counts)
      .map(([category, value]) => ({
        category,
        value,
        percentage: Math.round((value / (totalAll || 1)) * 100)
      }))
      .sort((a,b) => b.value - a.value);
  }, [transactions]);

  // Filtered summaries
  const filteredSummaries = useMemo(() => {
    const minVal = parseInt(minSpentFilter, 10) || 0;
    return cpmiSummaries.filter((sum) => {
      const matchSearch = 
        sum.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
        sum.id.toLowerCase().includes(reportSearch.toLowerCase()) ||
        sum.recruiter.toLowerCase().includes(reportSearch.toLowerCase());
      
      const matchMin = sum.totalSpent >= minVal;
      const matchStatus = !statusFilter || sum.status.toLowerCase().includes(statusFilter.toLowerCase());

      return matchSearch && matchMin && matchStatus;
    });
  }, [cpmiSummaries, reportSearch, minSpentFilter, statusFilter]);

  // Overall sums
  const totalFinancialSpent = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.value, 0);
  }, [transactions]);

  const totalCandidateSpentSum = useMemo(() => {
    return cpmiSummaries.reduce((sum, s) => sum + s.totalSpent, 0);
  }, [cpmiSummaries]);

  const activeCpmisWithTx = useMemo(() => {
    return cpmiSummaries.filter(s => s.txCount > 0).length;
  }, [cpmiSummaries]);

  const averageSpentPerCandidate = useMemo(() => {
    return Math.round(totalCandidateSpentSum / (activeCpmisWithTx || 1));
  }, [totalCandidateSpentSum, activeCpmisWithTx]);

  // Trigger Native Printer
  const handlePrint = () => {
    window.print();
  };

  // Export JSON Backup file
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ cpmis, transactions }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CPMI_Finance_Report_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6" id="reports-keuangan-root">
      
      {/* Top Banner Report */}
      <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-natural-dark font-serif animate-fade-in">Laporan Konsolidasi & Rekapitulasi Keuangan</h2>
          <p className="text-xs text-[#8C8479] mt-1">Audit operasional per-kepala CPMI, pengeluaran overhead kantor, dan rasio penyebaran dana sponsor.</p>
        </div>
        
        {/* Tools action */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={handleExportJSON}
            className="p-3 bg-natural-pane border border-natural-accent/30 hover:bg-natural-accent/25 rounded-xl text-xs font-bold text-natural-dark flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download full database audit backup"
          >
            <Download className="w-4 h-4 text-natural-primary" />
            Ekspor JSON Backup
          </button>
          
          <button
            onClick={handlePrint}
            className="px-5 py-3 bg-natural-primary hover:bg-natural-primary-hover rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan Keuangan
          </button>
        </div>
      </div>

      {/* Primary Financial Ratios Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="ratios-grid">
        
        {/* Total Cost Outflow */}
        <div className="bg-[#4A443F] p-5 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-white/20 text-[#E5D3B3] font-bold px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
              Total Budget Outflow
            </span>
            <p className="text-2xl font-bold font-mono text-white mt-4">{formatRupiah(totalFinancialSpent)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-[#C8B195] flex justify-between">
            <span>Operasional & CPMI</span>
            <span className="font-mono font-bold">{transactions.length} Total Transaksi</span>
          </div>
        </div>

        {/* Investasi Langsung CPMI */}
        <div className="bg-white p-5 rounded-3xl border border-natural-accent/30 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-natural-pane text-natural-dark font-bold px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
              Direct CPMI Investments
            </span>
            <p className="text-2xl font-bold font-mono text-natural-dark mt-4">{formatRupiah(totalCandidateSpentSum)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F9F6F1] text-[11px] text-[#8C8479] flex justify-between">
            <span>Rasio Penyaluran Langsung</span>
            <span className="font-bold text-natural-primary font-mono">
              {Math.round((totalCandidateSpentSum / (totalFinancialSpent || 1)) * 100)}% dana
            </span>
          </div>
        </div>

        {/* Average cost of deployment */}
        <div className="bg-white p-5 rounded-3xl border border-natural-accent/30 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-natural-pane text-natural-dark font-bold px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
              Rata-rata Biaya Per CPMI
            </span>
            <p className="text-2xl font-bold font-mono text-natural-primary mt-4">{formatRupiah(averageSpentPerCandidate)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F9F6F1] text-[11px] text-[#8C8479] flex justify-between">
            <span>Dari total yang memiliki pembiayaan</span>
            <span className="font-bold text-natural-dark">{activeCpmisWithTx} CPMI aktif didanai</span>
          </div>
        </div>

      </div>

      {/* Main Audit Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* OVERALL CATEGORY SUMS INDEX (1 Column) */}
        <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm">
          <div className="flex items-center space-x-2.5 mb-5 border-b border-[#F9F6F1] pb-3">
            <Coins className="w-5 h-5 text-natural-primary" />
            <h3 className="font-serif font-bold text-natural-dark text-sm">Akumulasi Sebaran Biaya</h3>
          </div>

          <div className="space-y-4">
            {categorySummary.map((item, idx) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-natural-dark font-bold">{item.category}</span>
                  <span className="text-natural-dark font-mono font-bold">{formatRupiah(item.value)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#8C8479]">
                  <span>Kontribusi Rencana</span>
                  <span className="font-mono font-bold text-natural-primary bg-natural-pane border border-natural-accent/30 px-1.5 rounded">{item.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-natural-pane rounded-full overflow-hidden border border-natural-accent/10">
                  <div className="h-full bg-natural-primary rounded-full transition-all duration-500" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-[#F9F6F1] mt-4 text-xs text-[#8C8479] space-y-2">
              <div className="flex justify-between">
                <span>Total Pengeluaran Umum Kantor</span>
                <span className="font-mono font-bold text-natural-dark">{formatRupiah(generalOfficeCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span>Rasio Sewa Sarpras & Cabang</span>
                <span className="font-mono font-bold text-natural-dark">
                  {Math.round((generalOfficeCosts / (totalFinancialSpent || 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BATCH CPMI EXPENDITURE LEDGER (Takes 2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-natural-accent/30 shadow-sm flex flex-col justify-between">
          <div className="p-6">
            <div className="pb-4 mb-4 border-b border-[#F9F6F1]">
              <h3 className="font-serif font-bold text-natural-dark text-base">Breakdown Pengeluaran Kas per CPMI</h3>
              <p className="text-xs text-[#8C8479] mt-0.5">Lacak biaya per CPMI, dari sponsor fee hingga MD dan paspor secara individu.</p>
            </div>

            {/* In-Report SearchFilters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 bg-natural-pane p-3.5 rounded-2xl border border-natural-accent/20">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C8479] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari Nama / ID CPMI..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="w-full bg-white border border-natural-accent/40 rounded-xl text-xs pl-8 pr-2 py-1.5 text-natural-dark font-medium focus:ring-1 focus:ring-natural-primary"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-natural-accent/40 rounded-xl text-xs px-2.5 py-1.5 text-natural-dark font-bold focus:ring-1 focus:ring-natural-primary"
              >
                <option value="">Semua Status Berkas</option>
                <option value="FLIGHT">TERBANG (FLIGHT)</option>
                <option value="BNSP/BLK">BNSP / BLK</option>
                <option value="PROCESS">PROCESS</option>
                <option value="FINAL STAGE">FINAL STAGE</option>
              </select>

              <select
                value={minSpentFilter}
                onChange={(e) => setMinSpentFilter(e.target.value)}
                className="w-full bg-white border border-natural-accent/40 rounded-xl text-xs px-2.5 py-1.5 text-natural-dark font-mono font-bold focus:ring-1 focus:ring-natural-primary"
              >
                <option value="0">Semua Rentang Pengeluaran</option>
                <option value="1000000">&gt; Rp1.000.000</option>
                <option value="5000000">&gt; Rp5.000.000</option>
                <option value="10000000">&gt; Rp10.000.000</option>
              </select>
            </div>

            {/* List CPMIs & financial aggregation summary table */}
            <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-natural-accent/10 text-[10px] uppercase tracking-wider text-[#8C8479] font-bold bg-[#F9F6F1] sticky top-0 bg-white">
                    <th className="py-2.5 px-4">Kandidat</th>
                    <th className="py-2.5 px-2">Sponsor Fee</th>
                    <th className="py-2.5 px-2">MD / Paspor</th>
                    <th className="py-2.5 px-2">Living Cost / Mcu</th>
                    <th className="py-2.5 px-4 text-right">Total Terpakai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F9F6F1] text-xs text-[#4A443F]">
                  {filteredSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#8C8479]">
                        <AlertCircle className="w-8 h-8 mx-auto text-[#E5D3B3] mb-2" />
                        Tidak ada data pencocokan pengeluaran CPMI.
                      </td>
                    </tr>
                  ) : (
                    filteredSummaries.map((sum) => {
                      const feeSponsor = sum.categoryAmounts["Fee Sponsor"] || 0;
                      const mdAndPaspor = (sum.categoryAmounts["Biaya MD"] || 0) + (sum.categoryAmounts["ID Paspor"] || 0);
                      const livingAndMcu = (sum.categoryAmounts["Living Cost"] || 0) + (sum.categoryAmounts["Mcu Pra"] || 0) + (sum.categoryAmounts["Transport"] || 0);
                      
                      return (
                        <tr key={sum.id} className="hover:bg-natural-pane/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono text-[10px] font-bold text-natural-primary bg-natural-pane border border-natural-accent/30 px-2 py-0.5 rounded-full mr-1 inline-block">
                              {sum.id}
                            </span>
                            <span className="font-bold text-natural-dark text-xs block mt-1">{sum.name}</span>
                            <span className="text-[9px] text-[#8C8479] block font-mono">PL: {sum.recruiter} · {sum.status}</span>
                          </td>
                          <td className="py-3 px-2 font-mono text-[11px] text-natural-dark font-medium">
                            {feeSponsor > 0 ? formatRupiah(feeSponsor) : <span className="text-gray-300">-</span>}
                          </td>
                          <td className="py-3 px-2 font-mono text-[11px] text-natural-dark font-medium">
                            {mdAndPaspor > 0 ? formatRupiah(mdAndPaspor) : <span className="text-gray-300">-</span>}
                          </td>
                          <td className="py-3 px-2 font-mono text-[11px] text-natural-dark font-medium">
                            {livingAndMcu > 0 ? formatRupiah(livingAndMcu) : <span className="text-gray-300">-</span>}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-bold text-xs whitespace-nowrap ${
                            sum.totalSpent > 8000000 ? "text-rose-600" : sum.totalSpent > 0 ? "text-natural-dark" : "text-gray-300"
                          }`}>
                            {sum.totalSpent > 0 ? formatRupiah(sum.totalSpent) : "Rp0"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          <div className="p-4 border-t border-natural-accent/15 bg-natural-pane text-[11px] text-[#8C8479] font-mono rounded-b-3xl flex items-center justify-between">
            <span>Dihitung berdasarkan audit harian kas kantor</span>
            <span className="bg-[#E1EDD8] text-[#5A6946] border border-[#7D8F69]/20 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px]">
              PP No. 22 Tahun 2021 Compliant
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
