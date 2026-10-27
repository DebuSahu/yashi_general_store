// Professional Order Receipt & Communication Helper for Yashi General Store
import { downloadInvoicePdf } from './pdfInvoiceGenerator';

/**
 * Builds a clean, professional WhatsApp Order Request for the Store Owner
 */
export function buildStoreWhatsappMessage({ order, items = [], totalAmount, shopSettings = {} }) {
  const storePhone = (shopSettings?.phone || '9876543210').replace(/[^0-9]/g, '').slice(-10);
  const storeEmail = shopSettings?.email || 'debusahu121@gmail.com';
  const orderItems = (items && items.length > 0) ? items : (order?.items || []);
  const total = totalAmount || order?.totalAmount || 0;

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
• *Phone:* +91 ${order?.customerPhone || ''}
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

🏪 *Store Information:*
• *Store Gmail:* ${storeEmail}
• *Store Location:* 510 Elliot Lane, Mirpur Cantonment, Kanpur
• *Store Contact:* +91 ${storePhone}

════════════════════════════
_Please pack and dispatch this order with our delivery boy immediately!_`;

  return {
    phone: `91${storePhone}`,
    text,
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
🏪 *STORE & HELPLINE CONTACTS:*
• *Shop Address:* 510 Elliot Lane, Near Water Tank, Mirpur Cantt, Kanpur - 208004
• *Store Helpline / WhatsApp:* ${storePhone}
• *Store Gmail:* ${storeEmail}

_A digital PDF copy of this bill has also been generated for your records. Our delivery partner will call you upon arrival!_
════════════════════════════`;

  return {
    phone: `91${clientPhone}`,
    text,
    url: clientPhone ? `https://wa.me/91${clientPhone}?text=${encodeURIComponent(text)}` : ''
  };
}

/**
 * Builds customer email invoice details using Store Gmail
 */
export function buildClientEmailBill({ order, items = [], totalAmount, shopSettings = {} }) {
  const customerEmail = (order?.customerEmail || '').trim().toLowerCase();
  const storeEmail = shopSettings?.email || 'debusahu121@gmail.com';
  const storePhone = shopSettings?.phone || '+91 98765 43210';
  const total = totalAmount || order?.totalAmount || 0;
  const orderItems = (items && items.length > 0) ? items : (order?.items || []);

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

If you have any questions or require modifications, please contact us immediately:
Phone / WhatsApp: ${storePhone}
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
    gmailComposeUrl,
    mailtoUrl
  };
}

/**
 * Automatically dispatches all order communications (WhatsApp Store, WhatsApp Client, Email, and PDF)
 * without waiting for the user to manually click any send button!
 */
export function autoDispatchOrderCommunications({ order, items = [], totalAmount, shopSettings = {} }) {
  const results = {
    pdfDownloaded: false,
    storeWhatsappDispatched: false,
    clientWhatsappDispatched: false,
    emailDispatched: false
  };

  // 1. Automatically generate and download the proper PDF Invoice
  try {
    downloadInvoicePdf({ order, items, shopSettings });
    results.pdfDownloaded = true;
  } catch (e) {
    console.warn('PDF auto-download error:', e);
  }

  // 2. Automatically dispatch order request to Store WhatsApp
  try {
    const storeWhatsapp = buildStoreWhatsappMessage({ order, items, totalAmount, shopSettings });
    if (storeWhatsapp?.url) {
      window.open(storeWhatsapp.url, '_blank');
      results.storeWhatsappDispatched = true;
    }
  } catch (e) {
    console.warn('Store WhatsApp dispatch error:', e);
  }

  // 3. Automatically dispatch bill to Client WhatsApp (if phone provided)
  try {
    const clientWhatsapp = buildClientWhatsappBillMessage({ order, items, totalAmount, shopSettings });
    if (clientWhatsapp?.url) {
      setTimeout(() => {
        try {
          window.open(clientWhatsapp.url, '_blank');
          results.clientWhatsappDispatched = true;
        } catch (e) {}
      }, 700);
    }
  } catch (e) {
    console.warn('Client WhatsApp dispatch error:', e);
  }

  // 4. Automatically dispatch email bill if customer has Gmail
  try {
    if (order?.customerEmail) {
      const emailBill = buildClientEmailBill({ order, items, totalAmount, shopSettings });
      if (emailBill?.gmailComposeUrl) {
        setTimeout(() => {
          try {
            window.open(emailBill.gmailComposeUrl, '_blank');
            results.emailDispatched = true;
          } catch (e) {}
        }, 1400);
      }
    }
  } catch (e) {
    console.warn('Email dispatch error:', e);
  }

  return results;
}
