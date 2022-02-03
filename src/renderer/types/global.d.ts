import type { IPC } from "../../main/ipc";

declare global {
  interface Window {
    ipc: IPC;
  }
}
