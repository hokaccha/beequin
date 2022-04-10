export function indent(config: any, model: any, selections: any | null): any {
  if (model === null || selections === null) {
    return [];
  }

  const commands: any = [];
  for (let i = 0, len = selections.length; i < len; i++) {
    commands[i] = new ShiftCommand(selections[i], {
      isUnshift: false,
      tabSize: config.tabSize,
      indentSize: config.indentSize,
      insertSpaces: config.insertSpaces,
      useTabStops: config.useTabStops,
      autoIndent: config.autoIndent
    }, config.languageConfigurationService);
  }
  return commands;
}

public static outdent(config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[]): ICommand[] {
  const commands: ICommand[] = [];
  for (let i = 0, len = selections.length; i < len; i++) {
    commands[i] = new ShiftCommand(selections[i], {
      isUnshift: true,
      tabSize: config.tabSize,
      indentSize: config.indentSize,
      insertSpaces: config.insertSpaces,
      useTabStops: config.useTabStops,
      autoIndent: config.autoIndent
    }, config.languageConfigurationService);
  }
  return commands;
}
