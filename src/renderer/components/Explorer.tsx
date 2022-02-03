import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import type { FC } from "react";
import { useCallback } from "react";
import { useAsync } from "react-use";
import { ipc } from "~/lib/ipc";

export const Explorer: FC = () => {
  const state = useAsync(async () => {
    const datasets = await ipc.invoke.getDatasets();
    return datasets;
  }, []);

  const handleClickItem = useCallback((datasetId: string) => {
    console.log(datasetId);
  }, []);

  console.log(state.value);

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
