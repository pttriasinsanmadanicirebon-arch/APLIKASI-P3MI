/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CPMI, Transaction } from "../types";
import { parseCPMIRows, parseTransactionRows, formatRupiah } from "../data/seedData";
import { ClipboardCopy, FileText, CheckCircle2, RefreshCw, HelpCircle, Import, Terminal } from "lucide-react";

interface Props {
  onImportCpmis: (cpmis: CPMI[]) => void;
  onImportTransactions: (txs: Transaction[]) => void;
}

export default function ImportForm({ onImportCpmis, onImportTransactions }: Props) {
  // Texboxes inputs
  const [cpmiRawText, setCpmiRawText] = useState("");
  const [txRawText, setTxRawText] = useState("");

  // Preview results
  const [parsedCpmis, setParsedCpmis] = useState<CPMI[]>([]);
  const [parsedTransactions, setParsedTransactions] = useState<Transaction[]>([]);

  // Show status
  const [processStatus, setProcessStatus] = useState<string | null>(null);

  // Trigger parsing CPMI
  const handleParseCpmi = () => {
    if (!cpmiRawText.trim()) {
      alert("Masukkan teks mentah CPMI terlebih dahulu!");
      return;
    }
    try {
      const result = parseCPMIRows(cpmiRawText);
      setParsedCpmis(result);
      setProcessStatus(`CPMI berhasil diurai: ${result.length} baris.`);
    } catch (e) {
      alert("Gagal mengurai teks CPMI. Periksa format pengetikan.");
    }
  };

  // Trigger parsing Transactions
  const handleParseTransactions = () => {
    if (!txRawText.trim()) {
      alert("Masukkan teks mentah Transaksi terlebih dahulu!");
      return;
    }
    try {
      const result = parseTransactionRows(txRawText);
      setParsedTransactions(result);
      setProcessStatus(`Transaksi berhasil diurai: ${result.length} baris.`);
    } catch (e) {
      alert("Gagal mengurai teks transaksi. Periksa format pengetikan.");
    }
  };

  // Commit parsed CPMIs to local state
  const handleCommitCpmis = () => {
    if (parsedCpmis.length === 0) return;
    onImportCpmis(parsedCpmis);
    setParsedCpmis([]);
    setCpmiRawText("");
    setProcessStatus(`Berhasil mengimpor ${parsedCpmis.length} CPMI ke database lokal!`);
    alert(`Sukses menambahkan ${parsedCpmis.length} CPMI baru ke database.`);
  };

  // Commit parsed Transactions to local state
  const handleCommitTransactions = () => {
    if (parsedTransactions.length === 0) return;
    onImportTransactions(parsedTransactions);
    setParsedTransactions([]);
    setTxRawText("");
    setProcessStatus(`Berhasil mengimpor ${parsedTransactions.length} Transaksi kas ke database lokal!`);
    alert(`Sukses menambahkan ${parsedTransactions.length} transaksi kas baru.`);
  };

  return (
    <div className="space-y-6" id="bulk-import-portal-root">
      
      {/* Intro info box */}
      <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm">
        <div className="flex items-center space-x-3 text-natural-primary mb-3">
          <Terminal className="w-6 h-6" />
          <h2 className="text-xl font-bold text-natural-dark font-serif">Batch Import / Salin Rekaman Log</h2>
        </div>
        <p className="text-xs text-[#8C8479] leading-relaxed">
          Punya rekaman data CPMI baru atau buku kas baru dari pesan WhatsApp atau dokumen teks? 
          Daripada memasukkan satu per satu via form, tempel teks mentah tersebut di bawah ini. Mesin cerdas aplikasi kami akan menguraikan nomor ID, nama kandidat, jenis biaya, tanggal, dan rupiahnya secara instan dan rapi!
        </p>
      </div>

      {processStatus && (
        <div className="bg-[#E1EDD8] border border-[#7D8F69]/30 text-[#5A6946] p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#5A6946]" />
          {processStatus}
        </div>
      )}

      {/* Main Dual View Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: CPMI BATCH PASTER */}
        <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-bold text-natural-dark text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-natural-primary" />
                Batch Tempel Teks CPMI
              </h3>
              <span className="text-[10px] text-[#8C8479] font-mono italic">Format: [No] [ID Prefix] [ID Num] [NAME]...</span>
            </div>

            <textarea
              rows={8}
              value={cpmiRawText}
              onChange={(e) => setCpmiRawText(e.target.value)}
              placeholder="Contoh salin baris:&#10;1 TSEX 6440 AMELIA KONAAH FLIGHT PA Irwan&#10;2 TS 6317 WANTIAH Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT Pa Hj Nono"
              className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-natural-primary font-mono text-natural-dark h-54 placeholder-[#8C8479]/50"
            />

            {/* Quick Demo Help */}
            <div className="mt-3 bg-natural-pane border border-natural-accent/20 p-3 rounded-xl text-[10px] text-[#8C8479] space-y-1">
              <strong className="text-natural-dark">Saran Penggunaan:</strong>
              <p>Pastikan baris diawali nomor indeks, kemudian kode ID CPMI (TS/TSEX), nama kandidat, status (FLIGHT, BNSP/BLK, dll) dan diakhiri petugas sponsor.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-natural-accent/15 mt-4 flex items-center gap-2">
            <button
              onClick={handleParseCpmi}
              className="flex-1 bg-natural-primary hover:bg-natural-primary-hover text-white font-bold text-xs py-2.5 rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              Proses & Urai Data (Preview)
            </button>

            {parsedCpmis.length > 0 && (
              <button
                onClick={handleCommitCpmis}
                className="flex-1 bg-[#5A6946] hover:bg-[#4E5B3C] text-white font-bold text-xs py-2.5 rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Import className="w-3.5 h-3.5" />
                Masukkan {parsedCpmis.length} CPMI Baru
              </button>
            )}
          </div>

          {/* Parsed elements preview list */}
          {parsedCpmis.length > 0 && (
            <div className="mt-4 border border-natural-accent/30 bg-natural-pane rounded-xl p-3 max-h-48 overflow-y-auto w-full">
              <span className="text-[10px] font-bold text-natural-primary uppercase block mb-2 font-mono">Hasil Preview Uraian CPMI</span>
              <div className="space-y-1.5 divide-y divide-natural-accent/15 text-[11px] w-full">
                {parsedCpmis.map((c, i) => (
                  <div key={i} className="pt-1.5 first:pt-0 flex justify-between">
                    <div>
                      <strong className="text-natural-primary font-mono">{c.id}</strong> — <span className="font-bold text-natural-dark">{c.name}</span>
                    </div>
                    <span className="text-[#8C8479] italic">PL: {c.recruiter}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* PANEL 2: TRANSACTIONS BATCH PASTER */}
        <div className="bg-white p-6 rounded-3xl border border-natural-accent/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-bold text-natural-dark text-sm flex items-center gap-1.5">
                <ClipboardCopy className="w-4 h-4 text-natural-accent" />
                Batch Tempel Transaksi Buku Kas
              </h3>
              <span className="text-[10px] text-[#8C8479] font-mono italic">Format: [DD/MM/YYYY] [Category] [ID] [Name] [Rp...]</span>
            </div>

            <textarea
              rows={8}
              value={txRawText}
              onChange={(e) => setTxRawText(e.target.value)}
              placeholder="Contoh salin baris:&#10;26/02/2025 Fee Sponsor TS6701 Khodijah Rp2.500.000&#10;22/05/2025 Keterangan Lain Pak Edy Biaya Kepengurusan Izin cabang Rp1.400.000"
              className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-natural-primary font-mono text-natural-dark h-54 placeholder-[#8C8479]/50"
            />

            {/* Quick Demo Help */}
            <div className="mt-3 bg-natural-pane border border-natural-accent/20 p-3 rounded-xl text-[10px] text-[#8C8479] space-y-1">
              <strong className="text-natural-dark">Saran Penggunaan:</strong>
              <p>Pastikan baris diawali tanggal Indo (DD/MM/YYYY), kategori, kemudian CPMI ID (TS/TSEX/TSF/TSJK) dan diakhiri nominal rupiah (Rp1.500.000).</p>
            </div>
          </div>

          <div className="pt-4 border-t border-natural-accent/15 mt-4 flex items-center gap-2">
            <button
              onClick={handleParseTransactions}
              className="flex-1 bg-natural-primary hover:bg-natural-primary-hover text-white font-bold text-xs py-2.5 rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Proses & Urai Data (Preview)
            </button>

            {parsedTransactions.length > 0 && (
              <button
                onClick={handleCommitTransactions}
                className="flex-1 bg-[#5A6946] hover:bg-[#4E5B3C] text-white font-bold text-xs py-2.5 rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Import className="w-3.5 h-3.5" />
                Masukkan {parsedTransactions.length} Transaksi Baru
              </button>
            )}
          </div>

          {/* Parsed elements preview list */}
          {parsedTransactions.length > 0 && (
            <div className="mt-4 border border-natural-accent/30 bg-natural-pane rounded-xl p-3 max-h-48 overflow-y-auto w-full">
              <span className="text-[10px] font-bold text-natural-primary uppercase block mb-2 font-mono">Hasil Preview Uraian Transaksi</span>
              <div className="space-y-1.5 divide-y divide-natural-accent/15 text-[11px] w-full">
                {parsedTransactions.map((t, i) => (
                  <div key={i} className="pt-1.5 first:pt-0 flex justify-between">
                    <div>
                      <strong className="text-natural-primary font-bold text-xs">{t.category}</strong> untuk <span className="font-mono text-natural-dark font-bold">{t.pmiRef}</span>
                      <span className="text-[#8C8479] block text-[9px] truncate max-w-xs italic mt-0.5">{t.description}</span>
                    </div>
                    <span className="font-mono font-bold text-natural-dark shrink-0">{formatRupiah(t.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
