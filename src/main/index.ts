import { join } from "path";
import { BrowserWindow, app } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import { initIpc } from "./ipc-handler";
import { initMenu } from "./menu";

app.on("ready", async () => {
  initMenu();
  initIpc();

  const port = process.env.PORT ? parseInt(process.env.PORT) : 18000;

  await prepareNext(
    {
      development: join(__dirname, "../../src/renderer"),
      production: join(__dirname, "../renderer"),
    },
    port
  );

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js"),
    },
  });

  const url = isDev ? `http://localhost:${port}/` : `file://${join(__dirname, "../renderer/out/index.html")}`;

  mainWindow.loadURL(url);
});

app.on("window-all-closed", app.quit);
