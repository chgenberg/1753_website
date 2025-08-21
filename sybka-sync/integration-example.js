// Example integration: Viva Wallet → Fortnox + Sybka+ → Ongoing
// Lägg denna logik i din Node.js backend

class IntegrationService {
  constructor() {
    this.fortnoxService = new FortnoxService();
    this.sybkaService = new SybkaService();
    this.vivaWalletService = new VivaWalletService();
  }

  /**
   * Huvudflöde när en betalning är bekräftad från Viva Wallet
   */
  async handlePaymentConfirmed(orderData, paymentData) {
    try {
      console.log('💳 Payment confirmed from Viva Wallet:', paymentData.transactionId);

      // 1. Skapa kund och faktura i Fortnox
      const fortnoxResult = await this.createFortnoxInvoice(orderData, paymentData);
      
      // 2. Skicka order till Sybka+ för warehouse fulfillment
      const sybkaResult = await this.createSybkaOrder(orderData, fortnoxResult);
      
      // 3. Uppdatera order status i din databas
      await this.updateOrderStatus(orderData.orderId, {
        status: 'processing',
        fortnox_invoice_id: fortnoxResult.DocumentNumber,
        sybka_order_id: sybkaResult.order_id,
        payment_confirmed: true
      });

      return {
        success: true,
        fortnox_invoice: fortnoxResult.DocumentNumber,
        sybka_order: sybkaResult.order_id
      };

    } catch (error) {
      console.error('❌ Integration error:', error);
      throw error;
    }
  }

  /**
   * Skapa faktura i Fortnox
   */
  async createFortnoxInvoice(orderData, paymentData) {
    const invoiceData = {
      CustomerNumber: await this.getOrCreateFortnoxCustomer(orderData.customer),
      InvoiceDate: new Date().toISOString().split('T')[0],
      Currency: orderData.currency,
      YourOrderNumber: orderData.orderId,
      
      // Fakturaadress
      InvoiceAddress: {
        Name: orderData.customer.name,
        Address: orderData.billingAddress.street,
        ZipCode: orderData.billingAddress.zipCode,
        City: orderData.billingAddress.city,
        Country: orderData.billingAddress.country
      },
      
      // Leveransadress
      DeliveryAddress: {
        Name: orderData.customer.name,
        Address: orderData.shippingAddress.street,
        ZipCode: orderData.shippingAddress.zipCode,
        City: orderData.shippingAddress.city,
        Country: orderData.shippingAddress.country
      },

      // Fakturaraderna
      InvoiceRows: orderData.items.map(item => ({
        ArticleNumber: item.sku,
        Description: item.name,
        Quantity: item.quantity,
        Price: item.price
      })),

      // Betalningsinformation
      PaymentWay: 'CARD', // Viva Wallet
      ExternalInvoiceReference1: paymentData.transactionId
    };

    return await this.fortnoxService.createInvoice(invoiceData);
  }

  /**
   * Skapa order i Sybka+ för warehouse fulfillment
   */
  async createSybkaOrder(orderData, fortnoxInvoice) {
    const sybkaOrderData = {
      shop_order_id: orderData.orderId,
      shop_order_increment_id: `1753-${orderData.orderId}`,
      order_date: new Date().toISOString(),
      currency: orderData.currency,
      grand_total: orderData.total,
      subtotal: orderData.subtotal,
      tax_amount: orderData.tax,
      
      // Leveransadress (dit Ongoing ska skicka)
      shipping_firstname: orderData.customer.firstName,
      shipping_lastname: orderData.customer.lastName,
      shipping_street: orderData.shippingAddress.street,
      shipping_postcode: orderData.shippingAddress.zipCode,
      shipping_city: orderData.shippingAddress.city,
      shipping_country: orderData.shippingAddress.country,
      shipping_email: orderData.customer.email,
      shipping_phone: orderData.customer.phone,
      
      // Fakturaadress
      billing_firstname: orderData.customer.firstName,
      billing_lastname: orderData.customer.lastName,
      billing_street: orderData.billingAddress.street,
      billing_postcode: orderData.billingAddress.zipCode,
      billing_city: orderData.billingAddress.city,
      billing_country: orderData.billingAddress.country,
      billing_email: orderData.customer.email,
      billing_phone: orderData.customer.phone,

      // Orderrader
      order_rows: orderData.items.map(item => ({
        sku: item.sku,
        name: item.name,
        qty_ordered: item.quantity,
        price: item.price,
        shop_order_id: orderData.orderId
      })),

      // Koppling till Fortnox
      fortnox_invoice_id: fortnoxInvoice.DocumentNumber,
      payment_gateway: 'vivawallet',
      transaction_id: paymentData.transactionId,
      sent_to_crm: true,
      status: 'completed',
      fulfillment_status: 'pending'
    };

    // Skicka till Sybka+ via din Laravel service
    const response = await fetch('http://localhost:8000/api/sybka/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sybkaOrderData)
    });

    if (!response.ok) {
      throw new Error(`Sybka+ order creation failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Webhook från Ongoing när order är skickad
   */
  async handleOngoingShipmentUpdate(shipmentData) {
    try {
      // 1. Uppdatera order status i din databas
      await this.updateOrderStatus(shipmentData.orderId, {
        status: 'shipped',
        tracking_number: shipmentData.trackingNumber,
        carrier: shipmentData.carrier,
        shipped_at: shipmentData.shippedAt
      });

      // 2. Skicka tracking info till kund (email)
      await this.sendTrackingEmail(shipmentData);

      // 3. Eventuellt uppdatera Fortnox med leveransstatus
      await this.updateFortnoxDeliveryStatus(shipmentData);

    } catch (error) {
      console.error('❌ Shipment update error:', error);
    }
  }

  /**
   * Hämta färdiga ordrar från Sybka+ (för synk tillbaka till Fortnox)
   */
  async syncCompletedOrdersToFortnox() {
    try {
      // Hämta ordrar som är skickade men inte uppdaterade i Fortnox
      const response = await fetch('http://localhost:8000/api/sybka/orders/completed');
      const completedOrders = await response.json();

      for (const order of completedOrders.data || []) {
        if (order.fortnox_invoice_id && order.tracking_number) {
          // Uppdatera Fortnox med leveransinformation
          await this.fortnoxService.updateInvoiceDelivery(order.fortnox_invoice_id, {
            deliveryDate: order.shipped_at,
            trackingNumber: order.tracking_number,
            carrier: order.carrier
          });
        }
      }

    } catch (error) {
      console.error('❌ Fortnox sync error:', error);
    }
  }
}

// Webhook endpoints i din Node.js backend:

// 1. Viva Wallet webhook (betalning bekräftad)
app.post('/webhooks/viva-wallet', async (req, res) => {
  const paymentData = req.body;
  const orderData = await getOrderById(paymentData.orderCode);
  
  await integrationService.handlePaymentConfirmed(orderData, paymentData);
  res.json({ success: true });
});

// 2. Ongoing webhook (leverans skickad)
app.post('/webhooks/ongoing', async (req, res) => {
  const shipmentData = req.body;
  
  await integrationService.handleOngoingShipmentUpdate(shipmentData);
  res.json({ success: true });
});

// 3. Cron job för att synka tillbaka till Fortnox
setInterval(async () => {
  await integrationService.syncCompletedOrdersToFortnox();
}, 5 * 60 * 1000); // Var 5:e minut 