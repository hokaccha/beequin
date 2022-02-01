import type { OnChange, OnMount } from "@monaco-editor/react";
import MonacoEditor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { FC } from "react";
import { useCallback } from "react";

type Props = {
  defaultQuery: string;
  onChange: (query: string) => void;
  onMount: OnMount;
};

const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 16,
  minimap: { enabled: false },
  renderLineHighlight: "none",
  tabSize: 2,
  renderWhitespace: "all",
  scrollBeyondLastLine: false,
};

export const Editor: FC<Props> = ({ defaultQuery, onChange, onMount }) => {
  const handleChange: OnChange = useCallback(
    (value: string | undefined) => {
      onChange(value || "");
    },
    [onChange]
  );

  return (
    <MonacoEditor
      defaultValue={defaultQuery}
      language="sql"
      onChange={handleChange}
      onMount={onMount}
      options={defaultOptions}
    />
  );
};
