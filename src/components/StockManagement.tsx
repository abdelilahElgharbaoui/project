'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { stockApi, ApiError } from '@/lib/api';
import { StockItem } from '@/types';

interface StockManagementProps {
  userRole: 'admin' | 'user';
}

type StockFormData = {
  name: string;
  category: 'medical' | 'equipment' | 'supplies' | 'medication';
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  roomIds: string[];
};

export default function StockManagement({ userRole }: StockManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for add/edit
  const [formData, setFormData] = useState<StockFormData>({
    name: '',
    category: 'medical',
    currentStock: 0,
    minStock: 10,
    maxStock: 100,
    unit: 'pieces',
    roomIds: []
  });

  // Test console log to verify component is rendering
  console.log('StockManagement component rendering');

  // Fetch stock items from backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log('Fetching stock items...');
    stockApi.getStockItems({
      search: searchTerm,
      category: filterCategory !== 'all' ? filterCategory : undefined,
    })
      .then(res => {
        console.log('Stock items received:', res.data);
        setStockItems(res.data as StockItem[]);
      })
      .catch((err: ApiError) => {
        console.error('Error fetching stock items:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [searchTerm, filterCategory]);

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesLowStock = !showLowStockOnly || item.currentStock <= item.minStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleAddItem = () => {
    setFormData({
      name: '',
      category: 'medical',
      currentStock: 0,
      minStock: 0,
      maxStock: 1,
      unit: 'pieces',
      roomIds: [],
    });
    setShowAddModal(true);
  };

  const handleEditItem = (item: StockItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      unit: item.unit,
      roomIds: item.roomIds,
    });
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      setError(null);
      try {
        await stockApi.deleteStockItem(itemId);
        setStockItems(items => items.filter(item => item.id !== itemId) as StockItem[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestockItem = (item: StockItem) => {
    setSelectedItem(item);
    setRestockQuantity(1);
    setShowRestockModal(true);
  };

  const handleSubmitRestock = async () => {
    if (!selectedItem || restockQuantity <= 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await stockApi.restockItem(selectedItem.id, restockQuantity);
      setStockItems(items => items.map(item => item.id === selectedItem.id ? res.data as StockItem : item));
      setShowRestockModal(false);
      setSelectedItem(null);
      setRestockQuantity(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitItem = async () => {
    if (!formData.name.trim()) {
      setError('Item name is required');
      return;
    }
    
    if (formData.minStock >= formData.maxStock) {
      setError('Minimum stock must be less than maximum stock');
      return;
    }
    
    if (formData.currentStock > formData.maxStock) {
      setError('Current stock cannot exceed maximum stock');
      return;
    }
    
    setLoading(true);
    setError(null);
    console.log('Submitting stock item:', formData);
    try {
      if (showEditModal && selectedItem) {
        console.log('Updating stock item:', selectedItem.id, formData);
        const res = await stockApi.updateStockItem(selectedItem.id, formData);
        console.log('Update response:', res);
        setStockItems(items => items.map(item => item.id === selectedItem.id ? res.data as StockItem : item));
        setShowEditModal(false);
        setSelectedItem(null);
      } else {
        console.log('Creating new stock item:', formData);
        const res = await stockApi.createStockItem(formData);
        console.log('Create response:', res);
        setStockItems(items => [...items, res.data as StockItem]);
        setShowAddModal(false);
      }
      // Reset form data
      setFormData({
        name: '',
        category: 'medical',
        currentStock: 0,
        minStock: 10,
        maxStock: 100,
        unit: 'pieces',
        roomIds: []
      });
    } catch (err: any) {
      console.error('Error submitting stock item:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowRestockModal(false);
    setSelectedItem(null);
    setRestockQuantity(1);
    setError(null);
    // Reset form data
    setFormData({
      name: '',
      category: 'medical',
      currentStock: 0,
      minStock: 10,
      maxStock: 100,
      unit: 'pieces',
      roomIds: []
    });
  };

  const getStockStatus = (item: StockItem) => {
    const percentage = (item.currentStock / item.maxStock) * 100;
    if (item.currentStock <= item.minStock) {
      return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (percentage < 30) {
      return { status: 'low', color: 'text-amber-600', bgColor: 'bg-amber-100' };
    } else if (percentage < 70) {
      return { status: 'medium', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    } else {
      return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  return (
    <div className="space-y-6">
      {loading && <div className="text-center text-blue-600">Loading...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        {userRole === 'admin' && (
          <button 
            onClick={handleAddItem}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stockItems.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {stockItems.filter(item => item.currentStock <= item.minStock).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Value at Risk</p>
              <p className="text-2xl font-bold text-amber-600">$12,450</p>
            </div>
            <TrendingDown className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Well Stocked</p>
              <p className="text-2xl font-bold text-green-600">
                {stockItems.filter(item => item.currentStock > item.minStock).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stock items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="all">All Categories</option>
              <option value="medical">Medical</option>
              <option value="equipment">Equipment</option>
              <option value="supplies">Supplies</option>
              <option value="medication">Medication</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Low stock only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Restocked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">Min: {item.minStock} • Max: {item.maxStock}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.currentStock} {item.unit}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              status.status === 'critical' ? 'bg-red-500' :
                              status.status === 'low' ? 'bg-amber-500' :
                              status.status === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color} capitalize`}>
                        {status.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.lastRestocked).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {userRole === 'admin' && (
                          <>
                            <button 
                              onClick={() => handleRestockItem(item)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Restock
                            </button>
                            <button 
                              onClick={() => handleEditItem(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        <button className="text-gray-600 hover:text-gray-900">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showAddModal ? 'Add New Item' : 'Edit Item'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as 'medical' | 'equipment' | 'supplies' | 'medication'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="medical">Medical</option>
                      <option value="equipment">Equipment</option>
                      <option value="supplies">Supplies</option>
                      <option value="medication">Medication</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="pieces">Pieces</option>
                      <option value="pairs">Pairs</option>
                      <option value="boxes">Boxes</option>
                      <option value="bottles">Bottles</option>
                      <option value="units">Units</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Stock
                    </label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Stock
                    </label>
                    <input
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) => setFormData({...formData, maxStock: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      min="1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmitItem}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showAddModal ? 'Add Item' : 'Update Item'}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Restock Item
                </h2>
                <button
                  onClick={() => {
                    setShowRestockModal(false);
                    setSelectedItem(null);
                    setRestockQuantity(1);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <p className="text-gray-900 font-medium">{selectedItem.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <p className="text-gray-900">{selectedItem.currentStock} {selectedItem.unit}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Stock
                    </label>
                    <p className="text-gray-900">{selectedItem.maxStock} {selectedItem.unit}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restock Quantity *
                  </label>
                  <input
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    min="1"
                    max={selectedItem.maxStock - selectedItem.currentStock}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum that can be added: {selectedItem.maxStock - selectedItem.currentStock} {selectedItem.unit}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmitRestock}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Restock Item
                </button>
                <button
                  onClick={() => {
                    setShowRestockModal(false);
                    setSelectedItem(null);
                    setRestockQuantity(1);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}