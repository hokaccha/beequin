import { Box, Button, Flex, Select, useDisclosure } from "@chakra-ui/react";
import type { FC } from "react";
import { useEffect, useState, useCallback } from "react";

import { IoSettingsSharp } from "react-icons/io5";
import { ProjectModal } from "./ProjectModal";
import type { OnChangeProjects } from "./ProjectModal";
import type { Project } from "~/../main/project/project";

import { ipc } from "~/lib/ipc";

type Props = {
  currentProject: Project | null;
  onChangeCurrentProject: (project: Project | null) => void;
};

export const Header: FC<Props> = ({ currentProject, onChangeCurrentProject }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [updateTargetProject, setUpdateTargetProject] = useState<Project | null>(currentProject);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    ipc.invoke.getProjects().then((projects) => setProjects(projects));
  }, []);

  const handleClickNewProject = useCallback(() => {
    setUpdateTargetProject(null);
    onOpen();
  }, [onOpen]);

  const handleClickSettingProject = useCallback(() => {
    setUpdateTargetProject(currentProject);
    onOpen();
  }, [currentProject, onOpen]);

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

  return (
    <Box bg="gray.100" padding={2}>
      <Flex gap={2}>
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
        {currentProject && (
          <Button size="sm" colorScheme="blue" onClick={handleClickSettingProject}>
            <IoSettingsSharp />
          </Button>
        )}
        <Button onClick={handleClickNewProject} colorScheme="green" size="sm">
          Create New Project
        </Button>
      </Flex>
      {isOpen && (
        <ProjectModal project={updateTargetProject} onClose={onClose} onChangeProjects={handleChangeProjects} />
      )}
    </Box>
  );
};
