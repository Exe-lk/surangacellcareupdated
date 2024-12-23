import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

export const createModel = async (name: string, description: string, brand: string, category: string) => {
  const status = true;
  const timestamp = Timestamp.now();
  const docRef = await addDoc(collection(firestore, 'ModelAccessory'), { name, description, brand, category, status, timestamp: timestamp });
  return docRef.id;
};

export const getModel = async () => {
  const q = query(collection(firestore, 'ModelAccessory'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteModel = async () => {
  const q = query(collection(firestore, 'ModelAccessory'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getModelById = async (id: string) => {
  const ModelRef = doc(firestore, 'ModelAccessory', id);
  const ModelSnap = await getDoc(ModelRef);
  if (ModelSnap.exists()) {
    return { id: ModelSnap.id, ...ModelSnap.data() };
  } else {
    return null;
  }
};

export const updateModel = async (id: string, name: string, description: string, brand: string, category: string, status: boolean) => {
  const ModelRef = doc(firestore, 'ModelAccessory', id);
  await updateDoc(ModelRef, { name, description, brand, category, status });
};

export const deleteModel = async (id: string) => {
  const ModelRef = doc(firestore, 'ModelAccessory', id);
  await deleteDoc(ModelRef);
};
