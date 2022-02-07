import { Box, Button, Flex } from "@chakra-ui/react";
import { faChevronCircleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";

import { Editor } from "./Editor";
import { Explorer } from "./Explorer";
import { Header } from "./Header";
import type { Project } from "~/../main/project/project";
import { ipc } from "~/lib/ipc";
import { useQueryStorage } from "~/lib/query";

const STORAGE_KEY_CURRENT_PROJECT_UUID = "currentProjectUuid";

export const App: FC = () => {
  const { getCurrentQuery, saveQuery } = useQueryStorage();
  const [queryResult, setQueryResult] = useState<any>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const executeQuery = useCallback(async (): Promise<void> => {
    const query = getCurrentQuery();
    if (!query || !currentProject) return;
    const response = await ipc.invoke.executeQuery(query, currentProject.uuid);
    setQueryResult(response);
  }, [getCurrentQuery, currentProject]);

  const dryRunQuery = useCallback(async (): Promise<void> => {
    const query = getCurrentQuery();
    if (!query || !currentProject) return;
    const response = await ipc.invoke.dryRunQuery(query, currentProject.uuid);
    setQueryResult(response);
  }, [getCurrentQuery, currentProject]);

  const handleChangeCurrentProject = useCallback((project: Project | null) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem(STORAGE_KEY_CURRENT_PROJECT_UUID, project?.uuid);
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_PROJECT_UUID);
    }
  }, []);

  useEffect(() => {
    ipc.on.executeQueryFromMenu(() => {
      executeQuery();
    });
  }, [executeQuery]);

  useEffect(() => {
    (async () => {
      const projects = await ipc.invoke.getProjects();
      const uuid = localStorage.getItem(STORAGE_KEY_CURRENT_PROJECT_UUID);
      const savedProject = projects.find((p) => p.uuid === uuid) || null;
      setCurrentProject(savedProject);
    })();
  }, []);

  return (
    <div>
      <Header onChangeCurrentProject={handleChangeCurrentProject} currentProject={currentProject} />
      <Flex>
        <Box flex={1}>
          <Box height="50vh">
            <Editor
              defaultQuery={getCurrentQuery()}
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
            <Button
              leftIcon={<FontAwesomeIcon icon={faChevronCircleRight} />}
              size="sm"
              colorScheme="blue"
              onClick={dryRunQuery}
            >
              Dry Run
            </Button>
          </Flex>
          <Box>{queryResult && <pre>{JSON.stringify(queryResult, null, 2)}</pre>}</Box>
        </Box>
        <Box width={300}>
          <Explorer project={currentProject} />
        </Box>
      </Flex>
    </div>
  );
};
