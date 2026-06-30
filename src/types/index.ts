export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  icon: string; // nama icon dari lucide-react
  color: string; // hex color untuk background icon
  monthlyLimit?: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note?: string;
  date: string; // ISO string
  source: "manual" | "scan";
  createdAt: string;
}

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}
