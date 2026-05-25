export interface Transaction {
  id?: number;
  ticker: string;
  date: string;
  type: 'BUY' | 'SELL' | 'INPLIT' | 'SPLIT' | 'DIV' | 'JCP' | 'REND';
  qty: number;
  price: number;
  created_at?: string;
  is_pending?: boolean;
}

export interface Metadata {
  key: string;
  value: string;
}

export interface Position {
  ticker: string;
  qty: number;
  avgPrice: number;
}

export interface Sell {
  id?: number;
  ticker: string;
  date: string;
  qty: number;
  avgCost: number;
  sellPrice: number;
  profit: number;
  type: 'DAY' | 'SWING' | 'AJUSTE' | 'DIV' | 'JCP' | 'REND';
}

export interface Asset {
  id?: number;
  ticker: string;
  description: string;
  type: string;
  custodianCnpj?: string;
  cnpj?: string;
  is_pending?: boolean;
}

export interface Custodian {
  id?: number;
  cnpj: string;
  name: string;
  is_pending?: boolean;
}
