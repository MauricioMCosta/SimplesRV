import { AssetType } from '../db/database.types';

export interface AssetFormData {
  ticker: string;
  description: string;
  type: AssetType;
  custodianCnpj: string;
  cnpj: string;
  inactive?: boolean;
}
