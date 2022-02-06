import type { Dataset, DryRunResponse, QueryResponse } from "./bigquery/client";
import type { IpcFromMainHandler } from "./ipc-lib";
import { createIpc } from "./ipc-lib";
import type { Project } from "./project/project";

export type IpcFromRenderer = {
  executeQuery: (query: string, projectUuid: string) => Promise<QueryResponse>;
  dryRunQuery: (query: string, projectUuid: string) => Promise<DryRunResponse>;
  getDatasets: (projectUuid: string) => Promise<Dataset[]>;
  getProjects: () => Promise<Project[]>;
  getProject: (projectUuid: string) => Promise<Project | null>;
  createProject: (project: Omit<Project, "uuid">) => Promise<Project>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectUuid: string) => Promise<void>;
  validateProject: (project: Omit<Project, "uuid">) => Promise<boolean>;
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
    executeQuery: (query, projectUuid) => ipcRenderer.invoke("executeQuery", query, projectUuid),
    dryRunQuery: (query, projectUuid) => ipcRenderer.invoke("dryRunQuery", query, projectUuid),
    getDatasets: (projectUuid) => ipcRenderer.invoke("getDatasets", projectUuid),
    getProjects: () => ipcRenderer.invoke("getProjects"),
    getProject: (projectUuid: string) => ipcRenderer.invoke("getProject", projectUuid),
    createProject: (project: Omit<Project, "uuid">) => ipcRenderer.invoke("createProject", project),
    updateProject: (project: Project) => ipcRenderer.invoke("updateProject", project),
    deleteProject: (projectUuid: string) => ipcRenderer.invoke("deleteProject", projectUuid),
    validateProject: (project: Omit<Project, "uuid">) => ipcRenderer.invoke("validateProject", project),
  },

  on: {
    executeQueryFromMenu: (listener) => ipcRenderer.on("executeQueryFromMenu", listener),
  },
};
