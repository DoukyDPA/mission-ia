import React from 'react';
import { Plus, Trash2, UserPlus, Pencil, CheckCircle, XCircle } from 'lucide-react'; // Ajout icônes
import { Structure, User, AllowedDomain } from '@/types';

interface AdminPanelProps {
  currentTab: string;
  structures: Structure[];
  users: User[];
  domains: AllowedDomain[];
  onAdd: () => void;
  onDelete: (table: string, id: string | number) => void;
  onEditUser: (u: User) => void;
  onEditStructure: (s: Structure) => void; // <-- NOUVEAU
  onInviteUser: () => void;
}

export const AdminPanel = ({ currentTab, structures, users, domains, onAdd, onDelete, onEditUser, onEditStructure, onInviteUser }: AdminPanelProps) => {
  
  if (currentTab === 'structures') {
    return (
      <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800">Gestion des Structures</h2><button onClick={onAdd} className="bg-[#116862] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-[#0e524d]"><Plus size={16} className="mr-2"/> Ajouter</button></div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4">Nom</th>
                  <th className="p-4">Ville</th>
                  <th className="p-4 text-center">Charte IA</th> {/* Nouvelle colonne */}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {structures.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4 text-slate-500">{s.city}</td>
                    <td className="p-4 text-center">
                       {s.has_charter ? <CheckCircle size={16} className="text-[#116862] mx-auto"/> : <XCircle size={16} className="text-slate-200 mx-auto"/>}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                        {/* Bouton modifier structure */}
                        <button onClick={() => onEditStructure(s)} className="text-[#116862] hover:underline"><Pencil size={16} /></button>
                        <button onClick={() => onDelete('structures', s.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    );
  }

  // ... (Le reste du fichier pour Users et Domains reste identique)
  if (currentTab === 'users') {
    return (
      <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800">Gestion des Utilisateurs</h2><button onClick={onInviteUser} className="bg-[#116862] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-[#0e524d]"><UserPlus size={16} className="mr-2"/> Inviter</button></div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200"><tr><th className="px-6 py-4">Utilisateur</th><th className="px-6 py-4">Rôle</th><th className="px-6 py-4">Structure</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map(u => (<tr key={u.id} className="hover:bg-slate-50"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{u.avatar}</div><div><div className="font-medium text-slate-900">{u.name}</div><div className="text-xs text-slate-500">{u.email}</div></div></div></td><td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{u.role}</span></td><td className="px-6 py-4 text-slate-600">{u.missionLocale}</td><td className="px-6 py-4 text-right"><button onClick={() => onEditUser(u)} className="text-[#116862] hover:underline text-xs flex items-center justify-end gap-1"><Pencil size={12}/> Modifier</button></td></tr>))}</tbody></table></div>
      </div>
    );
  }

  if (currentTab === 'domains') {
    return (
      <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800">Domaines autorisés</h2><button onClick={onAdd} className="bg-[#116862] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-[#0e524d]"><Plus size={16} className="mr-2"/> Ajouter</button></div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200"><tr><th className="px-6 py-4">Domaine</th><th className="px-6 py-4">Structure</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{domains.map(d => (<tr key={d.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-medium text-slate-800">{d.domain}</td><td className="px-6 py-4 text-slate-600">{d.structure_name || structures.find(s => s.id == d.structure_id)?.name || 'Non spécifié'}</td><td className="px-6 py-4 text-right"><button onClick={() => onDelete('allowed_domains', d.id)} className="text-red-500 hover:underline text-xs flex items-center justify-end gap-1"><Trash2 size={12}/> Supprimer</button></td></tr>))}</tbody></table></div>
      </div>
    );
  }

  return null;
};
