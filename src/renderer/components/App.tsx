import { Box, Button, Flex } from "@chakra-ui/react";
import { faSync, faChevronCircleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import prettyBytes from "pretty-bytes";
import type { FC } from "react";
import { useMemo, Suspense, useCallback, useEffect, useState } from "react";

import { Editor } from "./Editor";
import { Explorer } from "./Explorer";
import { Header } from "./Header";
import { QueryContent } from "./QueryContent";
import { QueryResult } from "./QueryResult";
import type { Project } from "~/../main/project/project";
import type { Setting } from "~/../main/setting/setting";
import { ipc } from "~/lib/ipc";
import type { Query } from "~/lib/query";
import { createQuery, QueryState, useQueryState, useQueryStorage } from "~/lib/query";

const STORAGE_KEY_CURRENT_PROJECT_UUID = "currentProjectUuid";

export const App: FC = () => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [setting, setSetting] = useState<Setting | null>(null);
  const [queries, setQueries] = useState<Query[]>(() => [createQuery()]);
  const [currentQueryId, setCurrentQueryId] = useState<string | null>(null);

  const currentQuery = useMemo(() => {
    return queries.find((q) => q.id === currentQueryId) || queries[0];
  }, [queries, currentQueryId]);

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

  const handleClickNewQuery = useCallback(() => {
    const newQuery = createQuery();
    const newQueries = queries.concat(newQuery);
    setQueries(newQueries);
  }, [queries]);

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
      {currentProject && (
        <Flex>
          <Box flex={1}>
            <Flex bg="gray.200">
              <Button size="xs" onClick={handleClickNewQuery}>
                +
              </Button>
              {queries.map((q) => (
                <Box
                  key={q.id}
                  onClick={() => setCurrentQueryId(q.id)}
                  fontSize={12}
                  px={4}
                  py={2}
                  bg={q.id === currentQueryId ? "gray.200" : "gray.300"}
                  borderLeft="1px"
                  borderColor="gray.400"
                  borderBottom={q.id === currentQueryId ? "3px" : "0px"}
                  borderBottomColor="blue.600"
                  borderBottomStyle="solid"
                  _last={{ borderRight: "1px", borderRightColor: "gray.400" }}
                >
                  {q.title}
                </Box>
              ))}
            </Flex>
            {queries.map((q) => (
              <Box key={q.id} display={q.id === currentQueryId ? "block" : "none"}>
                <QueryContent query={q} project={currentProject} setting={setting} />
              </Box>
            ))}
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
