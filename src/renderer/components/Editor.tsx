import { format } from "@hokaccha/sql-formatter";
import type { Monaco, OnChange, OnMount } from "@monaco-editor/react";
import MonacoEditor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { FC } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Setting } from "~/../main/setting/setting";
import { initVimMode } from "~/lib/monaco-vim";
import type CMAdapter from "~/lib/monaco-vim/cm_adapter";

type Props = {
  defaultQuery: string;
  setting: Setting;
  onChange: (query: string) => void;
  onExecute: () => void;
  onExecuteDryRun: () => void;
};

const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 16,
  minimap: { enabled: false },
  renderLineHighlight: "none",
  tabSize: 2,
  renderWhitespace: "all",
  scrollBeyondLastLine: false,
};

function getIndentUnit(indent: Setting["editor"]["indent"]) {
  switch (indent) {
    case "2space":
      return 2;
    case "4space":
      return 4;
  }
}

export const Editor: FC<Props> = ({ defaultQuery, setting, onChange, onExecute, onExecuteDryRun }) => {
  const vimModeRef = useRef<CMAdapter | null>(null);
  const [editorState, setEditorState] = useState<{ editor: editor.IStandaloneCodeEditor; monaco: Monaco } | null>(null);
  const handleChange: OnChange = useCallback(
    (value: string | undefined) => {
      onChange(value || "");
    },
    [onChange]
  );

  useEffect(() => {
    if (editorState === null) return;

    const { editor, monaco } = editorState;

    monaco.editor.defineTheme("beequin", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editorCursor.foreground": "#cccccc",
      },
    });
    monaco.editor.setTheme("beequin");

    if (vimModeRef.current !== null) {
      vimModeRef.current.dispose();
      vimModeRef.current = null;
    }

    if (setting.editor.mode === "vim") {
      vimModeRef.current = initVimMode(editor);
    }

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onExecute();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      onExecuteDryRun();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      let formattedQuery: string | null = null;
      const pos = editor.getPosition();
      try {
        formattedQuery = format(editor.getValue(), {
          linesBetweenQueries: 2,
          indent: " ".repeat(getIndentUnit(setting.editor.indent)),
          keywordCase: setting.formatter.keywordCase,
        });
      } catch (err) {
        alert("Format failed 😢");
        console.error(err);
      }
      const range = editor.getModel()?.getFullModelRange();
      if (formattedQuery && range) {
        editor.executeEdits(null, [{ range, text: formattedQuery }]);
        if (pos) editor.setPosition(pos);
      }
    });
  }, [onExecute, onExecuteDryRun, setting, editorState]);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    setEditorState({ editor, monaco });
  }, []);

  return (
    <MonacoEditor
      defaultValue={defaultQuery}
      language="sql"
      onChange={handleChange}
      options={defaultOptions}
      onMount={handleEditorDidMount}
    />
  );
};
