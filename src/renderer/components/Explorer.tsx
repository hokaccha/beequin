import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { faSync, faTable } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { TableField } from "@google-cloud/bigquery";
import type { FC } from "react";
import { useState, useCallback } from "react";

import { useAsync } from "react-use";
import type { Project } from "~/../main/project/project";
import { ipc } from "~/lib/ipc";

type Props = {
  project: Project | null;
};

export const Explorer: FC<Props> = ({ project }) => {
  const state = useAsync(async () => {
    if (project === null) return null;
    const datasets = await ipc.invoke.getDatasets(project.uuid);
    return datasets;
  }, [project]);
  const [schema, setSchema] = useState<TableField[] | null>(null);

  const handleClickTable = useCallback(
    async (datasetId: string, tableId: string) => {
      if (project === null) return;
      const schema = await ipc.invoke.getTableSchema(project.uuid, datasetId, tableId);
      setSchema(schema);
    },
    [project]
  );

  if (state.loading) {
    return (
      <Box textAlign="center" pt={20} color="gray.400">
        <FontAwesomeIcon size="lg" icon={faSync} spin />
      </Box>
    );
  }

  if (state.error) {
    return <Box>Error: {state.error.message}</Box>;
  }

  return (
    <Box>
      <Accordion allowMultiple>
        {state.value?.map((dataset) => (
          <AccordionItem key={dataset.id}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {dataset.id}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <UnorderedList listStyleType="none">
                {dataset.tables.map((table) => (
                  <ListItem
                    key={table.id}
                    onClick={() => handleClickTable(dataset.id, table.id)}
                    cursor="pointer"
                    _hover={{ color: "blue.500" }}
                  >
                    <HStack>
                      <Box>
                        <FontAwesomeIcon icon={faTable} />
                      </Box>
                      <Box>{table.id}</Box>
                    </HStack>
                  </ListItem>
                ))}
              </UnorderedList>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      {schema && <pre>{JSON.stringify(schema, null, 2)}</pre>}
    </Box>
  );
};
