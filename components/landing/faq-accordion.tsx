"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Apa itu sistem SawitKita?",
    answer:
      "SawitKita adalah sistem manajemen koperasi kelapa sawit terpadu yang mendigitalisasi seluruh rantai operasional: mulai dari pendataan anggota dan kebun, penimbangan TBS di pos timbang, perhitungan otomatis berat bersih dan potongan, pengelolaan harga TBS, transparansi pembayaran hasil panen, hingga buku besar simpanan anggota.",
  },
  {
    question: "Bagaimana cara penimbangan TBS dihitung secara otomatis?",
    answer:
      "Petugas cukup memasukkan berat bruto, berat tara armada, serta persentase potongan fraksi/sampah. Sistem secara otomatis menghitung Berat Setelah Tara = Bruto - Tara, Nilai Potongan (kg) = Berat Setelah Tara × Persentase Potongan / 100, Berat Bersih (Netto), serta Nilai Transaksi Kotor = Berat Bersih × Harga TBS aktif pada tanggal tersebut.",
  },
  {
    question: "Apakah petani dapat melihat hasil timbang dan hak bayar secara mandiri?",
    answer:
      "Ya, setiap anggota yang terdaftar memiliki akses ke Portal Anggota SawitKita. Melalui smartphone atau browser, petani dapat melihat riwayat timbang lengkap, potongan, harga yang berlaku, status verifikasi, nilai yang sudah dicairkan, sisa hak bayar, serta saldo simpanan mereka secara real-time.",
  },
  {
    question: "Apakah sistem mendukung pembayaran bertahap (parsial)?",
    answer:
      "Sangat mendukung. Koperasi dapat mencairkan pembayaran secara penuh maupun bertahap (parsial). Setiap pembayaran dialokasikan secara presisi ke nomor transaksi terkait, dan status transaksi akan otomatis diperbarui menjadi 'Dibayar Sebagian' atau 'Lunas' ketika seluruh kewajiban telah terbayar tanpa risiko overpayment.",
  },
  {
    question: "Apakah data simpanan anggota terpisah dari pembayaran TBS?",
    answer:
      "Benar. Sistem SawitKita menerapkan pemisahan buku besar yang ketat antara kewajiban pembayaran pembelian TBS hasil panen dan buku simpanan anggota (Simpanan Pokok, Wajib, dan Sukarela) agar pembukuan keuangan koperasi tetap akurat, transparan, dan memenuhi standar audit akuntansi koperasi.",
  },
  {
    question: "Bagaimana keamanan data transaksi yang telah diverifikasi?",
    answer:
      "Setiap perubahan harga, penerbitan transaksi timbang, verifikasi pembayaran, dan mutasi simpanan dicatat secara permanen di Audit Log yang tidak dapat dimanipulasi. Transaksi yang telah diverifikasi atau telah memiliki pembayaran tidak dapat diubah sembarangan tanpa otorisasi berjenjang.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all duration-200 shadow-2xs"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-slate-800 hover:text-[#1b4332] transition-colors"
            >
              <span className="text-sm sm:text-base">{faq.question}</span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180 text-[#1b4332]"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
