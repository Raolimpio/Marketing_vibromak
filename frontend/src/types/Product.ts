export interface Video {
  id?: string;
  type: 'tecnico';
  title: string;
  external_link: string;
}

export interface Document {
  id?: string;
  type: 'vista_explodida' | 'manual';
  title: string;
  external_link: string;
}

export interface Category {
  id?: string;
  name: string;
}

export interface Machine {
  id?: string;
  name: string;
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  code?: string;
  image?: string;
  videos?: Video[];
  documents?: Document[];
  specs?: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
  machineIds?: string[];
  active?: boolean;
}
