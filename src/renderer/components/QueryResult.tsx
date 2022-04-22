import { Box, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import type { FC } from "react";
import type { JobResult } from "~/../main/bigquery/client";
import type { QueryState } from "~/lib/query";

type Props = {
  queryState: QueryState | null;
};
export const QueryResult: FC<Props> = ({ queryState }) => {
  if (queryState === null) return null;

  switch (queryState.status) {
    case "running": {
      return <div>...</div>;
    }
    case "canceled": {
      return <Box>{<pre>{JSON.stringify(queryState, null, 2)}</pre>}</Box>;
    }
    case "error": {
      return <Box>{<pre>{JSON.stringify(queryState, null, 2)}</pre>}</Box>;
    }
    case "completed": {
      return <QueryResultTable result={queryState.result} />;
    }
    default: {
      throw new Error("Invalid state");
    }
  }
};

const QueryResultTable: FC<{ result: JobResult }> = ({ result }) => {
  const rows = result.responseRows[0];
  const headers = Object.keys(rows[0]);
  return (
    <Table>
      <Thead>
        <Tr>
          {headers.map((h: any, i: number) => (
            <Th key={i} borderColor="gray.500" textTransform="none" fontSize={14}>
              {h}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row: any, j: number) => (
          <Tr key={j}>
            {Object.values(row).map((val, k) => (
              <Td key={k}>
                <pre>{JSON.stringify(val, null, 2)}</pre>
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
