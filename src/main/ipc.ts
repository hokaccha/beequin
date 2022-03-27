import type { TableField } from "@google-cloud/bigquery";
import type { Dataset, DryRunResult, ExecuteQueryResult, JobResult } from "./bigquery/client";
import type { IpcFromMainHandler } from "./ipc-lib";
import { createIpc } from "./ipc-lib";
import type { Project } from "./project/project";
import type { Setting } from "./setting/setting";

export type IpcFromRenderer = {
  executeQuery: (query: string, projectUuid: string) => Promise<ExecuteQueryResult>;
  getJobResult: (jobId: string, projectUuid: string) => Promise<JobResult>;
  cancelQuery: (jobId: string, projectUuid: string) => Promise<void>;
  dryRunQuery: (query: string, projectUuid: string) => Promise<DryRunResult>;
  getDatasets: (projectUuid: string) => Promise<Dataset[]>;
  getTableSchema: (projectUuid: string, datasetId: string, tableId: string) => Promise<TableField[]>;
  getProjects: () => Promise<Project[]>;
  getProject: (projectUuid: string) => Promise<Project | null>;
  createProject: (project: Omit<Project, "uuid">) => Promise<Project>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectUuid: string) => Promise<void>;
  validateProject: (project: Omit<Project, "uuid">) => Promise<boolean>;
  saveSetting: (setting: Setting) => Promise<void>;
  loadSetting: () => Promise<Setting>;
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
    getJobResult: (jobId, projectUuid) => ipcRenderer.invoke("getJobResult", jobId, projectUuid),
    cancelQuery: (jobId, projectUuid) => ipcRenderer.invoke("cancelQuery", jobId, projectUuid),
    dryRunQuery: (query, projectUuid) => ipcRenderer.invoke("dryRunQuery", query, projectUuid),
    getDatasets: (projectUuid) => ipcRenderer.invoke("getDatasets", projectUuid),
    getTableSchema: (projectUuid, datasetId, tableId) =>
      ipcRenderer.invoke("getTableSchema", projectUuid, datasetId, tableId),
    getProjects: () => ipcRenderer.invoke("getProjects"),
    getProject: (projectUuid: string) => ipcRenderer.invoke("getProject", projectUuid),
    createProject: (project: Omit<Project, "uuid">) => ipcRenderer.invoke("createProject", project),
    updateProject: (project: Project) => ipcRenderer.invoke("updateProject", project),
    deleteProject: (projectUuid: string) => ipcRenderer.invoke("deleteProject", projectUuid),
    validateProject: (project: Omit<Project, "uuid">) => ipcRenderer.invoke("validateProject", project),
    saveSetting: (setting: Setting) => ipcRenderer.invoke("saveSetting", setting),
    loadSetting: () => ipcRenderer.invoke("loadSetting"),
  },

  on: {
    executeQueryFromMenu: (listener) => ipcRenderer.on("executeQueryFromMenu", listener),
  },
};
