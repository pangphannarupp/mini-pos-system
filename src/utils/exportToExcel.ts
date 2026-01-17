import * as XLSX from 'xlsx';
import type { Order } from '../types';

export const exportOrdersToExcel = (orders: Order[]) => {
    // Flatten data for Excel
    const data = orders.map(order => {
        const itemsSummary = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

        return {
            'Order ID': order.id,
            'Date': new Date(order.date).toLocaleString(),
            'Status': order.status,
            'Total': order.total,
            'Payment Method': order.paymentMethod,
            'Items': itemsSummary,
            'Customer ID': order.customerId || 'N/A',
            'Points Redeemed': order.pointsRedeemed || 0,
            'Discount': order.discountFromPoints || 0
        };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

    // Generate Excel file
    XLSX.writeFile(workbook, `Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};
