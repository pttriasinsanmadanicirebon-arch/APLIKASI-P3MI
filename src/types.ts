/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProcessStatus =
  | "PROCESS"
  | "BNSP/BLK"
  | "ID PASPOR"
  | "FINAL STAGE"
  | "TERBANG"
  | "CANCEL"
  | "TOLAK"
  | "SPONSOR"
  | "UPDATE DOKUMEN KELENGKAPAN"
  | "VERIF ID"
  | string;

export interface CPMI {
  id: string; // The CPMI reference code, e.g. "TS 6317" or "TSEX 6440"
  indexNum?: number; // Original index number from seed data (e.g. 1, 2, 3...)
  name: string;
  status: ProcessStatus;
  dateInput: string; // YYYY-MM-DD
  destination: string; // e.g. Taiwan
  gender: "Perempuan" | "Laki-laki" | string;
  category: string; // e.g. TKW (In Formal), Formal, etc.
  agency: string; // e.g. PT. TRIAS INSAN MADANI
  recruiter: string; // Sponsor/Field officer (e.g. PA Irwan, Bu Maskinah)
  pasporNo?: string;
  pasporExpiryDate?: string;
  notes?: string;
  documents?: {
    ktp: boolean;
    kk: boolean;
    ijazah: boolean;
    aktaLahir: boolean;
    suratIzinKeluarga: boolean;
    paspor: boolean;
    medicalCheck: boolean;
  };
}

export type TransactionCategory =
  | "Fee Sponsor"
  | "Biaya MD"
  | "ID Paspor"
  | "Living Cost"
  | "Transport"
  | "Mcu Pra"
  | "Royalti"
  | "Keterangan Lain";

export interface Transaction {
  id: string; // unique ID
  date: string; // YYYY-MM-DD
  category: TransactionCategory | string;
  pmiRef: string; // references CPMI.id, or "OPERATIONAL" etc.
  pmiName?: string; // Cache CPMI name or non-candidate name
  value: number; // Amount in Rp
  noReff?: string; // Reference number
  description?: string; // Details e.g. "Tiket Pesawat", "Sarpras"
}
