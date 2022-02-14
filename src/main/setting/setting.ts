import { promises as fs } from "fs";
import path from "path";
import { app } from "electron";
import { z } from "zod";

export const SettingSchema = z.object({
  editor: z
    .object({
      mode: z.enum(["default", "vim"]).default("default"),
      indent: z.enum(["2space", "4space"]).default("2space"),
      lineWrapping: z.boolean().default(false),
    })
    .default({}),
  formatter: z
    .object({
      convertKeywordToUppercase: z.boolean().default(false),
    })
    .default({}),
});

export type Setting = z.infer<typeof SettingSchema>;

function getConfigFilePath(): string {
  return path.join(app.getPath("userData"), "setting.json");
}

export function getDefaultSetting(): Setting {
  return SettingSchema.parse({});
}

export async function saveSetting(setting: Setting): Promise<void> {
  try {
    setting = SettingSchema.parse(setting);
  } catch (err) {
    console.warn(err);
    setting = getDefaultSetting();
  }
  await fs.writeFile(getConfigFilePath(), JSON.stringify(setting, null, 2));
}

export async function loadSetting(): Promise<Setting> {
  try {
    const str = await fs.readFile(getConfigFilePath(), "utf8");
    return SettingSchema.parse(JSON.parse(str)) as Setting;
  } catch (err) {
    if (err instanceof Error) {
      // File does not exist
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return getDefaultSetting();
      }
      // JSON Parse Error
      if (err.name === "SyntaxError") {
        console.warn(err);
        return getDefaultSetting();
      }
      // Schema validation error
      if (err.name === "ZodError") {
        console.warn(err);
        return getDefaultSetting();
      }
    }

    throw err;
  }
}
