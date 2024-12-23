import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

export const createBrand = async (name: string, category: string) => {
  const status = true;
  const timestamp = Timestamp.now();
  const docRef = await addDoc(collection(firestore, 'BrandDisplay'), { name, category, status, timestamp: timestamp });
  return docRef.id;
};

export const getBrand = async () => {
  const q = query(collection(firestore, 'BrandDisplay'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteBrand = async () => {
  const q = query(collection(firestore, 'BrandDisplay'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBrandById = async (id: string) => {
  const brandRef = doc(firestore, 'BrandDisplay', id);
  const brandSnap = await getDoc(brandRef);
  if (brandSnap.exists()) {
    return { id: brandSnap.id, ...brandSnap.data() };
  } else {
    return null;
  }
};

export const updateBrand = async (id: string, name: string, category: string, status: boolean) => {
  const brandRef = doc(firestore, 'BrandDisplay', id);
  await updateDoc(brandRef, { name, category, status });
};

export const deleteBrand = async (id: string) => {
  const brandRef = doc(firestore, 'BrandDisplay', id);
  await deleteDoc(brandRef);
};
