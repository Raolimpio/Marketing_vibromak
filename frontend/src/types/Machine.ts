export interface Machine {
  id?: string;
  name: string;
  description?: string;
  model?: string;
  manufacturer?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
