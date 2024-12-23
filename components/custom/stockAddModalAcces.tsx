import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Swal from 'sweetalert2';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { useAddStockInMutation } from '../../redux/slices/stockInOutAcceApiSlice';
import { useGetItemAcceByIdQuery } from '../../redux/slices/itemManagementAcceApiSlice';
import { useGetItemAccesQuery } from '../../redux/slices/itemManagementAcceApiSlice';
import { useUpdateStockInOutMutation } from '../../redux/slices/stockInOutAcceApiSlice';
import { useGetStockInOutsQuery } from '../../redux/slices/stockInOutAcceApiSlice';

interface StockAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

interface StockIn {
	barcode: number;
	cid: string;
	brand: string;
	model: string;
	category: string;
	type: string;
	quantity: string;
	date: string;
	storage: string;
	name: string;
	nic: string;
	mobile: string;
	mobileType: string;
	cost: string;
	code: string;
	stock: string;
	status: boolean;
	sellingPrice: Number;
}

const StockAddModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [stockIn, setStockIn] = useState<StockIn>({
		cid: '',
		brand: '',
		model: '',
		category: '',
		type: '',
		quantity: '',
		date: '',
		storage: '',
		name: '',
		nic: '',
		mobile: '',
		mobileType: '',
		cost: '',
		code: '',
		stock: 'stockIn',
		status: true,
		sellingPrice: 0,
		barcode: 0,
	});
	const { data: stockInData, isSuccess } = useGetItemAcceByIdQuery(id);
	const [addstockIn, { isLoading }] = useAddStockInMutation();
	const [updateStockInOut] = useUpdateStockInOutMutation();
	const { refetch } = useGetItemAccesQuery(undefined);
	const { data: stockInOuts } = useGetStockInOutsQuery(undefined);
	const [generatedCode, setGeneratedCode] = useState('');
	const [generatedbarcode, setGeneratedBarcode] = useState<any>();

	useEffect(() => {
		if (isSuccess && stockInData) {
			setStockIn(stockInData);
		}
		if (stockInOuts?.length) {
			const lastCode = stockInOuts
				.map((item: { code: string }) => item.code)
				.filter((code: string) => code)
				.reduce((maxCode: string, currentCode: string) => {
					const currentNumericPart = parseInt(currentCode.replace(/\D/g, ''), 10);
					const maxNumericPart = parseInt(maxCode.replace(/\D/g, ''), 10);
					return currentNumericPart > maxNumericPart ? currentCode : maxCode;
				}, '100000');
			const newCode = incrementCode(lastCode);
			setGeneratedCode(newCode);
		} else {
			setGeneratedCode('100000');
			setGeneratedBarcode('1000100000');
		}
	}, [isSuccess, stockInData, stockInOuts,isOpen]);

	const incrementCode = (code: string) => {
		const numericPart = parseInt(code.replace(/\D/g, ''), 10);
		const incrementedNumericPart = (numericPart + 1).toString().padStart(5, '0');
		const barcode = (numericPart + 1).toString().padStart(10, '0');
		const value = `${stockInData?.code}${incrementedNumericPart}`;
		setGeneratedBarcode(value);
		return incrementedNumericPart;
	};

	const formik = useFormik({
		initialValues: {
			brand: stockIn.brand || '',
			model: stockIn.model || '',
			category: stockIn.category || '',
			type: stockIn.type || '',
			quantity: '',
			date: '',
			storage: '',
			name: '',
			nic: '',
			mobile: '',
			mobileType: stockIn.mobileType || '',
			cost: '',
			code: generatedCode,
			stock: 'stockIn',
			status: true,
			sellingPrice: 0,
			barcode: generatedbarcode,
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: Record<string, string> = {};
			if (!values.quantity) {
				errors.quantity = 'Quantity is required';
			}
			if (!values.sellingPrice) {
				errors.sellingPrice = 'Selling Price is required';
			}
			if (!values.cost) {
				errors.cost = 'Cost is required';
			}
			if (!values.date) {
				errors.date = 'Date In is required';
			}
			if (values.type === 'Mobile') {
				if (!values.storage) {
					errors.storage = 'Storage is required';
				}
				if (values.mobileType === 'Used') {
					if (!values.name) {
						errors.name = 'Name is required';
					}
					if (!values.nic) {
						errors.nic = 'NIC is required';
					}else if (!/^\d{9}[Vv]$/.test(values.nic) && !/^\d{12}$/.test(values.nic)) {
						errors.nic = 'NIC must be 9 digits followed by "V" or 12 digits';
					}
					if (!values.mobile) {
						errors.mobile = 'Mobile Number is required';
					}else if (values.mobile.length !== 10) {
						errors.mobile = 'Mobile number must be exactly 10 digits';
					}
				}
			}
			if (!values.cost) {
				errors.cost = 'Cost is required';
			}
			return errors;
		},
		onSubmit: async (values) => {
			try {
				const process = Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				try {
					const updatedQuantity =
						parseInt(stockInData.quantity) + parseInt(values.quantity);
					const response: any = await addstockIn({
						...values,
						code: generatedCode,
						barcode: generatedbarcode,
					}).unwrap();
					await updateStockInOut({ id, quantity: updatedQuantity }).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Stock In Created Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to add the item. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred during the process. Please try again later.');
			}
		},
	});

	const formatMobileNumber = (value: string) => {
		let sanitized = value.replace(/\D/g, '');
		if (!sanitized.startsWith('0')) sanitized = '0' + sanitized;
		return sanitized.slice(0, 10);
	};

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>{'Stock In'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='code' label='Generated Code' className='col-md-6'>
						<Input
							type='text'
							value={generatedbarcode}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.code}
						/>
					</FormGroup>
					<FormGroup id='brand' label='Brand' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.brand}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.brand}
						/>
					</FormGroup>
					<FormGroup id='model' label='Model' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.model}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.model}
						/>
					</FormGroup>
					<FormGroup id='category' label='Category' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.category}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.category}
						/>
					</FormGroup>
					<FormGroup id='type' label='Type' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.type}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.type}
						/>
					</FormGroup>
					{formik.values.type === 'Mobile' && (
						<>
							<FormGroup id='storage' label='Storage' className='col-md-6'>
								<Input
									type='text'
									value={formik.values.storage}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.storage}
									invalidFeedback={formik.errors.storage}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup id='mobileType' label='Mobile Type' className='col-md-6'>
								<Input
									type='text'
									value={formik.values.mobileType}
									readOnly
									isValid={formik.isValid}
									isTouched={formik.touched.mobileType}
								/>
							</FormGroup>
							{formik.values.mobileType === 'Used' && (
								<>
									<FormGroup id='name' label='Name' className='col-md-6'>
										<Input
											type='text'
											value={formik.values.name}
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											isValid={formik.isValid}
											isTouched={formik.touched.name}
										/>
									</FormGroup>
									<FormGroup
										id='mobile'
										label='Mobile Number'
										className='col-md-6'>
										<Input
											type='text'
											value={formik.values.mobile}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												const input = e.target.value.replace(/\D/g, '');
												formik.setFieldValue('mobile', formatMobileNumber(input));
											}}
											onBlur={formik.handleBlur}
											isValid={formik.isValid}
											isTouched={formik.touched.mobile}
											invalidFeedback={formik.errors.mobile}
											validFeedback='Looks good!'
										/>
									</FormGroup>
									<FormGroup id='nic' label='NIC' className='col-md-6'>
										<Input
											type='text'
											value={formik.values.nic}
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											isValid={formik.isValid}
											isTouched={formik.touched.nic}
										/>
									</FormGroup>
								</>
							)}
						</>
					)}
					<FormGroup id='quantity' label='Quantity' className='col-md-6'>
						<Input
							type='number'
							min={1}
							placeholder='Enter Quantity'
							value={formik.values.quantity}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.quantity}
							invalidFeedback={formik.errors.quantity}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='date' label='Date In' className='col-md-6'>
						<Input
							type='date'
							max={new Date().toISOString().split('T')[0]}
							placeholder='Enter Date'
							value={formik.values.date}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.date}
							invalidFeedback={formik.errors.date}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='cost' label='Cost(lkr)' className='col-md-6'>
						<Input
							type='number'
							min={0}
							placeholder='Enter Cost'
							value={formik.values.cost}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							invalidFeedback={formik.errors.cost}
							isTouched={formik.touched.cost}
						/>
					</FormGroup>
					<FormGroup id='sellingPrice' label='Selling Price(lkr)' className='col-md-6'>
						<Input
							type='number'
							min={0}
							placeholder='Enter Cost'
							value={formik.values.sellingPrice}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.sellingPrice}
							invalidFeedback={formik.errors.sellingPrice}
							validFeedback='Looks good!'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='p-4'>
				<Button color='success' onClick={() => formik.handleSubmit()}>
					Stock In
				</Button>
			</ModalFooter>
		</Modal>
	);
};
StockAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default StockAddModal;
