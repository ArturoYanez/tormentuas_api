import { useState, useEffect } from 'react';

export type UserRole = 'admin' | 'operator' | 'accountant' | 'user';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual Supabase role check using has_role function
    // For now using mock data
    const checkUserRole = async () => {
      try {
        // Simulated role check - in production this would call Supabase
        // const { data } = await supabase.rpc('has_role', { _user_id: auth.uid(), _role: 'admin' })
        
        // Mock: Check localStorage for demo purposes
        const mockRole = localStorage.getItem('userRole') as UserRole || 'user';
        setUserRole(mockRole);
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  return { userRole, loading, setUserRole };
};
