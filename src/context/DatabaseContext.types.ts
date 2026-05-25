import * as dbActions from '@/src/db/operations';
import { Transaction, Position, Sell, Asset, Custodian } from '@/src/db/database.types';

export interface DatabaseState {
  transactions: Transaction[];
  positions: Position[];
  sells: Sell[];
  assets: Asset[];
  custodians: Custodian[];
}

export type Action = 
  | { 
    type: 'SET_DATA', payload: { 
      transactions: Transaction[], 
      positions: Position[], 
      sells: Sell[],
      assets: Asset[],
      custodians: Custodian[]
    } 
    };

export interface DatabaseContextType extends DatabaseState {
  db: typeof dbActions;
  refresh: () => Promise<void>;
}
