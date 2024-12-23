import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

export const createCategory = async (name: string) => {
  const status = true;
  const timestamp = Timestamp.now();
  const docRef = await addDoc(collection(firestore, 'CategoryDisplay'), { name, status, timestamp: timestamp });
  return docRef.id;
};

export const getCategory = async () => {
  const q = query(collection(firestore, 'CategoryDisplay'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteCategory = async () => {
  const q = query(collection(firestore, 'CategoryDisplay'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCategoryById = async (id: string) => {
  const categoryRef = doc(firestore, 'CategoryDisplay', id);
  const categorySnap = await getDoc(categoryRef);
  if (categorySnap.exists()) {
    return { id: categorySnap.id, ...categorySnap.data() };
  } else {
    return null;
  }
};

export const updateCategory = async (id: string, name: string, status: boolean) => {
  const categoryRef = doc(firestore, 'CategoryDisplay', id);
  await updateDoc(categoryRef, { name, status });
};

export const deleteCategory = async (id: string) => {
  const categoryRef = doc(firestore, 'CategoryDisplay', id);
  await deleteDoc(categoryRef);
};
