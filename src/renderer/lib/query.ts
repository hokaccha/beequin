import { useCallback, useRef, useState } from "react";
import { ipc } from "./ipc";
import type { JobResult } from "~/../main/bigquery/client";

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

type QueryState =
  | {
      status: "running";
      jobId: string;
    }
  | {
      status: "completed";
      result: JobResult;
    }
  | {
      status: "canceled";
      jobId: string;
    }
  | {
      status: "error";
      message: string;
    };

export function useQueryState() {
  const [queryState, setState] = useState<QueryState | null>(null);

  const executeQuery = useCallback(async (query: string, projectUuid: string): Promise<void> => {
    const { jobId } = await ipc.invoke.executeQuery(query, projectUuid);
    setState({
      status: "running",
      jobId: jobId,
    });

    let result: JobResult;
    try {
      result = await ipc.invoke.getJobResult(jobId, projectUuid);
    } catch (err) {
      // TODO: Use custom error class
      if (err instanceof Error && err.message.includes("This job has already been canceled")) {
        return;
      }

      throw err;
    }

    setState({
      status: "completed",
      result: result,
    });
  }, []);

  const cancelQuery = useCallback(async (jobId: string, projectUuid: string): Promise<void> => {
    setState({
      status: "canceled",
      jobId,
    });
    ipc.invoke.cancelQuery(jobId, projectUuid);
  }, []);

  return { queryState, executeQuery, cancelQuery };
}
