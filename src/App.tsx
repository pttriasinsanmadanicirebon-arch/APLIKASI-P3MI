/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CPMI, Transaction, AppUser } from "./types";
import { SEED_CPMIS, SEED_TRANSACTIONS } from "./data/seedData";
import { motion, AnimatePresence } from "motion/react";

// Submodules
import DashboardRingkasan from "./components/DashboardRingkasan";
import CpmiDatabase from "./components/CpmiDatabase";
import TransaksiBukuKas from "./components/TransaksiBukuKas";
import LaporanKeuangan from "./components/LaporanKeuangan";
import ImportForm from "./components/ImportForm";
import PengaturanPt from "./components/PengaturanPt";
import LoginScreen from "./components/LoginScreen";

// Icons
import { 
  BarChart3, Users, BookOpen, FileSpreadsheet, FileText, 
  Settings, RefreshCw, Layers, Plane, Globe, HelpCircle, LogOut
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Authentication state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem("CPMI_PORTAL_LOGGED_IN_USER");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("CPMI_PORTAL_LOGGED_IN_USER");
  };

  // PT Identity configuration states
  const [ptName, setPtName] = useState<string>(() => {
    return localStorage.getItem("CPMI_PORTAL_PT_NAME") || "PT. Trias Insan Madani";
  });
  const [ptLogo, setPtLogo] = useState<string | null>(() => {
    return localStorage.getItem("CPMI_PORTAL_PT_LOGO") || null;
  });

  const handleUpdatePtName = (name: string) => {
    setPtName(name);
    localStorage.setItem("CPMI_PORTAL_PT_NAME", name);
  };

  const handleUpdatePtLogo = (logo: string | null) => {
    setPtLogo(logo);
    if (logo) {
      localStorage.setItem("CPMI_PORTAL_PT_LOGO", logo);
    } else {
      localStorage.removeItem("CPMI_PORTAL_PT_LOGO");
    }
  };

  // Core synchronized states
  const [cpmis, setCpmis] = useState<CPMI[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 1. Initial State Hydrator from localStorage
  useEffect(() => {
    try {
      const savedCpmis = localStorage.getItem("CPMI_PORTAL_CPMIS");
      const savedTxs = localStorage.getItem("CPMI_PORTAL_TRANSACTIONS");

      if (savedCpmis) {
        setCpmis(JSON.parse(savedCpmis));
      } else {
        setCpmis(SEED_CPMIS);
        localStorage.setItem("CPMI_PORTAL_CPMIS", JSON.stringify(SEED_CPMIS));
      }

      if (savedTxs) {
        setTransactions(JSON.parse(savedTxs));
      } else {
        setTransactions(SEED_TRANSACTIONS);
        localStorage.setItem("CPMI_PORTAL_TRANSACTIONS", JSON.stringify(SEED_TRANSACTIONS));
      }
    } catch (e) {
      // fallback
      setCpmis(SEED_CPMIS);
      setTransactions(SEED_TRANSACTIONS);
    }
  }, []);

  // Save changes automatically
  const updateLocalStorageCpmis = (newData: CPMI[]) => {
    setCpmis(newData);
    localStorage.setItem("CPMI_PORTAL_CPMIS", JSON.stringify(newData));
  };

  const updateLocalStorageTxs = (newData: Transaction[]) => {
    setTransactions(newData);
    localStorage.setItem("CPMI_PORTAL_TRANSACTIONS", JSON.stringify(newData));
  };

  // State manipulation interfaces
  const handleAddCpmi = (newCpmi: CPMI) => {
    // Check duplication
    const exists = cpmis.some((c) => c.id.replace(/\s+/g, "").toUpperCase() === newCpmi.id.replace(/\s+/g, "").toUpperCase());
    if (exists) {
      alert(`ID CPMI "${newCpmi.id}" sudah digunakan oleh kandidat lain. Hubungi petugas administrator jika ada nomor kembar.`);
      return;
    }
    const updated = [newCpmi, ...cpmis];
    updateLocalStorageCpmis(updated);
  };

  const handleUpdateCpmi = (editedCpmi: CPMI) => {
    const updated = cpmis.map((c) => (c.id === editedCpmi.id ? editedCpmi : c));
    updateLocalStorageCpmis(updated);
  };

  const handleAddTransaction = (newTx: Transaction) => {
    const updated = [newTx, ...transactions];
    updateLocalStorageTxs(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    updateLocalStorageTxs(updated);
  };

  // Batch imports
  const handleImportCpmis = (imported: CPMI[]) => {
    const filtered = imported.filter(
      (imp) => !cpmis.some((c) => c.id.replace(/\s+/g, "").toUpperCase() === imp.id.replace(/\s+/g, "").toUpperCase())
    );
    const updated = [...filtered, ...cpmis];
    updateLocalStorageCpmis(updated);
  };

  const handleImportTransactions = (imported: Transaction[]) => {
    const updated = [...imported, ...transactions];
    updateLocalStorageTxs(updated);
  };

  // Reset helper
  const handleResetToSeeds = () => {
    if (confirm("Apakah Anda yakin ingin mengatur ulang pangkalan data kembali ke CPMI bawaan pabrik awal? Semua data input baru Anda akan dihapus.")) {
      setCpmis(SEED_CPMIS);
      setTransactions(SEED_TRANSACTIONS);
      localStorage.setItem("CPMI_PORTAL_CPMIS", JSON.stringify(SEED_CPMIS));
      localStorage.setItem("CPMI_PORTAL_TRANSACTIONS", JSON.stringify(SEED_TRANSACTIONS));
      alert("Database dikembalikan ke awal!");
      setActiveTab("dashboard");
    }
  };

  if (!currentUser) {
    return (
      <LoginScreen
        ptName={ptName}
        ptLogo={ptLogo}
        onLoginSuccess={(user: AppUser) => {
          setCurrentUser(user);
          localStorage.setItem("CPMI_PORTAL_LOGGED_IN_USER", JSON.stringify(user));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-natural-bg/95 flex flex-col font-sans" id="app-main-view">
      
      {/* PROFESSIONAL COMPOSURE TOP HEADER ROW */}
      <header className="bg-white border-b border-natural-accent/30 sticky top-0 z-50 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Title / Corporate logo info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-natural-primary rounded-xl flex items-center justify-center text-white font-bold tracking-wider relative overflow-hidden shadow-md shrink-0">
                {ptLogo ? (
                  <img src={ptLogo} alt="Logo PT" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <Globe className="w-5 h-5 animate-pulse text-white" />
                )}
                <div className="absolute inset-0 bg-white/10 hover:bg-transparent transition-all"></div>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-natural-dark font-serif tracking-tight uppercase leading-none truncate max-w-[180px] sm:max-w-[280px]" title={ptName}>
                  {ptName}
                </div>
                <span className="text-[10px] font-mono text-[#8C8479] font-semibold tracking-wide uppercase block mt-1">
                  Global Human Resource Portal
                </span>
              </div>
            </div>

            {/* General state statistics widgets */}
            <div className="hidden md:flex items-center space-x-4 shrink-0">
              <div className="text-right border-r border-natural-accent/40 pr-4">
                <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">Total Terdata</span>
                <span className="text-base font-bold text-natural-primary">{cpmis.length} CPMI</span>
              </div>
              <div className="text-right border-r border-[#8C8479]/20 pr-4">
                <span className="text-[10px] text-[#8C8479] uppercase block font-semibold font-sans">Ready to Flight</span>
                <span className="text-base font-bold text-natural-secondary">
                  {cpmis.filter(c => c.status.toLowerCase().includes("flight") || c.status.toLowerCase().includes("terbang")).length} CPMI
                </span>
              </div>
              <button
                onClick={handleResetToSeeds}
                className="text-xs text-natural-text hover:text-natural-secondary flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-natural-accent/40 rounded-xl transition-all border border-natural-accent/20 cursor-pointer"
                title="Atur ulang database ke versi bawaan data awal"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Bawaan
              </button>

              {/* Logged in User Badge & LogOut */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-natural-accent/30 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-natural-dark leading-none">{currentUser.name}</p>
                  <span className="text-[9px] text-[#4B6584] font-mono font-bold uppercase tracking-wider block mt-1">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Keluar dari Portal"
                  className="p-2 text-rose-500 hover:text-rose-600 hover:bg-[#FDF7F7] rounded-xl transition-all border border-transparent hover:border-rose-200 cursor-pointer flex items-center justify-center shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CORE NAVIGATION TAB MENU - Centered Layout */}
      <div className="bg-natural-dark border-b border-natural-dark py-1.5 sticky top-16 z-40 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <nav className="flex space-x-1 sm:space-x-2">
            {[
              { id: "dashboard", label: "Ringkasan", icon: BarChart3 },
              { id: "cpmi", label: "Database CPMI", icon: Users },
              { id: "transaksi", label: "Buku Kas Kasir", icon: BookOpen },
              { id: "laporan", label: "Laporan & Laba", icon: FileSpreadsheet },
              { id: "import", label: "Batch Import", icon: FileText },
              { id: "pengaturan-pt", label: "Pengaturan PT", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  id={`tab-nav-${tab.id}`}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-natural-primary text-white shadow-md border-b-2 border-white/20"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* WORKSPACE AREA CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            id="workspace-animate-viewport"
          >
            {activeTab === "dashboard" && (
              <DashboardRingkasan 
                cpmis={cpmis} 
                transactions={transactions} 
                onNavigate={setActiveTab} 
                ptName={ptName}
              />
            )}
            {activeTab === "cpmi" && (
              <CpmiDatabase 
                cpmis={cpmis} 
                transactions={transactions} 
                onAddCpmi={handleAddCpmi} 
                onUpdateCpmi={handleUpdateCpmi} 
                ptName={ptName}
              />
            )}
            {activeTab === "transaksi" && (
              <TransaksiBukuKas 
                transactions={transactions} 
                cpmis={cpmis} 
                onAddTransaction={handleAddTransaction} 
                onDeleteTransaction={handleDeleteTransaction} 
              />
            )}
            {activeTab === "laporan" && (
              <LaporanKeuangan 
                cpmis={cpmis} 
                transactions={transactions} 
                ptName={ptName}
              />
            )}
            {activeTab === "import" && (
              <ImportForm 
                onImportCpmis={handleImportCpmis} 
                onImportTransactions={handleImportTransactions} 
              />
            )}
            {activeTab === "pengaturan-pt" && (
              <PengaturanPt
                ptName={ptName}
                onUpdatePtName={handleUpdatePtName}
                ptLogo={ptLogo}
                onUpdatePtLogo={handleUpdatePtLogo}
                currentUser={currentUser}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* FOOTER STATEMENTS COMPACT */}
      <footer className="bg-white border-t border-natural-accent/30 py-4 text-center text-[10px] text-[#8C8479] font-mono print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} {ptName}. Hak Cipta Dilindungi Undang-Undang.</span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-natural-primary" />
            Keamanan Data Lunas &bull; Penyimpanan di Browser Lokal Anda
          </span>
        </div>
      </footer>

    </div>
  );
}
