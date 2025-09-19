'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import type { DashboardStats } from '@/lib/types';

type DashboardStatsParams = {
  dateFrom?: string;
  dateTo?: string;
};

export interface DashboardStatsContextValue {
  data: DashboardStats | null;
  setData: Dispatch<SetStateAction<DashboardStats | null>>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  params: DashboardStatsParams;
  setParams: Dispatch<SetStateAction<DashboardStatsParams>>;
}

export const DashboardStatsContext = createContext<DashboardStatsContextValue | undefined>(undefined);

interface DashboardStatsProviderProps {
  children: React.ReactNode;
  initialData?: DashboardStats | null;
  isLoading?: boolean;
  error?: unknown;
  initialParams?: DashboardStatsParams;
  refetch?: () => void;
  value?: DashboardStatsContextValue;
}

const noop = () => {};

export function DashboardStatsProvider({
  children,
  initialData = null,
  isLoading = false,
  error = null,
  initialParams = {},
  refetch = noop,
  value,
}: DashboardStatsProviderProps) {
  const [data, setData] = useState<DashboardStats | null>(initialData);
  const [params, setParams] = useState<DashboardStatsParams>(initialParams);

  const contextValue = useMemo<DashboardStatsContextValue>(() => {
    if (value) {
      return value;
    }

    return {
      data,
      setData,
      isLoading,
      isError: Boolean(error),
      error,
      refetch,
      params,
      setParams,
    };
  }, [value, data, isLoading, error, refetch, params, setData, setParams]);

  return (
    <DashboardStatsContext.Provider value={contextValue}>
      {children}
    </DashboardStatsContext.Provider>
  );
}

export function useDashboardStats(): DashboardStatsContextValue {
  const context = useContext(DashboardStatsContext);

  if (!context) {
    throw new Error('useDashboardStats must be used within a DashboardStatsProvider');
  }

  return context;
}
