import {
  Button,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from "@chakra-ui/react";
import type { FC } from "react";

import { ipc } from "~/lib/ipc";

type Props = {
  onClose: () => void;
};

export const GlobalSettingModal: FC<Props> = ({ onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Setting</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormLabel mt={4} mb={2}>
            Mode
          </FormLabel>
          <Select>
            <option>default</option>
            <option>vim</option>
          </Select>
          <FormLabel mt={4} mb={2}>
            Indent
          </FormLabel>
          <Select>
            <option>2 Space</option>
            <option>4 Space</option>
          </Select>
          <FormLabel mt={4} mb={2}>
            Line wrap
          </FormLabel>
          <Select>
            <option>wrap</option>
            <option>nowrap</option>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" ml={3}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
