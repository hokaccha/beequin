import { Box, Button, Flex } from "@chakra-ui/react";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { Suspense, useCallback, useEffect, useState } from "react";

import { Explorer } from "./Explorer";
import { Header } from "./Header";
import { QueryContent } from "./QueryContent";
import type { Project } from "~/../main/project/project";
import type { Setting } from "~/../main/setting/setting";
import { ipc } from "~/lib/ipc";
import { useAppContext } from "~/lib/useAppState";

const STORAGE_KEY_CURRENT_PROJECT_UUID = "currentProjectUuid";

export const Main: FC = () => {
  const {
    restoreProject,
    getCurrentProject,
    setCurrentProject,
    getCurrentProjectQueries,
    getCurrentQuery,
    setCurrentQuery,
    createQuery,
  } = useAppContext();
  const [setting, setSetting] = useState<Setting | null>(null);

  const currentProject = getCurrentProject();
  const currentQuery = getCurrentQuery();
  const queries = getCurrentProjectQueries();

  const handleChangeCurrentProject = useCallback(
    (project: Project | null) => {
      setCurrentProject(project?.uuid ?? null);
      if (project) {
        localStorage.setItem(STORAGE_KEY_CURRENT_PROJECT_UUID, project?.uuid);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_PROJECT_UUID);
      }
    },
    [setCurrentProject]
  );

  const handleChangeSetting = useCallback(async (setting: Setting) => {
    await ipc.invoke.saveSetting(setting);
    setSetting(setting);
  }, []);

  useEffect(() => {
    (async () => {
      const projects = await ipc.invoke.getProjects();
      const projectsWithQuery = projects.map((p) => {
        return Object.assign(p, { queries: [], currentQueryId: null });
      });
      const uuid = localStorage.getItem(STORAGE_KEY_CURRENT_PROJECT_UUID);
      restoreProject(projectsWithQuery, uuid);
    })();
  }, [restoreProject]);

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
      {currentProject && (
        <Flex>
          <Box flex={1}>
            <Flex bg="gray.200">
              <Button size="xs" onClick={createQuery}>
                +
              </Button>
              {queries.map((q) => (
                <Box
                  key={q.id}
                  onClick={() => setCurrentQuery(q.id)}
                  fontSize={12}
                  px={4}
                  py={2}
                  bg={q.id === currentQuery?.id ? "gray.300" : "gray.200"}
                  borderLeft="1px"
                  borderColor="gray.400"
                  borderBottom={q.id === currentQuery?.id ? "3px" : "0px"}
                  borderBottomColor="blue.600"
                  borderBottomStyle="solid"
                  _last={{ borderRight: "1px", borderRightColor: "gray.400" }}
                >
                  {q.title}
                </Box>
              ))}
            </Flex>
            {currentQuery && <QueryContent query={currentQuery} project={currentProject} setting={setting} />}
          </Box>
          <Box width={300}>
            <Suspense
              fallback={
                <Box textAlign="center" pt={20} color="gray.400">
                  <FontAwesomeIcon size="lg" icon={faSync} spin />
                </Box>
              }
            >
              <Explorer project={currentProject} />
            </Suspense>
          </Box>
        </Flex>
      )}
    </div>
  );
};
