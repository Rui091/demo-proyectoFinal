import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useDevices } from './useDevices';
import { useToast } from '../context/ToastContext';
import { useAudit } from './useAudit';

export interface Request {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  weight_kg: number;
  size_vol: string;
  type: 'document' | 'small_package' | 'recording';
  status: 'pending' | 'assigned' | 'in_progress' | 'delivered' | 'cancelled';
  assigned_device_id?: string;
  created_at: string;
}

const MOCK_REQUESTS: Request[] = [
  {
    id: '1',
    user_id: 'user-1',
    origin: 'Admin Building',
    destination: 'Cafeteria',
    weight_kg: 1.5,
    size_vol: '20x20x20',
    type: 'small_package',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user-1',
    origin: 'Library',
    destination: 'Sports Center',
    weight_kg: 0.2,
    size_vol: '10x5x1',
    type: 'document',
    status: 'in_progress',
    assigned_device_id: '1',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const { devices } = useDevices();
  const { showToast } = useToast();
  const { logAction } = useAudit();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setRequests(MOCK_REQUESTS);
      } else {
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequests(MOCK_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: Omit<Request, 'id' | 'status' | 'created_at' | 'user_id'>) => {
    // RF6: Validation Logic
    // Check if any available device can handle this weight
    // Or if a specific device was requested (not in this simple form yet), check that.
    // Here we just check if there exists ANY device with capacity >= weight.
    // If not, we might warn, but maybe we still allow creation (pending).
    // However, RF6 says "Generate alert if request exceeds limits".
    
    const capableDevices = devices.filter(d => d.capacity_kg >= requestData.weight_kg);
    if (capableDevices.length === 0) {
      showToast('No devices available with sufficient capacity.', 'error');
      return { error: { message: 'No devices available with sufficient capacity for this weight.' } };
    }

    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
        const newRequest: Request = {
          ...requestData,
          id: Math.random().toString(36).substr(2, 9),
          user_id: 'current-user',
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        setRequests([newRequest, ...requests]);
        showToast('Request created successfully (Mock)', 'success');
        
        // Log audit
        await logAction('CREATE', 'requests', `Request from ${requestData.origin} to ${requestData.destination}`);
        
        return { error: null };
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('requests')
        .insert([{ 
          ...requestData, 
          user_id: user?.id,
          status: 'pending' 
        }])
        .select()
        .single();

      if (error) throw error;
      setRequests([data, ...requests]);
      showToast('Request created successfully', 'success');
      
      // Log audit
      await logAction('CREATE', 'requests', `Request from ${requestData.origin} to ${requestData.destination}`);
      
      return { error: null };
    } catch (err: any) {
      showToast('Failed to create request', 'error');
      return { error: err };
    }
  };

  const updateStatus = async (id: string, status: Request['status']) => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
        setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
        showToast(`Request status updated to ${status}`, 'success');
        
        // Log audit
        await logAction('UPDATE', 'requests', `Status changed to ${status}`);
        
        // Simulate Email Notification
        if (status === 'delivered' || status === 'assigned') {
             setTimeout(() => showToast(`Email notification sent to user about ${status} status`, 'info'), 1000);
        }
        return { error: null };
      }

      const { error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      
      // Log audit
      await logAction('UPDATE', 'requests', `Status changed to ${status}`);
      
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { requests, loading, createRequest, updateStatus, refreshRequests: fetchRequests };
}
