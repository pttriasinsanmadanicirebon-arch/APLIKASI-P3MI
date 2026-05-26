/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from "react";
import { CPMI, Transaction, ProcessStatus } from "../types";
import { formatRupiah, CPMI_STATUS_OPTIONS } from "../data/seedData";
import { 
  Search, Filter, Plus, Edit2, CheckCircle2, XCircle, AlertCircle, FileText, 
  MapPin, User, Building, Landmark, ChevronRight, ChevronLeft, Calendar, FileCheck, CheckSquare, Square,
  Trash2, Paperclip, Download
} from "lucide-react";

interface Props {
  cpmis: CPMI[];
  transactions: Transaction[];
  onAddCpmi: (cpmi: CPMI) => void;
  onUpdateCpmi: (cpmi: CPMI) => void;
  ptName?: string;
}

export default function CpmiDatabase({ cpmis, transactions, onAddCpmi, onUpdateCpmi, ptName }: Props) {
  // File upload state for Candidate attachments module
  const [candDragActive, setCandDragActive] = useState(false);
  const candFileRef = useRef<HTMLInputElement>(null);

  // Navigation & filtration states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [recruiterFilter, setRecruiterFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected CPMI for detailed drawer view
  const [selectedCpmiId, setSelectedCpmiId] = useState<string | null>(null);

  // Forms / Modals state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // New/Edited CPMI Form values
  const [formIdPrefix, setFormIdPrefix] = useState("TS");
  const [formIdNum, setFormIdNum] = useState("");
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState("PROCESS");
  const [formDateInput, setFormDateInput] = useState(() => new Date().toISOString().substring(0, 10));
  const [formDestination, setFormDestination] = useState("Taiwan");
  const [formGender, setFormGender] = useState("Perempuan");
  const [formCategory, setFormCategory] = useState("TKW (In Formal)");
  const [formAgency, setFormAgency] = useState(ptName || "PT. TRIAS INSAN MADANI");
  const [formRecruiter, setFormRecruiter] = useState("");
  const [formNotes, setFormNotes] = useState("");
  
  // Document toggles for form / direct edit
  const [formDocs, setFormDocs] = useState({
    ktp: true,
    kk: true,
    ijazah: false,
    aktaLahir: false,
    suratIzinKeluarga: false,
    paspor: false,
    medicalCheck: false,
  });

  // Unique Recruiter list for filtration
  const recruitersList = useMemo(() => {
    const list = new Set<string>();
    cpmis.forEach((c) => {
      if (c.recruiter) list.add(c.recruiter);
    });
    return Array.from(list).sort();
  }, [cpmis]);

  // Handle detailed drawer opening
  const selectedCpmi = useMemo(() => {
    return cpmis.find((c) => c.id === selectedCpmiId) || null;
  }, [cpmis, selectedCpmiId]);

  // Attachment upload and management handlers
  const handleCandDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setCandDragActive(true);
    } else if (e.type === "dragleave") {
      setCandDragActive(false);
    }
  };

  const handleCandDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCandDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file: File) => {
        uploadCandidateFile(file);
      });
    }
  };

  const handleCandFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        uploadCandidateFile(file);
      });
    }
  };

  const uploadCandidateFile = (file: File) => {
    if (!selectedCpmi) return;

    // Local Storage safety limit (3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert(`Berkas "${file.name}" melebihi batas 3 MB! Harap unggah berkas yang lebih kecil.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const newAttachment = {
        id: "ATT-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        uploadedAt: new Date().toISOString(),
        base64Data: base64
      };

      const currentAttachments = selectedCpmi.attachments || [];
      const updatedCpmi = {
        ...selectedCpmi,
        attachments: [...currentAttachments, newAttachment]
      };

      onUpdateCpmi(updatedCpmi);
    };
    reader.onerror = () => {
      alert("Gagal mengonversi berkas ke format Base64.");
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadAttachment = (att: any) => {
    const link = document.createElement("a");
    link.href = att.base64Data;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDeleteAttachment = (attId: string) => {
    if (!selectedCpmi) return;
    if (confirm("Apakah Anda yakin ingin menghapus berkas lampiran ini?")) {
      const filtered = (selectedCpmi.attachments || []).filter(a => a.id !== attId);
      onUpdateCpmi({
        ...selectedCpmi,
        attachments: filtered
      });
    }
  };

  // Link transactions specifically for the selected CPMI
  const selectedCpmiTransactions = useMemo(() => {
    if (!selectedCpmiId) return [];
    
    // Some transactions have pmiRef matched directly (e.g. "TS 6701")
    return transactions.filter((t) => {
      // Normalize both IDs to remove extra white spaces for comparison
      const normRef1 = t.pmiRef.replace(/\s+/g, "").toUpperCase();
      const normRef2 = selectedCpmiId.replace(/\s+/g, "").toUpperCase();
      return normRef1 === normRef2;
    });
  }, [transactions, selectedCpmiId]);

  // Aggregate sum of transactions for selected CPMI
  const selectedCpmiTotalCost = useMemo(() => {
    return selectedCpmiTransactions.reduce((acc, t) => acc + t.value, 0);
  }, [selectedCpmiTransactions]);

  // Filtered List CPMI
  const filteredCpmis = useMemo(() => {
    return cpmis.filter((c) => {
      const matchSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.recruiter && c.recruiter.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchStatus = !statusFilter || c.status.toLowerCase().includes(statusFilter.toLowerCase());
      const matchRecruiter = !recruiterFilter || c.recruiter === recruiterFilter;

      return matchSearch && matchStatus && matchRecruiter;
    });
  }, [cpmis, searchTerm, statusFilter, recruiterFilter]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredCpmis.length / itemsPerPage) || 1;
  const paginatedCpmis = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCpmis.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCpmis, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Pre-fill Edit form
  const handleStartEdit = (cpmi: CPMI) => {
    setFormIdPrefix(cpmi.id.split(" ")[0] || "TS");
    setFormIdNum(cpmi.id.split(" ")[1] || "");
    setFormName(cpmi.name);
    setFormStatus(cpmi.status);
    setFormDateInput(cpmi.dateInput);
    setFormDestination(cpmi.destination);
    setFormGender(cpmi.gender);
    setFormCategory(cpmi.category);
    setFormAgency(cpmi.agency);
    setFormRecruiter(cpmi.recruiter);
    setFormNotes(cpmi.notes || "");
    setFormDocs(cpmi.documents || {
      ktp: false,
      kk: false,
      ijazah: false,
      aktaLahir: false,
      suratIzinKeluarga: false,
      paspor: false,
      medicalCheck: false
    });
    setIsEditing(true);
    setIsAddingNew(false);
  };

  // Reset form
  const handleResetForm = () => {
    setFormIdPrefix("TS");
    // Auto increment helper based on max ID
    const nums = cpmis.map(c => {
      const parts = c.id.split(/\s+/);
      const last = parts[parts.length - 1];
      const parsed = parseInt(last, 10);
      return isNaN(parsed) ? 0 : parsed;
    });
    const maxNum = Math.max(...nums, 6000);
    setFormIdNum(String(maxNum + 1));
    setFormName("");
    setFormStatus("PROCESS");
    setFormDateInput(new Date().toISOString().substring(0, 10));
    setFormDestination("Taiwan");
    setFormGender("Perempuan");
    setFormCategory("TKW (In Formal)");
    setFormAgency(ptName || "PT. TRIAS INSAN MADANI");
    setFormRecruiter("");
    setFormNotes("");
    setFormDocs({
      ktp: true,
      kk: true,
      ijazah: false,
      aktaLahir: false,
      suratIzinKeluarga: false,
      paspor: false,
      medicalCheck: false,
    });
  };

  // Submit forms
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formIdNum) {
      alert("Mohon isi ID dan Nama CPMI!");
      return;
    }

    const fullId = `${formIdPrefix.toUpperCase().trim()} ${formIdNum.trim()}`;

    const payload: CPMI = {
      id: fullId,
      name: formName.trim().toUpperCase(),
      status: formStatus as ProcessStatus,
      dateInput: formDateInput,
      destination: formDestination,
      gender: formGender,
      category: formCategory,
      agency: formAgency,
      recruiter: formRecruiter.trim() || "Pusat",
      notes: formNotes.trim(),
      documents: formDocs,
    };

    if (isEditing) {
      onUpdateCpmi(payload);
      if (selectedCpmiId === payload.id || selectedCpmiId === `${formIdPrefix} ${formIdNum}`) {
        setSelectedCpmiId(payload.id);
      }
      setIsEditing(false);
    } else {
      onAddCpmi(payload);
      setIsAddingNew(false);
      setSelectedCpmiId(payload.id); // View details instantly
    }
  };

  // Instant document toggle helper directly in the details panel
  const handleToggleDocDetail = (docKey: keyof typeof formDocs) => {
    if (!selectedCpmi) return;
    const updatedDocs = {
      ...selectedCpmi.documents,
      [docKey]: !selectedCpmi.documents?.[docKey]
    };
    onUpdateCpmi({
      ...selectedCpmi,
      documents: updatedDocs
    });
  };

  // Status Badge Creator
  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("FLIGHT") || s.includes("TERBANG")) {
      return (
        <span className="bg-[#E1EDD8] text-[#5A6946] border border-[#E1EDD8] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7D8F69] mr-1.5"></span>
          TERBANG
        </span>
      );
    }
    if (s.includes("BNSP") || s.includes("BLK")) {
      return (
        <span className="bg-[#F5E6D3] text-[#8B6E4E] border border-[#E5D3B3]/40 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B6E4E] mr-1.5"></span>
          BNSP / BLK
        </span>
      );
    }
    if (s.includes("CANCEL")) {
      return (
        <span className="bg-[#F5D3D3]/70 text-[#8B4E4E] border border-[#F5D3D3] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
          CANCEL
        </span>
      );
    }
    if (s.includes("TOLAK")) {
      return (
        <span className="bg-[#F9F6F1] text-[#8C8479] border border-stone-200 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8C8479] mr-1.5"></span>
          DITOLAK
        </span>
      );
    }
    if (s.includes("FINAL")) {
      return (
        <span className="bg-[#E1EDD8]/70 text-[#5A6946] border border-[#E1EDD8] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7D8F69] mr-1.5"></span>
          FINAL STAGE
        </span>
      );
    }
    if (s.includes("PASPOR")) {
      return (
        <span className="bg-[#F5E6D3]/50 text-[#8B6E4E] border border-[#E5D3B3]/20 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B6E4E] mr-1.5"></span>
          ID PASPOR
        </span>
      );
    }
    if (s.includes("VERIF")) {
      return (
        <span className="bg-[#D3E5F5]/60 text-[#4E6E8B] border border-blue-200/20 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4E6E8B] mr-1.5"></span>
          VERIF ID
        </span>
      );
    }
    return (
      <span className="bg-[#D3E5F5]/50 text-[#4E6E8B] border border-[#D3E5F5] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="cpmi-database-container">
      
      {/* MASTER LIST (Takes 2 Columns) */}
      <div className="xl:col-span-2 bg-white rounded-3xl border border-natural-accent/30 shadow-sm flex flex-col justify-between">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-natural-dark">Database Calon Pekerja Migran (CPMI)</h2>
              <p className="text-xs text-[#8C8479] mt-0.5">Total terdaftar: {filteredCpmis.length} orang ({cpmis.length} total sistem)</p>
            </div>
            
            <button
              id="btn-add-cpmi"
              onClick={() => {
                handleResetForm();
                setIsAddingNew(true);
                setIsEditing(false);
              }}
              className="bg-natural-primary hover:bg-natural-primary-hover text-white font-semibold text-xs px-5 py-2.5 rounded-full flex items-center gap-1.5 self-start transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah CPMI Baru
            </button>
          </div>
 
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-natural-pane rounded-2xl p-4 border border-natural-accent/20">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8C8479]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama, ID, atau sponsor..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-natural-accent/40 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark placeholder-[#8C8479]/60 font-medium"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8C8479]">
                <Filter className="w-4 h-4" />
              </span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-natural-accent/40 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark appearance-none font-semibold"
              >
                <option value="">Semua Status Proses</option>
                <option value="PROCESS">PROCESS (PROSES)</option>
                <option value="BNSP/BLK">BNSP / BLK</option>
                <option value="ID PASPOR">ID PASPOR</option>
                <option value="FINAL STAGE">FINAL STAGE</option>
                <option value="FLIGHT">TERBANG (FLIGHT)</option>
                <option value="CANCEL">CANCEL</option>
                <option value="TOLAK">TOLAK</option>
                <option value="VERIF">VERIF ID</option>
              </select>
            </div>

            {/* Recruiter filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8C8479]">
                <User className="w-4 h-4" />
              </span>
              <select
                value={recruiterFilter}
                onChange={(e) => {
                  setRecruiterFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-natural-accent/40 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark appearance-none font-semibold"
              >
                <option value="">Semua Petugas Sponsor</option>
                {recruitersList.map((rec) => (
                  <option key={rec} value={rec}>{rec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-natural-accent/10 text-[11px] uppercase tracking-wider text-[#8C8479] font-bold bg-[#F9F6F1]">
                  <th className="py-3 px-4">ID / Referensi</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-2">Status Proses</th>
                  <th className="py-3 px-4">Petugas Sponsor</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9F6F1] text-xs">
                {paginatedCpmis.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#8C8479] font-medium">
                      <AlertCircle className="w-8 h-8 mx-auto text-[#E5D3B3] mb-2" />
                      Tidak ada data CPMI yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  paginatedCpmis.map((cpmi) => {
                    const isSelected = selectedCpmiId === cpmi.id;
                    return (
                      <tr 
                        key={cpmi.id} 
                        onClick={() => setSelectedCpmiId(cpmi.id)}
                        className={`hover:bg-natural-pane/40 cursor-pointer transition-colors ${
                          isSelected ? "bg-[#E1EDD8]/50 hover:bg-[#E1EDD8]/70" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-natural-primary text-xs">
                          {cpmi.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-natural-dark">{cpmi.name}</div>
                          <div className="text-[10px] text-[#8C8479] font-mono mt-0.5">{cpmi.category} · {cpmi.destination}</div>
                        </td>
                        <td className="py-3.5 px-2">
                          {getStatusBadge(cpmi.status)}
                        </td>
                        <td className="py-3.5 px-4 text-[#4A443F] font-semibold">
                          {cpmi.recruiter || "Kemitraan"}
                        </td>
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleStartEdit(cpmi)}
                            title="Edit Data"
                            className="p-1 px-3 bg-natural-pane hover:bg-natural-accent/40 text-[#4A443F] border border-natural-accent/30 rounded-lg text-[11px] font-bold transition-all"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="p-4 border-t border-natural-accent/15 bg-natural-pane rounded-b-3xl flex justify-between items-center text-xs">
          <span className="text-[#8C8479] font-mono font-bold">
            Halaman {currentPage} dari {totalPages} ({filteredCpmis.length} CPMI)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-natural-accent/30 bg-white text-[#4A443F] hover:bg-natural-bg disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-natural-accent/30 bg-white text-[#4A443F] hover:bg-natural-bg disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>


      {/* FORM / DETAILED DRAWER (1 Column) */}
      {/* On desktop (xl), it takes 1 column in the grid.
          On mobile (<xl), if a detail/form is open, we display it as a fixed full-screen modal with a glass backdrop! */}
      <div 
        id="cpmi-details-drawer-wrapper"
        onClick={() => {
          // If in mobile responsive layout, clicking the backdrop closes the active drawer
          if (window.innerWidth < 1280) {
            setIsAddingNew(false);
            setIsEditing(false);
            setSelectedCpmiId(null);
          }
        }}
        className={`${
          isAddingNew || isEditing || selectedCpmi ? (
            "fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A443F]/60 backdrop-blur-xs xl:relative xl:inset-auto xl:bg-transparent xl:p-0 xl:backdrop-filter-none xl:z-0"
          ) : (
            "hidden xl:block"
          )
        }`}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`${
            isAddingNew || isEditing || selectedCpmi ? (
              "bg-white rounded-3xl border border-natural-accent/30 shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto xl:max-h-none xl:shadow-sm xl:max-w-none transition-all duration-300 transform scale-100"
            ) : (
              "bg-white rounded-3xl border border-natural-accent/30 shadow-sm p-6 overflow-hidden h-full flex flex-col justify-between"
            )
          }`}
        >
          {/* VIEW 1: Form Adding/Editing Container */}
          {isAddingNew || isEditing ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-natural-dark font-serif">
                  {isEditing ? "Edit Data CPMI" : "Registrasi CPMI Baru"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setIsEditing(false);
                  }}
                  className="text-xs text-natural-dark hover:text-natural-secondary shrink-0 font-bold bg-natural-pane px-3 py-1.5 rounded-full border border-natural-accent/20 cursor-pointer"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* ID Entry Field */}
                <div>
                  <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Kode / ID Referensi CPMI *</label>
                  <div className="flex gap-2">
                    <select
                      value={formIdPrefix}
                      onChange={(e) => setFormIdPrefix(e.target.value)}
                      className="bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary font-bold text-natural-dark"
                    >
                      <option value="TS">TS</option>
                      <option value="TSEX">TSEX</option>
                      <option value="TSF">TSF</option>
                      <option value="TSJK">TSJK</option>
                    </select>
                    <input
                      type="text"
                      required
                      disabled={isEditing}
                      placeholder="Contoh: 6317"
                      value={formIdNum}
                      onChange={(e) => setFormIdNum(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary font-mono font-bold text-natural-dark"
                    />
                  </div>
                  {isEditing && <p className="text-[10px] text-[#8C8479] mt-1 italic">ID CPMI utama tidak dapat diubah di pertengahan proses.</p>}
                </div>

                {/* Name File */}
                <div>
                  <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Nama Lengkap CPMI *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Sesuai KTP"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary font-bold text-natural-dark"
                  />
                </div>

                {/* Status form dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Status Proses Sekarang</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-semibold"
                  >
                    {CPMI_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Sponsor Recruiter */}
                <div>
                  <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Petugas Sponsor / Lapangan (PL)</label>
                  <input
                    type="text"
                    placeholder="Contoh: PA Irwan, Bu Yatni"
                    value={formRecruiter}
                    onChange={(e) => setFormRecruiter(e.target.value)}
                    className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-medium"
                  />
                </div>

                {/* Two columns gender / Destination */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Gender</label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value)}
                      className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-semibold"
                    >
                      <option value="Perempuan">Perempuan</option>
                      <option value="Laki-laki">Laki-laki</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Tujuan</label>
                    <input
                      type="text"
                      value={formDestination}
                      onChange={(e) => setFormDestination(e.target.value)}
                      className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-semibold"
                    />
                  </div>
                </div>

                {/* Category, Agency & Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Tgl Registrasi</label>
                    <input
                      type="date"
                      value={formDateInput}
                      onChange={(e) => setFormDateInput(e.target.value)}
                      className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-[11px] p-2 focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Kategori Pekerjaan</label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Asosiasi PT / Agensi</label>
                  <input
                    type="text"
                    value={formAgency}
                    onChange={(e) => setFormAgency(e.target.value)}
                    className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary text-natural-dark font-medium"
                  />
                </div>

                {/* Documents checklist checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-2">Checklist Kesiapan Dokumen</label>
                  <div className="grid grid-cols-2 gap-2.5 bg-natural-pane p-3 rounded-2xl border border-natural-accent/30 text-xs text-natural-dark font-medium">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-natural-primary focus:ring-natural-primary" 
                        checked={formDocs.ktp} 
                        onChange={(e) => setFormDocs({...formDocs, ktp: e.target.checked})}
                      />
                      KTP Asli
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-natural-primary focus:ring-natural-primary" 
                        checked={formDocs.kk} 
                        onChange={(e) => setFormDocs({...formDocs, kk: e.target.checked})}
                      />
                      Kartu Keluarga
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-natural-primary focus:ring-natural-primary" 
                        checked={formDocs.ijazah} 
                        onChange={(e) => setFormDocs({...formDocs, ijazah: e.target.checked})}
                      />
                      Ijazah Terakhir
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-natural-primary focus:ring-natural-primary" 
                        checked={formDocs.aktaLahir} 
                        onChange={(e) => setFormDocs({...formDocs, aktaLahir: e.target.checked})}
                      />
                      Akta Kelahiran
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-natural-primary focus:ring-natural-primary" 
                        checked={formDocs.suratIzinKeluarga} 
                        onChange={(e) => setFormDocs({...formDocs, suratIzinKeluarga: e.target.checked})}
                      />
                      Izin Keluarga
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-natural-primary focus:ring-natural-primary" 
                        checked={formDocs.paspor} 
                        onChange={(e) => setFormDocs({...formDocs, paspor: e.target.checked})}
                      />
                      Paspor
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8C8479] uppercase tracking-wide mb-1">Catatan Tambahan / Hambatan</label>
                  <textarea
                    placeholder="Keterangan medis, kendala paspor, verifikasi ID, dll..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-natural-pane border border-natural-accent/40 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-natural-primary h-16 font-medium text-natural-dark"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-natural-dark hover:opacity-90 text-white font-semibold text-xs py-3 rounded-full transition-all cursor-pointer shadow-sm"
                >
                  {isEditing ? "Perbarui Data CPMI" : "Draft Registrasi CPMI"}
                </button>
              </form>
            </div>
          ) : selectedCpmi ? (
            
            /* VIEW 2: Detailed Candidate Profile Profile Drawer (Linked Finances) */
            <div className="space-y-6" id="cpmi-details-drawer">
              {/* Drawer Header details */}
              <div className="border-b border-natural-accent/20 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#5A6946] bg-[#E1EDD8] px-3 py-1 rounded-full uppercase tracking-wider">
                      {selectedCpmi.id}
                    </span>
                    <h3 className="text-xl font-bold font-serif text-natural-dark mt-3">{selectedCpmi.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(selectedCpmi)}
                      className="p-2 bg-[#F9F6F1] hover:bg-natural-accent/20 text-[#4A443F] rounded-full border border-natural-accent/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCpmiId(null)}
                      className="p-2 bg-[#F9F6F1] hover:bg-rose-50 hover:text-rose-600 text-[#4A443F] rounded-full border border-natural-accent/40 transition-colors cursor-pointer"
                      title="Tutup detail"
                    >
                      <XCircle className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  {getStatusBadge(selectedCpmi.status)}
                </div>
              </div>

              {/* Demographics / General Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#8C8479] uppercase tracking-wider">Biodata & Administrasi</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-natural-pane p-3 rounded-2xl border border-natural-accent/10">
                    <span className="text-[#8C8479] block mb-0.5 font-semibold text-[10px] uppercase">Petugas Sponsor / PL</span>
                    <span className="font-bold text-natural-dark">{selectedCpmi.recruiter || "Kemitraan/Pusat"}</span>
                  </div>
                  <div className="bg-natural-pane p-3 rounded-2xl border border-natural-accent/10">
                    <span className="text-[#8C8479] block mb-0.5 font-semibold text-[10px] uppercase">Asosiasi Agen PT</span>
                    <span className="font-bold text-natural-dark truncate block text-[11px]">{selectedCpmi.agency || "PT. Trias Insan Madani"}</span>
                  </div>
                  <div className="bg-natural-pane p-3 rounded-2xl border border-natural-accent/10">
                    <span className="text-[#8C8479] block mb-0.5 font-semibold text-[10px] uppercase">Negara Tujuan / Gen</span>
                    <span className="font-bold text-natural-dark">{selectedCpmi.destination} ({selectedCpmi.gender === "Perempuan" ? "P" : "L"})</span>
                  </div>
                  <div className="bg-natural-pane p-3 rounded-2xl border border-natural-accent/10">
                    <span className="text-[#8C8479] block mb-0.5 font-semibold text-[10px] uppercase">Kategori Sektor</span>
                    <span className="font-bold text-natural-dark truncate block text-[11px]">{selectedCpmi.category}</span>
                  </div>
                </div>
              </div>

              {/* Document Completeness Checklist directly toggleable */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-[#8C8479] uppercase tracking-wider">Persyaratan Dokumen</h4>
                  <span className="text-[10px] text-[#8C8479] italic font-mono">(Klik untuk ubah)</span>
                </div>
                <div className="bg-natural-pane p-4 rounded-2xl border border-natural-accent/30 space-y-2.5 text-xs">
                  {[
                    { key: "ktp", label: "KTP Asli / Identitas" },
                    { key: "kk", label: "Kartu Keluarga (KK)" },
                    { key: "ijazah", label: "Ijazah Pendidikan" },
                    { key: "aktaLahir", label: "Akta Kelahiran" },
                    { key: "suratIzinKeluarga", label: "Surat Izin Keluarga (SIPP)" },
                    { key: "paspor", label: "Kesiapan Fisik Paspor" },
                  ].map((item) => {
                    const hasDoc = selectedCpmi.documents?.[item.key as keyof typeof formDocs] ?? false;
                    return (
                      <div 
                        key={item.key} 
                        onClick={() => handleToggleDocDetail(item.key as keyof typeof formDocs)}
                        className="flex items-center justify-between cursor-pointer group py-1 hover:bg-natural-accent/20 px-1.5 rounded-lg transition-colors border-b border-natural-accent/10 last:border-none"
                      >
                        <span className="text-natural-dark font-semibold">{item.label}</span>
                        {hasDoc ? (
                          <CheckSquare className="w-4 h-4 text-[#5A6946] group-hover:text-natural-secondary shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-[#8C8479]/50 group-hover:text-natural-primary shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FINANCIAL TRANSACTIONS BREAKDOWN SPECIFIC FOR THIS CPMI */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#8C8479] uppercase tracking-wider">Histori Jurnal Pengeluaran</h4>
                  <span className="text-xs font-mono font-bold text-[#8B4E4E] bg-[#F5D3D3]/70 px-3 py-1 rounded-full border border-[#F5D3D3]">
                    {formatRupiah(selectedCpmiTotalCost)}
                  </span>
                </div>

                <div className="bg-natural-pane rounded-2xl p-4 border border-natural-accent/30 space-y-3 max-h-56 overflow-y-auto">
                  {selectedCpmiTransactions.length === 0 ? (
                    <p className="text-xs text-[#8C8479] italic text-center py-4">Belum ada transaksi operasional khusus untuk CPMI ini.</p>
                  ) : (
                    selectedCpmiTransactions.map((t) => (
                      <div key={t.id} className="flex justify-between items-start border-b border-natural-accent/20 last:border-none pb-2.5 last:pb-0">
                        <div>
                          <div className="text-xs font-bold text-natural-dark">{t.category}</div>
                          <span className="text-[10px] text-[#8C8479] block font-mono mt-0.5">
                            {t.date ? new Date(t.date).toLocaleDateString("id-ID") : "-"}
                          </span>
                          {t.description && (
                            <span className="text-[10px] text-[#8C8479]/80 italic block leading-tight mt-1 max-w-[210px] truncate">
                              {t.description}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono font-bold text-natural-dark shrink-0">
                          {formatRupiah(t.value)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedCpmi.notes && (
                <div className="bg-[#F5E6D3]/60 border border-[#E5D3B3] rounded-2xl p-4">
                  <span className="text-[10px] uppercase font-bold text-[#8B6E4E] font-mono block">Catatan Kasus / Memo</span>
                  <p className="text-xs text-[#8B6E4E] mt-1.5 font-medium leading-relaxed">{selectedCpmi.notes}</p>
                </div>
              )}

              {/* ARSIP BERKAS & LAMPIRAN CPMI */}
              <div className="space-y-3 pt-3 border-t border-natural-accent/20">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#8C8479] uppercase tracking-wider font-sans">Arsip Berkas & Lampiran</h4>
                  <span className="text-[10px] text-natural-primary font-bold bg-neutral-100 border border-natural-accent/30 px-2.5 py-0.5 rounded-full font-mono">
                    {(selectedCpmi.attachments || []).length} Berkas
                  </span>
                </div>

                {/* Dashed Drag/Click Dropzone */}
                <div
                  onDragEnter={handleCandDrag}
                  onDragOver={handleCandDrag}
                  onDragLeave={handleCandDrag}
                  onDrop={handleCandDrop}
                  onClick={() => candFileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                    candDragActive
                      ? "border-natural-primary bg-natural-primary/5"
                      : "border-natural-accent/50 hover:border-natural-primary/60 hover:bg-natural-pane/40"
                  }`}
                >
                  <input
                    type="file"
                    ref={candFileRef}
                    multiple
                    onChange={handleCandFileChange}
                    className="hidden"
                    id="cand-attachment-input"
                  />
                  <div className="w-8 h-8 rounded-full bg-natural-pane flex items-center justify-center text-[#8C8479] border border-natural-accent/20">
                    <Paperclip className="w-4 h-4 text-natural-primary" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-natural-dark">
                      Klik atau Seret Berkas ke Sini
                    </p>
                    <p className="text-[10px] text-[#8C8479]/85 mt-0.5 font-medium">
                      Mendukung semua format berkas (Maks. 3 MB)
                    </p>
                  </div>
                </div>

                {/* List of attachments */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {!(selectedCpmi.attachments && selectedCpmi.attachments.length > 0) ? (
                    <p className="text-xs text-[#8C8479] italic text-center py-2.5">
                      Belum ada berkas lampiran terarsip untuk kandidat ini.
                    </p>
                  ) : (
                    selectedCpmi.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-xl border border-natural-accent/25 hover:border-natural-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <div className="p-1.5 bg-white/70 rounded-lg text-natural-secondary border border-natural-accent/15 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-natural-dark truncate" title={att.name}>
                              {att.name}
                            </p>
                            <p className="text-[9px] text-[#8C8479] font-mono mt-0.5 font-bold">
                              {Math.round(att.size / 1024)} KB &bull; {new Date(att.uploadedAt).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* BLUE DOWNLOAD BUTTON */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadAttachment(att);
                            }}
                            title="Unduh Berkas"
                            className="p-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <Download className="w-3 h-3 text-white" />
                            Unduh
                          </button>
                          
                          {/* Delete attachment button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAttachment(att.id);
                            }}
                            title="Hapus Berkas"
                            className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            
            /* VIEW 3: Empty details state default guidance */
            <div className="h-full flex flex-col justify-center items-center py-12 text-[#8C8479] text-center bg-[#F9F6F1]/55 rounded-3xl border border-dashed border-natural-accent/60">
              <FileText className="w-12 h-12 text-[#E5D3B3]/80 mb-3" />
              <h3 className="font-serif font-bold text-natural-dark text-base">Informasi CPMI Terpilih</h3>
              <p className="text-xs text-[#8C8479] max-w-[220px] mx-auto mt-2 leading-relaxed font-medium">
                Pilih salah satu baris CPMI untuk menampilkan biodata lengkap, verifikasi dokumen, dan pengeluaran transaksi harian terkait secara terintegrasi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
