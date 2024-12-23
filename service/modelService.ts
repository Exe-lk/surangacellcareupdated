import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

export const createModel = async (name: string,brand: string, category: string) => {
  const status = true;
  const timestamp = Timestamp.now();
  const docRef = await addDoc(collection(firestore, 'ModelDisplay'), { name, brand, category, status, timestamp: timestamp });
  return docRef.id;
};

export const getModel = async () => {
  const q = query(collection(firestore, 'ModelDisplay'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteModel = async () => {
  const q = query(collection(firestore, 'ModelDisplay'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getModelById = async (id: string) => {
  const ModelRef = doc(firestore, 'ModelDisplay', id);
  const ModelSnap = await getDoc(ModelRef);
  if (ModelSnap.exists()) {
    return { id: ModelSnap.id, ...ModelSnap.data() };
  } else {
    return null;
  }
};

export const updateModel = async (id: string, name: string, brand: string, category: string, status: boolean) => {
  const ModelRef = doc(firestore, 'ModelDisplay', id);
  await updateDoc(ModelRef, { name, brand, category, status });
};

export const deleteModel = async (id: string) => {
  const ModelRef = doc(firestore, 'ModelDisplay', id);
  await deleteDoc(ModelRef);
};
