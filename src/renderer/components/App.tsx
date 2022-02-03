import { Box, Button, Flex } from "@chakra-ui/react";
import type { OnMount } from "@monaco-editor/react";
import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";

import { IoMdArrowDroprightCircle } from "react-icons/io";
import { Editor } from "./Editor";
import { Explorer } from "./Explorer";
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

  const dryRunQuery = useCallback(async (): Promise<void> => {
    const query = getCurrentQuery();
    if (!query) return;
    const response = await ipc.invoke.dryRunQuery(query);
    setQueryResult(response);
  }, [getCurrentQuery]);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        executeQuery();
      });
    },
    [executeQuery]
  );

  useEffect(() => {
    ipc.on.executeQueryFromMenu(() => {
      executeQuery();
    });
  }, [executeQuery]);

  return (
    <div>
      <Flex>
        <Box flex={1}>
          <Box height="50vh">
            <Editor defaultQuery={getCurrentQuery()} onChange={saveQuery} onMount={handleEditorDidMount} />
          </Box>
          <Flex bg="#efefef" width="100%" padding={2} gap={2}>
            <Button leftIcon={<IoMdArrowDroprightCircle />} size="sm" colorScheme="blue" onClick={executeQuery}>
              Run
            </Button>
            <Button leftIcon={<IoMdArrowDroprightCircle />} size="sm" colorScheme="blue" onClick={dryRunQuery}>
              Dry Run
            </Button>
          </Flex>
          <Box>{queryResult && <pre>{JSON.stringify(queryResult, null, 2)}</pre>}</Box>
        </Box>
        <Box width="300px">
          <Explorer />
        </Box>
      </Flex>
    </div>
  );
};
