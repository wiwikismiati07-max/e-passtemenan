import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Copy,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Headphones,
  Clock,
  HeartHandshake,
} from 'lucide-react';

interface HotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HOTLINE_INFO = {
  telepon: '(0343) 426845',
  teleponClean: '0343426845',
  whatsapp: '085168700953',
  whatsappUrl: 'https://wa.me/6285168700953?text=Halo%20Satgas%20Anti%20Perundungan%20UPT%20SMPN%207%20Pasuruan%2C%20saya%20ingin%20berkonsultasi%20mengenai...',
  email: 'smp7pas@yahoo.co.id',
  emailUrl: 'mailto:smp7pas@yahoo.co.id?subject=Layanan%20Pengaduan%20E-Pass%20Temenan%20SMPN%207%20Pasuruan',
  website: 'www.smpn7pasuruan.sch.id',
  websiteUrl: 'https://www.smpn7pasuruan.sch.id',
  alamat: 'Jl. Ki Hajar Dewantara No. 27, Kota Pasuruan, Jawa Timur',
};

export const HotlineModal: React.FC<HotlineModalProps> = ({ isOpen, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Header with gradient banner */}
        <div className="relative p-6 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wider uppercase border border-white/20">
              <Headphones className="w-3.5 h-3.5 text-emerald-300" />
              <span>Pusat Bantuan & Hotline</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 relative z-10">
            <h3 className="text-xl font-black font-display tracking-tight">
              Hotline UPT SMPN 7 Pasuruan
            </h3>
            <p className="text-xs text-indigo-100 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Satgas Penanganan & Pencegahan Perundungan (Pass Temenan)</span>
            </p>
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 sm:p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
          
          {/* Card: Telepon Kantor */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Telepon Kantor
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate font-mono">
                  {HOTLINE_INFO.telepon}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => copyToClipboard(HOTLINE_INFO.telepon, 'telepon')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Salin Nomor Telepon"
              >
                {copiedField === 'telepon' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={`tel:${HOTLINE_INFO.teleponClean}`}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Panggil</span>
              </a>
            </div>
          </div>

          {/* Card: WhatsApp / Seluler Hotline */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3 hover:border-emerald-400 transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    Hotline WhatsApp Satgas
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    Respon Cepat
                  </span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate font-mono">
                  {HOTLINE_INFO.whatsapp}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => copyToClipboard(HOTLINE_INFO.whatsapp, 'whatsapp')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Salin Nomor WhatsApp"
              >
                {copiedField === 'whatsapp' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={HOTLINE_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat WA</span>
              </a>
            </div>
          </div>

          {/* Card: Pos-el (Email) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Pos-el (Email Resmi)
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {HOTLINE_INFO.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => copyToClipboard(HOTLINE_INFO.email, 'email')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Salin Email"
              >
                {copiedField === 'email' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={HOTLINE_INFO.emailUrl}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </a>
            </div>
          </div>

          {/* Card: Laman / Website */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Laman Web Sekolah
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {HOTLINE_INFO.website}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => copyToClipboard(HOTLINE_INFO.website, 'website')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Salin Alamat Website"
              >
                {copiedField === 'website' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={HOTLINE_INFO.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka</span>
              </a>
            </div>
          </div>

          {/* Service Commitment Banner */}
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-extrabold">Layanan Ramah Anak & Kerahasiaan Terjamin</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Satgas siap membantu seluruh peserta didik, orang tua, dan warga sekolah secara humanis, tanggap, dan aman.
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">UPT SMP Negeri 7 Kota Pasuruan</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
