/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { AppUser } from "../types";
import { Building2, Upload, Trash2, Check, RefreshCw, Users, UserPlus, KeyRound, ShieldAlert, Mail, User } from "lucide-react";

interface Props {
  ptName: string;
  onUpdatePtName: (name: string) => void;
  ptLogo: string | null;
  onUpdatePtLogo: (logo: string | null) => void;
  currentUser: AppUser;
}

export default function PengaturanPt({ ptName, onUpdatePtName, ptLogo, onUpdatePtLogo, currentUser }: Props) {
  const [nameInput, setNameInput] = useState(ptName);
  const [dragActive, setDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Staff User management states
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPass, setNewStaffPass] = useState("");

  // Hydrate users list from localStorage
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const saved = localStorage.getItem("CPMI_PORTAL_USERS");
      if (saved) {
        setUsersList(JSON.parse(saved));
      } else {
        setUsersList([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert("Nama PT tidak boleh kosong!");
      return;
    }
    onUpdatePtName(nameInput.trim());
    showSuccess("Nama PT diperbarui secara real-time!");
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // Convert uploaded image to base64
  const processImageFile = (file: File) => {
    if (!file) return;
    
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Format berkas harus berupa gambar (PNG, JPG, atau WEBP)!");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar too big! Maksimum ukuran logo adalah 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        onUpdatePtLogo(base64);
        showSuccess("Logo profil PT berhasil diperbarui!");
      }
    };
    reader.onerror = () => {
      alert("Gagal membaca berkas gambar.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle addition of a new user staff by Admin
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== "Admin") {
      alert("Hanya Administrator Utama yang berwenang menambahkan User Staff baru.");
      return;
    }

    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPass.trim()) {
      alert("Semua kolom isian User Staff wajib dilengkapi!");
      return;
    }

    const cleanEmail = newStaffEmail.trim().toLowerCase();
    
    // Check duplication with admin e-mail or existing staff
    if (cleanEmail === "pttriasinsanmadani@gmail.com") {
      alert("Email ini milik Administrator bawaan.");
      return;
    }

    const isDuplicate = usersList.some(u => u.email.toLowerCase() === cleanEmail);
    if (isDuplicate) {
      alert(`User Staff dengan email "${cleanEmail}" sudah terdaftar.`);
      return;
    }

    const newUser: AppUser = {
      id: "USER-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      name: newStaffName.trim(),
      email: cleanEmail,
      passwordHash: newStaffPass,
      role: "Staff",
      createdAt: new Date().toISOString()
    };

    const updated = [...usersList, newUser];
    localStorage.setItem("CPMI_PORTAL_USERS", JSON.stringify(updated));
    setUsersList(updated);
    
    // Clear form inputs
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPass("");

    showSuccess(`Sukses mendaftarkan staff baru: ${newUser.name}!`);
  };

  // Handle staff deletion
  const handleDeleteStaff = (id: string, name: string) => {
    if (currentUser.role !== "Admin") {
      alert("Hanya Administrator Utama yang berwenang menghapus user staff.");
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus hak akses staff "${name}"? Pengguna tidak akan bisa masuk lagi.`)) {
      const updated = usersList.filter(u => u.id !== id);
      localStorage.setItem("CPMI_PORTAL_USERS", JSON.stringify(updated));
      setUsersList(updated);
      showSuccess(`Staff "${name}" berhasil dinonaktifkan.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="pengaturan-pt-root">
      
      {/* Title block */}
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#1F3A5F]">Pengaturan & Security Portal</h2>
        <p className="text-xs text-[#8C8479] mt-1 font-medium">
          Kelola profil instansi resmi PT, perbarui logo utama, serta kustomisasi user staff yang berhak mengedit data kuitansi kasir.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-pulse shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main content grid: PT Profile settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Ganti Nama PT */}
        <div className="bg-white rounded-3xl border border-[#E2DDD5] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4 text-[#1F3A5F]">
              <Building2 className="w-5 h-5 shrink-0" />
              <h3 className="font-serif font-bold text-[#1F3A5F] text-base">Nama Registrasi PT</h3>
            </div>
            
            <p className="text-xs text-[#8C8479] leading-relaxed mb-4">
              Nama ini akan langsung ter-update otomatis pada Judul Utama Header, Metadata Cetak, dan Copyright Footer di seluruh aplikasi secara real-time.
            </p>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#4B6584] uppercase tracking-wide mb-1.5">
                  Nama Resmi PT / Agensi
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Contoh: PT. Sumber Sukses Bersama"
                  className="w-full bg-[#F7F5F2] border border-[#E2DDD5] rounded-xl text-xs p-3 focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] font-bold text-[#1F3A5F]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1F3A5F] hover:bg-[#152A4A] text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Simpan Perubahan Nama
              </button>
            </form>
          </div>

          <div className="mt-8 border-t border-[#E2DDD5]/35 pt-4 text-[10px] text-[#8C8479]/80 font-mono italic">
            Default: "PT. Trias Insan Madani"
          </div>
        </div>

        {/* Card 2: Upload Logo Profil PT */}
        <div className="bg-white rounded-3xl border border-[#E2DDD5] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4 text-[#1F3A5F]">
              <Upload className="w-5 h-5 shrink-0" />
              <h3 className="font-serif font-bold text-[#1F3A5F] text-base">Logo Profil Perusahaan</h3>
            </div>

            <p className="text-xs text-[#8C8479] leading-relaxed mb-4">
              Unggah file logo atau foto profil instansi untuk menggantikan ikon globe bawaan sistem pada pojok kiri atas Header.
            </p>

            {/* Drag Zone Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                dragActive
                  ? "border-[#1F3A5F] bg-[#1F3A5F]/5"
                  : "border-[#E2DDD5] hover:border-[#1F3A5F]/60 hover:bg-[#F7F5F2]/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                id="pt-logo-file-input"
              />

              {ptLogo ? (
                <div className="relative group" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={ptLogo}
                    alt="Logo PT Kustom"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-contain rounded-xl border border-[#E2DDD5] bg-[#F7F5F2]"
                  />
                  <button
                    onClick={() => {
                      onUpdatePtLogo(null);
                      showSuccess("Ikon reset kembali ke Globe bawaan!");
                    }}
                    title="Hapus Logo"
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 bg-[#F7F5F2] rounded-full flex items-center justify-center text-[#8C8479]">
                  <Upload className="w-5 h-5" />
                </div>
              )}

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#1F3A5F]">
                  {ptLogo ? "Klik atau seret untuk mengganti" : "Pilih Logo Perusahaan"}
                </p>
                <p className="text-[10px] text-[#8C8479]/80 font-medium">
                  Mendukung PNG, JPG, WEBP (Maks. 2 MB)
                </p>
              </div>
            </div>
          </div>

          {ptLogo && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  onUpdatePtLogo(null);
                  showSuccess("Logo profil diatur ulang!");
                }}
                className="text-xs text-[#8C8479] hover:text-rose-600 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Ke Default (Globe)
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Card 3: Kelola User Staff (MANDATORY REQUIREMENT) */}
      <div className="bg-white rounded-3xl border border-[#E2DDD5] p-6 shadow-sm" id="user-management-panel">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F7F5F2] pb-4 mb-6">
          <div className="flex items-center gap-2.5 text-[#1F3A5F]">
            <Users className="w-5.5 h-5.5 shrink-0" />
            <div>
              <h3 className="font-serif font-bold text-[#1F3A5F] text-base">Kelola User Staff & Keamanan Portal</h3>
              <p className="text-xs text-[#8C8479] mt-0.5">Tambah dan hapus account administrator eksternal (staff) yang berhak mengedit data CPMI.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-[#F7F5F2] px-3.5 py-1.5 rounded-full border border-[#E2DDD5]/60">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F3A5F]">
              Aktif Sebagai: {currentUser.role}
            </span>
          </div>
        </div>

        {currentUser.role !== "Admin" ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-950 p-6 rounded-2xl flex items-start gap-4">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Akses Ditutup (Hak Akses Staff Biasa)</h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                Akun Anda saat ini login sebagai staff biasa. Hanya Akun **Super Administrator Utama** (<span className="font-mono bg-amber-100 px-1 py-0.2 rounded font-bold">pttriasinsanmadani@gmail.com</span>) yang memiliki hak istimewa melisensikan atau menonaktifkan rekanan user staff dalam pangkalan data ini.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left Box: Form Pendaftaran Staff Baru */}
            <form onSubmit={handleAddStaffSubmit} className="lg:col-span-2 space-y-4 bg-[#F7F5F2] p-5 rounded-2xl border border-[#E2DDD5]/70">
              <div className="flex items-center gap-1.5 mb-2 text-[#1F3A5F]">
                <UserPlus className="w-4 h-4 text-[#1F3A5F]" />
                <h4 className="text-xs font-bold text-[#1F3A5F] uppercase tracking-wider font-sans">Daftarkan Staff Baru</h4>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-[#4B6584] uppercase tracking-wider mb-1">
                  Nama Lengkap Staff
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#4B6584] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="Contoh: Ibu Rahmawati"
                    className="w-full bg-white border border-[#E2DDD5] rounded-lg text-xs pl-9 pr-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#1F3A5F] font-semibold text-[#1F3A5F]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-[#4B6584] uppercase tracking-wider mb-1">
                  Email Login Staff
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#4B6584] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="rahma@triasinsan.com"
                    className="w-full bg-white border border-[#E2DDD5] rounded-lg text-xs pl-9 pr-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#1F3A5F] font-semibold text-[#1F3A5F]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-[#4B6584] uppercase tracking-wider mb-1">
                  Password Login
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-[#4B6584] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={newStaffPass}
                    onChange={(e) => setNewStaffPass(e.target.value)}
                    placeholder="Password minimal 6 digit"
                    className="w-full bg-white border border-[#E2DDD5] rounded-lg text-xs pl-9 pr-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#1F3A5F] font-mono font-bold text-[#1F3A5F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1F3A5F] hover:bg-[#152A4A] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer mt-2 text-center"
              >
                Simpan User Staff Baru
              </button>
            </form>

            {/* Right Box: Daftar Staff Ter-registrasi */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-[#4B6584] uppercase tracking-wider">
                Daftar Akun Staff Terdaftar ({usersList.length})
              </h4>
              
              <div className="overflow-y-auto max-h-[300px] border border-[#E2DDD5]/50 rounded-2xl divide-y divide-[#F7F5F2]">
                
                {/* Always active: Default Admin accounts */}
                <div className="p-3.5 bg-neutral-50 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] bg-[#1F3A5F] text-white font-bold font-mono px-2 py-0.5 rounded mr-1">
                      SUPER ADMIN
                    </span>
                    <p className="text-xs font-bold text-[#1F3A5F] mt-1">Sistem Administrator PT</p>
                    <p className="text-[10px] text-[#8C8479] font-mono mt-0.5">pttriasinsanmadani@gmail.com</p>
                  </div>
                  <span className="text-[10.5px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Sistem bawaan
                  </span>
                </div>

                {usersList.length === 0 ? (
                  <div className="p-6 text-center text-[#8C8479] text-xs italic">
                    Belum ada user staff eksternal tambahan. Daftarkan di panel sebelah kiri.
                  </div>
                ) : (
                  usersList.map((usr) => (
                    <div key={usr.id} className="p-3.5 hover:bg-[#F7F5F2]/20 transition-colors flex justify-between items-center">
                      <div>
                        <span className="text-[9px] bg-[#4B6584] text-white font-bold font-mono px-2 py-0.5 rounded mr-1">
                          STAFF PORTAL
                        </span>
                        <p className="text-xs font-bold text-[#1F3A5F] mt-1">{usr.name}</p>
                        <p className="text-[10px] text-[#8C8479] font-mono mt-0.5">{usr.email}</p>
                        <p className="text-[9px] text-gray-400 font-mono italic">PW: {usr.passwordHash}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteStaff(usr.id, usr.name)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title="Hapus Hak Akses Staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}

              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
