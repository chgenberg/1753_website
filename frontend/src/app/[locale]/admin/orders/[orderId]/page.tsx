'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { AdminOrder } from '@/types'
import { formatPrice } from '@/lib/currency'

export default function AdminOrderDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Form states
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    paymentStatus: '',
    fulfillmentStatus: '',
    trackingNumber: '',
    trackingCompany: '',
    internalNotes: ''
  })

  const [refundForm, setRefundForm] = useState({
    amount: '',
    reason: '',
    refundShipping: false
  })

  // Check admin access
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN'))) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, user, router])

  // Fetch order details
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && orderId) {
      fetchOrder()
    }
  }, [isAuthenticated, user, orderId])

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setOrder(data.data)
        setStatusUpdate({
          status: data.data.status,
          paymentStatus: data.data.paymentStatus,
          fulfillmentStatus: data.data.fulfillmentStatus,
          trackingNumber: data.data.trackingNumber || '',
          trackingCompany: data.data.trackingCompany || '',
          internalNotes: data.data.internalNotes || ''
        })
      } else {
        setError(data.message || 'Kunde inte hämta order')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Ett fel uppstod vid hämtning av order')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async () => {
    if (!order) return

    setUpdating(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusUpdate)
      })

      const data = await response.json()

      if (data.success) {
        setOrder(data.data)
        alert('Order uppdaterad!')
      } else {
        alert(data.message || 'Kunde inte uppdatera order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Ett fel uppstod vid uppdatering av order')
    } finally {
      setUpdating(false)
    }
  }

  const processRefund = async () => {
    if (!order) return

    if (!confirm('Är du säker på att du vill genomföra denna återbetalning?')) {
      return
    }

    setUpdating(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: refundForm.amount ? Number(refundForm.amount) : undefined,
          reason: refundForm.reason,
          refundShipping: refundForm.refundShipping
        })
      })

      const data = await response.json()

      if (data.success) {
        fetchOrder() // Refresh order data
        alert(`Återbetalning genomförd: ${data.message}`)
        setRefundForm({ amount: '', reason: '', refundShipping: false })
      } else {
        alert(data.message || 'Kunde inte genomföra återbetalning')
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      alert('Ett fel uppstod vid återbetalning')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-green-200 text-green-900'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'partially_refunded': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return null
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Order hittades inte'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Tillbaka till admin panel
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-gray-600">Detaljerad orderhantering</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Orderinformation</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ordernummer</p>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Datum</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('sv-SE')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Betalningsstatus</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaktions-ID</p>
                  <p className="font-medium">{order.transactionId || 'Ej tillgängligt'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Betalningsmetod</p>
                  <p className="font-medium">{order.paymentMethod || 'Ej tillgängligt'}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Kundinformation</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Namn</p>
                  <p className="font-medium">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : order.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">E-post</p>
                  <p className="font-medium">{order.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{order.phone || order.customerPhone || 'Ej angivet'}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Produkter</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      {item.variantTitle && (
                        <p className="text-sm text-gray-500">{item.variantTitle}</p>
                      )}
                      <p className="text-sm text-gray-500">SKU: {item.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Antal: {item.quantity}</p>
                      <p className="text-sm text-gray-500">{formatPrice(item.price, order.currency as any)} st</p>
                      <p className="font-medium">{formatPrice(item.price * item.quantity, order.currency as any)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Totals */}
              <div className="mt-6 border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Delsumma:</span>
                  <span>{formatPrice(order.subtotal, order.currency as any)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Rabatt:</span>
                    <span>-{formatPrice(order.discountAmount, order.currency as any)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frakt:</span>
                  <span>{formatPrice(order.shippingAmount, order.currency as any)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Moms:</span>
                  <span>{formatPrice(order.taxAmount, order.currency as any)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Totalt:</span>
                  <span>{formatPrice(order.totalAmount, order.currency as any)}</span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Leveransadress</h2>
                <div className="text-sm">
                  <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Faktureringsadress</h2>
                <div className="text-sm">
                  <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                  <p>{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                  <p>{order.billingAddress.postalCode} {order.billingAddress.city}</p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Uppdatera Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="PENDING">Väntande</option>
                    <option value="CONFIRMED">Bekräftad</option>
                    <option value="PROCESSING">Behandlas</option>
                    <option value="SHIPPED">Skickad</option>
                    <option value="DELIVERED">Levererad</option>
                    <option value="CANCELLED">Avbruten</option>
                    <option value="REFUNDED">Återbetald</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Betalningsstatus</label>
                  <select
                    value={statusUpdate.paymentStatus}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, paymentStatus: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="PENDING">Väntande</option>
                    <option value="PAID">Betald</option>
                    <option value="FAILED">Misslyckad</option>
                    <option value="REFUNDED">Återbetald</option>
                    <option value="PARTIALLY_REFUNDED">Delvis återbetald</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spårningsnummer</label>
                  <input
                    type="text"
                    value={statusUpdate.trackingNumber}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, trackingNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Spårningsnummer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fraktbolag</label>
                  <input
                    type="text"
                    value={statusUpdate.trackingCompany}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, trackingCompany: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="PostNord, DHL, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interna anteckningar</label>
                  <textarea
                    value={statusUpdate.internalNotes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, internalNotes: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Interna anteckningar..."
                  />
                </div>

                <button
                  onClick={updateOrderStatus}
                  disabled={updating}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Uppdaterar...' : 'Uppdatera Order'}
                </button>
              </div>
            </div>

            {/* Refund Section */}
            {order.paymentStatus.toUpperCase() === 'PAID' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Återbetalning</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Belopp (lämna tomt för full återbetalning)
                    </label>
                    <input
                      type="number"
                      value={refundForm.amount}
                      onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder={`Max: ${order.totalAmount} ${order.currency}`}
                      max={order.totalAmount}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anledning</label>
                    <textarea
                      value={refundForm.reason}
                      onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Anledning till återbetalning..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="refundShipping"
                      checked={refundForm.refundShipping}
                      onChange={(e) => setRefundForm({ ...refundForm, refundShipping: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="refundShipping" className="text-sm text-gray-700">
                      Inkludera frakt i återbetalning
                    </label>
                  </div>

                  <button
                    onClick={processRefund}
                    disabled={updating}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {updating ? 'Behandlar...' : 'Genomför Återbetalning'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 