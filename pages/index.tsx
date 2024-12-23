import React, { FC } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import classNames from 'classnames';
import Link from 'next/link';
import PropTypes from 'prop-types';
import useDarkMode from '../hooks/useDarkMode';
import PageWrapper from '../layout/PageWrapper/PageWrapper';
import Page from '../layout/Page/Page';
import Card, { CardBody } from '../components/bootstrap/Card';
import Button from '../components/bootstrap/Button';
import FormGroup from '../components/bootstrap/forms/FormGroup';
import Input from '../components/bootstrap/forms/Input';
import Swal from 'sweetalert2';
import Logo from '../components/Logo';
import { useAddUserMutation } from '../redux/slices/userApiSlice';

interface ILoginHeaderProps {
	isNewUser?: boolean;
}

const LoginHeader: FC<ILoginHeaderProps> = () => {
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Welcome,</div>
			<div className='text-center h4 text-muted mb-5'>Sign in to continue!</div>
		</>
	);
};

interface ILoginProps {
	isSignUp?: boolean;
}

const Login: NextPage<ILoginProps> = ({ isSignUp }) => {
	const router = useRouter();
	const { darkModeStatus } = useDarkMode();
	const [addUser] = useAddUserMutation();

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			email: '',
			password: '',
		},
		validate: (values) => {
			const errors: { email?: string; password?: string } = {};
			if (!values.email) {
				errors.email = 'Required';
			} else if (!values.email.includes('@')) {
				errors.email = 'Invalid email format.';
			} else if (values.email.includes(' ')) {
				errors.email = 'Email should not contain spaces.';
			}
			if (!values.password) {
				errors.password = 'Required';
			}
			return errors;
		},
		onSubmit: async (values) => {
			try {
				const response = await addUser(values).unwrap();
				const email = response.user.email;
				localStorage.setItem('email', email);
				if (response.user) {
					await Swal.fire({
						icon: 'success',
						title: 'Login Successful',
						text: 'You have successfully logged in!',
					});
					localStorage.setItem('userRole', response.user.position);
					switch (response.user.position) {
						case 'admin':
							router.push('/admin/dashboard');
							break;
						case 'Viewer':
							router.push('/viewer/dashboard');
							break;
						case 'display stock keeper':
							router.push('/display-stock/dashboard');
							break;
						case 'accessosry stock keeper':
							router.push('/accessory-stock/dashboard');
							break;
						case 'bill keeper':
							router.push('/bill-keeper/bill-management');
							break;
						case 'cashier':
							router.push('/cashier/rapaired-phone');
							break;
						case 'Repair Sales':
							router.push('repairSales/Waiting');
							break;
						default:
							break;
					}
				}
			} catch (error: any) {
				console.error('Login Error:', error);
				if (error.status === 404) {
					await Swal.fire('Error', 'Email not found. Please try again.', 'error');
				} else if (error.status === 401) {
					await Swal.fire('Error', 'Password is incorrect. Please try again.', 'error');
				} else {
					await Swal.fire(
						'Error',
						'An unexpected error occurred. Please try again.',
						'error',
					);
				}
			}
		},
	});

	return (
		<PageWrapper isProtected={false}>
			<Head>
				<title> Login</title>
			</Head>
			<Page className='p-0'>
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
						<Card className='shadow-3d-dark' data-tour='login-page'>
							<CardBody>
								<div className='text-center my-5'>
									<Link
										href='/'
										className={classNames(
											'text-decoration-none  fw-bold display-2',
											{
												'text-dark': !darkModeStatus,
												'text-light': darkModeStatus,
											},
										)}>
										<Logo width={200} />
									</Link>
								</div>
								<LoginHeader />
								<form className='row g-4'>
									<>
										<div className='col-12'>
											<FormGroup
												id='email'
												label='Your email'
												className='col-md-12'>
												<Input
													autoComplete='username'
													value={formik.values.email}
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													isValid={formik.isValid}
													isTouched={formik.touched.email}
													invalidFeedback={formik.errors.email}
												/>
											</FormGroup>
											<FormGroup
												id='password'
												label='Password'
												className='col-md-12'>
												<Input
													type='password'
													value={formik.values.password}
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													isValid={formik.isValid}
													isTouched={formik.touched.password}
													invalidFeedback={formik.errors.password}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<Button
												color='warning'
												className='w-100 py-3'
												onClick={formik.handleSubmit}>
												Login
											</Button>
										</div>
									</>
								</form>
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};
Login.propTypes = {
	isSignUp: PropTypes.bool,
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default Login;
