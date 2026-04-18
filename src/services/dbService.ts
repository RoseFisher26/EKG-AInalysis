import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  getDoc,
  serverTimestamp,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EKGRecord, PatientRecord, EKGAnalysis } from '../types';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: any, operation: any, path: string | null): never {
  const info: FirestoreErrorInfo = {
    error: error instanceof FirestoreError ? error.code : 'unknown',
    operationType: operation,
    path,
    authInfo: 'User info handled via context',
  };
  throw new Error(JSON.stringify(info));
}

export const dbService = {
  async saveAnalysis(userId: string, patientId: string, analysis: EKGAnalysis, imageUrl: string) {
    try {
      const docRef = await addDoc(collection(db, 'ekg_records'), {
        ownerId: userId,
        patientId,
        analysis,
        imageUrl,
        notes: '',
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', 'ekg_records');
    }
  },

  async getRecentAnalyses(userId: string) {
    try {
      const q = query(
        collection(db, 'ekg_records'),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EKGRecord[];
    } catch (error) {
      handleFirestoreError(error, 'list', 'ekg_records');
    }
  },

  async getPatients(userId: string) {
    try {
      const q = query(
        collection(db, 'patients'),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PatientRecord[];
    } catch (error) {
      handleFirestoreError(error, 'list', 'patients');
    }
  },

  async createPatient(userId: string, patient: Omit<PatientRecord, 'id' | 'ownerId' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'patients'), {
        ...patient,
        ownerId: userId,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', 'patients');
    }
  }
};
