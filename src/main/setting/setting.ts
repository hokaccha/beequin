export type EditorSetting = {
  mode: "default" | "vim";
  indent: "2space" | "4space";
  lineWrap: "enabled" | "disabled";
};

export type Setting = {
  editor: EditorSetting;
};

export async function saveSetting() {
  return;
}

export async function loadSetting(): Promise<Setting> {
  return;
}
