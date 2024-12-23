import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import useDarkMode from '../../../hooks/useDarkMode';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import ItemAddModal from '../../../components/custom/ItemAddEleModal';
import ItemEditModal from '../../../components/custom/ItemEditEleModal';
import { doc, deleteDoc, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import StockAddModal from '../../../components/custom/StockAddModal';
import StockOutModal from '../../../components/custom/StockOutElecModal';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import Swal from 'sweetalert2';
import ItemDeleteModal from '../../../components/custom/ItemDeleteModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DropdownItem } from '../../../components/bootstrap/Dropdown';
import { toPng, toSvg } from 'html-to-image';
import { useUpdateItemDisMutation } from '../../../redux/slices/itemManagementDisApiSlice';
import { useGetItemDissQuery } from '../../../redux/slices/itemManagementDisApiSlice';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import bill from '../../../assets/img/bill/WhatsApp_Image_2024-09-12_at_12.26.10_50606195-removebg-preview (1).png';
import { ref } from 'firebase/storage';

const Index: NextPage = () => {
	const { darkModeStatus } = useDarkMode();
	const [searchTerm, setSearchTerm] = useState('');
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false);
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false);
	const [addstockModalStatus, setAddstockModalStatus] = useState<boolean>(false);
	const [editstockModalStatus, setEditstockModalStatus] = useState<boolean>(false);
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [id, setId] = useState<string>('');
	const { data: itemDiss, error, isLoading, refetch } = useGetItemDissQuery(undefined);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['50']);
	const [updateItemDis] = useUpdateItemDisMutation();
	const [quantity, setQuantity] = useState<any>();
	const inputRef = useRef<HTMLInputElement>(null);
	const [formStatus, setFormStatus] = useState<boolean>(false);
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [itemDiss]);

	const handleClickDelete = async (itemDis: any) => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			});
			if (result.isConfirmed) {
				const values = await {
					id: itemDis.id,
					model: itemDis.model,
					brand: itemDis.brand,
					reorderLevel: itemDis.reorderLevel,
					quantity: itemDis.quantity,
					boxNumber: itemDis.boxNumber,
					category: itemDis.category,
					touchpadNumber: itemDis.touchpadNumber,
					batteryCellNumber: itemDis.batteryCellNumber,
					displaySNumber: itemDis.displaySNumber,
					otherCategory: itemDis.otherCategory,
					status: false,
				};
				await updateItemDis(values);
				Swal.fire('Deleted!', 'The Item Dis has been deleted.', 'success');
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete employee.', 'error');
		}
	};

	const handleExport = async (format: string) => {
		const table = document.querySelector('table');
		if (!table) return;
		modifyTableForExport(table as HTMLElement, true);
		const clonedTable = table.cloneNode(true) as HTMLElement;
		const rows = clonedTable.querySelectorAll('tr');
		rows.forEach((row) => {
			const lastCell = row.querySelector('td:last-child, th:last-child');
			if (lastCell) {
				lastCell.remove();
			}
		});
		const clonedTableStyles = getComputedStyle(table);
		clonedTable.setAttribute('style', clonedTableStyles.cssText);
		try {
			switch (format) {
				case 'svg':
					await downloadTableAsSVG();
					break;
				case 'png':
					await downloadTableAsPNG();
					break;
				case 'csv':
					downloadTableAsCSV(clonedTable);
					break;
				case 'pdf':
					await downloadTableAsPDF(clonedTable);
					break;
				default:
					console.warn('Unsupported export format: ', format);
			}
		} catch (error) {
			console.error('Error exporting table: ', error);
		} finally {
			modifyTableForExport(table as HTMLElement, false);
		}
	};
	const modifyTableForExport = (table: HTMLElement, hide: boolean) => {
		const rows = table.querySelectorAll('tr');
		rows.forEach((row) => {
			const lastCell = row.querySelector('td:last-child, th:last-child');
			if (lastCell instanceof HTMLElement) {
				if (hide) {
					lastCell.style.display = 'none';
				} else {
					lastCell.style.display = '';
				}
			}
		});
	};
	const downloadTableAsCSV = (table: any) => {
		let csvContent = '';
		const rows = table.querySelectorAll('tr');
		rows.forEach((row: any) => {
			const cols = row.querySelectorAll('td, th');
			const rowData = Array.from(cols)
				.map((col: any) => `"${col.innerText}"`)
				.join(',');
			csvContent += rowData + '\n';
		});
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'Item Management Report.csv';
		link.click();
	};
	const downloadTableAsPDF = async (table: HTMLElement) => {
		try {
			const pdf = new jsPDF('p', 'pt', 'a4');
			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			const rows: any[] = [];
			const headers: any[] = [];
			pdf.setLineWidth(1);
			pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
			const logoData = await loadImage(bill);
			const logoWidth = 100;
			const logoHeight = 40;
			const logoX = 20;
			const logoY = 20;
			pdf.addImage(logoData, 'PNG', logoX, logoY, logoWidth, logoHeight);
			pdf.setFontSize(8);
			pdf.setFont('helvetica', 'bold');
			pdf.text('Suranga Cell-Care(pvt).Ltd.', 20, logoY + logoHeight + 10);
			const title = 'Item Management Report';
			pdf.setFontSize(16);
			pdf.setFont('helvetica', 'bold');
			const titleWidth = pdf.getTextWidth(title);
			const titleX = pageWidth - titleWidth - 20;
			pdf.text(title, titleX, 30);
			const currentDate = new Date().toLocaleDateString();
			const dateX = pageWidth - pdf.getTextWidth(currentDate) - 20;
			pdf.setFontSize(12);
			pdf.text(currentDate, dateX, 50);
			const thead = table.querySelector('thead');
			if (thead) {
				const headerCells = thead.querySelectorAll('th');
				headers.push(Array.from(headerCells).map((cell: any) => cell.innerText));
			}
			const tbody = table.querySelector('tbody');
			if (tbody) {
				const bodyRows = tbody.querySelectorAll('tr');
				bodyRows.forEach((row: any) => {
					const cols = row.querySelectorAll('td');
					const rowData = Array.from(cols).map((col: any) => col.innerText);
					rows.push(rowData);
				});
			}
			const tableWidth = pageWidth * 0.85;
			const tableX = (pageWidth - tableWidth) / 2;
			autoTable(pdf, {
				head: headers,
				body: rows,
				startY: 100,
				margin: { left: 25, right: 20 },
				styles: {
					fontSize: 9.5,
					overflow: 'linebreak',
					cellPadding: 6,
				},
				headStyles: {
					fillColor: [80, 101, 166],
					textColor: [255, 255, 255],
					fontSize: 10.5,
				},
				columnStyles: {
					0: { cellWidth: 'auto' },
					1: { cellWidth: 'auto' },
					2: { cellWidth: 'auto' },
					3: { cellWidth: 'auto' },
				},
				tableWidth: 'wrap',
				theme: 'grid',
			});
			pdf.save('Item Management Report.pdf');
		} catch (error) {
			console.error('Error generating PDF: ', error);
			alert('Error generating PDF. Please try again.');
		}
	};
	const loadImage = (url: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.src = url;
			img.crossOrigin = 'Anonymous';
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(img, 0, 0);
					const dataUrl = canvas.toDataURL('image/png');
					resolve(dataUrl);
				} else {
					reject('Failed to load the logo image.');
				}
			};
			img.onerror = () => {
				reject('Error loading logo image.');
			};
		});
	};
	const hideLastCells = (table: HTMLElement) => {
		const rows = table.querySelectorAll('tr');
		rows.forEach((row) => {
			const lastCell = row.querySelector('td:last-child, th:last-child');
			if (lastCell instanceof HTMLElement) {
				lastCell.style.visibility = 'hidden';
				lastCell.style.border = 'none';
				lastCell.style.padding = '0';
				lastCell.style.margin = '0';
			}
		});
	};
	const restoreLastCells = (table: HTMLElement) => {
		const rows = table.querySelectorAll('tr');
		rows.forEach((row) => {
			const lastCell = row.querySelector('td:last-child, th:last-child');
			if (lastCell instanceof HTMLElement) {
				lastCell.style.visibility = 'visible';
				lastCell.style.border = '';
				lastCell.style.padding = '';
				lastCell.style.margin = '';
			}
		});
	};
	const downloadTableAsPNG = async () => {
		try {
			const table = document.querySelector('table');
			if (!table) {
				console.error('Table element not found');
				return;
			}
			const originalBorderStyle = table.style.border;
			table.style.border = '1px solid black';
			const dataUrl = await toPng(table, {
				cacheBust: true,
				style: {
					width: table.offsetWidth + 'px',
				},
			});
			table.style.border = originalBorderStyle;
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = 'Item Management Report.png';
			link.click();
		} catch (error) {
			console.error('Error generating PNG: ', error);
		}
	};
	const downloadTableAsSVG = async () => {
		try {
			const table = document.querySelector('table');
			if (!table) {
				console.error('Table element not found');
				return;
			}
			hideLastCells(table);
			const dataUrl = await toSvg(table, {
				backgroundColor: 'white',
				cacheBust: true,
				style: {
					width: table.offsetWidth + 'px',
					color: 'black',
				},
			});
			restoreLastCells(table);
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = 'Item Management Report.svg';
			link.click();
		} catch (error) {
			console.error('Error generating SVG: ', error);
			const table = document.querySelector('table');
			if (table) restoreLastCells(table);
		}
	};

	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					<label
						className='border-0 bg-transparent cursor-pointer me-0'
						htmlFor='searchInput'>
						<Icon icon='Search' size='2x' color='primary' />
					</label>
					<Input
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Search...'
						onChange={(event: any) => {
							setSearchTerm(event.target.value);
						}}
						value={searchTerm}
						ref={inputRef}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						icon='AddCircleOutline'
						color='success'
						isLight
						onClick={() => setAddModalStatus(true)}>
						New Item
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						{editModalStatus ? (
							<StockOutModal
								setIsOpen={setEditstockModalStatus}
								isOpen={editstockModalStatus}
								id={id}
								quantity={quantity}
							/>
						) : (
							<Card stretch>
								<CardTitle className='d-flex justify-content-between align-items-center m-4'>
									<div className='flex-grow-1 text-center text-primary'>
										Manage Stock
									</div>
									<Dropdown>
										<DropdownToggle hasIcon={false}>
											<Button icon='UploadFile' color='warning'>
												Export
											</Button>
										</DropdownToggle>
										<DropdownMenu isAlignmentEnd>
											<DropdownItem onClick={() => handleExport('svg')}>
												Download SVG
											</DropdownItem>
											<DropdownItem onClick={() => handleExport('png')}>
												Download PNG
											</DropdownItem>
											<DropdownItem onClick={() => handleExport('csv')}>
												Download CSV
											</DropdownItem>
											<DropdownItem onClick={() => handleExport('pdf')}>
												Download PDF
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</CardTitle>
								<CardBody isScrollable className='table-responsive'>
									<table className='table  table-bordered border-primary table-hover text-center'>
										<thead className={'table-dark border-primary'}>
											<tr>
												<th>Model</th>
												<th>Brand</th>
												<th>Reorder Level</th>
												<th>Quantity</th>
												<th>Box Number</th>
												<th>Category</th>
												<th></th>
												<th></th>
												<th></th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											{isLoading && (
												<tr>
													<td>Loading...</td>
												</tr>
											)}
											{error && (
												<tr>
													<td>Error fetching dealers.</td>
												</tr>
											)}
											{itemDiss &&
												dataPagination(itemDiss, currentPage, perPage)
													.filter((brand: any) => {
														if (
															brand.code.includes(
																searchTerm.slice(0, 4),
															)
														) {
															return brand;
														}
													})
													.map((itemDiss: any, index: any) => (
														<tr key={index}>
															<td>{itemDiss.model}</td>
															<td>{itemDiss.brand}</td>
															<td>{itemDiss.reorderLevel}</td>
															<td>{itemDiss.quantity}</td>
															<td>{itemDiss.boxNumber}</td>
															<td>{itemDiss.category}</td>
															<td>
																<Button
																	icon='CallReceived'
																	tag='a'
																	color='success'
																	onClick={() => {
																		setAddstockModalStatus(
																			true,
																		);
																		setId(itemDiss.id);
																		setQuantity(
																			itemDiss.quantity,
																		); 
																	}}></Button>
															</td>
															<td>
																<Button
																	icon='CallMissedOutgoing'
																	tag='a'
																	color='warning'
																	onClick={() => (
																		refetch(),
																		setEditstockModalStatus(
																			true,
																		),
																		setId(itemDiss.id),
																		setQuantity(
																			itemDiss.quantity,
																		)
																	)}></Button>
															</td>
															<td>
																<Button
																	icon='Edit'
																	tag='a'
																	color='info'
																	onClick={() => (
																		setEditModalStatus(true),
																		setId(itemDiss.id)
																	)}></Button>
															</td>
															<td>
																<Button
																	className='m-2'
																	icon='Delete'
																	color='danger'
																	onClick={() =>
																		handleClickDelete(itemDiss)
																	}></Button>
															</td>
														</tr>
													))}
										</tbody>
									</table>
									<Button
										icon='Delete'
										className='mb-5'
										onClick={() => setDeleteModalStatus(true)}>
										Recycle Bin
									</Button>
								</CardBody>
								<PaginationButtons
									data={itemDiss}
									label='parts'
									setCurrentPage={setCurrentPage}
									currentPage={currentPage}
									perPage={perPage}
									setPerPage={setPerPage}
								/>
							</Card>
						)}
					</div>
				</div>
			</Page>
			<ItemAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id='' />
			<ItemEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
			<StockAddModal
				setIsOpen={setAddstockModalStatus}
				isOpen={addstockModalStatus}
				id={id}
				quantity={quantity}
			/>
			<StockOutModal
				setIsOpen={setEditstockModalStatus}
				isOpen={editstockModalStatus}
				id={id}
				quantity={quantity}
			/>
			<ItemDeleteModal setIsOpen={setDeleteModalStatus} isOpen={deleteModalStatus} id='' />
		</PageWrapper>
	);
};

export default Index;
