import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
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
        <Box>Loading...</Box>
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
