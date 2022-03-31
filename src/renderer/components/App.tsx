import { Box, Button, Flex } from "@chakra-ui/react";
import { faSync, faChevronCircleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import prettyBytes from "pretty-bytes";
import type { FC } from "react";
import { Suspense, useCallback, useEffect, useState } from "react";

import { Editor } from "./Editor";
import { Explorer } from "./Explorer";
import { Header } from "./Header";
import type { Project } from "~/../main/project/project";
import type { Setting } from "~/../main/setting/setting";
import { ipc } from "~/lib/ipc";
import { useQueryState, useQueryStorage } from "~/lib/query";

const STORAGE_KEY_CURRENT_PROJECT_UUID = "currentProjectUuid";

export const App: FC = () => {
  const { getCurrentQuery, saveQuery } = useQueryStorage();
  const queryState = useQueryState();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [setting, setSetting] = useState<Setting | null>(null);

  const executeQuery = useCallback(async (): Promise<void> => {
    const query = getCurrentQuery();
    if (!query || !currentProject) return;
    queryState.executeQuery(query, currentProject.uuid);
  }, [getCurrentQuery, currentProject, queryState]);

  const dryRunQuery = useCallback(async (): Promise<void> => {
    const query = getCurrentQuery();
    if (!query || !currentProject) return;
    const response = await ipc.invoke.dryRunQuery(query, currentProject.uuid);
    window.alert(`This query will process bytes ${prettyBytes(Number(response.totalBytesProcessed))} when run`);
  }, [getCurrentQuery, currentProject]);

  const handleChangeCurrentProject = useCallback((project: Project | null) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem(STORAGE_KEY_CURRENT_PROJECT_UUID, project?.uuid);
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_PROJECT_UUID);
    }
  }, []);

  const handleChangeSetting = useCallback(async (setting: Setting) => {
    await ipc.invoke.saveSetting(setting);
    setSetting(setting);
  }, []);

  const handleCancel = useCallback(() => {
    if (queryState.queryState?.status !== "running") return;
    if (currentProject === null) return;
    const jobId = queryState.queryState.jobId;
    queryState.cancelQuery(jobId, currentProject.uuid);
  }, [queryState, currentProject]);

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

  useEffect(() => {
    (async () => {
      const setting = await ipc.invoke.loadSetting();
      setSetting(setting);
    })();
  }, []);

  // TODO: loading
  if (setting === null) {
    return null;
  }

  return (
    <div>
      <Header
        onChangeCurrentProject={handleChangeCurrentProject}
        currentProject={currentProject}
        setting={setting}
        onChangeSetting={handleChangeSetting}
      />
      <Flex>
        <Box flex={1}>
          <Box height="50vh">
            <Editor
              defaultQuery={getCurrentQuery()}
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
          <Box>{queryState.queryState && <pre>{JSON.stringify(queryState.queryState, null, 2)}</pre>}</Box>
        </Box>
        <Box width={300}>
          {currentProject && (
            <Suspense
              fallback={
                <Box textAlign="center" pt={20} color="gray.400">
                  <FontAwesomeIcon size="lg" icon={faSync} spin />
                </Box>
              }
            >
              <Explorer project={currentProject} />
            </Suspense>
          )}
        </Box>
      </Flex>
    </div>
  );
};
