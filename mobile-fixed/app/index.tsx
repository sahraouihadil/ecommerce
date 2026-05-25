/**
 * Index — Entry point, redirects based on auth state
 * Fixed: added isLoading guard with a visible splash so users see progress,
 * and guests always land on the customer home screen.
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
      // Unauthenticated visitors browse the customer screens as guests
      router.replace('/(customer)');
      return;
    }

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

  // Show a branded splash while auth resolves — never shows a blank screen
  return <LoadingScreen message="Welcome to ARoom" />;
}
