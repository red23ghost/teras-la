import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function Cart() {
  const { tableCode } = useParams()
  const navigate = useNavigate()
  const { cart, updateQty, removeFromCart, clearCart, total } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)

  const handleOrder = async () => {
    if (cart.length === 0) return alert('Keranjang kosong')
    if (!customerName.trim()) return alert('Masukkan nama Anda')
    setLoading(true)
    try {
      const tableRes = await axios.get(`${API}/api/tables/code/${tableCode}`)
      const table = tableRes.data

      const items = cart.map(item => ({
        product: item._id,
        tenant: item.tenant._id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        subtotal: item.price * item.qty
      }))

      const orderRes = await axios.post(`${API}/api/orders`, {
        table: table._id,
        tableCode,
        items,
        total,
        paymentMethod,
        customerName
      })

      clearCart()
      navigate(`/order/${orderRes.data._id}`)
    } catch (error) {
      alert('Gagal membuat order, coba lagi')
      console.error(error)
    }
    setLoading(false)
  }

  if (cart.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-6xl mb-4">🛒</div>
      <p className="text-gray-500 mb-6">Keranjang kosong</p>
      <button onClick={() => navigate(`/menu/${tableCode}`)} className="bg-green-600 text-white px-6 py-3 rounded-xl">
        Kembali ke Menu
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white px-6 py-4">
        <button onClick={() => navigate(`/menu/${tableCode}`)} className="text-green-200 mb-1">← Kembali</button>
        <h1 className="text-xl font-bold">Keranjang</h1>
      </div>

      <div className="px-6 py-4 space-y-3">
        {cart.map(item => (
          <div key={item._id} className="bg-white rounded-xl p-4 flex justify-between items-center shadow">
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{item.name}</p>
              <p className="text-gray-500 text-sm">{item.tenant?.name}</p>
              <p className="text-green-600 font-bold">Rp {(item.price * item.qty).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-8 h-8 bg-gray-200 rounded-full font-bold">-</button>
              <span className="w-6 text-center">{item.qty}</span>
              <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-8 h-8 bg-green-600 text-white rounded-full font-bold">+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-white mx-6 rounded-xl shadow mb-4">
        <h2 className="font-semibold text-gray-800 mb-3">Detail Pesanan</h2>
        <div className="mb-3">
          <label className="block text-gray-600 text-sm mb-1">Nama Anda</label>
          <input
            type="text"
            placeholder="Masukkan nama"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="block text-gray-600 text-sm mb-1">Metode Pembayaran</label>
          <div className="flex gap-3">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 py-2 rounded-lg border font-medium ${paymentMethod === 'cash' ? 'bg-green-600 text-white border-green-600' : 'text-gray-600'}`}
            >
              💵 Cash
            </button>
            <button
              onClick={() => setPaymentMethod('qris')}
              className={`flex-1 py-2 rounded-lg border font-medium ${paymentMethod === 'qris' ? 'bg-green-600 text-white border-green-600' : 'text-gray-600'}`}
            >
              📱 QRIS
            </button>
          </div>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total</span>
          <span className="text-green-600">Rp {total.toLocaleString()}</span>
        </div>
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Pesan Sekarang'}
        </button>
      </div>
    </div>
  )
}

export default Cart
