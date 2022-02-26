import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { faSync, faTable, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { TableField } from "@google-cloud/bigquery";
import type { FC } from "react";
import { useMemo, useState, useCallback } from "react";

import { useAsync } from "react-use";
import type { Table } from "~/../main/bigquery/client";
import type { Project } from "~/../main/project/project";
import { ipc } from "~/lib/ipc";

type Props = {
  project: Project | null;
};

export const Explorer: FC<Props> = ({ project }) => {
  const datasets = useAsync(async () => {
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

  const [filterText, setFilterText] = useState("");

  const tablesByDatabaseId = useMemo<Record<string, Table[]>>(() => {
    if (!datasets.value) return {};

    const ret: Record<string, Table[]> = {};

    for (const dataset of datasets.value) {
      ret[dataset.id] = dataset.tables.filter((table) => {
        return table.id.includes(filterText);
      });
    }

    return ret;
  }, [datasets.value, filterText]);

  const handleChangeFilter = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setFilterText(text);
  }, []);

  if (datasets.loading) {
    return (
      <Box textAlign="center" pt={20} color="gray.400">
        <FontAwesomeIcon size="lg" icon={faSync} spin />
      </Box>
    );
  }

  if (datasets.error) {
    return <Box>Error: {datasets.error.message}</Box>;
  }

  return (
    <Box>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <FontAwesomeIcon icon={faSearch} color="gray.300" />
        </InputLeftElement>
        <Input type="search" placeholder="Filter by table name" onChange={handleChangeFilter} />
      </InputGroup>
      <Accordion allowMultiple>
        {datasets.value?.map((dataset) => (
          <AccordionItem key={dataset.id}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {dataset.id} ({(tablesByDatabaseId[dataset.id] || []).length})
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <UnorderedList listStyleType="none">
                {(tablesByDatabaseId[dataset.id] || []).map((table) => (
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
