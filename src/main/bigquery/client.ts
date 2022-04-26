import type { TableField, TableMetadata } from "@google-cloud/bigquery";
import { BigQuery } from "@google-cloud/bigquery";
import { wait } from "../utils/timer";

type BigQueryClientOption = {
  projectId: string;
  keyFilename?: string;
};

export type ExecuteQueryResult = {
  jobId: string;
};

export type ResultItem =
  | string
  | number
  | boolean
  | { value: string }
  | Uint8Array
  | Array<any>
  | Record<string, any>
  | null;
export type ResultRow = Record<string, ResultItem>;

export type JobResult = {
  rows: ResultRow[];
  metadata: {
    totalBytesProcessed: string;
    totalSlotMs: number;
  };
};

export type DryRunResult = {
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

type JobStatus = "running" | "canceled" | "completed";

const jobStatusMap: Map<string, JobStatus> = new Map();

export class BigQueryClient {
  private readonly bigquery: BigQuery;

  constructor(options: BigQueryClientOption) {
    this.bigquery = new BigQuery(options);
  }

  async executeQuery(query: string): Promise<ExecuteQueryResult> {
    const [job] = await this.bigquery.createQueryJob({ query });
    if (!job.id) throw new Error("Invalid job");

    jobStatusMap.set(job.id, "running");

    return {
      jobId: job.id,
    };
  }

  async getJobResult(jobId: string): Promise<JobResult> {
    const job = await this.bigquery.job(jobId);
    const [rows] = await job.getQueryResults();
    const [metadata] = await job.getMetadata();

    if (jobStatusMap.get(jobId) === "canceled") {
      // Todo: return custom error type
      throw new Error("This job has already been canceled.");
    }

    jobStatusMap.set(jobId, "completed");

    return {
      rows,
      metadata: {
        totalBytesProcessed: metadata.statistics.totalBytesProcessed,
        totalSlotMs: parseInt(metadata.statistics.totalSlotMs) || 0,
      },
    };
  }

  async cancelQuery(jobId: string): Promise<void> {
    const job = await this.bigquery.job(jobId);
    await job.cancel();
    jobStatusMap.set(jobId, "canceled");
  }

  async dryRunQuery(query: string): Promise<DryRunResult> {
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

      // > A user can make up to 100 API requests per second to an API method.
      // https://cloud.google.com/bigquery/quotas#api_request_quotas
      //
      // We use half that value for safety.
      if (calledApiCount >= 50) {
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

  async getTableSchema(datasetId: string, tableId: string): Promise<TableField[]> {
    const resp = await this.bigquery.dataset(datasetId).table(tableId).getMetadata();
    const metadata = resp[0] as TableMetadata;
    return metadata.schema?.fields || [];
  }
}
