import { useCallback, useRef } from "react";

const STORAGE_KEY = "CURRENT_QUERY";

export function useQueryStorage() {
  const defaultValue = localStorage.getItem(STORAGE_KEY) || "";
  const queryRef = useRef(defaultValue);
  const getCurrentQuery = useCallback((): string => {
    return queryRef.current;
  }, []);
  const saveQuery = useCallback((query: string): void => {
    queryRef.current = query;
    localStorage.setItem(STORAGE_KEY, query);
  }, []);
  return { getCurrentQuery, saveQuery };
}
