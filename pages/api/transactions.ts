import { ACTIVE_URLS } from '@/utils/constants';
import { get, includes, map, omit, pick } from 'lodash';

export default async function handler(req, res) {
  const apiURL: any = ACTIVE_URLS.ACTIVE_PM_URL;
  const companyKey = process.env.NEXT_PUBLIC_PM_COMPANY_KEY;
  const apiKey = process.env.NEXT_PUBLIC_PM_API_KEY;
  const { authorization } = req.headers;
  const body: any = req.body;

  if (!apiURL || !companyKey || !apiKey) {
    return res.status(401).json({ message: 'API keys missing' });
  }

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');

  const transactionType = get(req, 'body.transactionType', null);

  const url = new URL(
    transactionType === 'community' ? apiURL : `https://api.propertymonitor.com/pm/v1/unit-history`
  );

  for (const [key, value] of Object.entries(body)) {
    if (value && !includes(['transactionType'], key)) {
      url.searchParams.append(key, value);
    }
  }

  const headers: any = {
    'x-api-key': apiKey,
    'company-key': companyKey,
  };
  try {
    const externalRes = await fetch(url.href, {
      method: 'GET',
      headers,
    });
    const externalData = await externalRes.json();

    const meta = omit(externalData, ['data']);
    if (!externalRes.ok) {
      return res.status(externalRes.status).json({ message: externalData });
    }
    const data =
      transactionType === 'community'
        ? externalData?.data
        : unitTransactionData(externalData?.data, get(req, 'body.type', 'Sale'));
    return res.status(200).json({ data, meta: transactionType === 'community' ? meta : null });
  } catch (e) {
    return res.status(500).json(e);
  }
}

const unitTransactionData = (transaction: any, type = 'sale') => {
  const sales = get(transaction, 'sales_unit_history', []);
  const rent = get(transaction, 'rental_unit_history', []);
  let arr: any[] = [];
  for (const elem of sales) {
    arr.push({
      category: 'Sales',
      no_beds: get(transaction, 'no_beds', null),
      sub_loc_1: get(transaction, 'sub_loc_1', null),
      sub_loc_2: get(transaction, 'sub_loc_2', null),
      sub_loc_3: get(transaction, 'sub_loc_3', null),
      sub_loc_4: get(transaction, 'sub_loc_4', null),
      transaction_type: get(elem, 'evidence_type', null),
      evidence: get(elem, 'evidence', null),
      total_sales_price: get(elem, 'total_sales_price', null),
      sales_price_sqm_unit: get(elem, 'sales_price_sqm_unit', null),
      sales_price_sqft_unit: get(elem, 'sales_price_sqft_unit', null),
      evidence_date: get(elem, 'evidence_date', null),
    });
  }
  if (type === 'sale') {
    return arr;
  }
  arr = [];

  for (const elem of rent) {
    arr.push({
      category: 'Rent',
      no_beds: get(transaction, 'no_beds', null),
      sub_loc_1: get(transaction, 'sub_loc_1', null),
      sub_loc_2: get(transaction, 'sub_loc_2', null),
      sub_loc_3: get(transaction, 'sub_loc_3', null),
      sub_loc_4: get(transaction, 'sub_loc_4', null),
      rent_price_sqft_unit: get(elem, 'rent_price_sqft_unit', null),
      rent_price_sqm_unit: get(elem, 'rent_price_sqm_unit', null),
      total_rent: get(elem, 'total_rent', null),
      transaction_type: get(elem, 'evidence_type', null),
      evidence: get(elem, 'evidence', null),
      start_date: get(elem, 'start_date', null),
      end_date: get(elem, 'end_date', null),
      rent_sequence: get(elem, 'rent_sequence', null),
      unit_bua_sqft: get(transaction, 'unit_bua_sqft', null),
      plot_size_sqft: get(transaction, 'plot_size_sqft', null),
    });
  }

  return arr;
};
