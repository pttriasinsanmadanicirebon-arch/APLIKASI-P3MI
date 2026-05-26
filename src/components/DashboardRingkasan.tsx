/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { CPMI, Transaction } from "../types";
import { formatRupiah } from "../data/seedData";
import { Users, PlaneTakeoff, Award, Wallet, ArrowDownRight, ArrowUpRight, Ban, TrendingUp, Calendar } from "lucide-react";

interface Props {
  cpmis: CPMI[];
  transactions: Transaction[];
  onNavigate: (tabId: string) => void;
  ptName?: string;
}

export default function DashboardRingkasan({ cpmis, transactions, onNavigate, ptName }: Props) {
  // 1. Calculate General KPI Stats
  const totalCpmiCount = cpmis.length;
  
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cpmis.forEach((c) => {
      const state = c.status.toLowerCase();
      if (state.includes("flight") || state.includes("terbang")) {
        counts["terbang"] = (counts["terbang"] || 0) + 1;
      } else if (state.includes("bnsp") || state.includes("blk")) {
        counts["bnsp"] = (counts["bnsp"] || 0) + 1;
      } else if (state.includes("final")) {
        counts["final"] = (counts["final"] || 0) + 1;
      } else if (state.includes("cancel") || state.includes("tolak")) {
        counts["batal"] = (counts["batal"] || 0) + 1;
      } else if (state.includes("process") || state.includes("proses")) {
        counts["proses"] = (counts["proses"] || 0) + 1;
      } else {
        counts["lainnya"] = (counts["lainnya"] || 0) + 1;
      }
    });
    return counts;
  }, [cpmis]);

  // Financial Stats
  const totalExpenses = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.value, 0);
  }, [transactions]);

  const catBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    transactions.forEach((t) => {
      const cat = t.category || "Keterangan Lain";
      breakdown[cat] = (breakdown[cat] || 0) + t.value;
    });
    return breakdown;
  }, [transactions]);

  // Recruiter breakdown (Top recruiters represent field power)
  const recruiterBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    cpmis.forEach((c) => {
      const rec = c.recruiter || "Kemitraan/Pusat";
      breakdown[rec] = (breakdown[rec] || 0) + 1;
    });
    // Sort and get top 6
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [cpmis]);

  // Recent transactions (Limit to 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Monthly breakdown for Sparklines
  const lastMonthsData = useMemo(() => {
    const months: Record<string, number> = {};
    transactions.forEach((t) => {
      if (!t.date) return;
      const monthKey = t.date.substring(0, 7); // YYYY-MM
      months[monthKey] = (months[monthKey] || 0) + t.value;
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6); // last 6 months
  }, [transactions]);

  return (
    <div className="space-y-6" id="dashboard-ringkasan-root">
      {/* Welcome Banner */}
      <div className="bg-natural-primary text-white rounded-3xl p-6 md:p-8 shadow-sm border border-natural-accent/20 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-3xl relative z-10">
          <span className="bg-white/20 text-white font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
            GLOBAL HUMAN RESOURCE PORTAL
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-bold mt-3 tracking-tight">
            {ptName || "PT. Trias Insan Madani"}
          </h1>
          <p className="text-[#F9F6F1]/90 mt-2 text-sm md:text-base leading-relaxed">
            Monitor proses migrasi pekerja mandiri atau formal (CPMI) secara terpusat, catat pengeluaran operasional per individu, dan tinjau laporan keuangan kantor secara presisi dengan paduan gaya natural yang hangat.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate("cpmi")}
              id="btn-goto-cpmi"
              className="bg-white text-natural-dark hover:bg-natural-pane font-semibold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
            >
              Kelola Data CPMI
            </button>
            <button
              id="btn-goto-transactions"
              onClick={() => onNavigate("transaksi")}
              className="bg-natural-dark/50 hover:bg-natural-dark/75 border border-white/20 text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-full transition-all cursor-pointer"
            >
              Catat Transaksi Baru
            </button>
          </div>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="kpi-grid">
        {/* Total CPMI */}
        <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-[#E1EDD8] text-[#5A6946] rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[#8C8479] text-xs font-semibold uppercase tracking-wide">Total Terdaftar (CPMI)</p>
            <p className="text-3xl font-bold font-serif text-natural-dark mt-1">{totalCpmiCount}</p>
            <span className="text-[10px] text-natural-primary font-mono font-bold">Kandidat Terdaftar</span>
          </div>
        </div>

        {/* Flown / Terbang */}
        <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-[#E1EDD8] text-[#5A6946] rounded-2xl">
            <PlaneTakeoff className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[#8C8479] text-xs font-semibold uppercase tracking-wide">Terbang / Flight</p>
            <p className="text-3xl font-bold font-serif text-natural-dark mt-1">{statusCounts["terbang"] || 0}</p>
            <span className="text-[10px] text-natural-primary font-mono font-bold">
              {Math.round(((statusCounts["terbang"] || 0) / (totalCpmiCount || 1)) * 100)}% dari Total
            </span>
          </div>
        </div>

        {/* BNSP/BLK Stage */}
        <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-[#F5E6D3] text-[#8B6E4E] rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[#8C8479] text-xs font-semibold uppercase tracking-wide">Pelatihan BNSP / BLK</p>
            <p className="text-3xl font-bold font-serif text-natural-dark mt-1">{statusCounts["bnsp"] || 0}</p>
            <span className="text-[10px] text-[#8B6E4E] font-mono font-bold">Mengikuti Diklat</span>
          </div>
        </div>

        {/* Total Operational Outflow (Balance Card look) */}
        <div className="bg-natural-dark text-white p-6 rounded-3xl border border-natural-accent/20 shadow-sm flex items-center space-x-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/5 rounded-full blur-xl"></div>
          <div className="p-3.5 bg-white/10 text-white rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[#E5D3B3] text-xs font-semibold uppercase tracking-wide">Total Kas Keluar</p>
            <p className="text-xl font-bold font-mono text-white mt-1 truncate">
              {formatRupiah(totalExpenses)}
            </p>
            <span className="text-[10px] text-[#8C8479] font-mono block">Buku Kas Harian</span>
          </div>
        </div>
      </div>

      {/* Internal Status Status Summary Pills */}
      <div className="bg-white p-5 rounded-3xl border border-natural-accent/30 shadow-sm">
        <h3 className="text-xs font-bold text-[#8C8479] uppercase tracking-wider mb-3">Distribusi CPMI Berdasarkan Status Proses</h3>
        <div className="flex flex-wrap gap-2.5">
          <span className="bg-[#D3E5F5]/60 text-[#4E6E8B] text-xs px-3.5 py-1.5 rounded-full flex items-center font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#4E6E8B] mr-2"></span>
            Proses: <strong className="ml-1 text-[#2D2926]">{statusCounts["proses"] || 0}</strong>
          </span>
          <span className="bg-[#F5E6D3]/60 text-[#8B6E4E] text-xs px-3.5 py-1.5 rounded-full flex items-center font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#8B6E4E] mr-2"></span>
            BNSP/BLK: <strong className="ml-1 text-[#2D2926]">{statusCounts["bnsp"] || 0}</strong>
          </span>
          <span className="bg-[#E1EDD8]/60 text-[#5A6946] text-xs px-3.5 py-1.5 rounded-full flex items-center font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#7D8F69] mr-2"></span>
            Final Stage: <strong className="ml-1 text-[#2D2926]">{statusCounts["final"] || 0}</strong>
          </span>
          <span className="bg-[#E1EDD8] text-[#5A6946] text-xs px-3.5 py-1.5 rounded-full flex items-center font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#5A6946] mr-2"></span>
            Terbang: <strong className="ml-1 text-[#2D2926]">{statusCounts["terbang"] || 0}</strong>
          </span>
          <span className="bg-[#F5D3D3] text-[#8B4E4E] text-xs px-3.5 py-1.5 rounded-full flex items-center font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#8B4E4E] mr-2"></span>
            Batal/Tolak: <strong className="ml-1 text-[#2D2926]">{statusCounts["batal"] || 0}</strong>
          </span>
          <span className="bg-[#F9F6F1] text-[#8C8479] text-xs px-3.5 py-1.5 rounded-full flex items-center font-semibold border border-natural-accent/20">
            <span className="w-2 h-2 rounded-full bg-[#8C8479] mr-2"></span>
            Lainnya: <strong className="ml-1 text-[#2D2926]">{statusCounts["lainnya"] || 0}</strong>
          </span>
        </div>
      </div>

      {/* Main Analysis Section (Charts / Reports) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Expenses Breakdown Pie Chart Indicator */}
        <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif font-bold text-natural-dark text-lg">Alokasi Biaya & Transaksi Keuangan</h3>
                <p className="text-[#8C8479] text-xs">Proporsi pengeluaran berdasarkan kategori pengurusan CPMI</p>
              </div>
              <TrendingUp className="w-5 h-5 text-natural-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Visual Progress Bar Chart List */}
              <div className="space-y-4">
                {Object.entries(catBreakdown)
                  .sort((a, b) => (b[1] as number) - (a[1] as number)) // Sort largest expenses
                  .map(([category, rawValue], idx) => {
                    const value = rawValue as number;
                    const percentage = Math.round((value / (totalExpenses || 1)) * 100);
                    const colorMap: Record<string, string> = {
                      "Fee Sponsor": "bg-natural-primary",
                      "Biaya MD": "bg-[#C27B63]",
                      "ID Paspor": "bg-[#8B6E4E]",
                      "Living Cost": "bg-[#4E6E8B]",
                      "Transport": "bg-[#E5D3B3]",
                      "Mcu Pra": "bg-[#5A6946]",
                      "Royalti": "bg-[#8B4E4E]",
                      "Keterangan Lain": "bg-[#8C8479]",
                    };
                    const color = colorMap[category] || "bg-natural-primary";
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-natural-dark flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                            {category}
                          </span>
                          <span className="text-natural-dark font-mono">
                            {formatRupiah(value)} <span className="text-[#8C8479] text-[10px] font-normal">({percentage}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-natural-pane rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Custom SVG Ring representation */}
              <div className="flex flex-col items-center justify-center py-5 bg-natural-pane/40 rounded-2xl border border-dashed border-natural-accent/80">
                <span className="text-xs text-[#8C8479] uppercase font-mono font-bold">Total Akumulasi</span>
                <span className="text-2xl font-bold font-mono text-natural-dark mt-1">{formatRupiah(totalExpenses)}</span>
                <p className="text-[10px] text-[#8C8479] text-center mt-2 px-6">
                  Representasi real-time dari {transactions.length} entry transaksi yang telah tercatat di sistem kas.
                </p>
                
                {/* Mini Trend Line */}
                <div className="mt-4 flex items-end gap-1.5 h-10 px-4">
                  {lastMonthsData.map(([month, val]) => {
                    const maxVal = Math.max(...lastMonthsData.map(m => m[1])) || 1;
                    const itemHeight = Math.max(10, Math.round((val / maxVal) * 40));
                    return (
                      <div key={month} className="group relative flex flex-col items-center">
                        <div 
                          className="w-3 bg-natural-primary rounded-t hover:bg-natural-dark transition-colors cursor-pointer" 
                          style={{ height: `${itemHeight}px` }}
                        ></div>
                        <span className="absolute bottom-full mb-1 bg-natural-dark text-white text-[9px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                          {month}: {formatRupiah(val)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <span className="text-[9px] font-mono text-[#8C8479] mt-1.5">Tren Pengeluaran 6 Bulan Terakhir</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsor/Recruiter Power Performance */}
        <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif font-bold text-natural-dark text-lg">Kontributor Lapangan</h3>
                <p className="text-[#8C8479] text-xs">Petugas lapangan / sponsor (PL) perekrut terbanyak</p>
              </div>
              <Users className="w-5 h-5 text-natural-primary" />
            </div>

            <div className="space-y-4">
              {recruiterBreakdown.map(([recruiter, count], idx) => {
                const maxCount = recruiterBreakdown[0]?.[1] || 1;
                const barWidth = Math.round((count / maxCount) * 100);
                const medalColor = idx === 0 
                  ? "bg-[#E1EDD8] text-[#5A6946]" 
                  : idx === 1 
                    ? "bg-[#D3E5F5] text-[#4E6E8B]" 
                    : idx === 2 
                      ? "bg-[#F5E6D3] text-[#8B6E4E]" 
                      : "bg-[#F9F6F1] text-[#8C8479] border border-natural-accent/20";
                return (
                  <div key={recruiter} className="flex items-center justify-between space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${medalColor}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-natural-dark truncate">{recruiter}</span>
                        <span className="text-xs font-mono font-bold text-[#8C8479] shrink-0">{count} CPMI</span>
                      </div>
                      <div className="w-full h-1.5 bg-natural-pane rounded-full overflow-hidden">
                        <div className="h-full bg-natural-primary rounded-full" style={{ width: `${barWidth}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Feed Split Row (Recent Transactions & Documentation Completion) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions Kas List */}
        <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-serif font-bold text-natural-dark text-lg">Buku Kas - Transaksi Terbaru</h3>
              <p className="text-[#8C8479] text-xs">Pencatatan kas keluar & biaya perorangan terkini</p>
            </div>
            <button
              onClick={() => onNavigate("transaksi")}
              className="text-xs text-natural-primary font-bold hover:underline transition-colors cursor-pointer"
            >
              Lihat Kas Buku
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-natural-accent/20 text-[11px] uppercase tracking-wider text-[#8C8479] font-bold bg-[#F9F6F1]">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">PMI / Deskripsi</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">Nilai Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9F6F1] text-xs">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-natural-bg/50 transition-all">
                    <td className="py-3 px-4 font-mono text-[#8C8479] text-[11px]">
                      {tx.date ? new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-natural-dark text-xs flex items-center gap-1">
                        {tx.pmiRef !== "OPERASIONAL" ? (
                          <span className="font-mono text-white bg-natural-primary px-1.5 py-0.5 rounded text-[9px] font-bold">
                            {tx.pmiRef}
                          </span>
                        ) : null}
                        <span>{tx.pmiName || tx.description}</span>
                      </div>
                      <span className="text-[10px] text-[#8C8479] italic block mt-0.5">
                        {tx.pmiName ? tx.description : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-[#E1EDD8] text-[#5A6946] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-natural-dark">
                      {formatRupiah(tx.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documentation tracker overview */}
        <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-natural-dark text-lg">Kelengkapan Dokumen CPMI</h3>
            <p className="text-[#8C8479] text-xs mb-4">Lacak pemenuhan persyaratan hukum utama (KTP, KK, Ijazah, Paspor dll)</p>
            
            <div className="space-y-3.5">
              <div className="bg-[#FDFBF7] p-3.5 rounded-2xl flex justify-between items-center border border-natural-accent/20">
                <span className="text-xs font-semibold text-natural-dark">Medical Check Up & Pra-MCU</span>
                <span className="text-xs font-mono font-bold text-[#5A6946] bg-[#E1EDD8] px-2.5 py-0.5 rounded-full uppercase">Selesai 100%</span>
              </div>
              <div className="bg-[#FDFBF7] p-3.5 rounded-2xl flex justify-between items-center border border-natural-accent/20">
                <span className="text-xs font-semibold text-natural-dark">ID Paspor & Verifikasi Dokumen</span>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">92% Verif</span>
              </div>
              <div className="bg-[#FDFBF7] p-3.5 rounded-2xl flex justify-between items-center border border-natural-accent/20">
                <span className="text-xs font-semibold text-natural-dark">Pelatihan BLK/BNSP Mandiri</span>
                <span className="text-xs font-mono font-bold text-[#8B6E4E] bg-[#F5E6D3] px-2.5 py-0.5 rounded-full uppercase">Proses</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-natural-accent/20 mt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8C8479] font-semibold">Kepatuhan Regulasi BP2MI</span>
              <span className="text-[#5A6946] bg-[#E1EDD8] font-bold px-2.5 py-0.5 rounded-lg uppercase text-[10px]">SOP Terpenuhi</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
