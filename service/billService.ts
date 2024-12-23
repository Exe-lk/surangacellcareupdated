import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

export const createBill = async ( billNumber: string,dateIn: string,phoneDetail: string,  phoneModel: string, repairType: string, technicianNum: string, CustomerName: string, CustomerMobileNum: string, NIC: string, componentCost:string,repairCost:string,cost: string, Price: string, Status: string, DateOut: string) => {
  const status = true;
  const docRef = await addDoc(collection(firestore, 'bill'), { billNumber,dateIn,phoneDetail, phoneModel, repairType, technicianNum, CustomerName, CustomerMobileNum, NIC,componentCost,repairCost, cost, Price, Status, DateOut, status });
  return docRef.id;
};

export const getBills = async () => {
  const q = query(collection(firestore, 'bill'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteBills = async () => {
  const q = query(collection(firestore, 'bill'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBillById = async (id: string) => {
  const billRef = doc(firestore, 'bill', id);
  const billSnap = await getDoc(billRef);
  if (billSnap.exists()) {
    return { id: billSnap.id, ...billSnap.data() };
  } else {
    return null;
  }
};

export const updateBill = async (id: string, billNumber: string,dateIn: string,phoneDetail: string,  phoneModel: string, repairType: string, technicianNum: string, CustomerName: string, CustomerMobileNum: string, NIC: string,componentCost:string,repairCost:string, cost: string, Price: string, Status: string, DateOut: string, status: any) => {
  const billRef = doc(firestore, 'bill', id);
  await updateDoc(billRef, { billNumber,dateIn,phoneDetail, phoneModel, repairType, technicianNum, CustomerName, CustomerMobileNum, NIC,componentCost,repairCost, cost, Price, Status, DateOut, status });
};

export const deleteBill = async (id: string) => {
  const billRef = doc(firestore, 'bill', id);
  await deleteDoc(billRef);
};
