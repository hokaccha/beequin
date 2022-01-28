import { ipcMain } from "./ipc";

export function initIpc(): void {
  ipcMain.handle("executeQuery", async (_event, query) => {
    console.log(query);
    return "ok";
  });
}
