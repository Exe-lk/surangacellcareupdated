import { firestore } from '../firebaseConfig';
import {
	addDoc,
	collection,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	getDoc,
	query,
	where,
	Timestamp,
	orderBy,
	limit,
	setDoc,
} from 'firebase/firestore';

export const createstockIn = async (values: any) => {
	values.status = true;
	values.timestamp = Timestamp.now();
	const docRef = await addDoc(collection(firestore, 'Stock'), values);
	const { quantity } = values;
	const subCollectionRef = collection(docRef, 'subStock');
	
	
	let uniqueId = 1000;
	
	for (let i = 0; i < quantity; i++) {
        const barcodeValue = values.barcode + uniqueId;
        await setDoc(doc(subCollectionRef, barcodeValue), {
            id: docRef.id,
            uniqueId: uniqueId.toString(),
            status: false,
            barcode: barcodeValue,
			print:false
        });
        uniqueId += 1;
    }

	return docRef.id;
};

export const getAllSubStockData = async () => {
	try {
		const stockCollectionRef = collection(firestore, 'Stock');
		const stockSnapshot = await getDocs(stockCollectionRef);
		let allSubStockData: any[] = [];
		for (const stockDoc of stockSnapshot.docs) {
			const stockDocId = stockDoc.id;
			const subStockCollectionRef = collection(firestore, 'Stock', stockDocId, 'subStock');
			const subStockSnapshot = await getDocs(subStockCollectionRef);
			const subStockData = subStockSnapshot.docs.map((subDoc) => ({
				id: subDoc.id,
				parentStockId: stockDocId,
				...subDoc.data(),
			}));
			allSubStockData = allSubStockData.concat(subStockData);
		}
		return allSubStockData;
	} catch (error) {
		console.error('Error fetching all subStock data:', error);
		throw new Error('Failed to fetch subStock data.');
	}
};

export const updateSubStock = async (
	stockDocId: string,
    subStockDocId: string,
	values:any
) => {
    try {
        const subStockDocRef = doc(firestore, 'Stock', stockDocId, 'subStock', subStockDocId);
        await updateDoc(subStockDocRef, values);
        return { success: true, message: 'SubStock status updated successfully.' };
    } catch (error) {
        console.error('Error updating subStock:', error);
        throw new Error('Failed to update subStock.');
    }
};
export const updateSubStockById = async (subStockId: string) => {
    try {
        const stockCollectionRef = collection(firestore, 'Stock');
        const stockSnapshot = await getDocs(stockCollectionRef);

        for (const stockDoc of stockSnapshot.docs) {
            const stockDocId = stockDoc.id;
            const subStockCollectionRef = collection(firestore, 'Stock', stockDocId, 'subStock');
            const subStockQuery = query(subStockCollectionRef, where('__name__', '==', subStockId));
            const subStockSnapshot = await getDocs(subStockQuery);

            if (!subStockSnapshot.empty) {
                const subStockDocRef = doc(firestore, 'Stock', stockDocId, 'subStock', subStockId);
                await updateDoc(subStockDocRef, { status: true });
                return { success: true, message: 'SubStock status updated successfully.' };
            }
        }

        throw new Error('SubStock not found.');
    } catch (error) {
        console.error('Error updating subStock:', error);
        throw new Error('Failed to update subStock.');
    }
};

const findLargestUniqueId = (data: any[]) => {
	if (!data || data.length === 0) {
		throw new Error('No data available to find uniqueId.');
	}
	const largestUniqueId = data.reduce((max, item) => {
		const uniqueId = parseInt(item.uniqueId, 10);
		return uniqueId > max ? uniqueId : max;
	}, 0);
	return largestUniqueId;
};

// export const getstockIns = async () => {
// 	const q = query(collection(firestore, 'Stock'), where('status', '==', true));
// 	const querySnapshot = await getDocs(q);
// 	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };
export const getstockIns = async () => {
    try {
        const q = query(collection(firestore, 'Stock'), where('status', '==', true));
        const querySnapshot = await getDocs(q);
        const stockData = [];

        for (const stockDoc of querySnapshot.docs) {
            const stockDocId = stockDoc.id;
            const stockInfo:any = { id: stockDocId, ...stockDoc.data(), subStock: [] };
            
            const subStockCollectionRef = collection(firestore, 'Stock', stockDocId, 'subStock');
            const subStockSnapshot = await getDocs(subStockCollectionRef);
            
            const subStockData = subStockSnapshot.docs.map((subDoc) => ({
                id: subDoc.id,
                ...subDoc.data(),
            }));
            
            stockInfo.subStock = subStockData;
            stockData.push(stockInfo);
        }

        return stockData;
    } catch (error) {
        console.error('Error fetching stockIns with subStock data:', error);
        throw new Error('Failed to fetch stockIns and subStock data.');
    }
};
export const getstockInById = async (id: string) => {
	const stockInRef = doc(firestore, 'Stock', id);
	const stockInSnap = await getDoc(stockInRef);
	if (stockInSnap.exists()) {
		return { id: stockInSnap.id, ...stockInSnap.data() };
	} else {
		return null;
	}
};

export const updatestockIn = async (id: string, quantity: string) => {
	const stockInRef = doc(firestore, 'ItemManagementDis', id);
	await updateDoc(stockInRef, { quantity });
};

export const createstockOut = async (
	model: string,
	brand: string,
	category: string,
	quantity: string,
	date: string,
	description: string,
	technicianNum: string,
	dateIn: string,
	cost: string,
	sellingPrice: string,
	branchNum: string,
	sellerName: string,
	stock: string,
) => {
	const status = true;
	const timestamp = Timestamp.now();
	const docRef = await addDoc(collection(firestore, 'Stock'), {
		model,
		brand,
		category,
		quantity,
		date,
		description,
		technicianNum,
		dateIn,
		cost,
		sellingPrice,
		branchNum,
		sellerName,
		stock,
		status,
		timestamp: timestamp,
	});
	return docRef.id;
};
