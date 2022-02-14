import { Box, Button, Flex, Select, useDisclosure } from "@chakra-ui/react";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useEffect, useState, useCallback } from "react";

import { ProjectModal } from "./ProjectModal";
import type { OnChangeProjects } from "./ProjectModal";
import { SettingModal } from "./SettingModal";
import type { Project } from "~/../main/project/project";

import type { Setting } from "~/../main/setting/setting";
import { ipc } from "~/lib/ipc";

type Props = {
  currentProject: Project | null;
  onChangeCurrentProject: (project: Project | null) => void;
  setting: Setting;
  onChangeSetting: (setting: Setting) => void;
};

export const Header: FC<Props> = ({ currentProject, onChangeCurrentProject, setting, onChangeSetting }) => {
  const projectModalDisclosure = useDisclosure();
  const settingModalDisclosure = useDisclosure();
  const [updateTargetProject, setUpdateTargetProject] = useState<Project | null>(currentProject);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    ipc.invoke.getProjects().then((projects) => setProjects(projects));
  }, []);

  const handleClickNewProject = useCallback(() => {
    setUpdateTargetProject(null);
    projectModalDisclosure.onOpen();
  }, [projectModalDisclosure]);

  const handleClickEditProject = useCallback(() => {
    setUpdateTargetProject(currentProject);
    projectModalDisclosure.onOpen();
  }, [currentProject, projectModalDisclosure]);

  const handleChangeProject = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const uuid = event.target.value;
      const project = projects.find((p) => p.uuid === uuid) || null;
      onChangeCurrentProject(project);
    },
    [onChangeCurrentProject, projects]
  );

  const handleChangeProjects = useCallback<OnChangeProjects>(
    async ({ project, type }) => {
      const projects = await ipc.invoke.getProjects();
      setProjects(projects);

      switch (type) {
        case "create":
        case "update":
          onChangeCurrentProject(project);
          break;
        case "delete":
          if (currentProject && project.uuid === currentProject.uuid) {
            onChangeCurrentProject(projects[0] || null);
          }
          break;
      }
    },
    [currentProject, onChangeCurrentProject]
  );

  const handleClickSetting = useCallback(() => {
    settingModalDisclosure.onOpen();
  }, [settingModalDisclosure]);

  return (
    <Box bg="gray.100" padding={2}>
      <Flex gap={2}>
        <Box>
          {projects.length !== 0 && (
            <Select
              w="auto"
              onChange={handleChangeProject}
              placeholder={currentProject ? undefined : "Select Project"}
              value={currentProject?.uuid}
            >
              {projects.map((project) => (
                <option key={project.uuid} value={project.uuid}>
                  {project.projectId}
                </option>
              ))}
            </Select>
          )}
        </Box>
        {currentProject && (
          <Box display="flex" alignItems="center">
            <Button size="sm" bg="gray.300" color="gray.800" onClick={handleClickEditProject}>
              <FontAwesomeIcon icon={faCog} />
            </Button>
          </Box>
        )}
        <Box display="flex" alignItems="center">
          <Button onClick={handleClickNewProject} colorScheme="green" size="sm">
            Create New Project
          </Button>
        </Box>
      </Flex>
      <Box position="absolute" right={4} top={3}>
        <Button size="sm" bg="gray.300" color="gray.800" onClick={handleClickSetting}>
          <FontAwesomeIcon icon={faCog} />
        </Button>
      </Box>
      {projectModalDisclosure.isOpen && (
        <ProjectModal
          project={updateTargetProject}
          onClose={projectModalDisclosure.onClose}
          onChangeProjects={handleChangeProjects}
        />
      )}
      {settingModalDisclosure.isOpen && (
        <SettingModal onClose={settingModalDisclosure.onClose} setting={setting} onChangeSetting={onChangeSetting} />
      )}
    </Box>
  );
};
