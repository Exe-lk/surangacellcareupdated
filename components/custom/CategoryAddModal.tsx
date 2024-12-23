import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';
import { useAddCategoryMutation } from '../../redux/slices/categoryApiSlice';
import { useGetCategoriesQuery } from '../../redux/slices/categoryApiSlice';

interface CategoryEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const CategoryAddModal: FC<CategoryEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [addCategory, { isLoading }] = useAddCategoryMutation();
	const { refetch } = useGetCategoriesQuery(undefined);

	const formik = useFormik({
		initialValues: {
			name: '',
			status: true,
		},
		validate: (values) => {
			const errors: {
				name?: string;
			} = {};
			if (!values.name) {
				errors.name = 'Required';
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
					const response: any = await addCategory(values).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Category Created Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					console.error('Error during handleSubmit: ', error);
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to add the category. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				Swal.close;
				alert('An error occurred during file upload. Please try again later.');
			}
		},
	});

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>{'New Category'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='name' label='Category Name' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.name}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.name}
							invalidFeedback={formik.errors.name}
							validFeedback='Looks good!'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
				Create Category
				</Button>
			</ModalFooter>
		</Modal>
	);
};
CategoryAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default CategoryAddModal;
