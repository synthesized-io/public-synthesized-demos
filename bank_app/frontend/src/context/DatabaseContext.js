import React, { createContext, useContext, useState } from 'react';

export const DATABASE_OPTIONS = {
  SEED: 'SEED',
  TESTING: 'TESTING',
  PROD: 'PROD'
};

const DatabaseContext = createContext();

export function DatabaseProvider({ children }) {
  const [selectedDatabase, setSelectedDatabase] = useState(DATABASE_OPTIONS.TESTING);

  return (
    <DatabaseContext.Provider value={{ selectedDatabase, setSelectedDatabase }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
} 