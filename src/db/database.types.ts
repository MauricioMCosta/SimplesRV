export interface Transaction {
  id?: number;
  ticker: string;
  date: string;
  type: 'BUY' | 'SELL' | 'INPLIT' | 'SPLIT' | 'DIV' | 'JCP' | 'REND';
  qty: number;
  price: number;
  created_at?: string;
  is_pending?: boolean;
  acquisition_type?: 'REG' | 'BON' | 'SUB';
  sub_ticker?: string;
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

export type AssetType = 'AÇÕES' | 'FII' | 'FIAGRO' | 'FIA' | 'ETF' | 'BDR' | 'RENDA FIXA' | 'CRYPTO' | 'OUTROS';

export const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'AÇÕES', label: 'Ações' },
  { value: 'FII', label: 'FII' },
  { value: 'FIAGRO', label: 'FIAGRO' },
  { value: 'FIA', label: 'FIA' },
  { value: 'ETF', label: 'ETF' },
  { value: 'BDR', label: 'BDR' },
  { value: 'RENDA FIXA', label: 'Renda Fixa' },
  { value: 'CRYPTO', label: 'Criptomoeda' },
  { value: 'OUTROS', label: 'Outros' }
];

export interface Asset {
  id?: number;
  ticker: string;
  description: string;
  type: AssetType;
  custodianCnpj?: string;
  cnpj?: string;
  is_pending?: boolean;
  inactive?: boolean;
}

export interface Custodian {
  id?: number;
  cnpj: string;
  name: string;
  is_pending?: boolean;
}
