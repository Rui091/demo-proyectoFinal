import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
  id: string;
  action: string;
  table_name: string;
  performed_by: string; // User ID
  user_full_name?: string; // User full name from profiles
  details: string;
  timestamp: string;
}

const MOCK_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    action: 'CREATE',
    table_name: 'requests',
    performed_by: 'user-id-1',
    user_full_name: 'Admin User',
    details: 'Created request #123456',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    action: 'UPDATE',
    table_name: 'devices',
    performed_by: 'user-id-1',
    user_full_name: 'Admin User',
    details: 'Updated status of DJI-M300-001 to busy',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '3',
    action: 'LOGIN',
    table_name: 'auth',
    performed_by: 'user-id-1',
    user_full_name: 'Admin User',
    details: 'User logged in with 2FA',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function useAudit() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setLogs(MOCK_LOGS);
      } else {
        const { data, error } = await supabase
          .from('audit_logs')
          .select(`
            *,
            profiles:performed_by (
              full_name
            )
          `)
          .order('timestamp', { ascending: false });

        if (error) throw error;
        
        // Transform data to include user_full_name
        const transformedLogs = (data || []).map((log: any) => ({
          ...log,
          user_full_name: log.profiles?.full_name || 'Unknown User',
        }));
        
        setLogs(transformedLogs);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setLogs(MOCK_LOGS);
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (action: string, table: string, details: string) => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
        const newLog: AuditLogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          action,
          table_name: table,
          performed_by: 'current-user',
          user_full_name: 'Current User',
          details,
          timestamp: new Date().toISOString(),
        };
        setLogs(prev => [newLog, ...prev]);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        action,
        table_name: table,
        performed_by: user?.id,
        details,
      }]);
    } catch (err) {
      console.error('Failed to log action:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, logAction, refreshLogs: fetchLogs };
}
