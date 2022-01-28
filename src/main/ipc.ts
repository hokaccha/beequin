import type { IpcFromMainHandler } from "./ipc-lib";
import { createIpc } from "./ipc-lib";

export type IpcFromRenderer = {
  executeQuery: (query: string) => Promise<string>;
};

export type IpcFromMain = {
  executeQueryFromMenu: IpcFromMainHandler;
};

export type IPC = {
  invoke: IpcFromRenderer;
  on: IpcFromMain;
};

export const { ipcRenderer, ipcMain } = createIpc<IpcFromRenderer, IpcFromMain>();

export const ipc: IPC = {
  invoke: {
    executeQuery: (query) => ipcRenderer.invoke("executeQuery", query),
  },

  on: {
    executeQueryFromMenu: (listener) => ipcRenderer.on("executeQueryFromMenu", listener),
  },
};
