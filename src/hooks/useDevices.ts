import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { useAudit } from './useAudit';

export interface Device {
  id: string;
  model: string;
  type: 'robot' | 'drone';
  capacity_kg: number;
  battery_autonomy: string;
  serial_number: string;
  status: 'available' | 'busy' | 'maintenance';
  location_lat?: number;
  location_lng?: number;
  address?: string;
}

const MOCK_DEVICES: Device[] = [
  {
    id: '1',
    model: 'DJI Matrice 300',
    type: 'drone',
    capacity_kg: 2.7,
    battery_autonomy: '55 min',
    serial_number: 'DJI-M300-001',
    status: 'available',
    location_lat: 3.3487,
    location_lng: -76.5316,
    address: 'Edificio administrativo, PUJ Cali',
  },
  {
    id: '2',
    model: 'Boston Dynamics Spot',
    type: 'robot',
    capacity_kg: 14,
    battery_autonomy: '90 min',
    serial_number: 'SPOT-001',
    status: 'busy',
    location_lat: 3.3490,
    location_lng: -76.5310,
    address: 'Biblioteca, PUJ Cali',
  },
  {
    id: '3',
    model: 'DJI Mavic 3',
    type: 'drone',
    capacity_kg: 0.5,
    battery_autonomy: '46 min',
    serial_number: 'DJI-M3-002',
    status: 'maintenance',
    location_lat: 3.3485,
    location_lng: -76.5320,
    address: 'Facultad de Ingenieria, PUJ Cali',
  },
];

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { logAction } = useAudit();

  const fetchDevices = async () => {
    setLoading(true);
    try {
      // Try Supabase first
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
        // Mock mode
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
        setDevices(MOCK_DEVICES);
      } else {
        const { data, error } = await supabase
          .from('devices')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDevices(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching devices:', err);
      // Fallback to mock if Supabase fails (e.g. table doesn't exist yet)
      setDevices(MOCK_DEVICES);
      // setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async (device: Omit<Device, 'id' | 'status'>) => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
        const newDevice: Device = {
          ...device,
          id: Math.random().toString(36).substr(2, 9),
          status: 'available',
        };
        setDevices([newDevice, ...devices]);
        showToast('Device registered successfully (Mock)', 'success');
        
        // Log audit
        await logAction('CREATE', 'devices', `Device ${device.model} registered`);
        
        return { error: null };
      }

      const { data, error } = await supabase
        .from('devices')
        .insert([{ ...device, status: 'available' }])
        .select()
        .single();

      if (error) throw error;
      setDevices([data, ...devices]);
      showToast('Device registered successfully', 'success');
      
      // Log audit
      await logAction('CREATE', 'devices', `Device ${device.model} registered`);
      
      return { error: null };
    } catch (err: any) {
      showToast('Failed to register device', 'error');
      return { error: err };
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return { devices, loading, error, addDevice, refreshDevices: fetchDevices };
}
