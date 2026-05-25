/**
 * Index — Entry point, redirects based on auth state
 */

import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { LoadingScreen } from '../src/components/ui';

export default function Index() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Allow visitors to browse the customer screens without logging in
      router.replace('/(customer)');
      return;
    }

    // Route based on role
    switch (role) {
      case 'customer':
        router.replace('/(customer)');
        break;
      case 'deliveryman':
        router.replace('/(delivery)');
        break;
      case 'admin':
      case 'stock_manager':
      case 'marketing_manager':
      case 'accountant':
        router.replace('/(stubs)/admin');
        break;
      default:
        router.replace('/(customer)');
    }
  }, [isAuthenticated, isLoading, role]);

  return <LoadingScreen message="Welcome to ARoom" />;
}
