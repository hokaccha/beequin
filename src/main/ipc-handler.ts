import { BigQueryClient } from "./bigquery/client";
import { ipcMain } from "./ipc";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  validateProject,
  getProject,
} from "./project/project";
import { loadSetting, saveSetting } from "./setting/setting";

export function initIpc(): void {
  ipcMain.handle("executeQuery", async (_event, query, projectUuid) => {
    const project = await getProject(projectUuid);
    if (project === null) {
      throw new Error("project not found");
    }
    const client = new BigQueryClient(project);
    return client.executeQuery(query);
  });

  ipcMain.handle("dryRunQuery", async (_event, query, projectUuid) => {
    const project = await getProject(projectUuid);
    if (project === null) {
      throw new Error("project not found");
    }
    const client = new BigQueryClient(project);
    return client.dryRunQuery(query);
  });

  ipcMain.handle("getDatasets", async (_event, projectUuid) => {
    const project = await getProject(projectUuid);
    if (project === null) {
      throw new Error("project not found");
    }
    const client = new BigQueryClient(project);
    return client.getDatasets();
  });

  ipcMain.handle("getProjects", async () => {
    return getProjects();
  });

  ipcMain.handle("getProject", async (_event, projectUuid) => {
    return getProject(projectUuid);
  });

  ipcMain.handle("createProject", async (_event, project) => {
    return createProject(project);
  });

  ipcMain.handle("updateProject", async (_event, project) => {
    return updateProject(project);
  });

  ipcMain.handle("deleteProject", async (_event, projectUuid) => {
    return deleteProject(projectUuid);
  });

  ipcMain.handle("validateProject", async (_event, project) => {
    return validateProject(project);
  });

  ipcMain.handle("saveSetting", async (_event, setting) => {
    return saveSetting(setting);
  });

  ipcMain.handle("loadSetting", async () => {
    return loadSetting();
  });
}
