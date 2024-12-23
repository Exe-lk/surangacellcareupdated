import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

export const createItemDis = async (values: any) => {
  values.status = true;
  const docRef = await addDoc(collection(firestore, 'ItemManagementDis'), values);
  return docRef.id;
};

export const getItemDiss = async () => {
  const q = query(collection(firestore, 'ItemManagementDis'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteItemDiss = async () => {
  const q = query(collection(firestore, 'ItemManagementDis'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getItemDisById = async (id: string) => {
  const ItemDisRef = doc(firestore, 'ItemManagementDis', id);
  const ItemDisSnap = await getDoc(ItemDisRef);
  if (ItemDisSnap.exists()) {
    return { id: ItemDisSnap.id, ...ItemDisSnap.data() };
  } else {
    return null;
  }
};

export const updateItemDis = async (id: string, model: string, brand: string, reorderLevel: string, quantity: string, boxNumber: string, category: string, touchpadNumber: string, batteryCellNumber: string, displaySNumber: string, status: boolean) => {
  const ItemDisRef = doc(firestore, 'ItemManagementDis', id);
  await updateDoc(ItemDisRef, { model, brand, reorderLevel, quantity, boxNumber, category, touchpadNumber, batteryCellNumber, displaySNumber, status });
};

export const deleteItemDis = async (id: string) => {
  const ItemDisRef = doc(firestore, 'ItemManagementDis', id);
  await deleteDoc(ItemDisRef);
};


