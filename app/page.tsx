import React from "react";
import Link from "next/link";
import {
  Scale,
  Users,
  MapPin,
  TrendingUp,
  CreditCard,
  PiggyBank,
  FileText,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { FaqAccordion } from "@/components/landing/faq-accordion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <LandingNavbar />

      {/* HERO SECTION */}
      <section id="beranda" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Background Subtle Gradient & Accents */}
        <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-emerald-100/60 to-transparent pointer-events-none" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-200/40 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-xs font-semibold text-[#1b4332]">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Solusi Digital Agribisnis Sawit Terpadu</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Satu Platform untuk Koperasi Sawit yang{" "}
                <span className="text-[#1b4332] underline decoration-[#d4a373] decoration-wavy decoration-2">
                  Lebih Transparan
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Kelola Panen, Transparansi Pembayaran, Koperasi Lebih Maju. Catat penimbangan TBS secara akurat, hitung potongan otomatis, kelola pembayaran hasil panen, dan sajikan laporan keuangan tanpa kerumitan.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold shadow-md">
                    Mulai Kelola Koperasi
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#fitur" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 font-semibold">
                    Pelajari Fitur
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Sesuai Standar Penetapan Disbun</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Audit Trail Keuangan Terkunci</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Portal Mandiri Petani Real-Time</span>
                </div>
              </div>
            </div>

            {/* Right Visual Dashboard Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
                  {/* Card Header Top Bar */}
                  <div className="bg-[#1b4332] text-white p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-[11px] font-mono tracking-wider bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-200">
                        POS TIMBANG SAWITKITA
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-emerald-200">Harga TBS Periode Aktif</p>
                        <p className="text-2xl font-bold text-white tracking-tight">
                          Rp 2.850 <span className="text-xs font-normal text-emerald-200">/ kg</span>
                        </p>
                      </div>
                      <span className="text-xs bg-[#d4a373] text-[#1b4332] font-semibold px-2.5 py-1 rounded-md">
                        Status: AKTIF
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Simulated Weighing Calculation */}
                  <div className="p-6 space-y-4 text-sm bg-white">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-slate-500 font-medium text-xs">Simulasi Penimbangan Terakhir</span>
                      <span className="text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                        Terkonfirmasi
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[10px]">Berat Bruto</span>
                        <span className="font-semibold text-slate-800 text-sm">6.200 kg</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[10px]">Berat Tara</span>
                        <span className="font-semibold text-slate-800 text-sm">1.200 kg</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[10px]">Potongan (3.0%)</span>
                        <span className="font-semibold text-amber-700 text-sm">-150 kg</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-100">
                        <span className="text-emerald-700 block text-[10px] font-medium">Berat Bersih (Netto)</span>
                        <span className="font-bold text-[#1b4332] text-sm">4.850 kg</span>
                      </div>
                    </div>

                    {/* Calculated Payout */}
                    <div className="p-3 bg-linear-to-r from-emerald-900 to-[#1b4332] text-white rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-300 uppercase tracking-wider block">
                          Nilai Transaksi Petani
                        </span>
                        <span className="text-lg font-bold text-white tracking-tight">
                          Rp 13.822.500
                        </span>
                      </div>
                      <Link href="/login">
                        <Button variant="gold" size="sm" className="text-xs">
                          Masuk Demo
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FITUR UTAMA */}
      <section id="fitur" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1b4332] bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-100">
              Fitur Lengkap Operasional
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dirancang untuk Menjawab Kebutuhan Nyata Koperasi Sawit
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Bukan sekadar pencatatan digital biasa. Setiap alur dirancang presisi menghubungkan penimbangan fisik, kalkulasi potongan, pencairan bertahap, dan simpanan anggota.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all group bg-white">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1b4332] flex items-center justify-center mb-5 group-hover:bg-[#1b4332] group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Manajemen Anggota & Kebun</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pendataan komprehensif profil anggota petani, nomor identitas koperasi, NIK, rekening bank, serta peta kepemilikan banyak lahan kebun sawit (luas hektare, lokasi desa/kecamatan, dan tahun tanam).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all group bg-white">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1b4332] flex items-center justify-center mb-5 group-hover:bg-[#1b4332] group-hover:text-white transition-colors">
                <Scale className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Digitalisasi Timbang TBS</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pencatatan cepat di jembatan timbang. Input berat bruto, tara, potongan fraksi sampah persentase, dan potongan manual dengan validasi server ketat mencegah kesalahan hitung operator.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all group bg-white">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1b4332] flex items-center justify-center mb-5 group-hover:bg-[#1b4332] group-hover:text-white transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Manajemen Harga TBS Berperiode</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kelola penetapan harga TBS per kilogram berdasarkan ketetapan resmi Dinas Perkebunan. Transaksi lama terkunci pada harga snapshot saat transaksi dikonfirmasi.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all group bg-white">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1b4332] flex items-center justify-center mb-5 group-hover:bg-[#1b4332] group-hover:text-white transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Pembayaran Penuh & Bertahap</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kelola kewajiban pembayaran petani dengan fleksibilitas bayar penuh maupun parsial. Setiap rupiah pembayaran teralokasi langsung ke transaksi dengan cetak kuitansi resmi.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all group bg-white">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1b4332] flex items-center justify-center mb-5 group-hover:bg-[#1b4332] group-hover:text-white transition-colors">
                <PiggyBank className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Buku Besar Simpanan Anggota</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Struktur tabungan koperasi terpisah: Simpanan Pokok, Simpanan Wajib, dan Simpanan Sukarela. Lengkap dengan riwayat mutasi mutlak yang dapat direkonstruksi untuk audit keuangan.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all group bg-white">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1b4332] flex items-center justify-center mb-5 group-hover:bg-[#1b4332] group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Laporan & Analitik Komprehensif</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Laporan tonase panen, nilai pembelian TBS, realisasi vs tunggakan pembayaran petani, produktivitas per kebun, dan ekspor data CSV siap audit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION CARA KERJA */}
      <section id="cara-kerja" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1b4332] bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-100">
              Alur Operasional Terpadu
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bagaimana SawitKita Bekerja dari Hulu ke Hilir
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              6 langkah sistematis menjamin tidak ada tonase yang hilang, tidak ada salah potong, dan hak bayar petani transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Petani & Kebun Terdaftar",
                desc: "Anggota petani didata lengkap bersama data legalitas kebun miliknya untuk kepastian asal usul tandan buah segar (traceability).",
              },
              {
                step: "02",
                title: "Penimbangan di Pos Timbang",
                desc: "Truk pengangkut TBS menimbang bruto saat masuk dan menimbang tara saat keluar. Operator mencatat kondisi fraksi buah.",
              },
              {
                step: "03",
                title: "Perhitungan Otomatis Server",
                desc: "Sistem otomatis menghitung berat bersih setelah potongan dan mengalikan dengan harga TBS resmi yang aktif pada hari itu.",
              },
              {
                step: "04",
                title: "Verifikasi Pengurus Koperasi",
                desc: "Pengurus memverifikasi tiket timbang lapangan sebelum transaksi masuk ke daftar siap bayar untuk mencegah manipulasi.",
              },
              {
                step: "05",
                title: "Pencairan Pembayaran",
                desc: "Bendahara memproses pembayaran via transfer bank atau tunai. Mendukung cicilan parsial dengan kuitansi resmi.",
              },
              {
                step: "06",
                title: "Petani Cek Mandiri",
                desc: "Petani dapat langsung memantau nota timbang, potongan, bukti transfer, dan tabungan koperasi dari portal anggota.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs relative">
                <span className="text-3xl font-extrabold text-[#d4a373] opacity-60 block mb-2 font-mono">
                  {item.step}
                </span>
                <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION MANFAAT */}
      <section id="manfaat" className="py-20 bg-[#1b4332] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#d4a373] bg-emerald-900/60 inline-block px-3 py-1 rounded-full border border-emerald-800">
              Nilai Tambah Nyata
            </h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              Dirancang Memberi Manfaat Bagi Seluruh Ekosistem
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Manfaat Pengurus */}
            <div className="bg-emerald-900/40 border border-emerald-700/50 p-8 rounded-2xl space-y-4">
              <h4 className="text-xl font-bold text-[#d4a373] flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" />
                Manfaat untuk Pengurus Koperasi
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-emerald-100">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Eliminasi kesalahan hitung manual persentase potongan dan harga per kg.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Kontrol ketat arus kas pembayaran: cegah pembayaran ganda dan kelebihan bayar.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Pemisahan pembukuan simpanan pokok/wajib dari transaksi TBS.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Laporan keuangan dan rekap produksi siap cetak untuk Rapat Anggota Tahunan (RAT).</span>
                </li>
              </ul>
            </div>

            {/* Manfaat Petani */}
            <div className="bg-emerald-900/40 border border-emerald-700/50 p-8 rounded-2xl space-y-4">
              <h4 className="text-xl font-bold text-[#d4a373] flex items-center gap-2">
                <Users className="w-6 h-6" />
                Manfaat untuk Petani Anggota
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-emerald-100">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Transparansi penuh: cek berat kotor, tara, potongan, dan harga aktif secara mandiri.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Kepastian sisa pembayaran yang belum dicairkan koperasi tanpa perlu tanya ke kantor.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Buku simpanan digital: pantau saldo tabungan pokok, wajib, dan sukarela kapan saja.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Menerima pengumuman harga resmi dan jadwal pencairan langsung ke portal.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FAQ */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1b4332] bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-100">
              Pertanyaan yang Sering Diajukan
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Segala Hal Mengenai Sistem SawitKita
            </h3>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Siap Memajukan Tata Kelola Koperasi Sawit Anda?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Gunakan platform SawitKita sekarang juga. Masuk menggunakan akun demo pengurus atau petani untuk mengeksplorasi seluruh fitur secara langsung.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/login">
              <Button size="lg" className="gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold">
                Masuk ke Aplikasi
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="font-semibold">
                Daftar Sebagai Petani
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
