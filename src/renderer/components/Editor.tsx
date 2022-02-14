import type { Editor as CodeMirrorEditor, EditorConfiguration } from "codemirror";
import type { FC } from "react";
import { useEffect, useRef, useCallback } from "react";

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
import type { Setting } from "~/../main/setting/setting";

type Props = {
  defaultQuery: string;
  setting: Setting;
  onChange: (query: string) => void;
  onExecute: () => void;
  onExecuteDryRun: () => void;
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
  const options: EditorConfiguration = {
    mode: "text/x-sql",
    keyMap: setting.editor.mode,
    lineNumbers: true,
    indentUnit: getIndentUnit(setting.editor.indent),
    lineWrapping: setting.editor.lineWrapping,
  };

  const editorRef = useRef<CodeMirrorEditor | null>(null);

  const handleDidMount = useCallback((editor: CodeMirrorEditor) => {
    editorRef.current = editor;
  }, []);

  const handleChange = useCallback<NonNullable<IUnControlledCodeMirror["onChange"]>>(
    (_editor, _data, value) => {
      onChange(value || "");
    },
    [onChange]
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (editor === null) return;
    editor.setOption("extraKeys", {
      // Now supports only macOS
      "Cmd-Enter": () => {
        onExecute();
      },
      "Shift-Cmd-Enter": () => {
        onExecuteDryRun();
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
            indent: " ".repeat(getIndentUnit(setting.editor.indent)),
            uppercase: setting.formatter.convertKeywordToUppercase,
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
          else cm.replaceSelection(" ".repeat(getIndentUnit(setting.editor.indent)));
        } else if (cm.state.vim.insertMode) {
          cm.replaceSelection(" ".repeat(getIndentUnit(setting.editor.indent)));
        }
      },
    });
  }, [onExecute, onExecuteDryRun, setting.editor.indent, setting.formatter.convertKeywordToUppercase]);

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
