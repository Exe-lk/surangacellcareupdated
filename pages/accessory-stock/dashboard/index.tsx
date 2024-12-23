import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import LineWithLabel1 from '../../../components/lineAcces';
import PieBasic from '../../../components/QRAnalatisk';
import LineWithLabe2 from '../../../components/SalesAnalatisk';
const Index: NextPage = () => {
	return (
		<PageWrapper>
			<Page>
				<div className='flex-grow-1 text-right text-info'>Welcome to Accessory Stock</div>
				<div className='row'>
					<LineWithLabel1 />
					<PieBasic />
					<LineWithLabe2 />
				</div>
			</Page>
		</PageWrapper>
	);
};
export default Index;
