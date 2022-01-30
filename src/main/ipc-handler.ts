import { BigQueryClient } from "./bigquery/client";
import { ipcMain } from "./ipc";

export function initIpc(): void {
  ipcMain.handle("executeQuery", async (_event, query) => {
    const client = new BigQueryClient({
      projectId: "bdash-316712",
      keyFilename: "/Users/hokaccha/.config/gcloud/bdash-local.json",
    });
    const result = await client.executeQuery(query);
    return result;
  });
}
