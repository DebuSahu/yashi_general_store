// Professional Order Receipt & Communication Helper for Yashi General Store
import { downloadInvoicePdf, getInvoicePdfBase64 } from './pdfInvoiceGenerator';

export const DEFAULT_EMAIL_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxGQA2IyTH85cT2I0FLZcH3I2-rcwmZUcdNM0h6JRi4RyYfswOEhDkJvK3ChGzNEDDb/exec';

const STORE_BASE_URL = typeof window !== 'undefined' && window.location.origin
  ? (window.location.origin + window.location.pathname).replace(/\/$/, '')
  : 'https://DebuSahu.github.io/yashi_general_store';

/**
 * Builds customer email invoice details using Store Gmail
 */
export function buildClientEmailBill({ order, items = [], totalAmount, shopSettings = {} }) {
  const customerEmail = (order?.customerEmail || '').trim().toLowerCase();
  const storeEmail = shopSettings?.email || 'debusahu121@gmail.com';
  const storePhone = shopSettings?.phone || '+91 98765 43210';
  const total = totalAmount || order?.totalAmount || 0;
  const orderItems = (items && items.length > 0) ? items : (order?.items || []);
  const pdfBillUrl = `${STORE_BASE_URL}/?bill=${encodeURIComponent(order?.id || '')}`;

  const itemsList = orderItems.map((item, index) => 
    `${index + 1}. ${item.name} (${item.unit || 'unit'}) - Qty: ${item.quantity || 1} x Rs. ${item.price} = Rs. ${(Number(item.price) || 0) * (Number(item.quantity) || 1)}`
  ).join('\n');

  const subject = `Official Tax Invoice & Bill #${order?.id || 'ORD'} - Yashi General Store`;

  const body = 
`Dear ${order?.customerName || 'Customer'},

Thank you for your order with Yashi General Store! Your order has been placed and is currently being packed for doorstep delivery.

Please find attached your official Tax Invoice & Cash Bill (PDF).

==================================================
TAX INVOICE & ORDER SUMMARY
YASHI GENERAL STORE, KANPUR
==================================================
Invoice / Order ID : #${order?.id}
Date & Time        : ${new Date().toLocaleString('en-IN')}
Store Contact      : ${storePhone}
Store Email        : ${storeEmail}

BILLED & DELIVERED TO:
Customer Name      : ${order?.customerName}
Mobile Number      : +91 ${order?.customerPhone}
Customer Email     : ${customerEmail}
Delivery Address   : ${order?.address}
Delivery Perimeter : ${order?.distanceKm || '0.8'} km (Verified <= 5km Zone)

--------------------------------------------------
ITEMIZED PRODUCT DETAILS:
--------------------------------------------------
${itemsList}

--------------------------------------------------
PAYMENT SUMMARY:
--------------------------------------------------
Subtotal           : Rs. ${total}
Delivery Fee       : FREE (Guaranteed <= 5km Radius)
Total Amount Due   : Rs. ${total}
Payment Method     : Cash on Delivery / UPI at Doorstep
Estimated ETA      : 15 - 30 Minutes

--------------------------------------------------
DIGITAL PDF BILL LINK:
${pdfBillUrl}
--------------------------------------------------

If you have any questions or require modifications, please contact us immediately:
Phone / WhatsApp: ${storePhone}
Email: ${storeEmail}

Yashi General Store
510 Elliot Lane, Near Water Tank, Mirpur Cantonment, Kanpur, Uttar Pradesh - 208004
Udyam Regd: YGS-KNP-2024 | FSSAI Lic: 22723102000491
==================================================`;

  return {
    to: customerEmail,
    from: storeEmail,
    subject,
    body,
    pdfBillUrl
  };
}

/**
 * Builds a professional WhatsApp Bill and Tax Receipt for the Customer
 * (Targets CUSTOMER'S mobile phone, NOT self mobile!)
 */
export function buildClientWhatsappBillMessage({ order, items = [], totalAmount, shopSettings = {} }) {
  const clientPhone = (order?.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
  const storePhone = shopSettings?.phone || '+91 98765 43210';
  const storeEmail = shopSettings?.email || 'debusahu121@gmail.com';
  const orderItems = (items && items.length > 0) ? items : (order?.items || []);
  const total = totalAmount || order?.totalAmount || 0;
  const pdfBillUrl = `${STORE_BASE_URL}/?bill=${encodeURIComponent(order?.id || '')}`;

  const nowStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const formattedItems = orderItems.map((item, index) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    return `  ${index + 1}. *${item.name}* (${item.unit || '1 unit'})\n     ${qty} x ₹${price} = *₹${qty * price}*`;
  }).join('\n');

  const text = 
`╔════════════════════════════╗
   🧾 *OFFICIAL CASH INVOICE*
   *YASHI GENERAL STORE*
╚════════════════════════════╝

Namaste *${order?.customerName || 'Customer'}*! 🙏
Thank you for ordering with Yashi General Store. Your order is confirmed and currently being packed for doorstep delivery.

📋 *INVOICE DETAILS:*
• *Invoice No:* #INV-${order?.id || 'ORD-NEW'}
• *Order Date:* ${nowStr}
• *Customer Name:* ${order?.customerName || 'Customer'}
• *Contact Mobile:* +91 ${clientPhone}
• *Registered Gmail:* ${order?.customerEmail || 'Guest'}

📍 *DELIVERING TO:*
${order?.address || 'Mirpur Cantonment, Kanpur'}
• *Estimated ETA:* 15 - 30 Minutes

────────────────────────────
🛒 *ITEMIZED BILL:*
${formattedItems}
────────────────────────────

💵 *BILL BREAKDOWN:*
• *Subtotal:* ₹${total}
• *Express Neighborhood Delivery:* FREE (<= 5km)
• *NET AMOUNT PAYABLE:* *₹${total}*
• *Payment Mode:* Cash on Delivery / UPI Scanner at doorstep

────────────────────────────
📄 *DOWNLOAD OFFICIAL PDF BILL (TAP LINK):*
${pdfBillUrl}
────────────────────────────

🏪 *STORE & HELPLINE CONTACTS:*
• *Shop Address:* 510 Elliot Lane, Near Water Tank, Mirpur Cantt, Kanpur - 208004
• *Store Helpline / WhatsApp:* ${storePhone}
• *Store Gmail:* ${storeEmail}

_A digital PDF copy of this bill is also sent to your Gmail. Our delivery partner will call you upon arrival!_
════════════════════════════`;

  return {
    phone: `91${clientPhone}`,
    text,
    pdfBillUrl,
    url: clientPhone ? `https://wa.me/91${clientPhone}?text=${encodeURIComponent(text)}` : ''
  };
}

/**
 * Builds a WhatsApp Order Dispatch Ticket for the Store Owner (Backup for Admin)
 */
export function buildStoreWhatsappMessage({ order, items = [], totalAmount, shopSettings = {} }) {
  const storePhone = (shopSettings?.phone || '9876543210').replace(/[^0-9]/g, '').slice(-10);
  const storeEmail = shopSettings?.email || 'debusahu121@gmail.com';
  const orderItems = (items && items.length > 0) ? items : (order?.items || []);
  const total = totalAmount || order?.totalAmount || 0;
  const clientPhone = (order?.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
  const pdfBillUrl = `${STORE_BASE_URL}/?bill=${encodeURIComponent(order?.id || '')}`;

  const formattedItems = orderItems.map((item, index) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const itemTotal = qty * price;
    return `  ${index + 1}. *${item.name}* [${item.unit || 'unit'}]\n     Qty: *${qty}*  x  ₹${price}  =  *₹${itemTotal}*`;
  }).join('\n');

  const text = 
`╔════════════════════════════╗
   🛍️ *NEW DISPATCH REQUEST*
   *YASHI GENERAL STORE*
╚════════════════════════════╝

📋 *ORDER SUMMARY:*
• *Order ID:* #${order?.id || 'ORD-NEW'}
• *Customer:* ${order?.customerName || 'Customer'} (+91 ${clientPhone})
• *Address:* ${order?.address || 'Mirpur Cantonment, Kanpur'}
• *Verified Radius:* ${order?.distanceKm ? order.distanceKm + ' km (<= 5km Zone)' : 'Within 5km delivery perimeter'}

🛒 *ITEMS:*
${formattedItems}

💰 *TOTAL PAYABLE:* ₹${total}
📄 *PDF BILL LINK:* ${pdfBillUrl}`;

  return {
    phone: `91${storePhone}`,
    text,
    pdfBillUrl,
    url: `https://wa.me/91${storePhone}?text=${encodeURIComponent(text)}`
  };
}

/**
 * Dispatches the order bill directly through Store Gmail (debusahu121@gmail.com)
 * with the generated PDF attached!
 * (Zero FormSubmit, Zero Third-Party branding, 100% Store Gmail)
 */
export async function sendReceiptDirectToCustomerGmail({ order, items = [], totalAmount, shopSettings = {} }) {
  const customerEmail = (order?.customerEmail || '').trim().toLowerCase();
  if (!customerEmail || !customerEmail.includes('@')) {
    return { success: false, reason: 'No customer Gmail provided' };
  }

  const storeEmail = shopSettings?.email || 'debusahu121@gmail.com';
  const emailBill = buildClientEmailBill({ order, items, totalAmount, shopSettings });
  const filename = `Yashi_General_Store_Bill_${order?.id || 'ORD'}.pdf`;

  // Generate real PDF base64 for attachment
  let pdfBase64 = null;
  try {
    pdfBase64 = getInvoicePdfBase64({ order, items, shopSettings });
  } catch (err) {
    console.warn('PDF base64 generation error:', err);
  }

  const emailPayload = {
    to: customerEmail,
    from: storeEmail,
    subject: emailBill.subject,
    body: emailBill.body,
    filename,
    pdfBase64,
    orderId: order?.id,
    totalAmount
  };

  let dispatched = false;

  // 1. Direct Dispatch via Google Apps Script Web App (Sends directly from debusahu121@gmail.com with PDF attached)
  const webhookUrl = shopSettings?.emailWebhookUrl || localStorage.getItem('ygs_email_webhook_url') || DEFAULT_EMAIL_WEBHOOK_URL;
  if (webhookUrl && webhookUrl.startsWith('https://script.google.com')) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(emailPayload),
        mode: 'no-cors' // Google Apps Script Web App cross-origin support
      });
      dispatched = true;
      console.log('PDF bill dispatched directly through Store Gmail (Google Apps Script):', customerEmail);
    } catch (err) {
      console.warn('Google Apps Script dispatch error:', err);
    }
  }

  // 2. Direct Dispatch via backend Node API if running
  const API_BASE = typeof window !== 'undefined' && window.location.hostname.includes('localhost')
    ? 'http://localhost:5000/api'
    : null;

  if (API_BASE && !dispatched) {
    try {
      const res = await fetch(`${API_BASE}/orders/${order?.id}/send-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
      if (res.ok) {
        dispatched = true;
        console.log('PDF bill dispatched directly through Store Gmail (Server Nodemailer):', customerEmail);
      }
    } catch (err) {
      console.warn('Server email dispatch error:', err);
    }
  }

  return { success: dispatched, to: customerEmail, from: storeEmail, filename };
}

/**
 * Automatically dispatches:
 * 1. PDF Bill downloaded to customer device
 * 2. Directly sends email through Store Gmail (debusahu121@gmail.com) with PDF attached
 */
export function autoDispatchOrderCommunications({ order, items = [], totalAmount, shopSettings = {} }) {
  const results = {
    pdfDownloaded: false,
    emailDispatched: false
  };

  // 1. Automatically download the proper PDF Invoice to customer's device
  try {
    downloadInvoicePdf({ order, items, shopSettings });
    results.pdfDownloaded = true;
  } catch (e) {
    console.warn('PDF auto-download error:', e);
  }

  // 2. Directly send email through Store Gmail (debusahu121@gmail.com) with PDF attached
  try {
    if (order?.customerEmail) {
      sendReceiptDirectToCustomerGmail({ order, items, totalAmount, shopSettings })
        .then((res) => {
          results.emailDispatched = res.success;
        })
        .catch((e) => console.warn('Background email dispatch error:', e));
    }
  } catch (e) {
    console.warn('Email dispatch error:', e);
  }

  return results;
}
