import React, { useEffect, useRef, useState } from 'react';
import CommonRightPanel from '../../../components/CommonRightPanel';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

import Swal from 'sweetalert2';
import Additem from '../../../components/add-item';
import Edit from '../../../components/edit-item';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../components/bootstrap/Card';
import Input from '../../../components/bootstrap/forms/Input';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import bill from '../../../assets/img/bill/WhatsApp_Image_2024-09-12_at_12.26.10_50606195-removebg-preview (1).png';

interface Category {
	id: number;
}
function index() {
	const [toggleRightPanel, setToggleRightPanel] = useState(false);
	const [orderedItems, setOrderedItems] = useState<any>([]);
	const [cname, setCname] = useState<string>('');
	const [amount, setAmount] = useState<number>(0);
	const [id, setId] = useState<any>(1530);
	const customerNameInputRef = useRef<HTMLInputElement>(null);
	const customerAmountInputRef = useRef<HTMLInputElement>(null);
	const [casher, setCasher] = useState<any>({});
	const [payment, setPayment] = useState(true);
	const [activeComponent, setActiveComponent] = useState<'additem' | 'edit'>('additem');
	const currentDate = new Date().toLocaleDateString('en-CA');
	const currentTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});
	const [address, setAddress] = useState('');
	

	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'orders');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData: any = querySnapshot.docs
					.map((doc) => {
						const data = doc.data() as Category;
						return {
							...data,
						};
					})
					.sort((a: any, b: any) => b.id - a.id); // Sort by id in ascending order
				setId(firebaseData[0].id + 1 || 1500);
				console.log(firebaseData[0].id + 1);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, []);

	const addbill = async () => {
		if (
			amount >=
				orderedItems.reduce(
					(total: any, item: any) =>
						total +
						item.quantity * item.price +
						((total + item.quantity * item.price) / 100) * 10,
					0.0,
				) &&
			orderedItems.reduce(
				(total: any, item: any) =>
					total +
					item.quantity * item.price +
					((total + item.quantity * item.price) / 100) * 10,
				0.0,
			) > 1
		) {
			try {
				const result = await Swal.fire({
					title: 'Are you sure?',
					text: 'You will not be able to recover this status!',
					// text: id,
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes, update it!',
				});

				if (result.isConfirmed) {
					const amount = orderedItems.reduce(
						(total: any, item: any) =>
							total +
							item.quantity * item.price +
							((total + item.quantity * item.price) / 100) * 10,
						0.0,
					);
					const currentDate = new Date();
					const formattedDate = currentDate.toLocaleDateString();

					const year = currentDate.getFullYear();
					const month = String(currentDate.getMonth() + 1).padStart(2, '0');
					const day = String(currentDate.getDate()).padStart(2, '0');
					const formattedDate1 = `${year}-${month}-${day}`;

					const values = {
						orders: orderedItems,
						time: currentTime,
						date: formattedDate,
						casheir: casher.email,
						amount: Number(amount),
						type: payment ? 'cash' : 'card',
						id: id,
					};
					const values1 = {
						description: id,
						date: formattedDate1,
						price: Number(amount),
						type: 'Incoming',
						url: '',
					};
					const collectionRef = collection(firestore, 'orders');
					const collectionRef1 = collection(firestore, 'cashBook');

					addDoc(collectionRef, values)
						.then(() => {
							addDoc(collectionRef1, values1)
								.then(() => {
									Swal.fire(
										'Added!',

										'bill has been add successfully.',
										'success',
									);
									setOrderedItems([]);
									setCname('');
									setAmount(0);
								})
								.catch((error) => {
									console.error('Error adding document: ', error);
									alert(
										'An error occurred while adding the document. Please try again later.',
									);
								});
						})
						.catch((error) => {
							console.error('Error adding document: ', error);
							alert(
								'An error occurred while adding the document. Please try again later.',
							);
						});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred during file upload. Please try again later.');
			}
		} else {
			Swal.fire('warning..!', 'insufficient amount', 'error');
		}
	};
	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.ctrlKey && event.key.toLowerCase() === 'b') {
			setToggleRightPanel((prevState) => !prevState);
			event.preventDefault(); // Prevent default browser behavior
		} else if (event.ctrlKey && event.key.toLowerCase() === 'p') {
			addbill();
			event.preventDefault(); // Prevent default browser behavior
		} else if (event.key === 'Shift') {
			// Check if the focus is on the input fields
			if (
				document.activeElement === customerNameInputRef.current ||
				document.activeElement === customerAmountInputRef.current
			) {
				// Prevent default action of the Shift key press
				event.preventDefault();
			} else {
				// Focus the customer name input
				customerNameInputRef.current?.focus();
			}
		}
	};

	useEffect(() => {
		const handleCustomerNameEnter = (event: KeyboardEvent) => {
			if (event.key === 'Shift') {
				customerAmountInputRef.current?.focus();
			}
		};

		const handleAmountEnter = (event: KeyboardEvent) => {
			if (event.key === 'Shift') {
				event.stopPropagation();
				event.preventDefault();
				addbill();
			}
		};

		const customerNameInput = customerNameInputRef.current;
		const customerAmountInput = customerAmountInputRef.current;

		customerNameInput?.addEventListener('keydown', handleCustomerNameEnter);
		customerAmountInput?.addEventListener('keydown', handleAmountEnter);

		window.addEventListener('keydown', handleKeyPress);

		return () => {
			// customerNameInput?.removeEventListener('keydown', handleCustomerNameEnter);
			customerAmountInput?.removeEventListener('keydown', handleAmountEnter);
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, [cname, amount]);

	useEffect(() => {
		const cashier = localStorage.getItem('user');
		if (cashier) {
			const jsonObject = JSON.parse(cashier);
			console.log(jsonObject);
			setCasher(jsonObject);
		}
	}, []);
	interface Category {
		cid: string;
		categoryname: string;
	}

	useEffect(() => {
		// Retrieve email from local storage
		const email = localStorage.getItem('email');
		console.log("email",email);
	
		// Switch case to set the address based on the email
		switch (email) {
		  case 'sakyarasadi@gmail.com':
			setAddress('No. 524/1/A, Kandy Road, Kadawatha');
			break;
		  case 'achintha@gmail.com':
			setAddress('No. 172/20, Ragama Road, Kadawatha');
			break;
		  case 'jayani@gmail.com':
			setAddress('No. 135/6, Kandy Road, Kadawatha');
			break;
		}
	  }, []);
	
	return (
		<PageWrapper className=''>
			<div className='row m-4'>
				<div className='col-4 mb-3 mb-sm-0'>
					<Additem
						orderedItems={orderedItems}
						setOrderedItems={setOrderedItems}
						isActive={activeComponent === 'additem'}
						setActiveComponent={setActiveComponent}
					/>{' '}
				</div>
				<div className='col-4 '>
					<Edit
						orderedItems={orderedItems}
						setOrderedItems={setOrderedItems}
						isActive={activeComponent === 'edit'}
						setActiveComponent={setActiveComponent}
					/>{' '}
				</div>
				<div className='col-4'>
					<div className='row justify-content-end'>
						{/* <div className='col-3'>
							<Button
								className=''
								icon='Groups'
								onClick={() => setToggleRightPanel(!toggleRightPanel)}
								color={toggleRightPanel ? 'dark' : 'danger'}
								aria-label='Toggle right panel'>
								Return
							</Button>
						</div>
						<div className='col-2'>
							<Button
								className=''
								icon='Groups'
								onClick={() => setToggleRightPanel(!toggleRightPanel)}
								color={toggleRightPanel ? 'dark' : 'light'}
								aria-label='Toggle right panel'>
								Bill
							</Button>
						</div> */}
					</div>
					<Card stretch className='mt-4 p-4' style={{ height: '75vh' }}>
						<CardBody isScrollable>
							<div className='row mt-1 mb-0'>
								<div className='col d-flex align-items-center'>
									<img
										src={bill}
										width={350}
										height={60}
									/>
									{/* <strong className='fs-5'>No.135/6, Kandy Road,Kadawatha</strong>
									<strong className='fs-5'>Tel:0112928521/0779931144</strong> */}
								</div>
								{/* <div className='col-auto text-end  fs-5'>#{id}</div> */}
							</div>
							<br></br>
							<CardLabel>{address}</CardLabel>
							<Input
								ref={customerNameInputRef}
								onChange={(e: any) => setCname(e.target.value)}
								value={cname}
								type='text'
								className='mt-3 mb-4 p-3'
								placeholder='Customer Name'
							/>
							<hr />
							<div className='row'>
								<div className='col d-flex align-items-center '>Item</div>
								<div className='col-auto text-end'>
									{orderedItems.length} (items)
								</div>
							</div>
							<div className='row mt-2'>
								<div className='col d-flex align-items-center'>Subtotal</div>
								<div className='col-auto text-end'>
									<strong className='fs-5'>
										{orderedItems.reduce(
											(total: any, item: any) =>
												total + item.quantity * item.price,
											0,
										)}
										.00
									</strong>
								</div>
							</div>
							<div className='row mt-2'>
								<div className='col d-flex align-items-center'>Discount</div>
								<div className='col-auto text-end text-success-emphasis fs-5'>
									-5000.00
								</div>
							</div>
							<div className='row mt-2'>
								<div className='col d-flex align-items-center'>TAX (10%)</div>
								<div className='col-auto text-end  fs-5'>
									{orderedItems
										.reduce(
											(total: any, item: any) =>
												((total + item.quantity * item.price) / 100) * 10,
											0,
										)
										.toFixed(2)}
								</div>
							</div>

							<hr />

							<div className='row mt-2'>
								<div className='col d-flex align-items-center fs-3'>Total</div>
								<div className='col-auto text-end  fs-3'>
									LKR:{' '}
									{orderedItems
										.reduce(
											(total: any, item: any) =>
												total +
												item.quantity * item.price +
												((total + item.quantity * item.price) / 100) * 10,
											0.0,
										)
										.toFixed(2)}
								</div>
							</div>

							<CardLabel>Amount</CardLabel>
							<Input
								type={'number'}
								value={amount}
								onChange={(e: any) => {
									setAmount(e.target.value);
								}}
								ref={customerAmountInputRef}
								className='mt-3 mb-4 p-3'
								placeholder='Enter Amount'></Input>

							<div className='row mt-2'>
								<div className='col d-flex align-items-center'>Balance</div>
								<div className='col-auto text-end  fs-5'>
									{amount -
										orderedItems
											.reduce(
												(total: any, item: any) =>
													total +
													item.quantity * item.price +
													((total + item.quantity * item.price) / 100) *
														10,
												0.0,
											)
											.toFixed(2)}
								</div>
							</div>
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
								className='btn btn-success w-100 mt-3 fs-4 p-3 mb-3'
								onClick={addbill}>
								Print Bill
							</Button>
						</CardBody>
					</Card>
				</div>
			</div>

			<CommonRightPanel
				setOpen={setToggleRightPanel}
				isOpen={toggleRightPanel}
				orderedItems={orderedItems}
				id={id}
			/>
		</PageWrapper>
	);
}

export default index;
