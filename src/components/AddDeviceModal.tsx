import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDeviceModal({ isOpen, onClose, onSuccess }: AddDeviceModalProps) {
  const { addDevice } = useDevices();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    type: 'drone' as 'drone' | 'robot',
    capacity_kg: '',
    battery_autonomy: '',
    serial_number: '',
    address: '',
    location_lat: '',
    location_lng: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const deviceData: any = {
      model: formData.model,
      type: formData.type,
      capacity_kg: Number(formData.capacity_kg),
      battery_autonomy: formData.battery_autonomy,
      serial_number: formData.serial_number,
    };

    if (formData.address) deviceData.address = formData.address;
    if (formData.location_lat) deviceData.location_lat = Number(formData.location_lat);
    if (formData.location_lng) deviceData.location_lng = Number(formData.location_lng);

    const { error } = await addDevice(deviceData);

    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert('Failed to add device');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Register New Device</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Model Name</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. DJI Matrice 300"
              value={formData.model}
              onChange={e => setFormData({ ...formData, model: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as 'drone' | 'robot' })}
              >
                <option value="drone">Drone</option>
                <option value="robot">Robot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="SN-12345"
                value={formData.serial_number}
                onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (kg)</label>
              <input
                required
                type="number"
                step="0.1"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="0.0"
                value={formData.capacity_kg}
                onChange={e => setFormData({ ...formData, capacity_kg: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Battery Autonomy</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. 45 min"
                value={formData.battery_autonomy}
                onChange={e => setFormData({ ...formData, battery_autonomy: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location Address (Optional)</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Edificio administrativo, PUJ Cali"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Latitude (Optional)</label>
              <input
                type="number"
                step="0.000001"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. 3.3487"
                value={formData.location_lat}
                onChange={e => setFormData({ ...formData, location_lat: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Longitude (Optional)</label>
              <input
                type="number"
                step="0.000001"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. -76.5316"
                value={formData.location_lng}
                onChange={e => setFormData({ ...formData, location_lng: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Register Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
