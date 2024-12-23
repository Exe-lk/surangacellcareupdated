import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

export const createBrand = async (category: string, name: string) => {
  const status = true;
  const timestamp = Timestamp.now();
  const docRef = await addDoc(collection(firestore, 'BrandAccessory'), { category, name, status, timestamp: timestamp });
  return docRef.id;
};

export const getBrand = async () => {
  const q = query(collection(firestore, 'BrandAccessory'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteBrand = async () => {
  const q = query(collection(firestore, 'BrandAccessory'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBrandById = async (id: string) => {
  const brandRef = doc(firestore, 'BrandAccessory', id);
  const brandSnap = await getDoc(brandRef);
  if (brandSnap.exists()) {
    return { id: brandSnap.id, ...brandSnap.data() };
  } else {
    return null;
  }
};

export const updateBrand = async (id: string, category: string, name: string, status: boolean) => {
  const brandRef = doc(firestore, 'BrandAccessory', id);
  await updateDoc(brandRef, { category, name, status });
};

export const deleteBrand = async (id: string) => {
  const brandRef = doc(firestore, 'BrandAccessory', id);
  await deleteDoc(brandRef);
};
