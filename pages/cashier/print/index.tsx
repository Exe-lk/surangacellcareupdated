import React, { useEffect, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import 'react-simple-keyboard/build/css/index.css';
import Swal from 'sweetalert2';
import Card, { CardBody, CardFooter } from '../../../components/bootstrap/Card';
import { Dropdown } from 'primereact/dropdown';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import { useGetStockInOutsQuery } from '../../../redux/slices/stockInOutDissApiSlice';
import { useGetStockInOutsQuery as useGetStockInOutsdisQuery } from '../../../redux/slices/stockInOutAcceApiSlice';

function index() {
	const [orderedItems, setOrderedItems] = useState<any[]>([]);

	const { data: Disstock, error, isLoading } = useGetStockInOutsQuery(undefined);
	const { data: Accstock } = useGetStockInOutsdisQuery(undefined);
	const [items, setItems] = useState<any[]>([]);
	const [selectedBarcode, setSelectedBarcode] = useState<any[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<string>('');
	const [quantity, setQuantity] = useState<number>(1);
	const [payment, setPayment] = useState(true);
	const [amount, setAmount] = useState<number>(0);
	const [id, setId] = useState<number>(1530);
	const [casher, setCasher] = useState<any>({});
	const currentDate = new Date().toLocaleDateString('en-CA');
	const currentTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});
	const [isQzReady, setIsQzReady] = useState(false);
	// useEffect(() => {
	// 	const cashier = localStorage.getItem('user');
	// 	if (cashier) {
	// 		const jsonObject = JSON.parse(cashier);
	// 		console.log(jsonObject);
	// 		setCasher(jsonObject);
	// 	}
	// }, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result1 = Accstock.filter((item: any) => item.stock === 'stockIn');
				// const result = Disstock.filter((item: any) => item.stock === 'stockIn') // Filter for stockIn
				// 	.flatMap((item: any) =>
				// 		item.subStock.map((subItem: any) => ({
				// 			...subItem,
				// 			brand: item.brand,
				// 			category: item.category,
				// 			cost: item.cost,
				// 			model: item.model,
				// 			type: 'displaystock',
				// 		})),
				// 	);
				const combinedResult = [...result1];
				setItems(combinedResult);
				console.log(combinedResult);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, [payment]);

	const handlePopupOk = async () => {
		if (!selectedProduct || quantity <= 0) {
			Swal.fire('Error', 'Please select a product and enter a valid quantity.', 'error');
			return;
		}
		const selectedItem = items.find((item) => item.barcode === selectedProduct);
		if (selectedItem) {
			console.log(selectedItem.type);
			if (selectedItem.type == 'displaystock') {
				const existingItemIndex = orderedItems.findIndex(
					(item) => item.barcode.slice(0, 4) === selectedProduct.slice(0, 4),
				);

				const existingItem = orderedItems.find((item) => item.barcode === selectedProduct);
				if (!existingItem) {
					const barcode = [...selectedBarcode, selectedProduct];
					setSelectedBarcode(barcode);
				}

				let updatedItems;

				if (existingItemIndex !== -1) {
					updatedItems = [...orderedItems];
					updatedItems[existingItemIndex] = {
						...selectedItem,
						quantity: updatedItems[existingItemIndex].quantity + 1,
					};
				} else {
					updatedItems = [...orderedItems, { ...selectedItem, quantity: 1 }];
				}
				setOrderedItems(updatedItems);
			} else {
				const existingItemIndex = orderedItems.findIndex(
					(item) => item.barcode === selectedProduct,
				);
				let updatedItems;

				if (existingItemIndex !== -1) {
					updatedItems = [...orderedItems];
					updatedItems[existingItemIndex] = {
						...selectedItem,
						quantity,
					};
				} else {
					updatedItems = [...orderedItems, { ...selectedItem, quantity }];
				}
				setOrderedItems(updatedItems);
			}

			setSelectedProduct('');
			setQuantity(1);

			Swal.fire({
				title: 'Success',
				text: 'Item added/replaced successfully.',
				icon: 'success',
				showConfirmButton: false,
				timer: 1000,
			});
		} else {
			Swal.fire('Error', 'Selected item not found.', 'error');
		}
	};

	const handleDeleteItem = (cid: string) => {
		const updatedItems = orderedItems.filter((item) => item.cid !== cid);
		setOrderedItems(updatedItems);

		Swal.fire({
			title: 'Success',
			text: 'Item removed successfully.',
			icon: 'success',
			showConfirmButton: false,
			timer: 1000,
		});
	};

	const calculateSubTotal = () => {
		return orderedItems
			.reduce(
				(sum, val) =>
					sum +
					val.price * val.quantity -
					((val.price * val.quantity) / 100) * val.discount,
				0,
			)
			.toFixed(2);
	};
	const calculateDiscount = () => {
		return orderedItems
			.reduce((sum, val) => sum + ((val.price * val.quantity) / 100) * val.discount, 0)
			.toFixed(2);
	};

	const calculateTotal = () => {
		return orderedItems.reduce((sum, val) => sum + val.price * val.quantity, 0).toFixed(2);
	};

	const addbill = async () => {
		if (
			amount >= Number(calculateSubTotal()) &&
			amount > 0 &&
			Number(calculateSubTotal()) > 0
		) {
			try {
				const result = await Swal.fire({
					title: 'Are you sure?',
					text: 'You will not be able to recover this status!',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes, Print Bill!',
				});

				if (result.isConfirmed) {
					const totalAmount = calculateSubTotal();
					const currentDate = new Date();
					const formattedDate = currentDate.toLocaleDateString();

					const values = {
						orders: orderedItems,
						time: currentTime,
						date: formattedDate,
						casheir: casher.email,
						amount: Number(totalAmount),
						type: payment ? 'cash' : 'card',
						id: id,
					};

					//add print function


				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred. Please try again later.');
			}
		} else {
			Swal.fire('Warning..!', 'Insufficient amount', 'error');
		}
	};

	return (
		<PageWrapper className=''>
			<div className='row m-4'>
				{/* Second Card */}
				<div className='col-4'>
					<Card stretch className='mt-4 p-4' style={{ height: '75vh' }}>
						<CardBody isScrollable>
							<Button color='success' className='mt-4 w-100 mb-4' onClick={addbill}>
								Process
							</Button>

							<div
								// ref={printRef} // Attach the ref here
								style={{
									width: '300px',
									fontSize: '12px',
									backgroundColor: 'white',
									color: 'black',
								}}
								className='p-3'>
								<center>
									{/* <img src={Logo} style={{ height: 50, width: 100 }} alt='' /> */}
									<p>
										No.137M,
										<br />
										Colombo Road,
										<br />
										Biyagama
										<br />
										TEL : -076 227 1846 / 076 348 0380
									</p>
								</center>
								<div className='d-flex justify-content-between align-items-center mt-4'>
									<div className='text-start'>
										<p className='mb-0'>
											DATE &nbsp;&emsp; &emsp; &emsp;:&emsp;{currentDate}
										</p>
										<p className='mb-0'>START TIME&emsp;:&emsp;{currentTime}</p>
										<p className='mb-0'> INVOICE NO&nbsp; &nbsp;:&emsp;{id}</p>
									</div>
								</div>

								<hr />
								<hr />
								<p>
									Product &emsp;Qty&emsp;&emsp; U/Price&emsp;&emsp;&emsp; Net
									Value
								</p>

								<hr />

								{orderedItems.map(
									({ cid, name, quantity, price, discount }: any, index: any) => (
										<p>
											{index + 1}. {name}
											<br />
											{cid}&emsp;&emsp;&emsp;
											{quantity}&emsp;&emsp;&emsp;
											{price}.00&emsp;&emsp;&emsp;&emsp;
											{(price * quantity).toFixed(2)}
										</p>
									),
								)}

								<hr />
								<div className='d-flex justify-content-between'>
									<div>Total</div>
									<div>
										<strong>{calculateTotal()}</strong>
									</div>
								</div>
								<div className='d-flex justify-content-between'>
									<div>Discount</div>
									<div>
										<strong>{calculateDiscount()}</strong>
									</div>
								</div>
								<div className='d-flex justify-content-between'>
									<div>
										<strong>Sub Total</strong>
									</div>
									<div>
										<strong>{calculateSubTotal()}</strong>
									</div>
								</div>
								<hr />
								<div className='d-flex justify-content-between'>
									<div>Cash Received</div>
									<div>{amount}.00</div>
								</div>
								<div className='d-flex justify-content-between'>
									<div>Balance</div>
									<div>{amount - Number(calculateSubTotal())}</div>
								</div>
								<div className='d-flex justify-content-between'>
									<div>No.Of Pieces</div>
									<div>{orderedItems.length}</div>
								</div>

								<hr />
								<center>THANK YOU COME AGAIN</center>
								<hr />

								<center style={{ fontSize: '11px' }}></center>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
		</PageWrapper>
	);
}

export default index;
