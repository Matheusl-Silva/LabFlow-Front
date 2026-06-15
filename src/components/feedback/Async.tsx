"use client";

import type { UseQueryResult } from "@tanstack/react-query";

interface AsyncProps<T> {
  query: UseQueryResult<T, Error>;
  loading: React.ReactNode;
  error: (refetch: () => void, err: Error) => React.ReactNode;
  empty?: (data: T) => React.ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

/**
 * Render-props para consumir um React Query sem repetir o switch
 * isLoading / isError / empty / content em cada página.
 */
export function Async<T>({
  query,
  loading,
  error,
  empty,
  isEmpty,
  children,
}: AsyncProps<T>) {
  if (query.isLoading) return <>{loading}</>;

  if (query.isError) {
    return <>{error(() => void query.refetch(), query.error)}</>;
  }

  const data = query.data as T;
  if (empty && isEmpty?.(data)) return <>{empty(data)}</>;

  return <>{children(data)}</>;
}
