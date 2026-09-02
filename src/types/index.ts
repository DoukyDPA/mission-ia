// src/types/index.ts

export interface Structure {
  id: string | number;
  name: string;
  city: string;
  has_charter?: boolean;
  charter_url?: string;
}

export interface User { 
  id: string | number; 
  email: string; 
  name: string; 
  role: string; 
  missionLocale: string; 
  avatar: string; 
  structure_id?: string | number; 
}

// C'est ici que la modification a lieu : on a ajouté tags et image_url
export interface Resource { 
  id: string | number; 
  title: string; 
  type: 'file' | 'text' | 'link' | 'pdf' | 'video'; 
  date: string; 
  size?: string; 
  category: string; 
  access: string; 
  file_url?: string; 
  description?: string; 
  // Résumé court, saisi à la main. Texte brut, dépliable sur la carte
  // de la page Veille. Distinct de `description`, qui porte le corps
  // HTML des articles et reste vide pour les vidéos et les liens.
  summary?: string;
  uploaded_by?: string | number; 
  tags?: string[];
  image_url?: string;
  // Timestamp brut conservé : le champ `date` est déjà formaté pour
  // l'affichage, il ne permet ni tri ni filtre par période.
  created_at?: string;
  // Portée du contenu, déjà présente en base mais jamais exploitée.
  //   'global'    : socle commun, visible de toutes les entités
  //   'structure' : réservé à target_structure_id
  access_scope?: 'global' | 'structure';
  target_structure_id?: string | number | null;
}

export interface Prompt { 
  id: string | number; 
  title: string; 
  content: string; 
  author: string; 
  role: string; 
  avatar: string; 
  missionLocale: string; 
  date: string; 
  tags: string[]; 
  likes: number; 
  forks: number; 
  isFork: boolean; 
  parentId?: string | number | null; 
  parentAuthor?: string;
  user_id?: string | number; 
}

export interface AllowedDomain { 
  id: string | number; 
  domain: string; 
  structure_id?: string | number | null; 
  structure_name?: string; 
}

export interface FAQItem { 
  id: string | number; 
  question: string; 
  answer: string; 
  category?: string; 
}

export interface ForumPost { 
  id: string | number; 
  title: string; 
  content: string; 
  author_name: string; 
  author_avatar: string; 
  structure_id: string | number; 
  created_at: string; 
  replies_count: number; 
}
