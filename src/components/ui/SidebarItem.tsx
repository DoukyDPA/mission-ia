// src/components/ui/SidebarItem.tsx
import React from 'react';

export const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 ${active ? 'bg-[#116862]/10 text-[#116862] font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
    <Icon size={20} /><span>{label}</span>
  </button>
);
