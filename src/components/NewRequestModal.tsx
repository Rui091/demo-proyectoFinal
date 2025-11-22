import React, { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { useRequests } from '../hooks/useRequests';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LOCATIONS = [
  'Cedro rosado',
  'Almendros',
  'Palmas',
  'Lagos',
  'Saman',
  'Educacion continua',
  'Guduales',
  'Guayacanes',
  'Facultad',
  'Edificio administrativo',
  'Edificio financiero',
  'Biblioteca',
  'Capilla',
];

export default function NewRequestModal({ isOpen, onClose, onSuccess }: NewRequestModalProps) {
  const { createRequest } = useRequests();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    weight_kg: '',
    size_vol: '',
    type: 'small_package' as 'document' | 'small_package' | 'recording',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error: reqError } = await createRequest({
      ...formData,
      weight_kg: Number(formData.weight_kg),
    });

    setLoading(false);
    if (!reqError) {
      onSuccess();
      onClose();
    } else {
      setError(reqError.message || 'Failed to create request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">New Shipment Request</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
              <select
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.origin}
                onChange={e => setFormData({ ...formData, origin: e.target.value })}
              >
                <option value="">Select Origin...</option>
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
              <select
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.destination}
                onChange={e => setFormData({ ...formData, destination: e.target.value })}
              >
                <option value="">Select Destination...</option>
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="document">Document</option>
              <option value="small_package">Small Package</option>
              <option value="recording">Video Recording (Drone)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
              <input
                required
                type="number"
                step="0.1"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="0.0"
                value={formData.weight_kg}
                onChange={e => setFormData({ ...formData, weight_kg: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Size (Vol)</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. 10x10x10"
                value={formData.size_vol}
                onChange={e => setFormData({ ...formData, size_vol: e.target.value })}
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
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
