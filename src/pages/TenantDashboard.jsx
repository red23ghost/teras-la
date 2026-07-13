import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function TenantDashboard() {
  const navigate = useNavigate()
  const [tenant, setTenant] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('orders')
  const [loading, setLoading] = useState(true)
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: '' })
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [productPhoto, setProductPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // State untuk edit produk
  const [editingProductId, setEditingProductId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', category: '' })
  const [editPhoto, setEditPhoto] = useState(null)
  const [editPhotoPreview, setEditPhotoPreview] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // State untuk konfirmasi bayar
  const [markingPaidId, setMarkingPaidId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('tenantToken')
    const tenantData = localStorage.getItem('tenantData')
    if (!token) { navigate('/tenant/login'); return }
    setTenant(JSON.parse(tenantData))
    fetchData(JSON.parse(tenantData).id, token)
    const interval = setInterval(() => fetchOrders(JSON.parse(tenantData).id, token), 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async (tenantId, token) => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/api/products/tenant/${tenantId}`),
        axios.get(`${API}/api/orders/tenant/${tenantId}`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setProducts(productsRes.data)
      setOrders(ordersRes.data)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const fetchOrders = async (tenantId, token) => {
    try {
      const res = await axios.get(`${API}/api/orders/tenant/${tenantId}`, { headers: { Authorization: `Bearer ${token}` } })
      setOrders(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProductPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleAddProduct = async () => {
    const token = localStorage.getItem('tenantToken')
    try {
      const res = await axios.post(`${API}/api/products`, newProduct, { headers: { Authorization: `Bearer ${token}` } })
      const newProductId = res.data._id

      if (productPhoto) {
        setUploadingPhoto(true)
        const formData = new FormData()
        formData.append('photo', productPhoto)
        await axios.post(`${API}/api/products/${newProductId}/upload-photo`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        })
        setUploadingPhoto(false)
      }

      setNewProduct({ name: '', description: '', price: '', category: '' })
      setProductPhoto(null)
      setPhotoPreview(null)
      setShowAddProduct(false)
      fetchData(tenant.id, token)
    } catch (error) {
      alert('Gagal menambah produk')
      setUploadingPhoto(false)
    }
  }

  const handleToggleAvailable = async (productId, isAvailable) => {
    const token = localStorage.getItem('tenantToken')
    try {
      await axios.put(`${API}/api/products/${productId}`, { isAvailable: !isAvailable }, { headers: { Authorization: `Bearer ${token}` } })
      fetchData(tenant.id, token)
    } catch (error) {
      alert('Gagal mengubah status produk')
    }
  }

  const handleStartEdit = (product) => {
    setEditingProductId(product._id)
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || ''
    })
    setEditPhoto(null)
    setEditPhotoPreview(null)
  }

  const handleCancelEdit = () => {
    setEditingProductId(null)
    setEditForm({ name: '', description: '', price: '', category: '' })
    setEditPhoto(null)
    setEditPhotoPreview(null)
  }

  const handleEditPhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditPhoto(file)
      setEditPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveEdit = async (productId) => {
    const token = localStorage.getItem('tenantToken')
    try {
      setSavingEdit(true)
      await axios.put(`${API}/api/products/${productId}`, editForm, { headers: { Authorization: `Bearer ${token}` } })

      if (editPhoto) {
        const formData = new FormData()
        formData.append('photo', editPhoto)
        await axios.post(`${API}/api/products/${productId}/upload-photo`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        })
      }

      setSavingEdit(false)
      handleCancelEdit()
      fetchData(tenant.id, token)
    } catch (error) {
      alert('Gagal menyimpan perubahan produk')
      setSavingEdit(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Hapus produk ini?')) return
    const token = localStorage.getItem('tenantToken')
    try {
      await axios.delete(`${API}/api/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } })
      fetchData(tenant.id, token)
    } catch (error) {
      alert('Gagal menghapus produk')
    }
  }

  const handleUpdateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem('tenantToken')
    try {
      await axios.put(`${API}/api/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
      fetchData(tenant.id, token)
    } catch (error) {
      alert('Gagal mengubah status order')
    }
  }

  const handleMarkPaid = async (orderId, paymentMethod) => {
    if (!confirm('Tandai pesanan ini sudah dibayar?')) return
    const token = localStorage.getItem('tenantToken')
    try {
      setMarkingPaidId(orderId)
      await axios.put(`${API}/api/orders/${orderId}/payment`, {
        paymentMethod,
        paymentStatus: 'paid'
      })
      setMarkingPaidId(null)
      fetchData(tenant.id, token)
    } catch (error) {
      alert('Gagal menandai pembayaran')
      setMarkingPaidId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('tenantToken')
    localStorage.removeItem('tenantData')
    navigate('/tenant/login')
  }

  if (loading) return <div className="text-center py-20">Loading...</div>

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const activeOrders = orders.filter(o => ['processing', 'delivering'].includes(o.status))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{tenant?.name}</h1>
          <p className="text-green-200 text-sm">Dashboard Tenant</p>
        </div>
        <div className="flex items-center gap-4">
          {pendingOrders.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {pendingOrders.length} order baru!
            </span>
          )}
          <button onClick={handleLogout} className="bg-green-800 px-3 py-2 rounded-lg text-sm">Logout</button>
        </div>
      </nav>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{pendingOrders.length}</div>
          <div className="text-gray-500 text-xs">Order Baru</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500">{activeOrders.length}</div>
          <div className="text-gray-500 text-xs">Diproses</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{products.length}</div>
          <div className="text-gray-500 text-xs">Produk</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 gap-2 mb-4">
        <button onClick={() => setActiveTab('orders')} className={`flex-1 py-2 rounded-lg font-medium ${activeTab === 'orders' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
          Order {pendingOrders.length > 0 && `(${pendingOrders.length})`}
        </button>
        <button onClick={() => setActiveTab('products')} className={`flex-1 py-2 rounded-lg font-medium ${activeTab === 'products' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
          Produk
        </button>
      </div>

      <div className="px-6 pb-8">
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 && <p className="text-center text-gray-500 py-10">Belum ada order</p>}
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{order.customerName}</p>
                    <p className="text-gray-500 text-sm">Meja {order.tableCode}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === 'pending' ? 'bg-red-100 text-red-600' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                    order.status === 'delivering' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
                {order.items.filter(item => item.tenant === tenant?.id).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b">
                    <span>{item.name} x{item.qty}</span>
                    <span>Rp {item.subtotal.toLocaleString()}</span>
                  </div>
                ))}

                {/* Info pembayaran */}
                <div className="flex justify-between items-center text-sm mt-2 pt-2">
                  <span className="text-gray-500">
                    Bayar via <span className="font-medium uppercase">{order.paymentMethod}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {order.paymentStatus === 'paid' ? 'Sudah Bayar' : 'Belum Bayar'}
                  </span>
                </div>

                {order.paymentStatus === 'unpaid' && (
                  <button
                    onClick={() => handleMarkPaid(order._id, order.paymentMethod)}
                    disabled={markingPaidId === order._id}
                    className="w-full mt-2 bg-purple-50 text-purple-600 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {markingPaidId === order._id ? 'Menyimpan...' : 'Tandai Sudah Bayar'}
                  </button>
                )}

                <div className="flex gap-2 mt-3">
                  {order.status === 'pending' && (
                    <button onClick={() => handleUpdateOrderStatus(order._id, 'processing')} className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium">
                      Proses
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button onClick={() => handleUpdateOrderStatus(order._id, 'delivering')} className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium">
                      Antar
                    </button>
                  )}
                  {order.status === 'delivering' && (
                    <button onClick={() => handleUpdateOrderStatus(order._id, 'completed')} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium">
                      Selesai
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <button onClick={() => setShowAddProduct(!showAddProduct)} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold mb-4">
              + Tambah Produk
            </button>

            {showAddProduct && (
              <div className="bg-white rounded-xl shadow p-4 mb-4 space-y-3">
                <input type="text" placeholder="Nama produk" className="w-full border rounded-lg px-3 py-2" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input type="text" placeholder="Deskripsi" className="w-full border rounded-lg px-3 py-2" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                <input type="number" placeholder="Harga" className="w-full border rounded-lg px-3 py-2" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                <input type="text" placeholder="Kategori (Makanan/Minuman)" className="w-full border rounded-lg px-3 py-2" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Foto produk (opsional)</label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover mt-2" />
                  )}
                </div>

                <button onClick={handleAddProduct} disabled={uploadingPhoto} className="w-full bg-green-600 text-white py-2 rounded-lg font-medium disabled:opacity-50">
                  {uploadingPhoto ? 'Mengupload foto...' : 'Simpan'}
                </button>
              </div>
            )}

            <div className="space-y-3">
              {products.map(product => (
                <div key={product._id} className="bg-white rounded-xl shadow p-4">
                  {editingProductId === product._id ? (
                    // ===== Form edit =====
                    <div className="space-y-3">
                      <p className="font-semibold text-gray-800 mb-1">Edit Produk</p>
                      <input type="text" placeholder="Nama produk" className="w-full border rounded-lg px-3 py-2" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      <input type="text" placeholder="Deskripsi" className="w-full border rounded-lg px-3 py-2" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                      <input type="number" placeholder="Harga" className="w-full border rounded-lg px-3 py-2" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                      <input type="text" placeholder="Kategori (Makanan/Minuman)" className="w-full border rounded-lg px-3 py-2" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} />

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Ganti foto (opsional)</label>
                        <div className="flex items-center gap-3">
                          <img
                            src={editPhotoPreview || product.photo}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x300/e5e7eb/9ca3af?text=No+Image' }}
                          />
                          <input type="file" accept="image/*" onChange={handleEditPhotoChange} className="flex-1 border rounded-lg px-3 py-2 text-sm min-w-0" />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleSaveEdit(product._id)} disabled={savingEdit} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50">
                          {savingEdit ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button onClick={handleCancelEdit} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium">
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ===== Tampilan normal =====
                    <div>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.photo}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x300/e5e7eb/9ca3af?text=No+Image' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                          <p className="text-green-600 font-bold">Rp {product.price.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => handleToggleAvailable(product._id, product.isAvailable)}
                          className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${product.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                        >
                          {product.isAvailable ? 'Tersedia' : 'Habis'}
                        </button>
                      </div>

                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <button onClick={() => handleStartEdit(product)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteProduct(product._id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium">
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TenantDashboard
