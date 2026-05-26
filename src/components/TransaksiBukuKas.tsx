/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Transaction, CPMI, TransactionCategory } from "../types";
import { formatRupiah, TRANSACTION_CATEGORIES } from "../data/seedData";
import { 
  Plus, Search, Calendar, Tag, DollarSign, Trash2, ArrowRightLeft, 
  ChevronLeft, ChevronRight, Calculator, FileSpreadsheet, PlusCircle, AlertCircle
} from "lucide-react";

interface Props {
  transactions: Transaction[];
  cpmis: CPMI[];
  onAddTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function TransaksiBukuKas({ transactions, cpmis, onAddTransaction, onDeleteTransaction }: Props) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [monthFilter, setMonthFilter] = useState(""); // YYYY-MM
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // New Transaction Form states
  const [formDate, setFormDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [formCategory, setFormCategory] = useState("Fee Sponsor");
  const [formPmiRef, setFormPmiRef] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Auto suggestion for CPMI matching No Reff selection
  const [pmiQuery, setPmiQuery] = useState("");
  const [showPmiDropdown, setShowPmiDropdown] = useState(false);

  // Filter CPMI suggestions
  const suggestedCpmis = useMemo(() => {
    if (!pmiQuery) return [];
    return cpmis.filter(c => 
      c.id.toLowerCase().includes(pmiQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(pmiQuery.toLowerCase())
    ).slice(0, 5);
  }, [cpmis, pmiQuery]);

  // Aggregate stats based on current filters
  const processedTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id.localeCompare(a.id))
      .filter((t) => {
        const matchSearch = 
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.pmiRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.pmiName && t.pmiName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchCat = !selectedCategory || t.category === selectedCategory;
        const matchMonth = !monthFilter || (t.date && t.date.substring(0, 7) === monthFilter);

        return matchSearch && matchCat && matchMonth;
      });
  }, [transactions, searchTerm, selectedCategory, monthFilter]);

  // Financial Sum
  const filteredSpentTotal = useMemo(() => {
    return processedTransactions.reduce((sum, t) => sum + t.value, 0);
  }, [processedTransactions]);

  // Pagination logic
  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedTransactions.slice(startIdx, startIdx + itemsPerPage);
  }, [processedTransactions, currentPage]);

  // List of active months in transaction seed
  const activeMonthsList = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => {
      if (t.date) set.add(t.date.substring(0, 7)); // YYYY-MM
    });
    return Array.from(set).sort((a,b) => b.localeCompare(a));
  }, [transactions]);

  // Handle swift-add action
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(formValue, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("Masukkan nilai transaksi (Rupiah) yang valid!");
      return;
    }

    // Match candidate name cached if there is a match
    const cleanRef = formPmiRef.toUpperCase().trim() || "OPERASIONAL";
    const matchedCpmi = cpmis.find(c => c.id.replace(/\s+/g, "").toUpperCase() === cleanRef.replace(/\s+/g, "").toUpperCase());
    
    const payload: Transaction = {
      id: `tx-user-${Date.now()}`,
      date: formDate,
      category: formCategory,
      pmiRef: cleanRef,
      pmiName: matchedCpmi ? matchedCpmi.name : undefined,
      value: amount,
      description: formDescription.trim() || `${formCategory} untuk ${cleanRef}`
    };

    onAddTransaction(payload);
    
    // reset form fields
    setFormValue("");
    setFormDescription("");
    setPmiQuery("");
    alert("Transaksi berhasil dicatat!");
  };

  // Helper CPMI selector button
  const handleSelectPmi = (cpmi: CPMI) => {
    setFormPmiRef(cpmi.id);
    setPmiQuery(cpmi.name);
    setShowPmiDropdown(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="buku-kas-container">
      
      {/* LEFT COLUMN: SWIFT REGISTER FORM (1 Column) */}
      <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm self-start">
        <div className="flex items-center space-x-2.5 mb-5">
          <PlusCircle className="w-5 h-5 text-natural-primary" />
          <h3 className="text-base font-bold text-natural-dark font-serif">Pencatatan Transaksi Baru</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Calendar Picker */}
          <div>
            <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Tanggal Transaksi *</label>
            <div className="relative">
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary font-mono font-bold text-natural-dark"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Kategori Biaya / Kas Keluar *</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-semibold"
            >
              {TRANSACTION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* CPMI Suggester / Code connector */}
          <div className="relative">
            <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">No Reff PMI / CPMI ID (Opsional)</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Cari ID/Nama CPMI"
                value={pmiQuery}
                onFocus={() => setShowPmiDropdown(true)}
                onChange={(e) => {
                  setPmiQuery(e.target.value);
                  setFormPmiRef(e.target.value);
                  setShowPmiDropdown(true);
                }}
                className="flex-grow bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary font-bold text-natural-dark placeholder-[#8C8479]/60"
              />
              <button
                type="button"
                onClick={() => {
                  setFormPmiRef("OPERASIONAL");
                  setPmiQuery("OPERASIONAL");
                  setShowPmiDropdown(false);
                }}
                className="px-3 bg-natural-pane border border-natural-accent/30 hover:bg-natural-accent/20 p-2 text-[10px] text-natural-dark font-bold rounded-xl transition-all"
                title="Atur sebagai pengeluaran non-CPMI umum"
              >
                OPERASIONAL
              </button>
            </div>

            {/* Suggester Suggestions list */}
            {showPmiDropdown && suggestedCpmis.length > 0 && (
              <div className="absolute z-15 left-0 right-0 bg-white border border-natural-accent/30 rounded-2xl mt-1 shadow-lg max-h-48 overflow-y-auto text-xs divide-y divide-[#F9F6F1]">
                {suggestedCpmis.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectPmi(c)}
                    className="p-2.5 hover:bg-natural-pane cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-natural-primary mr-1.5">{c.id}</span>
                      <strong className="text-natural-dark">{c.name}</strong>
                    </div>
                    <span className="text-[10px] text-[#8C8479] italic">Sponsor: {c.recruiter}</span>
                  </div>
                ))}
              </div>
            )}
            {showPmiDropdown && pmiQuery && suggestedCpmis.length === 0 && (
              <div className="absolute z-15 left-0 right-0 bg-white border border-natural-accent/30 rounded-2xl mt-1 p-2 text-[11px] text-[#8C8479] italic">
                Klik luar untuk menggunakan kode &ldquo;{pmiQuery}&rdquo; secara bebas.
              </div>
            )}
            <p className="text-[10px] text-[#8C8479] mt-1 italic">Contoh: <strong>TS 6317</strong> agar pengeluaran terintegrasi otomatis.</p>
          </div>

          {/* Amount / Value (Nilai) */}
          <div>
            <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Nilai Transaksi (Rupiah) *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8C8479] font-bold text-xs">
                Rp
              </span>
              <input
                type="number"
                required
                min="0"
                placeholder="Contoh: 1500000"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary font-mono font-bold text-natural-dark"
              />
            </div>
          </div>

          {/* Notes description */}
          <div>
            <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Keterangan / Deskripsi Biaya *</label>
            <textarea
              required
              rows={3}
              placeholder="Detail pengeluaran, contoh: 'ID Paspor Khodijah' atau 'MCU Tahap I'"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-medium placeholder-[#8C8479]/60"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-natural-primary hover:bg-natural-primary-hover text-white font-bold text-xs py-3 rounded-full shadow-sm transition-all cursor-pointer"
          >
            Simpan & Posting Transaksi
          </button>
        </form>

        {/* Global Suggestion Close Handler */}
        {showPmiDropdown && (
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowPmiDropdown(false)}
          ></div>
        )}
      </div>

      {/* RIGHT COLUMN: RECODS MASTER LEDGER LIST (Takes 2 Columns) */}
      <div className="xl:col-span-2 bg-white rounded-3xl border border-natural-accent/30 shadow-sm flex flex-col justify-between">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-natural-dark">Buku Anggaran & Jurnal Keuangan</h2>
              <p className="text-xs text-[#8C8479] mt-1">Daftar rekonsiliasi pengeluaran dana kantor secara riil dan berurutan.</p>
            </div>
            
            {/* Quick Filter Info Total */}
            <div className="bg-[#E1EDD8] border border-[#7D8F69]/30 rounded-2xl p-3 flex items-center space-x-3 self-start font-mono shrink-0">
              <Calculator className="w-5 h-5 text-[#5A6946]" />
              <div>
                <span className="text-[10px] text-[#5A6946] block uppercase tracking-wider font-bold font-sans">Total Anggaran Terfilter</span>
                <span className="text-sm font-bold text-[#5A6946]">{formatRupiah(filteredSpentTotal)}</span>
              </div>
            </div>
          </div>

          {/* Filters shelf */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-natural-pane p-4 rounded-2xl border border-natural-accent/20">
            {/* search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8C8479]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari deskripsi, PMI Reff..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-natural-accent/40 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark placeholder-[#8C8479]/60 font-medium"
              />
            </div>

            {/* category select */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8C8479]">
                <Tag className="w-4 h-4" />
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-natural-accent/40 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-semibold appearance-none"
              >
                <option value="">Semua Kategori Biaya</option>
                {TRANSACTION_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Month select */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8C8479]">
                <Calendar className="w-4 h-4" />
              </span>
              <select
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-natural-accent/40 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-semibold appearance-none"
              >
                <option value="">Semua Bulan Buku</option>
                {activeMonthsList.map(m => {
                  const [y, mNum] = m.split("-");
                  const dateObj = new Date(parseInt(y), parseInt(mNum)-1, 1);
                  const label = dateObj.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                  return (
                    <option key={m} value={m}>{label}</option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Ledger Payouts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-natural-accent/10 text-[11px] uppercase tracking-wider text-[#8C8479] font-bold bg-[#F9F6F1]">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Referensi CPMI</th>
                  <th className="py-3 px-4">Kategori Pengeluaran</th>
                  <th className="py-3 px-4">Deskripsi / Memo</th>
                  <th className="py-3 px-4 text-right">Nilai</th>
                  <th className="py-3 px-3 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9F6F1] text-xs">
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#8C8479] font-medium">
                      <AlertCircle className="w-8 h-8 mx-auto text-[#E5D3B3] mb-2" />
                      Tidak ada rekaman kas keluar yang cocok dengan filter Anda.
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-natural-pane/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-[#8C8479] whitespace-nowrap">
                        {tx.date ? new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-natural-primary whitespace-nowrap">
                        {tx.pmiRef !== "OPERASIONAL" ? tx.pmiRef : (
                          <span className="text-[#8C8479]/60 font-normal italic">OPR / Umum</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block bg-natural-pane text-natural-dark border border-natural-accent/30 px-2 md:px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-natural-dark max-w-xs truncate">
                        <strong className="block text-natural-dark text-xs font-bold">{tx.pmiName || ""}</strong>
                        <span className="text-[11px] text-[#8C8479] italic block leading-tight truncate mt-0.5">
                          {tx.description}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-natural-dark text-xs whitespace-nowrap">
                        {formatRupiah(tx.value)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm("Apakah Anda yakin ingin menghapus postingan kas ini secara permanen?")) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 text-[#8C8479]/40 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-natural-accent/15 bg-natural-pane rounded-b-3xl flex justify-between items-center text-xs">
          <span className="text-[#8C8479] font-mono font-bold">
            Halaman {currentPage} dari {totalPages} ({processedTransactions.length} baris data)
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-natural-accent/30 bg-white text-[#4A443F] hover:bg-natural-bg disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-natural-accent/30 bg-white text-[#4A443F] hover:bg-natural-bg disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
