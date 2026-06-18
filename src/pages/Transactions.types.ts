import { Transaction } from "@/src/db/database.types";

export type TransactionType = 'BUY' | 'SELL' | 'SPLIT' | 'INPLIT' | 'DIV' | 'JCP' | 'REND';

export interface TransactionFormData {
  id?: number;
  ticker: string;
  date: string;
  type: TransactionType;
  qty: string;
  price: string;
  acquisition_type?: 'REG' | 'BON' | 'SUB';
  sub_ticker?: string;
}
