# Sybka+ Integration Guide
## Komplett flöde: Viva Wallet → Fortnox → Sybka+ → Ongoing

### 🔄 **Integration Overview**

```
E-commerce (Viva Wallet) → Din Backend → Fortnox ERP → Sybka+ WMS → Ongoing 3PL
```

## 📋 **Steg-för-steg Process**

### **1. Kund betalar (Viva Wallet)**
- Kund slutför betalning på din webshopp
- Viva Wallet skickar webhook till din backend
- Din backend får bekräftelse på lyckad betalning

### **2. Din Backend (Node.js) hanterar ordern**
```javascript
// Webhook från Viva Wallet
app.post('/webhooks/viva-wallet', async (req, res) => {
  const paymentData = req.body;
  const orderData = await getOrderById(paymentData.orderCode);
  
  // A. Skapa faktura i Fortnox
  const fortnoxInvoice = await createFortnoxInvoice(orderData, paymentData);
  
  // B. Skicka order till Sybka+ för fulfillment
  const sybkaOrder = await fetch('http://localhost:8000/api/sybka/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shop_order_id: orderData.orderId,
      currency: orderData.currency,
      grand_total: orderData.total,
      shipping_firstname: orderData.customer.firstName,
      shipping_lastname: orderData.customer.lastName,
      shipping_street: orderData.shippingAddress.street,
      shipping_postcode: orderData.shippingAddress.zipCode,
      shipping_city: orderData.shippingAddress.city,
      shipping_country: orderData.shippingAddress.country,
      shipping_email: orderData.customer.email,
      order_rows: orderData.items.map(item => ({
        sku: item.sku,
        name: item.name,
        qty_ordered: item.quantity,
        price: item.price
      })),
      fortnox_invoice_id: fortnoxInvoice.DocumentNumber,
      payment_gateway: 'vivawallet',
      transaction_id: paymentData.transactionId
    })
  });
});
```

### **3. Fortnox ERP**
- ✅ **Faktura skapas** med orderdata
- ✅ **Kund registreras** (om ny)
- ✅ **Bokföring** sker automatiskt
- ✅ **Produkter synkas** till Sybka+ (automatiskt)

### **4. Sybka+ WMS (Warehouse Management)**
- ✅ **Tar emot order** från din backend
- ✅ **Hämtar produktdata** från Fortnox (automatisk synk)
- ✅ **Skickar order** till Ongoing för plockning/packning

### **5. Ongoing 3PL (Warehouse)**
- 📦 **Plockar och packar** produkter
- 🚚 **Skickar** med fraktbolag
- 📧 **Skickar tracking-info** tillbaka

### **6. Status-uppdateringar tillbaka**
```javascript
// Webhook från Ongoing (när order skickas)
app.post('/webhooks/ongoing', async (req, res) => {
  const shipmentData = req.body;
  
  // Uppdatera order status
  await updateOrderStatus(shipmentData.orderId, {
    status: 'shipped',
    tracking_number: shipmentData.trackingNumber,
    carrier: shipmentData.carrier
  });
  
  // Skicka tracking-email till kund
  await sendTrackingEmail(shipmentData);
});

// Cron job: Synka färdiga ordrar tillbaka till Fortnox
setInterval(async () => {
  const completedOrders = await fetch('http://localhost:8000/api/sybka/orders/completed');
  const orders = await completedOrders.json();
  
  for (const order of orders.completed_orders) {
    if (order.tracking_number) {
      // Uppdatera Fortnox med leveransstatus
      await updateFortnoxDeliveryStatus(order.fortnox_invoice_id, {
        deliveryDate: order.shipped_at,
        trackingNumber: order.tracking_number
      });
    }
  }
}, 5 * 60 * 1000); // Var 5:e minut
```

## 🛠️ **Teknisk Implementation**

### **Sybka+ Service (Laravel/PHP)**
- ✅ **Färdig och testad** i `/sybka-sync/`
- ✅ **API endpoints:**
  - `POST /api/sybka/orders` - Skapa order
  - `GET /api/sybka/orders/completed` - Hämta färdiga ordrar
  - `GET /api/sybka/products` - Hämta produkter (från Fortnox)
  - `GET /api/sybka/test` - Testa anslutning

### **Din Node.js Backend behöver:**
1. **Viva Wallet webhook handler**
2. **Fortnox API integration** (som du redan har)
3. **Ongoing webhook handler**
4. **Cron job** för status-synk

## 🔧 **Konfiguration**

### **Sybka+ API (redan konfigurerat):**
- URL: `https://mitt.synkaplus.se/api/`
- Team ID: `844`
- Token: `QgFCIjnAOZrZlD2J4pxyJq8VmPZNH7sl5jG5U3gSQbBb25eO6r2yEQoYm1eV`

### **I Sybka+ admin-panel behöver du:**
1. **Aktivera Fortnox-synk** för produkter
2. **Konfigurera Ongoing-koppling** för fulfillment
3. **Sätta webhook-URLs** för status-uppdateringar

### **I din Node.js backend:**
```javascript
// .env
SYBKA_SYNC_URL=http://localhost:8000
FORTNOX_API_TOKEN=your_fortnox_token
VIVA_WALLET_WEBHOOK_SECRET=your_viva_secret
ONGOING_WEBHOOK_SECRET=your_ongoing_secret
```

## 🚀 **Deployment**

1. **Sybka+ Service:** Deploya Laravel-appen till Railway/Heroku
2. **Node.js Backend:** Uppdatera med nya webhook-handlers
3. **Webhook URLs:** Konfigurera i Viva Wallet och Ongoing

## 📊 **Monitoring**

```javascript
// Health checks
const sybkaHealth = await fetch('http://localhost:8000/health');
const sybkaTest = await fetch('http://localhost:8000/api/sybka/test');

// Logga alla steg
console.log('Payment → Fortnox → Sybka+ → Ongoing');
```

## ❓ **Nästa steg för dig:**

1. **Kontrollera Sybka+ admin** - aktivera Fortnox produktsynk
2. **Konfigurera Ongoing** - koppla till Sybka+ 
3. **Uppdatera din Node.js backend** med webhook-handlers
4. **Testa hela flödet** med en testorder

Vill du att jag hjälper dig implementera webhook-handlers i din Node.js backend? 