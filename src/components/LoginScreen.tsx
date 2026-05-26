/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppUser } from "../types";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Building2 } from "lucide-react";

interface Props {
  ptName: string;
  ptLogo: string | null;
  onLoginSuccess: (user: AppUser) => void;
}

export default function LoginScreen({ ptName, ptLogo, onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing users or initialize with the requested admin user
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Mohon masukkan email dan kata sandi Anda!");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Fetch users from localStorage
      let users: AppUser[] = [];
      try {
        const savedUsers = localStorage.getItem("CPMI_PORTAL_USERS");
        if (savedUsers) {
          users = JSON.parse(savedUsers);
        }
      } catch (err) {
        console.error("Error loading users", err);
      }

      // Check for Default Admin: pttriasinsanmadani@gmail.com / 123456
      const defaultAdminEmail = "pttriasinsanmadani@gmail.com";
      const defaultAdminPass = "123456";

      const matchedAdmin = 
        email.trim().toLowerCase() === defaultAdminEmail && 
        password === defaultAdminPass;

      if (matchedAdmin) {
        const adminUser: AppUser = {
          id: "ADMIN-DEFAULT",
          name: "Sistem Administrator PT",
          email: defaultAdminEmail,
          passwordHash: defaultAdminPass,
          role: "Admin",
          createdAt: new Date().toISOString()
        };
        onLoginSuccess(adminUser);
        setIsSubmitting(false);
        return;
      }

      // Check inside additional staff
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.passwordHash === password
      );

      if (foundUser) {
        onLoginSuccess(foundUser);
      } else {
        setErrorMsg("Email atau Password salah! Periksa kembali kredensial Anda.");
      }
      setIsSubmitting(false);
    }, 850); // elegant slight artificial delay for a realistic premium authentication look
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center p-4 selection:bg-[#1F3A5F] selection:text-white" id="login-container">
      
      {/* Absolute clean backdrop decoration */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#1F3A5F]/10 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2DDD5] shadow-xl overflow-hidden relative z-10 p-8 sm:p-10">
        
        {/* PT Branding Header inside login */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-14 h-14 bg-[#1F3A5F] rounded-2xl flex items-center justify-center text-white font-bold tracking-wider relative overflow-hidden shadow-md">
            {ptLogo ? (
              <img src={ptLogo} alt="Logo PT" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-7 h-7 text-white animate-pulse" />
            )}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif text-[#1F3A5F] uppercase tracking-tight">
              {ptName}
            </h2>
            <p className="text-[11px] font-mono text-[#4B6584] uppercase tracking-widest font-bold">
              PORTAL KEMITRAAN CPMI & AUDIT KAS
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold px-4 py-3 rounded-xl mb-6 text-center animate-shake">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          
          {/* Email field */}
          <div>
            <label className="block text-[10px] font-bold text-[#4B6584] uppercase tracking-wider mb-1.5">
              Alamat Email Rekanan
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#4B6584]/60 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rekanan@perusahaan.com"
                className="w-full bg-[#F7F5F2] border border-[#E2DDD5] rounded-xl text-xs pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] font-semibold text-[#1F3A5F]"
              />
            </div>
            <p className="text-[9px] text-gray-400 mt-1 italic">
              Kredensial admin: pttriasinsanmadani@gmail.com
            </p>
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-[#4B6584] uppercase tracking-wider">
                Kata Sandi Portal
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#4B6584]/60 absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full bg-[#F7F5F2] border border-[#E2DDD5] rounded-xl text-xs pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] font-mono font-bold text-[#1F3A5F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#4B6584]/60 hover:text-[#1F3A5F]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Key verification badge footer */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#4B6584] font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Sesi dienkripsi secara lokal di browser Anda</span>
          </div>

          {/* Submit block */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1F3A5F] hover:bg-[#152A4A] disabled:bg-[#1F3A5F]/50 text-white py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memvalidasi Pembukuan...</span>
              </>
            ) : (
              <span>Masuk Portal Organisasi</span>
            )}
          </button>

        </form>

        <div className="mt-8 pt-5 border-t border-[#E2DDD5]/40 text-center">
          <p className="text-[10px] text-[#8C8479] font-mono">
            Keamanan Data &bull; Hak Cipta Dilindungi Undang-Undang
          </p>
        </div>

      </div>

    </div>
  );
}
