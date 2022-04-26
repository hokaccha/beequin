import { Box, Button, Flex } from "@chakra-ui/react";
import { faChevronCircleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import prettyBytes from "pretty-bytes";
import type { FC } from "react";
import { useCallback } from "react";
import { Editor } from "./Editor";
import { QueryResult } from "./QueryResult";
import type { Project } from "~/../main/project/project";
import type { Setting } from "~/../main/setting/setting";
import { ipc } from "~/lib/ipc";
import type { Query } from "~/lib/query";
import { useQueryState } from "~/lib/query";

type Props = {
  query: Query;
  project: Project;
  setting: Setting;
};

export const QueryContent: FC<Props> = ({ query, project, setting }) => {
  const queryState = useQueryState();
  const executeQuery = useCallback(async (): Promise<void> => {
    queryState.executeQuery(query.query, project.uuid);
  }, [project, queryState, query]);

  const dryRunQuery = useCallback(async (): Promise<void> => {
    const response = await ipc.invoke.dryRunQuery(query.query, project.uuid);
    window.alert(`This query will process bytes ${prettyBytes(Number(response.totalBytesProcessed))} when run`);
  }, [project, query]);

  const handleCancel = useCallback(() => {
    if (queryState.queryState?.status !== "running") return;
    const jobId = queryState.queryState.jobId;
    queryState.cancelQuery(jobId, project.uuid);
  }, [queryState, project]);

  const saveQuery = useCallback(() => {
    // todo
  }, []);

  // useEffect(() => {
  //   ipc.on.executeQueryFromMenu(() => {
  //     executeQuery();
  //   });
  // }, [executeQuery]);

  return (
    <Box flex={1}>
      <Box height="50vh">
        <Editor
          defaultQuery={query.query}
          setting={setting}
          onChange={saveQuery}
          onExecute={executeQuery}
          onExecuteDryRun={dryRunQuery}
        />
      </Box>
      <Flex bg="gray.200" width="full" padding={2} gap={2}>
        <Button
          leftIcon={<FontAwesomeIcon icon={faChevronCircleRight} />}
          size="sm"
          colorScheme="blue"
          onClick={executeQuery}
        >
          Run
        </Button>
        {queryState.queryState?.status === "running" && (
          <Button size="sm" colorScheme="blue" onClick={handleCancel}>
            Cancel
          </Button>
        )}
        <Button
          leftIcon={<FontAwesomeIcon icon={faChevronCircleRight} />}
          size="sm"
          colorScheme="blue"
          onClick={dryRunQuery}
        >
          Dry Run
        </Button>
      </Flex>
      <QueryResult queryState={queryState.queryState}></QueryResult>
    </Box>
  );
};
