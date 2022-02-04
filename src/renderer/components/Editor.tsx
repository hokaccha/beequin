import type { Editor as CodeMirrorEditor, EditorConfiguration } from "codemirror";
import type { FC } from "react";
import { useRef, useCallback } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import type { IUnControlledCodeMirror } from "react-codemirror2";
import { format } from "sql-formatter";

import "codemirror/addon/comment/comment";
import "codemirror/addon/display/autorefresh";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/sql-hint";
import "codemirror/addon/search/search";
import "codemirror/addon/runmode/colorize";
import "codemirror/keymap/vim";
import "codemirror/mode/sql/sql";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/hint/show-hint.css";

type Props = {
  defaultQuery: string;
  onChange: (query: string) => void;
  onExecute: () => void;
};

const DEFAULT_INDENT = 2;

const options: EditorConfiguration = {
  mode: "text/x-sql",
  keyMap: "vim", // Todo: configurable
  lineNumbers: true,
  indentUnit: DEFAULT_INDENT, // Todo: configurable
};

export const Editor: FC<Props> = ({ defaultQuery, onChange, onExecute }) => {
  const editorRef = useRef<CodeMirrorEditor | null>(null);
  const handleChange = useCallback<NonNullable<IUnControlledCodeMirror["onChange"]>>(
    (_editor, _data, value) => {
      onChange(value || "");
    },
    [onChange]
  );
  const handleDidMount = useCallback(
    (editor: CodeMirrorEditor) => {
      editorRef.current = editor;
      editor.setOption("extraKeys", {
        // Now supports only macOS
        "Cmd-Enter": () => {
          onExecute();
        },
        "Cmd-A": () => {
          editor.execCommand("selectAll");
        },
        "Cmd-/": () => {
          editor.execCommand("toggleComment");
        },
        "Shift-Cmd-F": (cm: CodeMirror.Editor) => {
          let formattedQuery: string | null = null;
          try {
            formattedQuery = format(cm.getValue(), {
              linesBetweenQueries: 2,
              indent: " ".repeat(cm.getOption("indentUnit") || DEFAULT_INDENT),
              uppercase: false,
            });
          } catch (err) {
            alert("Format failed😢");
            console.error(err);
          }
          if (formattedQuery) {
            cm.setValue(formattedQuery);
          }
        },
        Tab: (cm: CodeMirror.Editor) => {
          if (!cm.state.vim) {
            if (cm.getDoc().somethingSelected()) cm.execCommand("indentMore");
            else cm.replaceSelection(" ".repeat(cm.getOption("indentUnit") || DEFAULT_INDENT));
          } else if (cm.state.vim.insertMode) {
            cm.replaceSelection(" ".repeat(cm.getOption("indentUnit") || DEFAULT_INDENT));
          }
        },
      });
    },
    [onExecute]
  );

  return (
    <div className="Editor">
      <CodeMirror
        value={defaultQuery}
        onChange={handleChange}
        options={options}
        editorDidMount={handleDidMount}
      ></CodeMirror>
    </div>
  );
};
