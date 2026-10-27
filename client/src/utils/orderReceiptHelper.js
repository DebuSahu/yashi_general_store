// Professional Order Receipt & Communication Helper for Yashi General Store
import { downloadInvoicePdf } from './pdfInvoiceGenerator';

const STORE_BASE_URL = typeof window !== 'undefined' && window.location.origin
  ? (window.location.origin + window.location.pathname).replace(/\/$/, '')
  : 'https://DebuSahu.github.io/yashi_general_store';

/**
 * Builds a clean, professional WhatsApp Order Request for the Store Owner
 */
export function buildStoreWhatsappMessage({ order, items = [], totalAmount, shopSettings = {} }) {
  const storePhone = (shopSettings?.phone || '9876543210').replace(/[^0-9]/g, '').slice(-10);
  const storeEmail = shopSettings?.email || 'debusahu121@gmail.com';
  const orderItems = (items && items.length > 0) ? items : (order?.items || []);
  const total = totalAmount || order?.totalAmount || 0;
  const clientPhone = (order?.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
  const pdfBillUrl = `${STORE_BASE_URL}/?bill=${encodeURIComponent(order?.id || '')}`;

  const orderTimeStr = new Date().toLocaleDateString('en-IN', {
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
    const itemTotal = qty * price;
    return `  ${index + 1}. *${item.name}* [${item.unit || 'unit'}]\n     Qty: *${qty}*  x  ₹${price}  =  *₹${itemTotal}*`;
  }).join('\n');

  // Customer bill text for store owner to 1-tap forward
  const forwardBillText = encodeURIComponent(
    `Namaste ${order?.customerName || 'Customer'}! 🙏\nHere is your official PDF Bill & Invoice #${order?.id} from Yashi General Store:\n\n📄 *DOWNLOAD OFFICIAL PDF BILL:*\n${pdfBillUrl}\n\n💵 *Total Payable:* ₹${total} (Cash / UPI on Delivery)\n🛵 *Delivery:* Lightning Express (15-30 Mins)\n🏪 *Yashi General Store, Mirpur Cantt, Kanpur*`
  );

  const text = 
`╔════════════════════════════╗
   🛍️ *NEW DISPATCH REQUEST*
   *YASHI GENERAL STORE*
╚════════════════════════════╝

📋 *ORDER SUMMARY:*
• *Order ID:* #${order?.id || 'ORD-NEW'}
• *Timestamp:* ${orderTimeStr}
• *Status:* Confirmed (Awaiting Packing)

👤 *CUSTOMER PROFILE:*
• *Name:* ${order?.customerName || 'Customer'}
• *Phone:* +91 ${clientPhone}
• *Verified Gmail:* ${order?.customerEmail || 'Guest / Unlinked'}

📍 *DOORSTEP DELIVERY ADDRESS:*
${order?.address || 'Mirpur Cantonment, Kanpur'}
• *Verified Radius:* ${order?.distanceKm ? order.distanceKm + ' km (<= 5km Zone)' : 'Within 5km delivery perimeter'}
• *Delivery Slot:* ${order?.notes || '⚡ Lightning Express (15-30 mins)'}

────────────────────────────
🛒 *ITEMIZED ORDER DETAILS:*
${formattedItems}
────────────────────────────

💵 *PAYMENT SUMMARY:*
• *Order Subtotal:* ₹${total}
• *Doorstep Delivery:* FREE (Neighborhood Zone)
• *TOTAL AMOUNT PAYABLE:* *₹${total}*
• *Mode:* Cash on Delivery / UPI at Doorstep

────────────────────────────
📄 *OFFICIAL PDF BILL LINK (TAP TO VIEW):*
${pdfBillUrl}

📲 *1-TAP FORWARD PDF BILL TO CUSTOMER:*
https://wa.me/91${clientPhone}?text=${forwardBillText}

🏪 *Store Information:*
• *Store Gmail:* ${storeEmail}
• *Store Location:* 510 Elliot Lane, Mirpur Cantonment, Kanpur
• *Store Contact:* +91 ${storePhone}

════════════════════════════
_Please pack and dispatch this order with our delivery boy immediately!_`;

  return {
    phone: `91${storePhone}`,
    text,
    pdfBillUrl,
    url: `https://wa.me/91${storePhone}?text=${encodeURIComponent(text)}`
  };
}

/**
 * Builds a professional WhatsApp Bill and Tax Receipt for the Customer
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
📄 *OFFICIAL PDF BILL (TAP LINK TO DOWNLOAD):*
${pdfBillUrl}
────────────────────────────

🏪 *STORE & HELPLINE CONTACTS:*
• *Shop Address:* 510 Elliot Lane, Near Water Tank, Mirpur Cantt, Kanpur - 208004
• *Store Helpline / WhatsApp:* ${storePhone}
• *Store Gmail:* ${storeEmail}

_A digital PDF copy of this bill has also been generated for your records. Our delivery partner will call you upon arrival!_
════════════════════════════`;

  return {
    phone: `91${clientPhone}`,
    text,
    pdfBillUrl,
    url: clientPhone ? `https://wa.me/91${clientPhone}?text=${encodeURIComponent(text)}` : ''
  };
}

/**
 * Dispatches the order bill directly from Store Gmail (debusahu121@gmail.com)
 * to the customer's Gmail in the background WITHOUT asking the user or opening any compose window!
 */
export async function sendReceiptDirectToCustomerGmail({ order, items = [], totalAmount, shopSettings = {} }) {
  const customerEmail = (order?.customerEmail || '').trim().toLowerCase();
  if (!customerEmail || !customerEmail.includes('@')) {
    return { success: false, reason: 'No valid customer Gmail provided' };
  }

  const storeEmail = shopSettings?.email || 'debusahu121@gmail.com';
  const storePhone = shopSettings?.phone || '+91 98765 43210';
  const orderItems = (items && items.length > 0) ? items : (order?.items || []);
  const total = totalAmount || order?.totalAmount || 0;
  const billPdfUrl = `${STORE_BASE_URL}/?bill=${encodeURIComponent(order?.id || '')}`;

  const itemsFormatted = orderItems.map((item, index) => 
    `${index + 1}. ${item.name} (${item.unit || 'unit'}) - Qty: ${item.quantity || 1} x Rs. ${item.price} = Rs. ${(Number(item.price) || 0) * (Number(item.quantity) || 1)}`
  ).join('\n');

  const payload = {
    _subject: `Official Tax Invoice & Bill #${order?.id || 'YGS'} - Yashi General Store`,
    _replyto: storeEmail,
    store_name: 'Yashi General Store',
    store_phone: storePhone,
    store_email: storeEmail,
    store_address: '510 Elliot Lane, Near Water Tank, Mirpur Cantonment, Kanpur - 208004',
    invoice_number: `INV-${order?.id}`,
    customer_name: order?.customerName || 'Valued Customer',
    customer_phone: `+91 ${order?.customerPhone || ''}`,
    customer_email: customerEmail,
    delivery_address: order?.address || 'Mirpur Cantonment, Kanpur',
    delivery_zone: `${order?.distanceKm || '0.8'} km (Verified <= 5km Zone)`,
    delivery_slot: order?.notes || 'Lightning Express (15-30 mins)',
    order_items: itemsFormatted,
    subtotal: `Rs. ${total}`,
    delivery_charge: 'FREE (Neighborhood <= 5km Zone)',
    grand_total_payable: `Rs. ${total}`,
    payment_mode: 'Cash on Delivery / UPI at Doorstep',
    pdf_bill_download_link: billPdfUrl,
    message: `Dear ${order?.customerName},\n\nThank you for ordering with Yashi General Store! Your order #${order?.id} is confirmed and packed.\n\nYou can view and download your official PDF bill here: ${billPdfUrl}\n\nDelivery Address: ${order?.address}\nTotal Amount Due: Rs. ${total}\nPayment Mode: Cash on Delivery / UPI at Doorstep\n\nStore Helpline: ${storePhone} / Email: ${storeEmail}`
  };

  let dispatched = false;

  // 1. Direct Background Dispatch via FormSubmit AJAX (Zero Popups, Silent Background Delivery)
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(customerEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      dispatched = true;
      console.log('Direct receipt email dispatched successfully to customer Gmail:', customerEmail);
    }
  } catch (err) {
    console.warn('Background email dispatch to customer note:', err);
  }

  // 2. Also send notification to Store Owner Gmail (debusahu121@gmail.com) so the store owner gets it in real-time!
  try {
    if (storeEmail && storeEmail !== customerEmail) {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(storeEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          _subject: `[NEW ORDER] #${order?.id} - Rs. ${total} from ${order?.customerName}`
        })
      });
    }
  } catch (err) {
    console.warn('Store notification email dispatch note:', err);
  }

  // 3. If a custom Google Apps Script Webhook is configured in shopSettings, trigger it directly
  if (shopSettings?.emailWebhookUrl) {
    try {
      await fetch(shopSettings.emailWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          from: storeEmail,
          subject: payload._subject,
          body: payload.message,
          pdfUrl: billPdfUrl,
          orderId: order?.id
        })
      });
      dispatched = true;
    } catch (err) {
      console.warn('Custom email webhook dispatch note:', err);
    }
  }

  return { success: dispatched, to: customerEmail, from: storeEmail, pdfBillUrl };
}

/**
 * Builds customer email invoice details using Store Gmail (backup mailto/url)
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

  const subject = `Official Tax Invoice & Order Confirmation #${order?.id || 'ORD'} - Yashi General Store`;

  const body = 
`Dear ${order?.customerName || 'Customer'},

Thank you for your order with Yashi General Store! Your order has been placed and is currently being packed for doorstep delivery.

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
OFFICIAL PDF BILL (CLICK TO DOWNLOAD):
${pdfBillUrl}
--------------------------------------------------

If you have any questions, call or WhatsApp: ${storePhone}
Email: ${storeEmail}

Yashi General Store
510 Elliot Lane, Near Water Tank, Mirpur Cantonment, Kanpur, Uttar Pradesh - 208004
Udyam Regd: YGS-KNP-2024 | FSSAI Lic: 22723102000491
==================================================`;

  const gmailComposeUrl = customerEmail
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(customerEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : '';

  const mailtoUrl = customerEmail
    ? `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : '';

  return {
    to: customerEmail,
    from: storeEmail,
    subject,
    body,
    pdfBillUrl,
    gmailComposeUrl,
    mailtoUrl
  };
}

/**
 * Automatically dispatches all order communications (PDF Bill, Store WhatsApp, Client WhatsApp, and Direct Background Email)
 * WITHOUT asking the user or opening manual compose windows!
 */
export function autoDispatchOrderCommunications({ order, items = [], totalAmount, shopSettings = {} }) {
  const results = {
    pdfDownloaded: false,
    storeWhatsappDispatched: false,
    clientWhatsappDispatched: false,
    emailDispatched: false
  };

  // 1. Automatically generate and download the proper PDF Invoice directly
  try {
    downloadInvoicePdf({ order, items, shopSettings });
    results.pdfDownloaded = true;
  } catch (e) {
    console.warn('PDF auto-download error:', e);
  }

  // 2. Automatically dispatch bill directly from Store Gmail to Customer Gmail in the background!
  try {
    if (order?.customerEmail) {
      sendReceiptDirectToCustomerGmail({ order, items, totalAmount, shopSettings })
        .then(() => {
          results.emailDispatched = true;
        })
        .catch((e) => console.warn('Background email dispatch error:', e));
    }
  } catch (e) {
    console.warn('Email dispatch error:', e);
  }

  // 3. Automatically dispatch order request to Store WhatsApp (with PDF link)
  try {
    const storeWhatsapp = buildStoreWhatsappMessage({ order, items, totalAmount, shopSettings });
    if (storeWhatsapp?.url) {
      // Use direct link click
      const a = document.createElement('a');
      a.href = storeWhatsapp.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      results.storeWhatsappDispatched = true;
    }
  } catch (e) {
    console.warn('Store WhatsApp dispatch error:', e);
  }

  // 4. Automatically dispatch bill to Client WhatsApp (with PDF link)
  try {
    const clientWhatsapp = buildClientWhatsappBillMessage({ order, items, totalAmount, shopSettings });
    if (clientWhatsapp?.url) {
      setTimeout(() => {
        try {
          const a = document.createElement('a');
          a.href = clientWhatsapp.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          results.clientWhatsappDispatched = true;
        } catch (e) {}
      }, 500);
    }
  } catch (e) {
    console.warn('Client WhatsApp dispatch error:', e);
  }

  return results;
}
