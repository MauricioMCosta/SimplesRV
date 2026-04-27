import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import * as dbActions from '@/src/db/database';

interface DatabaseState {
  transactions: dbActions.Transaction[];
  positions: dbActions.Position[];
  sells: dbActions.Sell[];
  assets: dbActions.Asset[];
}

type Action = 
  | { 
    type: 'SET_DATA', payload: { transactions: dbActions.Transaction[], 
    positions: dbActions.Position[], 
    sells: dbActions.Sell[],
    assets: dbActions.Asset[] } 
    };

const databaseReducer = (state: DatabaseState, action: Action): DatabaseState => {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

interface DatabaseContextType extends DatabaseState {
  db: typeof dbActions;
  refresh: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(databaseReducer, { transactions: [], positions: [], sells: [], assets: [] });

  const refresh = useCallback(async () => {
    const transactions = await dbActions.getTransactions();
    const positions = await dbActions.getBalances();
    const sells = await dbActions.getSells();
    const assets = await dbActions.getAssets();
    dispatch({ type: 'SET_DATA', payload: { transactions, positions, sells, assets } });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dbWrapper = {
    ...dbActions,
    addTransaction: async (tx: any) => {
        await dbActions.addTransaction(tx);
        await refresh();
    },
    deleteTransaction: async (id: number) => {
        await dbActions.deleteTransaction(id);
        await refresh();
    },
    addAsset: async (a: any) => {
        await dbActions.addAsset(a);
        await refresh();
    },
    updateAsset: async (id: number, data: any) => {
        await dbActions.updateAsset(id, data);
        await refresh();
    },
    deleteAsset: async (id: number) => {
        await dbActions.deleteAsset(id);
        await refresh();
    },
    forceRecalculate: async (tickers?: string[]) => {
        await dbActions.forceRecalculate(tickers);
        await refresh();
    },
    consolidateTrades: async () => {
        await dbActions.consolidateTrades();
        await refresh();
    },
    countPendingTransactions: async () => {
        return await dbActions.countPendingTransactions();
    },
    resetDB: async () => {
        await dbActions.resetDB();
        await refresh();
    }
  };

  return (
    <DatabaseContext.Provider value={{ ...state, db: dbWrapper, refresh }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
