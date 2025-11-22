import React, { useState } from 'react';
import { Search, Filter, Clock, User, Database } from 'lucide-react';
import { useAudit } from '../hooks/useAudit';

export default function AuditLog() {
  const { logs, loading } = useAudit();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.action === filter;
    const matchesSearch = log.details.toLowerCase().includes(search.toLowerCase()) || 
                          log.performed_by.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-slate-500 mt-1">System-wide activity monitoring and traceability</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
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
            <option value="all">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Timestamp</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Action</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Entity</th>
                <th className="px-6 py-4 font-semibold text-slate-700">User</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No logs found.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                        log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Database className="w-4 h-4" />
                        <span className="capitalize">{log.table_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">{log.performed_by}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
