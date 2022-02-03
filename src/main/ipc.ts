import type { Dataset, DryRunResponse, QueryResponse } from "./bigquery/client";
import type { IpcFromMainHandler } from "./ipc-lib";
import { createIpc } from "./ipc-lib";

export type IpcFromRenderer = {
  executeQuery: (query: string) => Promise<QueryResponse>;
  dryRunQuery: (query: string) => Promise<DryRunResponse>;
  getDatasets: () => Promise<Dataset[]>;
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
    dryRunQuery: (query) => ipcRenderer.invoke("dryRunQuery", query),
    getDatasets: () => ipcRenderer.invoke("getDatasets"),
  },

  on: {
    executeQueryFromMenu: (listener) => ipcRenderer.on("executeQueryFromMenu", listener),
  },
};
