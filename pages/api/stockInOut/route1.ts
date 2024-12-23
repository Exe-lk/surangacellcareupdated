import type { NextApiRequest, NextApiResponse } from 'next';
import {
	createstockOut,
	getAllSubStockData,
	updateSubStock,
} from '../../../service/stockInOutDissService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		switch (req.method) {
			case 'POST': {
				const {
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
				} = req.body;
				if (!model) {
					res.status(400).json({ error: 'stock In name is required' });
					return;
				}
				const id = await createstockOut(
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
				);
				res.status(201).json({ message: 'stock In created', id });
				break;
			}
			case 'GET': {
				const stockIns = await getAllSubStockData();
				res.status(200).json(stockIns);
				break;
			}
			case 'PUT': {
				const { id, subid,values} = req.body;
				await updateSubStock(id, subid,values);
				res.status(200).json({ message: 'stock In updated' });
				break;
			}
			default: {
				res.setHeader('Allow', ['POST', 'GET', 'PUT']);
				res.status(405).end(`Method ${req.method} Not Allowed`);
				break;
			}
		}
	} catch (error) {
		res.status(500).json({ error: 'An error occurred' });
	}
}
