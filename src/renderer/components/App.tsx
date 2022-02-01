import { Box, Button } from "@chakra-ui/react";
import type { OnMount } from "@monaco-editor/react";
import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";

import { IoMdArrowDroprightCircle } from "react-icons/io";
import { Editor } from "./Editor";
import { ipc } from "~/lib/ipc";
import { useQueryStorage } from "~/lib/query";

export const App: FC = () => {
  const { getCurrentQuery, saveQuery } = useQueryStorage();
  const [queryResult, setQueryResult] = useState<any>(null);

  const executeQuery = useCallback(async (): Promise<void> => {
    const query = getCurrentQuery();
    if (!query) return;
    const response = await ipc.invoke.executeQuery(query);
    setQueryResult(response);
  }, [getCurrentQuery]);

  useEffect(() => {
    ipc.on.executeQueryFromMenu(() => {
      executeQuery();
    });
  }, [executeQuery]);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        executeQuery();
      });
    },
    [executeQuery]
  );

  return (
    <div>
      <Box height="50vh">
        <Editor defaultQuery={getCurrentQuery()} onChange={saveQuery} onMount={handleEditorDidMount} />
      </Box>
      <Box bg="#efefef" width="100%" padding={4}>
        <Button leftIcon={<IoMdArrowDroprightCircle />} colorScheme="blue" onClick={executeQuery}>
          Run
        </Button>
      </Box>
      <Box>{queryResult && <pre>{JSON.stringify(queryResult, null, 2)}</pre>}</Box>
    </div>
  );
};
