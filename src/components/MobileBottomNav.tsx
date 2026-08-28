import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Trees,
  ShieldAlert,
  Menu,
  Calendar,
  BookOpenCheck,
  Users,
} from 'lucide-react';
import { AppDatabase } from '../types';

interface MobileBottomNavProps {
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenMobileMenu: () => void;
  db: AppDatabase;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onSelectView,
  onOpenMobileMenu,
  db,
}) => {
  const navItems = [
    {
      id: 'dashboard-overview',
      label: 'Beranda',
      icon: LayoutDashboard,
    },
    {
      id: 'sabtu-teh-ceri',
      label: 'Beli Teh Ceri',
      icon: Sparkles,
      count: db.sabtuBeliTehCeri?.length || 0,
    },
    {
      id: 'kebun-berseri',
      label: 'Kebun Berseri',
      icon: Trees,
      count: db.kebunLuasBerseri?.length || 0,
    },
    {
      id: 'e-lapor',
      label: 'E-Lapor',
      icon: ShieldAlert,
      count: db.eLaporPerundungan?.length || 0,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Handphone"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg transition-colors"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-w-[56px] ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute -top-1 -right-2.5 px-1 py-0.2 min-w-[14px] text-[9px] font-black leading-tight text-white bg-indigo-600 rounded-full text-center shadow-xs">
                  {item.count > 99 ? '99+' : item.count}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
              {item.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-0.5" />
            )}
          </button>
        );
      })}

      {/* Menu Drawer Opener */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all min-w-[56px]"
      >
        <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <Menu className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Semua</span>
      </button>
    </nav>
  );
};
