import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useDevices } from './useDevices';
import { useToast } from '../context/ToastContext';
import { useAudit } from './useAudit';

export interface Request {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  correo: string;
  origin: string;
  destination: string;
  weight_kg: number;
  size_vol: string;
  type: 'document' | 'small_package' | 'recording';
  status: 'pending' | 'assigned' | 'in_progress' | 'delivered' | 'cancelled';
  assigned_device_id?: string;
  qr_code?: string;
  created_at: string;
}

const MOCK_REQUESTS: Request[] = [
  {
    id: '1',
    user_id: 'user-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan.perez@javerianacali.edu.co',
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
    nombre: 'María',
    apellido: 'González',
    correo: 'maria.gonzalez@javerianacali.edu.co',
    origin: 'Library',
    destination: 'Sports Center',
    weight_kg: 0.2,
    size_vol: '10x5x1',
    type: 'document',
    status: 'in_progress',
    assigned_device_id: '1',
    qr_code: 'QR-123456',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const { devices, updateDeviceStatus } = useDevices();
  const { showToast } = useToast();
  const { logAction } = useAudit();
  const [qrModalData, setQrModalData] = useState<{ qrCode: string; request: Request } | null>(null);

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

  const createRequest = async (requestData: Omit<Request, 'id' | 'status' | 'created_at' | 'user_id' | 'qr_code'>) => {
    // RF6: Validation Logic
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
          qr_code: `QR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          created_at: new Date().toISOString(),
        };
        setRequests([newRequest, ...requests]);
        showToast('Request created successfully (Mock)', 'success');
        
        // Log audit
        await logAction('CREATE', 'requests', `Request from ${requestData.origin} to ${requestData.destination} by ${requestData.nombre} ${requestData.apellido}`);
        
        showToast('Request created successfully', 'success');
        
        return { error: null };
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      const qrCode = `QR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('requests')
        .insert([{ 
          ...requestData, 
          user_id: user?.id,
          status: 'pending',
          qr_code: qrCode,
        }])
        .select()
        .single();

      if (error) throw error;
      setRequests([data, ...requests]);
      showToast('Request created successfully', 'success');
      
      // Log audit
      await logAction('CREATE', 'requests', `Request from ${requestData.origin} to ${requestData.destination} by ${requestData.nombre} ${requestData.apellido}`);
      
      showToast('Request created successfully', 'success');
      
      return { error: null };
    } catch (err: any) {
      showToast('Failed to create request', 'error');
      return { error: err };
    }
  };

  const updateStatus = async (id: string, status: Request['status']) => {
    try {
      const request = requests.find(r => r.id === id);
      if (!request) return { error: { message: 'Request not found' } };

      let assignedDeviceId = request.assigned_device_id;
      
      // Auto-assign device when status changes to 'assigned'
      if (status === 'assigned' && !assignedDeviceId) {
        // Find available device with sufficient capacity
        const availableDevice = devices.find(
          d => d.status === 'available' && d.capacity_kg >= request.weight_kg
        );
        
        if (!availableDevice) {
          showToast('No available devices with sufficient capacity', 'error');
          return { error: { message: 'No available devices' } };
        }
        
        assignedDeviceId = availableDevice.id;
        
        // Update device status to busy
        await updateDeviceStatus(availableDevice.id, 'busy');
        showToast(`Device ${availableDevice.model} assigned and marked as busy`, 'success');
      }
      
      // Free device when status changes to 'delivered'
      if (status === 'delivered' && assignedDeviceId) {
        await updateDeviceStatus(assignedDeviceId, 'available');
        showToast('Device freed and marked as available', 'info');
      }
      
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
        setRequests(requests.map(r => 
          r.id === id ? { ...r, status, assigned_device_id: assignedDeviceId } : r
        ));
        showToast(`Request status updated to ${status}`, 'success');
        
        // Log audit
        await logAction('UPDATE', 'requests', `Status changed to ${status}${assignedDeviceId ? ` - Device assigned: ${assignedDeviceId}` : ''}`);
        
        // Show QR modal when assigned
        if (status === 'assigned' && request.qr_code) {
          setQrModalData({ qrCode: request.qr_code, request });
        }
        
        showToast(`Request status updated to ${status}`, 'success');
        
        return { error: null };
      }

      const updateData: any = { status };
      if (assignedDeviceId) {
        updateData.assigned_device_id = assignedDeviceId;
      }

      const { error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      setRequests(requests.map(r => 
        r.id === id ? { ...r, status, assigned_device_id: assignedDeviceId } : r
      ));
      
      // Log audit
      await logAction('UPDATE', 'requests', `Status changed to ${status}${assignedDeviceId ? ` - Device assigned: ${assignedDeviceId}` : ''}`);
      
      // Show QR modal when assigned
      if (status === 'assigned' && request.qr_code) {
        setQrModalData({ qrCode: request.qr_code, request });
      }
      
      showToast(`Request status updated to ${status}`, 'success');
      
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { 
    requests, 
    loading, 
    createRequest, 
    updateStatus, 
    refreshRequests: fetchRequests,
    qrModalData,
    setQrModalData,
  };
}
