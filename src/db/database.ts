import Dexie, { type Table } from 'dexie';
import { Transaction, Metadata, Position, Sell, Asset, Custodian } from './database.types';

export class AppDatabase extends Dexie {
  transactions!: Table<Transaction>;
  metadata!: Table<Metadata>;
  positions!: Table<Position>;
  sells!: Table<Sell>;
  assets!: Table<Asset>;
  custodians!: Table<Custodian>;

  constructor() {
    super('FinDB');
    this.version(9).stores({
      transactions: '++id, ticker, date, type, [ticker+date]',
      metadata: 'key',
      positions: 'ticker',
      sells: '++id, ticker, date, type',
      assets: '++id, &ticker, custodianCnpj, payingSourceCnpj, is_pending',
      custodians: '++id, &cnpj, is_pending'
    });

    this.version(10).stores({
      transactions: '++id, ticker, date, type, [ticker+date]',
      metadata: 'key',
      positions: 'ticker',
      sells: '++id, ticker, date, type',
      assets: '++id, &ticker, custodianCnpj, cnpj, is_pending',
      custodians: '++id, &cnpj, is_pending'
    }).upgrade(async tx => {
      await tx.table('assets').toCollection().modify((asset: any) => {
        if (asset.fundCnpj) {
          asset.cnpj = asset.fundCnpj;
          delete asset.fundCnpj;
        }
        if (asset.payingSourceCnpj) {
          delete asset.payingSourceCnpj;
        }
      });
    });
  }
}

export const db = new AppDatabase();
