'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Search, 
  Clock,
  Package,
  MapPin,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { scenarioApi } from '@/lib/api';
import { Scenario } from '@/types';

interface ScenarioManagementProps {
  userRole: 'admin' | 'user';
}

type ScenarioFormData = {
  name: string;
  description: string;
  requiredEquipment: string[];
  estimatedDuration: number;
  roomTypes: string[];
};

export default function ScenarioManagement({ userRole }: ScenarioManagementProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoomType, setFilterRoomType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [formData, setFormData] = useState<ScenarioFormData>({
    name: '',
    description: '',
    requiredEquipment: [],
    estimatedDuration: 30,
    roomTypes: [],
  });

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterRoomType !== 'all') params.roomType = filterRoomType;
      
      const response = await scenarioApi.getScenarios(params);
      
      if (response.success) {
        setScenarios(response.data as Scenario[]);
      } else {
        setError('Failed to fetch scenarios');
      }
    } catch (err) {
      console.error('Error fetching scenarios:', err);
      setError('Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAddScenario = () => {
    setFormData({
      name: '',
      description: '',
      requiredEquipment: [],
      estimatedDuration: 30,
      roomTypes: [],
    });
    setShowAddModal(true);
  };

  const handleEditScenario = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setFormData({
      name: scenario.name,
      description: scenario.description,
      requiredEquipment: [...scenario.requiredEquipment],
      estimatedDuration: scenario.estimatedDuration,
      roomTypes: [...scenario.roomTypes],
    });
    setShowEditModal(true);
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;
    
    try {
      const response = await scenarioApi.deleteScenario(scenarioId);
      
      if (response.success) {
        setScenarios(scenarios.filter(s => s.id !== scenarioId));
      } else {
        alert('Failed to delete scenario');
      }
    } catch (err) {
      console.error('Error deleting scenario:', err);
      alert('Failed to delete scenario');
    }
  };

  const handleSubmitScenario = async () => {
    if (!formData.name || !formData.description || formData.requiredEquipment.length === 0 || formData.roomTypes.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      let response;
      
      if (showAddModal) {
        response = await scenarioApi.createScenario(formData);
      } else {
        response = await scenarioApi.updateScenario(editingScenario!.id, formData);
      }
      
      if (response.success) {
        setShowAddModal(false);
        setShowEditModal(false);
        fetchScenarios();
      } else {
        alert('Failed to save scenario');
      }
    } catch (err) {
      console.error('Error saving scenario:', err);
      alert('Failed to save scenario');
    }
  };

  const addEquipment = () => {
    const equipment = prompt('Enter equipment name:');
    if (equipment && equipment.trim()) {
      setFormData({
        ...formData,
        requiredEquipment: [...formData.requiredEquipment, equipment.trim()]
      });
    }
  };

  const removeEquipment = (index: number) => {
    setFormData({
      ...formData,
      requiredEquipment: formData.requiredEquipment.filter((_, i) => i !== index)
    });
  };

  const addRoomType = () => {
    const roomType = prompt('Enter room type:');
    if (roomType && roomType.trim()) {
      setFormData({
        ...formData,
        roomTypes: [...formData.roomTypes, roomType.trim()]
      });
    }
  };

  const removeRoomType = (index: number) => {
    setFormData({
      ...formData,
      roomTypes: formData.roomTypes.filter((_, i) => i !== index)
    });
  };

  const toggleRoomType = (roomType: string) => {
    setFormData({
      ...formData,
      roomTypes: formData.roomTypes.includes(roomType)
        ? formData.roomTypes.filter(rt => rt !== roomType)
        : [...formData.roomTypes, roomType]
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoomType = filterRoomType === 'all' || scenario.roomTypes.includes(filterRoomType as any);
    return matchesSearch && matchesRoomType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Scenario Management</h1>
        {userRole === 'admin' && (
          <button 
            onClick={handleAddScenario}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Scenario
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>
          <div>
            <select
              value={filterRoomType}
              onChange={(e) => setFilterRoomType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="all">All Room Types</option>
              <option value="consultation">Consultation</option>
              <option value="surgery">Surgery</option>
              <option value="emergency">Emergency</option>
              <option value="meeting">Meeting</option>
              <option value="imaging">Imaging</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredScenarios.map((scenario) => (
          <div key={scenario.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{scenario.name}</h3>
                <p className="text-gray-600 text-sm">{scenario.description}</p>
              </div>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Estimated Duration: {scenario.estimatedDuration} minutes</span>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Compatible Room Types:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {scenario.roomTypes.map((roomType) => (
                    <span
                      key={roomType}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize"
                    >
                      {roomType}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                View Details
              </button>
              {userRole === 'admin' && (
                <>
                  <button 
                    onClick={() => handleEditScenario(scenario)}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteScenario(scenario.id)}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Scenario Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showAddModal ? 'Create New Scenario' : 'Edit Scenario'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scenario Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter scenario name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    rows={3}
                    placeholder="Enter scenario description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({...formData, estimatedDuration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compatible Room Types *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['consultation', 'surgery', 'emergency', 'meeting', 'imaging'].map(roomType => (
                      <label key={roomType} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.roomTypes.includes(roomType)}
                          onChange={() => toggleRoomType(roomType)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{roomType}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Equipment
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={addEquipment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Equipment
                    </button>
                  </div>
                
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmitScenario}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showAddModal ? 'Create Scenario' : 'Update Scenario'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
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