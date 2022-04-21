import { Box } from "@chakra-ui/react";
import type { FC } from "react";
import type { QueryState } from "~/lib/query";

type Props = {
  queryState: QueryState | null;
};
export const QueryResult: FC<Props> = ({ queryState }) => {
  if (queryState === null) return null;

  return <Box>{<pre>{JSON.stringify(queryState, null, 2)}</pre>}</Box>;
};
