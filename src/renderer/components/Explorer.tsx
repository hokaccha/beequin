import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";
import { useCallback } from "react";
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

  const handleClickItem = useCallback((datasetId: string) => {
    console.info(datasetId);
  }, []);

  return (
    <Box>
      {state.loading ? (
        <Box textAlign="center" pt={20} color="gray.400">
          <FontAwesomeIcon size="lg" icon={faSync} spin />
        </Box>
      ) : state.error ? (
        <Box>Error: {state.error.message}</Box>
      ) : (
        <UnorderedList>
          {state.value?.map((dataset) => (
            <ListItem key={dataset.id} onClick={() => handleClickItem(dataset.id)}>
              {dataset.id}
              <UnorderedList>
                {dataset.tables.map((table) => (
                  <ListItem key={table.id}>{table.id}</ListItem>
                ))}
              </UnorderedList>
            </ListItem>
          ))}
        </UnorderedList>
      )}
    </Box>
  );
};
