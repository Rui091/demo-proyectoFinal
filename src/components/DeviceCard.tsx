import { Battery, MapPin, Weight } from 'lucide-react';
import type { Device } from '../hooks/useDevices';

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const statusColors = {
    available: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    busy: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    maintenance: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all duration-200 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[device.status]}`}>
              {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">{device.serial_number}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
            {device.model}
          </h3>
          <p className="text-sm text-slate-500 capitalize">{device.type}</p>
        </div>
        <div className={`p-2 rounded-lg ${device.type === 'drone' ? 'bg-sky-100 text-sky-600' : 'bg-indigo-100 text-indigo-600'}`}>
          {device.type === 'drone' ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Weight className="w-4 h-4 text-slate-400" />
          <span>{device.capacity_kg} kg</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Battery className="w-4 h-4 text-slate-400" />
          <span>{device.battery_autonomy}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 col-span-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="truncate">{device.address || `Lat: ${device.location_lat}, Lng: ${device.location_lng}`}</span>
        </div>
      </div>
    </div>
  );
}
