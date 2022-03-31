import useSWR from "swr";
import type { IpcFromRenderer } from "~/../main/ipc";

// Defined in preload.ts
const ipc = window.ipc;
export { ipc };

type IpcName = keyof IpcFromRenderer;
type ExtractPromise<T> = T extends Promise<infer X> ? X : never;

export function useIpcInvoke<T extends IpcName>(
  name: T,
  ...args: Parameters<IpcFromRenderer[T]>
): ExtractPromise<ReturnType<IpcFromRenderer[T]>> {
  const { data, error } = useSWR(
    [name, ...args],
    async (name, ...args) => {
      // @ts-expect-error
      return ipc.invoke[name](...args);
    },
    { suspense: true }
  );
  if (error) {
    throw error;
  }

  return data as any;
}
