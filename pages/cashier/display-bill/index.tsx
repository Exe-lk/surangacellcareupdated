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
import { useGetStockInOutsQuery , useUpdateSubStockInOutMutation } from '../../../redux/slices/stockInOutDissApiSlice';
import { useGetStockInOutsQuery as useGetStockInOutsdisQuery } from '../../../redux/slices/stockInOutAcceApiSlice';

function index() {
	const [orderedItems, setOrderedItems] = useState<any[]>([]);

	const { data: Disstock, error, isLoading } = useGetStockInOutsQuery(undefined);
	const { data: Accstock } = useGetStockInOutsdisQuery(undefined);
	const [updateSubStockInOut] = useUpdateSubStockInOutMutation();
	const [items, setItems] = useState<any[]>([]);
	const [selectedBarcode, setSelectedBarcode] = useState<any[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<string>('');
	const [quantity, setQuantity] = useState<number>(1);
	const [payment, setPayment] = useState(true);
	const [amount, setAmount] = useState<number>(0);
	const [id1, setId] = useState<number>(1530);
	const [casher, setCasher] = useState<any>({});
	const currentDate = new Date().toLocaleDateString('en-CA');
	const currentTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});
	const [sellingPrices, setSellingPrices] = useState<{ [prefix: string]: number }>({});
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
				// const result1 = Accstock.filter((item: any) => item.stock === 'stockIn');
				const result = Disstock.filter((item: any) => item.stock === 'stockIn') // Filter for stockIn
					.flatMap((item: any) =>
						item.subStock.map((subItem: any) => ({
							...subItem,
							brand: item.brand,
							category: item.category,
							cost: item.cost,
							model: item.model,
							type: 'displaystock',
						})),
					);
				const combinedResult = [...result];
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

		const productPrefix = selectedProduct.slice(0, 4);
		if (!sellingPrices[productPrefix]) {
			Swal.fire('Warning', 'Please enter a selling price for this product.', 'error');
			return;
		}

		const selectedItem = items.find((item) => item.barcode === selectedProduct);
		console.log(selectedItem);
		if (selectedItem) {
			const sellingPrice = sellingPrices[productPrefix];
			const existingItemIndex = orderedItems.findIndex(
				(item) => item.barcode.slice(0, 4) === selectedProduct.slice(0, 4),
			);

			const existingItem = orderedItems.find((item) => item.barcode === selectedProduct);
			if (!existingItem) {
				const barcode = [
					...selectedBarcode,
					{ barcode: selectedProduct, id: selectedItem.id },
				];
				setSelectedBarcode(barcode);
			}

			let updatedItems;

			if (existingItemIndex !== -1) {
				updatedItems = [...orderedItems];
				updatedItems[existingItemIndex] = {
					...selectedItem,
					quantity: updatedItems[existingItemIndex].quantity + 1,
					sellingPrice,
					netValue: (updatedItems[existingItemIndex].quantity + 1) * sellingPrice,
				};
			} else {
				updatedItems = [
					...orderedItems,
					{
						...selectedItem,
						quantity: 1,
						sellingPrice,
						netValue: sellingPrice, // Initial net value for 1 item
					},
				];
			}
			setOrderedItems(updatedItems);

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

	const handleDeleteItem = (barcode: string) => {
		// Remove the deleted item's selling price
		const productPrefix = barcode.slice(0, 4); // Extract the first 4 digits
		setSellingPrices((prev) => {
			const updatedPrices = { ...prev };
			delete updatedPrices[productPrefix];
			return updatedPrices;
		});

		// Filter out the deleted item
		const updatedItems = orderedItems.filter((item) => item.barcode !== barcode);
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
			.reduce((sum, val) => sum + val.sellingPrice * val.quantity, 0)
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
		console.log(selectedBarcode);
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
	
					Swal.fire({
						title: 'Success',
						text: 'Bill has been added successfully.',
						icon: 'success',
						showConfirmButton: false, 
						timer: 1000, 
					});
					const selectedBarcodes = selectedBarcode; 
					const subStockUpdatePromises = selectedBarcodes.map(async (subid: any) => {
						const values = {
							status: true, 
							soldDate: formattedDate,
						};
						try {
							await updateSubStockInOut({ id:subid.id, subid: subid.barcode, values }).unwrap();
							console.log(`Sub-stock with ID: ${subid} updated successfully.`);
						} catch (error) {
							console.error(`Failed to update sub-stock with ID: ${subid}`, error);
						}
					});
					await Promise.all(subStockUpdatePromises);	
					setOrderedItems([]);
					setAmount(0);
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred. Please try again later.');
			}
		} else {
			Swal.fire('Warning..!', 'Insufficient amount', 'error');
		}
	};

	
	const handleProductChange = (value: string) => {
		const productPrefix = value.slice(0, 4); 
		if (sellingPrices[productPrefix]) {
			// Auto-fill the selling price if it exists
			setQuantity(1);
			setSelectedProduct(value);
		} else {
			// Allow manual entry for selling price
			setSelectedProduct(value);
		}
	};

	return (
		<PageWrapper className=''>
			<div className='row m-4'>
				<div className='col-8 mb-3 mb-sm-0'>
					<Card stretch className='mt-4 ' style={{ height: '75vh' }}>
						<CardBody isScrollable>
							<table className='table table-hover table-bordered border-primary'>
								<thead className={'table-dark border-primary'}>
									<tr>
										<th>Name</th>
										<th>Qty</th>
										<th>Cost</th>
										<th>U/Price(LKR)</th>

										<th>Net Value(LKR)</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									{orderedItems.map((val, index) => (
										<tr key={index}>
											<td>
												{val.category} {val.model} {val.brand}
											</td>
											<td>{val.quantity}</td>
											<td>{val.cost}</td>
											<td>{val.sellingPrice}</td>{' '}
											{/* Display selling price */}
											<td>
												{(val.sellingPrice * val.quantity).toFixed(2)}
											</td>{' '}
											{/* Calculate Net Value */}
											<td>
												<Button
													icon='delete'
													onClick={() =>
														handleDeleteItem(val.barcode)
													}></Button>
											</td>
										</tr>
									))}
									<tr>
										<td colSpan={4} className='text fw-bold'>
											Total
										</td>
										<td className='fw-bold'>{calculateSubTotal()}</td>
										<td></td>
									</tr>
								</tbody>
							</table>
						</CardBody>
						<CardFooter className='pb-1'>
							{/* Two cards side by side occupying full width */}
							<div className='d-flex w-100'>
								<Card className='col-4 flex-grow-1 me-2'>
									<CardBody>
										<FormGroup
											id='product'
											label='Product Name'
											className='col-12'>
											<Dropdown
												aria-label='State'
												editable
												placeholder='-- Select Product --'
												className='selectpicker col-12'
												options={
													items
														? items.map((type: any) => ({
																value: type.barcode,
																label: type.barcode,
														  }))
														: [{ value: '', label: 'No Data' }]
												}
												onChange={(e: any) =>
													handleProductChange(e.target.value)
												}
												value={selectedProduct}
											/>

											{/* <Select
												ariaLabel='Default select example'
												onChange={(e: any) =>
													setSelectedProduct(e.target.value)
												}
												value={selectedProduct}
												placeholder='Select Item'
												validFeedback='Looks good!'>
												{items.map((option, index) => (
													<Option key={index} value={option.cid}>
														{option.name}
													</Option>
												))}
											</Select> */}
										</FormGroup>
										<FormGroup
											id='sellingPrice'
											label='Selling Price'
											className='col-12 mt-2'>
											<Input
												type='number'
												onChange={(e: any) => {
													const productPrefix = selectedProduct.slice(
														0,
														4,
													);
													const price = Number(e.target.value);
													setSellingPrices((prev) => ({
														...prev,
														[productPrefix]: price,
													})); // Store the price
												}}
												value={
													sellingPrices[selectedProduct.slice(0, 4)] || ''
												} // Auto-fill if available
												min={1}
												validFeedback='Looks good!'
											/>
										</FormGroup>

										<div className='d-flex justify-content-end mt-2'>
											{/* <button className='btn btn-danger me-2'>Cancel</button> */}
											<button
												className='btn btn-success'
												onClick={handlePopupOk}>
												ADD
											</button>
										</div>
									</CardBody>
								</Card>
								<Card className='flex-grow-1 ms-2'>
									<CardBody>
										<>
											<FormGroup
												id='amount'
												label='Amount (LKR)'
												className='col-12 mt-2'>
												<Input
													type='number'
													onChange={(e: any) => {
														let value = e.target.value;

														// Remove leading zero if it's the first character
														if (
															value.length > 1 &&
															value.startsWith('0')
														) {
															value = value.substring(1); // Remove the first character
														}

														setAmount(value); // Update the state with the modified value
													}}
													value={amount}
													min={0}
													validFeedback='Looks good!'
												/>
											</FormGroup>
											<ChecksGroup isInline className='pt-2'>
												<Checks
													// type='switch'
													id='inlineCheckOne'
													label='Cash'
													name='checkOne'
													checked={payment}
													onClick={(e) => {
														setPayment(true);
													}}
												/>
												<Checks
													// type='switch'
													id='inlineCheckTwo'
													label='Card'
													name='checkOne'
													checked={!payment}
													onClick={(e) => {
														setPayment(false);
													}}
												/>
											</ChecksGroup>
											<Button
												color='success'
												className='mt-4 w-100'
												onClick={addbill}>
												Process
											</Button>
										</>
									</CardBody>
								</Card>
							</div>
						</CardFooter>
					</Card>
				</div>
				{/* Second Card */}
				<div className='col-4'>
					<Card stretch className='mt-4 p-4' style={{ height: '75vh' }}>
						<CardBody isScrollable>
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
										<p className='mb-0'> INVOICE NO&nbsp; &nbsp;:&emsp;{id1}</p>
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
									(
										{ cid, name, quantity, price, discount, sellingPrice }: any,
										index: any,
									) => (
										<p>
											{index + 1}. {name}
											<br />
											{cid}&emsp;&emsp;&emsp;
											{quantity}&emsp;&emsp;&emsp;
											{sellingPrice}.00&emsp;&emsp;&emsp;&emsp;
											{(sellingPrice * quantity).toFixed(2)}
										</p>
									),
								)}

								<hr />
								<div className='d-flex justify-content-between'>
									<div>Total</div>
									<div>
										<strong>{calculateSubTotal()}</strong>
									</div>
								</div>
								{/* <div className='d-flex justify-content-between'>
									<div>Discount</div>
									<div>
										<strong>{calculateDiscount()}</strong>
									</div>
								</div> */}
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
				fhfhff
			</div>
		</PageWrapper>
	);
}

export default index;