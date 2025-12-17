// src/components/ui/Badge.tsx
import React from 'react';

export const Badge = ({ children, color = "blue" }: { children: React.ReactNode, color?: string }) => {
  const colors: any = { blue: "bg-blue-50 text-blue-700 border-blue-200", purple: "bg-purple-50 text-purple-700 border-purple-200", green: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  return <span className={`text-xs px-2.5 py-0.5 rounded-full border ${colors[color] || colors.blue}`}>{children}</span>;
};
