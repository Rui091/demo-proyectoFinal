import React, { useState } from 'react';
import { Plus, Search, Filter, XCircle } from 'lucide-react';
import { useRequests, type Request } from '../hooks/useRequests';
import NewRequestModal from '../components/NewRequestModal';
import { QRCodeSVG } from 'qrcode.react';

export default function Requests() {
  const { requests, loading, refreshRequests, updateStatus } = useRequests();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter;
    const matchesSearch = req.origin.toLowerCase().includes(search.toLowerCase()) || 
                          req.destination.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-slate-100 text-slate-600';
      case 'assigned': return 'bg-blue-100 text-blue-600';
      case 'in_progress': return 'bg-amber-100 text-amber-600';
      case 'delivered': return 'bg-emerald-100 text-emerald-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Shipment Requests</h1>
          <p className="text-slate-500 mt-1">Manage and track delivery requests</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search origin or destination..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">ID</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Route</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Type</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Weight</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading requests...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No requests found.</td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500">#{req.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{req.origin}</span>
                        <span className="text-xs text-slate-500">to {req.destination}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{req.type.replace('_', ' ')}</td>
                    <td className="px-6 py-4">{req.weight_kg} kg</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {req.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(req.id, 'assigned')}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                          >
                            Assign
                          </button>
                        )}
                        {req.status === 'assigned' && (
                          <button 
                            onClick={() => updateStatus(req.id, 'in_progress')}
                            className="text-amber-600 hover:text-amber-800 font-medium text-xs"
                          >
                            Start
                          </button>
                        )}
                         {req.status === 'in_progress' && (
                          <button 
                            onClick={() => updateStatus(req.id, 'delivered')}
                            className="text-emerald-600 hover:text-emerald-800 font-medium text-xs"
                          >
                            Deliver
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal with QR Code */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Request Details</h2>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                  <QRCodeSVG value={`https://transport-sys.com/track/${selectedRequest.id}`} size={150} />
                  <p className="text-center text-xs text-slate-400 mt-2">Scan to Track</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Origin</span>
                  <span className="font-medium text-slate-900">{selectedRequest.origin}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Destination</span>
                  <span className="font-medium text-slate-900">{selectedRequest.destination}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Weight</span>
                  <span className="font-medium text-slate-900">{selectedRequest.weight_kg} kg</span>
                </div>
                 <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Size</span>
                  <span className="font-medium text-slate-900">{selectedRequest.size_vol}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshRequests}
      />
    </div>
  );
}
