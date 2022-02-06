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
  Text,
} from "@chakra-ui/react";
import type { FC } from "react";
import { useState, useCallback } from "react";

import type { Project } from "~/../main/project/project";
import { ipc } from "~/lib/ipc";

type Props = {
  project: Project | null;
  onClose: () => void;
  onChangeProjects: (args?: { createdProject?: Project; deletedProject?: Project }) => void;
};

export const ProjectModal: FC<Props> = ({ project, onClose, onChangeProjects }) => {
  const [projectId, setProjectId] = useState(project?.projectId || "");
  const [keyFilename, setKeyFilename] = useState<string>(project?.keyFilename || "");

  const handleChangeProjectId = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectId(event.target.value);
  }, []);

  const handleChangeKeyFilename = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyFilename(event.target.value);
  }, []);

  const handleCreate = useCallback(async () => {
    const project = await ipc.invoke.createProject({
      projectId,
      keyFilename,
    });
    onChangeProjects({ createdProject: project });
    onClose();
  }, [onClose, onChangeProjects, projectId, keyFilename]);

  const handleUpdate = useCallback(async () => {
    if (project === null) return;
    await ipc.invoke.updateProject({
      uuid: project.uuid,
      projectId,
      keyFilename,
    });
    onChangeProjects();
    onClose();
  }, [project, onClose, onChangeProjects, projectId, keyFilename]);

  const handleDelete = useCallback(async () => {
    if (project === null) return;
    await ipc.invoke.deleteProject(project.uuid);
    onChangeProjects({ deletedProject: project });
    onClose();
  }, [project, onClose, onChangeProjects]);

  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{project ? "Edit Project" : "New Project"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel mb={2} htmlFor="projectIdInput">
              Project ID
            </FormLabel>
            <Input id="projectIdInput" defaultValue={projectId} onChange={handleChangeProjectId} />
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
          {project ? (
            <>
              <Button colorScheme="red" onClick={handleDelete}>
                Delete
              </Button>
              <Button colorScheme="blue" ml={3} onClick={handleUpdate}>
                Save
              </Button>
            </>
          ) : (
            <Button colorScheme="blue" onClick={handleCreate}>
              Create
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
