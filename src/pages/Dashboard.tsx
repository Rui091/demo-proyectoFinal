import React from 'react';
import { Truck, Package, Activity, AlertCircle } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import { useRequests } from '../hooks/useRequests';
import DeviceMap from '../components/DeviceMap';

export default function Dashboard() {
  const { devices } = useDevices();
  const { requests } = useRequests();

  const stats = [
    {
      label: 'Total Devices',
      value: devices.length,
      icon: Truck,
      color: 'bg-blue-500',
      subtext: `${devices.filter(d => d.status === 'available').length} Available`
    },
    {
      label: 'Active Requests',
      value: requests.filter(r => ['pending', 'assigned', 'in_progress'].includes(r.status)).length,
      icon: Package,
      color: 'bg-emerald-500',
      subtext: `${requests.filter(r => r.status === 'pending').length} Pending`
    },
    {
      label: 'Completed Deliveries',
      value: requests.filter(r => r.status === 'delivered').length,
      icon: Activity,
      color: 'bg-indigo-500',
      subtext: 'All time'
    },
    {
      label: 'Issues / Alerts',
      value: devices.filter(d => d.status === 'maintenance').length,
      icon: AlertCircle,
      color: 'bg-amber-500',
      subtext: 'Devices in maintenance'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Real-time overview of transport operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Live Device Tracking</h3>
          <div className="h-[400px]">
            <DeviceMap devices={devices} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {requests.slice(0, 5).map(req => (
              <div key={req.id} className="flex items-start gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                  req.status === 'pending' ? 'bg-slate-400' :
                  req.status === 'in_progress' ? 'bg-amber-500' :
                  req.status === 'delivered' ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Request #{req.id.slice(0, 6)} - {req.status.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {req.origin} → {req.destination}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(req.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
