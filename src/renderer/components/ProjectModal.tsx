import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import type { FC } from "react";
import { useState, useCallback } from "react";

import type { Project } from "~/../main/project/project";
import { ipc } from "~/lib/ipc";

export type OnChangeProjects = ({ project, type }: { project: Project; type: "create" | "update" | "delete" }) => void;

type Props = {
  project: Project | null;
  onClose: () => void;
  onChangeProjects: OnChangeProjects;
};

export const ProjectModal: FC<Props> = ({ project, onClose, onChangeProjects }) => {
  const isEditMode = !!project;
  const [projectId, setProjectId] = useState(project?.projectId || "");
  const [keyFilename, setKeyFilename] = useState<string>(project?.keyFilename || "");

  const handleChangeProjectId = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectId(event.target.value);
  }, []);

  const handleChangeKeyFilename = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyFilename(event.target.value);
  }, []);

  const handleCreate = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (!projectId) return;
      const project = await ipc.invoke.createProject({
        projectId,
        keyFilename,
      });
      onChangeProjects({ project, type: "create" });
      onClose();
    },
    [onClose, onChangeProjects, projectId, keyFilename]
  );

  const handleUpdate = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (!projectId) return;
      if (project === null) return;
      const newProject = {
        uuid: project.uuid,
        projectId,
        keyFilename,
      };
      await ipc.invoke.updateProject(newProject);
      onChangeProjects({ project: newProject, type: "update" });
      onClose();
    },
    [project, onClose, onChangeProjects, projectId, keyFilename]
  );

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Are you sure?")) return;
    if (project === null) return;
    await ipc.invoke.deleteProject(project.uuid);
    onChangeProjects({ project, type: "delete" });
    onClose();
  }, [project, onClose, onChangeProjects]);

  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{project ? "Edit Project" : "New Project"}</ModalHeader>
        <ModalCloseButton />
        <form>
          <ModalBody>
            <FormControl isRequired isInvalid={!projectId}>
              <FormLabel mb={2} htmlFor="projectIdInput">
                Project ID
              </FormLabel>
              <Input
                id="projectIdInput"
                defaultValue={projectId}
                onChange={handleChangeProjectId}
                autoFocus={!isEditMode}
              />
            </FormControl>
            <FormLabel mt={4} mb={2} htmlFor="keyFilenameInput">
              JSON Key File Path
            </FormLabel>
            <Input
              id="keyFilenameInput"
              value={keyFilename}
              onChange={handleChangeKeyFilename}
              placeholder="/Users/your_name/.config/gcloud/credentials.json"
            />
          </ModalBody>

          <ModalFooter>
            {isEditMode ? (
              <>
                <Button colorScheme="red" onClick={handleDelete}>
                  Delete
                </Button>
                <Button colorScheme="blue" ml={3} onClick={handleUpdate} type="submit">
                  Save
                </Button>
              </>
            ) : (
              <Button colorScheme="blue" onClick={handleCreate} type="submit">
                Create
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
