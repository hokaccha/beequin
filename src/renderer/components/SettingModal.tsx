import {
  Box,
  Checkbox,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import merge from "deepmerge";
import type { FC } from "react";
import { useCallback } from "react";
import type { Setting } from "~/../main/setting/setting";

import { ipc } from "~/lib/ipc";

type Props = {
  onClose: () => void;
  setting: Setting;
  onChangeSetting: (setting: Setting) => void;
};

export const SettingModal: FC<Props> = ({ onClose, setting, onChangeSetting }) => {
  const handleChange = useCallback(
    (value) => {
      const newSetting = merge(setting, value);
      onChangeSetting(newSetting);
    },
    [setting, onChangeSetting]
  );
  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Setting</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mt={4} mb={4}>
            <Heading as="h2" borderBottom="1px solid gray" fontSize={24} pb={2} mb={4}>
              Editor
            </Heading>
            <Heading as="h3" fontSize={16} mb={2} mt={4}>
              Mode
            </Heading>
            <RadioGroup value={setting.editor.mode} onChange={(value) => handleChange({ editor: { mode: value } })}>
              <Stack spacing={5} direction="row">
                <Radio colorScheme="green" value="default">
                  Default
                </Radio>
                <Radio colorScheme="green" value="vim">
                  Vim
                </Radio>
              </Stack>
            </RadioGroup>
            <Heading as="h3" fontSize={16} mb={2} mt={4}>
              Indent
            </Heading>
            <RadioGroup value={setting.editor.indent} onChange={(value) => handleChange({ editor: { indent: value } })}>
              <Stack spacing={5} direction="row">
                <Radio colorScheme="green" value="2space">
                  2 space
                </Radio>
                <Radio colorScheme="green" value="4space">
                  4 space
                </Radio>
              </Stack>
            </RadioGroup>
            <Heading as="h3" fontSize={16} mb={2} mt={4}>
              Line wrapping
            </Heading>
            <Checkbox
              colorScheme="green"
              isChecked={setting.editor.lineWrapping}
              onChange={(e) => handleChange({ editor: { lineWrapping: e.target.checked } })}
            >
              Enable line wrapping
            </Checkbox>
          </Box>

          <Box mt={4} mb={4}>
            <Heading as="h2" borderBottom="1px solid gray" fontSize={24} pb={2} mb={4}>
              Formatter
            </Heading>
            <Heading as="h3" fontSize={16} mb={2} mt={4}>
              Uppercase
            </Heading>
            <Checkbox
              colorScheme="green"
              isChecked={setting.formatter.convertKeywordToUppercase}
              onChange={(e) => handleChange({ formatter: { convertKeywordToUppercase: e.target.checked } })}
            >
              Convert SQL keywords to uppercase
            </Checkbox>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
