// src/types/index.ts
export interface Structure { id: string | number; name: string; city: string; }
export interface User { id: string | number; email: string; name: string; role: string; missionLocale: string; avatar: string; structure_id?: string | number; }
export interface Resource { id: string | number; title: string; type: 'file' | 'text' | 'link' | 'pdf' | 'video'; date: string; size?: string; category: string; access: string; file_url?: string; description?: string; uploaded_by?: string | number; }
export interface Prompt { 
  id: string | number; title: string; content: string; author: string; role: string; 
  avatar: string; missionLocale: string; date: string; tags: string[]; 
  likes: number; forks: number; isFork: boolean; parentId?: string | number | null; parentAuthor?: string;
  user_id?: string | number; 
}
export interface AllowedDomain { id: string | number; domain: string; structure_id?: string | number | null; structure_name?: string; }
