import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from './AuthContext';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface FriendLog {
  id: string;
  personName: string;
  amount: number;
  note: string;
  dueDate?: string;
  transactionDate?: string;
  type: 'lent' | 'borrowed';
  status: 'pending' | 'returned';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  userId: string;
}

interface DataContextType {
  friendLogs: FriendLog[];
  addFriendLog: (log: Omit<FriendLog, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateFriendLog: (id: string, updates: Partial<FriendLog>) => Promise<void>;
  deleteFriendLog: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [friendLogs, setFriendLogs] = useState<FriendLog[]>([]);

  useEffect(() => {
    if (!user) {
      setFriendLogs([]);
      return;
    }

    const q = query(
      collection(db, 'loans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FriendLog[];
      setFriendLogs(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'loans');
    });

    return unsubscribe;
  }, [user]);

  const addFriendLog = async (log: Omit<FriendLog, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'loans'), {
        ...log,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'loans');
    }
  };

  const updateFriendLog = async (id: string, updates: Partial<FriendLog> | 'returned') => {
    const finalUpdates = typeof updates === 'string' && updates === 'returned' 
      ? { status: 'returned' as const } 
      : updates as Partial<FriendLog>;
      
    try {
      await updateDoc(doc(db, 'loans', id), {
        ...finalUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `loans/${id}`);
    }
  };

  const deleteFriendLog = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'loans', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `loans/${id}`);
    }
  };

  return (
    <DataContext.Provider value={{ friendLogs, addFriendLog, updateFriendLog, deleteFriendLog }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
