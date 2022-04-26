import { Box, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import type { FC } from "react";
import type { JobResult, ResultItem } from "~/../main/bigquery/client";
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

const ResultCell: FC<{ value: ResultItem }> = ({ value }) => {
  if (value == null) {
    return <Box color="gray.400">null</Box>;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return <Box color="green.600">{value.toString()}</Box>;
  }

  if (typeof value === "boolean") {
    return <Box color="blue.600">{value.toString()}</Box>;
  }

  // DATE, DATETIME, TIMESTAMP, GEOGRAPHY
  if (Object.keys(value).length === 1 && "value" in value) {
    return value.value;
  }

  // Bytes
  if (value instanceof Uint8Array) {
    return window.btoa(String.fromCharCode(...value));
  }

  // Array or Record
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
};

const QueryResultTable: FC<{ result: JobResult }> = ({ result }) => {
  const { rows } = result;
  const headers = Object.keys(rows[0]);
  return (
    <Table>
      <Thead>
        <Tr>
          {headers.map((h, i) => (
            <Th key={i} borderColor="gray.500" textTransform="none" fontSize={14}>
              {h}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row, j) => (
          <Tr key={j}>
            {Object.values(row).map((val, k) => (
              <Td key={k}>
                <ResultCell value={val} />
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
