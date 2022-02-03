import { BigQueryClient } from "./bigquery/client";
import { ipcMain } from "./ipc";

const setting = {
  projectId: "bdash-316712",
  keyFilename: "/Users/hokaccha/.config/gcloud/bdash-local.json",
};

export function initIpc(): void {
  ipcMain.handle("executeQuery", async (_event, query) => {
    const client = new BigQueryClient(setting);
    return client.executeQuery(query);
  });

  ipcMain.handle("dryRunQuery", async (_event, query) => {
    const client = new BigQueryClient(setting);
    return client.dryRunQuery(query);
  });

  ipcMain.handle("getDatasets", async () => {
    const client = new BigQueryClient(setting);
    return client.getDatasets();
  });
}
