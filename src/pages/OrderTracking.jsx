import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const statusSteps = ['pending', 'processing', 'delivering', 'completed']
const statusLabel = {
  pending: 'Menunggu Konfirmasi',
  processing: 'Sedang Diproses',
  delivering: 'Sedang Diantar',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
}
const statusEmoji = {
  pending: '⏳',
  processing: '👨‍🍳',
  delivering: '🛵',
  completed: '✅',
  cancelled: '❌'
}

function OrderTracking() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API}/api/orders/${orderId}`)
        setOrder(res.data)
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }
    fetchOrder()
    const interval = setInterval(fetchOrder, 5000)
    return () => clearInterval(interval)
  }, [orderId])

  if (loading) return <div className="text-center py-20">Loading...</div>
  if (!order) return <div className="text-center py-20">Order tidak ditemukan</div>

  const currentStep = statusSteps.indexOf(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white px-6 py-6 text-center">
        <div className="text-5xl mb-2">{statusEmoji[order.status]}</div>
        <h1 className="text-2xl font-bold">{statusLabel[order.status]}</h1>
        <p className="text-green-200 text-sm mt-1">Meja {order.tableCode}</p>
      </div>

      <div className="px-6 py-6">
        {/* Progress bar */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-xl shadow p-6 mb-4">
            <div className="flex justify-between mb-2">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-500">{statusLabel[step].split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code pembayaran QRIS */}
        {order.paymentMethod === 'qris' && order.paymentStatus === 'unpaid' && (
          <div className="bg-white rounded-xl shadow p-6 mb-4 text-center">
            <h2 className="font-bold text-gray-800 mb-3">Scan untuk Bayar</h2>
            <img
              src="https://placehold.co/300x300/ffffff/000000?text=QRIS"
              alt="QRIS"
              className="w-56 h-56 mx-auto rounded-lg border"
            />
            <p className="text-gray-500 text-sm mt-3">Tunjukkan bukti bayar ke tenant setelah scan</p>
          </div>
        )}

        {/* Order items */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <h2 className="font-bold text-gray-800 mb-4">Detail Pesanan</h2>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-gray-500 text-sm">x{item.qty}</p>
              </div>
              <p className="font-semibold text-gray-800">Rp {item.subtotal.toLocaleString()}</p>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg pt-3">
            <span>Total</span>
            <span className="text-green-600">Rp {order.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Nama</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Pembayaran</span>
            <span className="font-medium uppercase">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status Bayar</span>
            <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
              {order.paymentStatus === 'paid' ? 'Sudah Bayar' : 'Belum Bayar'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
