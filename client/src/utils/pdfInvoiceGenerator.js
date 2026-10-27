import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Convert number to Indian currency words
function numberToWordsINR(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Zero Rupees Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n < 20) return single[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
  }

  function convertThreeDigits(n) {
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += single[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      str += convertTwoDigits(n);
    }
    return str.trim();
  }

  let words = '';
  let crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;

  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  if (crore > 0) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' Thousand ';
  if (remainder > 0) words += convertThreeDigits(remainder);

  return 'Rupees ' + words.trim() + ' Only';
}

/**
 * Generate a professional, high-fidelity PDF invoice for Yashi General Store
 */
export function generateInvoicePdf({ order, items = [], shopSettings = {}, appliedCoupon = null }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  // Store Details (Store Gmail defaults to debusahu121@gmail.com, configurable via shopSettings.email)
  const storeName = (shopSettings.storeName || 'Yashi General Store').toUpperCase();
  const storePhone = shopSettings.phone || '+91 98765 43210';
  const storeEmail = shopSettings.email || 'debusahu121@gmail.com';
  const storeAddress = shopSettings.address || '510 Elliot Lane, Near Water Tank, Mirpur Cantonment, Kanpur - 208004';

  const orderItems = (items && items.length > 0) ? items : (order?.items || []);
  const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const discount = order?.discount || (appliedCoupon?.value ? Number(appliedCoupon.value) : 0);
  const totalAmount = Math.max(0, subtotal - discount);

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Top Accent Banner (Emerald Green)
  doc.setFillColor(22, 163, 74); // #16a34a
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Header Left: Store Brand & Info
  doc.setTextColor(22, 163, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(storeName, margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Fresh Milk, Amul & Namaste India Dairy, Farm Veggies & Daily Groceries', margin, 23.5);
  doc.text(storeAddress, margin, 28);
  doc.text(`Phone / WhatsApp: ${storePhone}   |   Store Gmail: ${storeEmail}`, margin, 32.5);

  // Header Right: Invoice Type & Number
  doc.setFillColor(240, 253, 244); // light green bg badge
  doc.roundedRect(pageWidth - margin - 60, 11, 60, 23, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208); // green border
  doc.roundedRect(pageWidth - margin - 60, 11, 60, 23, 2, 2, 'S');

  doc.setTextColor(22, 163, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TAX INVOICE / CASH BILL', pageWidth - margin - 30, 17, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`INVOICE: #${order?.id || 'ORD-NEW'}`, pageWidth - margin - 30, 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${formattedDate}  ${formattedTime}`, pageWidth - margin - 30, 29, { align: 'center' });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, 38, pageWidth - margin, 38);

  // Customer Details Block ("Billed & Delivered To")
  const startY = 43;
  const colWidth = (contentWidth - 6) / 2;

  // Left Box: Customer Info
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, startY, colWidth, 34, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, startY, colWidth, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 163, 74);
  doc.text('BILLED & DELIVERED TO:', margin + 4, startY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(String(order?.customerName || 'Valued Customer').substring(0, 36), margin + 4, startY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Mobile: +91 ${order?.customerPhone || 'N/A'}`, margin + 4, startY + 17);
  doc.text(`Email: ${order?.customerEmail || 'Verified Google Account'}`, margin + 4, startY + 22);

  const addressLines = doc.splitTextToSize(`Address: ${order?.address || 'Mirpur Cantonment, Kanpur'}`, colWidth - 8);
  doc.text(addressLines.slice(0, 2), margin + 4, startY + 27);

  // Right Box: Order & Delivery Details
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + colWidth + 6, startY, colWidth, 34, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + colWidth + 6, startY, colWidth, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 163, 74);
  doc.text('DELIVERY & PAYMENT SPECIFICATIONS:', margin + colWidth + 10, startY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Delivery Method: Doorstep Delivery (<= 5 km)', margin + colWidth + 10, startY + 12);
  doc.text(`GPS Distance: ${order?.distanceKm ? order.distanceKm + ' km (Verified Zone)' : '0.8 km (Neighborhood Zone)'}`, margin + colWidth + 10, startY + 17);
  doc.text('Delivery Slot: Lightning Express (15-30 mins)', margin + colWidth + 10, startY + 22);
  doc.text('Payment Mode: Cash on Delivery / UPI at Doorstep', margin + colWidth + 10, startY + 27);
  doc.text(`Order Status: Confirmed & Dispatched`, margin + colWidth + 10, startY + 32);

  // Itemized Table
  const tableData = orderItems.map((item, index) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const total = qty * price;
    return [
      String(index + 1),
      item.name || 'Store Item',
      item.unit || '1 unit',
      String(qty),
      `Rs. ${price.toFixed(2)}`,
      `Rs. ${total.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: startY + 39,
    head: [['#', 'Item Description', 'Unit / Pack', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 80, halign: 'left' },
      2: { cellWidth: 32, halign: 'left' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' }
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  const finalY = doc.lastAutoTable.finalY + 4;

  // Amount in Words (Left)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, finalY, 100, 26, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, finalY, 100, 26, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('AMOUNT IN WORDS:', margin + 4, finalY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const wordsLines = doc.splitTextToSize(numberToWordsINR(totalAmount), 92);
  doc.text(wordsLines, margin + 4, finalY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Guaranteed 100% genuine & fresh products.', margin + 4, finalY + 22);

  // Totals Calculation Box (Right)
  const totalsX = margin + 104;
  const totalsWidth = contentWidth - 104;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(totalsX, finalY, totalsWidth, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsX, finalY, totalsWidth, 26, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal:', totalsX + 4, finalY + 6);
  doc.text(`Rs. ${subtotal.toFixed(2)}`, pageWidth - margin - 4, finalY + 6, { align: 'right' });

  if (discount > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text('Coupon Discount:', totalsX + 4, finalY + 11);
    doc.text(`- Rs. ${discount.toFixed(2)}`, pageWidth - margin - 4, finalY + 11, { align: 'right' });
  } else {
    doc.text('Neighborhood Delivery (<= 5km):', totalsX + 4, finalY + 11);
    doc.setTextColor(22, 163, 74);
    doc.text('FREE', pageWidth - margin - 4, finalY + 11, { align: 'right' });
  }

  // Grand Total Highlight Bar
  doc.setFillColor(22, 163, 74);
  doc.roundedRect(totalsX, finalY + 16, totalsWidth, 10, 1.5, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('GRAND TOTAL PAYABLE:', totalsX + 4, finalY + 22.5);
  doc.text(`Rs. ${totalAmount.toFixed(2)}`, pageWidth - margin - 4, finalY + 22.5, { align: 'right' });

  // Signature & Verification Block
  const footerY = Math.min(finalY + 34, pageHeight - 34);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('• Returns & Replacements: Report any discrepancy at doorstep to our delivery agent.', margin, footerY + 5);
  doc.text(`• For assistance, call or WhatsApp ${storePhone} or email ${storeEmail}.`, margin, footerY + 9);
  doc.text('• Thank you for choosing Yashi General Store, Mirpur Cantonment, Kanpur!', margin, footerY + 13);

  // Digital Signatory Stamp
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('For YASHI GENERAL STORE', pageWidth - margin - 4, footerY + 6, { align: 'right' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 163, 74);
  doc.text('[Digitally Verified Bill]', pageWidth - margin - 4, footerY + 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Authorized Signatory', pageWidth - margin - 4, footerY + 15, { align: 'right' });

  return doc;
}

/**
 * Triggers instant direct download of the PDF invoice file
 */
export function downloadInvoicePdf({ order, items = [], shopSettings = {}, appliedCoupon = null }) {
  try {
    const doc = generateInvoicePdf({ order, items, shopSettings, appliedCoupon });
    const filename = `Yashi_General_Store_Bill_${order?.id || 'ORD'}.pdf`;
    doc.save(filename);
    return { success: true, filename };
  } catch (err) {
    console.error('Failed to generate or download PDF invoice:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Returns PDF as a binary Blob or Data URL for email or WhatsApp sharing
 */
export function getInvoicePdfBlob({ order, items = [], shopSettings = {}, appliedCoupon = null }) {
  try {
    const doc = generateInvoicePdf({ order, items, shopSettings, appliedCoupon });
    return doc.output('blob');
  } catch (err) {
    console.error('Failed to get PDF blob:', err);
    return null;
  }
}
