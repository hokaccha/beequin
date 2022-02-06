import { BigQuery } from "@google-cloud/bigquery";
import { wait } from "../utils/timer";

type BigQueryClientOption = {
  projectId: string;
  keyFilename?: string;
};

export type QueryResponse = {
  responseRows: any;
  metadata: {
    totalBytesProcessed: string;
    totalSlotMs: number;
  };
};

export type DryRunResponse = {
  totalBytesProcessed: string;
};

export type Table = {
  id: string;
  type: "TABLE" | "VIEW" | "EXTERNAL" | "MATERIALIZED_VIEW";
};

export type Dataset = {
  id: string;
  tables: Table[];
};

export class BigQueryClient {
  private readonly bigquery: BigQuery;

  constructor(options: BigQueryClientOption) {
    this.bigquery = new BigQuery(options);
  }

  async executeQuery(query: string): Promise<QueryResponse> {
    const [job] = await this.bigquery.createQueryJob({ query });
    const result = await job.getQueryResults();
    const [metadata] = await job.getMetadata();
    return {
      responseRows: result,
      metadata: {
        totalBytesProcessed: metadata.statistics.totalBytesProcessed,
        totalSlotMs: parseInt(metadata.statistics.totalSlotMs) || 0,
      },
    };
  }

  async dryRunQuery(query: string): Promise<DryRunResponse> {
    const [job] = await this.bigquery.createQueryJob({ query, dryRun: true });
    return {
      totalBytesProcessed: job.metadata.statistics.totalBytesProcessed,
    };
  }

  async getDatasets(): Promise<Dataset[]> {
    let calledApiCount = 1;
    let promises: Promise<void>[] = [];
    const [datasets] = await this.bigquery.getDatasets();
    const ret: Dataset[] = [];

    for (const dataset of datasets) {
      if (!dataset.id) continue;
      const datasetValue: Dataset = { id: dataset.id, tables: [] };
      ret.push(datasetValue);
      const fetchTable = async () => {
        const [tables] = await dataset.getTables();
        for (const table of tables) {
          if (!table.id) continue;
          datasetValue.tables.push({
            id: table.id,
            type: table.metadata.type,
          });
        }
      };
      calledApiCount++;
      promises.push(fetchTable());

      // https://cloud.google.com/bigquery/quotas#api_request_quotas
      // > A user can make up to 100 API requests per second to an API method.
      if (calledApiCount >= 100) {
        promises.push(wait(1000));
        await Promise.all(promises);
        promises = [];
        calledApiCount = 0;
      }
    }

    // flush promises
    await Promise.all(promises);

    return ret;
  }
}
