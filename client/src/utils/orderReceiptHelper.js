// Helper to format WhatsApp messages and email invoices for Yashi General Store

export function buildStoreWhatsappMessage({ order, items = [], totalAmount, shopSettings }) {
  const storePhone = (shopSettings?.phone || '9876543210').replace(/[^0-9]/g, '').slice(-10);
  const orderItems = (items && items.length > 0) ? items : (order?.items || []);
  const itemsText = orderItems.map(i => `• ${i.quantity || 1}x ${i.name} - ₹${(Number(i.price) || 0) * (Number(i.quantity) || 1)}`).join('\n');
  const total = totalAmount || order?.totalAmount || 0;

  const text = `🛍️ *NEW ORDER RECEIVED - YASHI GENERAL STORE*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Order ID:* #${order?.id || 'ORD-NEW'}\n` +
    `👤 *Customer Name:* ${order?.customerName || 'Customer'}\n` +
    `📞 *Customer Phone:* +91 ${order?.customerPhone || ''}\n` +
    `📧 *Gmail Address:* ${order?.customerEmail || 'Guest / Unlinked'}\n` +
    `📍 *Delivery Address:* ${order?.address || 'Mirpur Cantt'}\n` +
    `📍 *Distance from Shop:* ${order?.distanceKm ? order.distanceKm + ' km (<= 5km)' : 'Within 5km delivery zone'}\n` +
    `⏰ *Notes / Slot:* ${order?.notes || 'Lightning Express Delivery'}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🛒 *ITEMS ORDERED:*\n${itemsText}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💵 *TOTAL PAYABLE:* ₹${total}\n` +
    `🛵 *Status:* Awaiting Packing & Dispatch`;

  return {
    phone: `91${storePhone}`,
    text,
    url: `https://wa.me/91${storePhone}?text=${encodeURIComponent(text)}`
  };
}

export function buildClientWhatsappBillMessage({ order, items = [], totalAmount, shopSettings }) {
  const clientPhone = (order?.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
  const orderItems = (items && items.length > 0) ? items : (order?.items || []);
  const itemsText = orderItems.map(i => `• ${i.quantity || 1}x ${i.name} - ₹${(Number(i.price) || 0) * (Number(i.quantity) || 1)}`).join('\n');
  const total = totalAmount || order?.totalAmount || 0;
  const storePhone = shopSettings?.phone || '+91 98765 43210';
  const nowStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const text = `🧾 *YASHI GENERAL STORE - ORDER BILL & RECEIPT*\n` +
    `Namaste ${order?.customerName || 'Customer'}! 🙏\n` +
    `Thank you for ordering with Yashi General Store. Your order is confirmed!\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Order ID:* #${order?.id || 'ORD-NEW'}\n` +
    `📅 *Date:* ${nowStr}\n` +
    `📍 *Delivery Address:* ${order?.address || 'Mirpur Cantt'}\n` +
    `🛵 *Estimated Delivery:* 15 - 30 Mins (Within 5km)\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🛒 *ITEMIZED BILL:*\n${itemsText}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💵 *TOTAL PAYABLE:* ₹${total}\n` +
    `💳 *Payment Mode:* Cash on Delivery / UPI at doorstep\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏪 *Yashi General Store*\n` +
    `📍 *Shop Location:* Mirpur Cantonment, Kanpur\n` +
    `📞 *Store Helpline:* ${storePhone}\n\n` +
    `Our delivery partner will call you at +91 ${clientPhone} when arriving at your doorstep!`;

  return {
    phone: `91${clientPhone}`,
    text,
    url: clientPhone ? `https://wa.me/91${clientPhone}?text=${encodeURIComponent(text)}` : ''
  };
}

export function buildClientEmailBill({ order, items = [], totalAmount, shopSettings }) {
  const email = (order?.customerEmail || '').trim();
  const storePhone = shopSettings?.phone || '+91 98765 43210';
  const total = totalAmount || order?.totalAmount || 0;
  const orderItems = (items && items.length > 0) ? items : (order?.items || []);
  const itemsText = orderItems.map(i => `${i.quantity || 1}x ${i.name} - Rs. ${(Number(i.price) || 0) * (Number(i.quantity) || 1)}`).join('\n');

  const subject = `Order Confirmation & Bill #${order?.id || 'YGS'} - Yashi General Store`;
  const body = `Dear ${order?.customerName || 'Customer'},\n\n` +
    `Thank you for shopping with Yashi General Store!\n\n` +
    `Order ID: #${order?.id}\n` +
    `Delivery To: ${order?.address}\n` +
    `Total Amount: Rs. ${total}\n\n` +
    `Itemized Bill:\n${itemsText}\n\n` +
    `Estimated Delivery: 15-30 Mins (Within 5km delivery radius)\n` +
    `Payment Mode: Cash on Delivery / UPI\n\n` +
    `Store Helpline: ${storePhone}\n` +
    `Yashi General Store, 510 Elliot Lane, Mirpur Cantonment, Kanpur - 208004`;

  return {
    email,
    subject,
    body,
    mailtoUrl: email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : ''
  };
}
