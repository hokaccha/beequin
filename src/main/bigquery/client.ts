import { BigQuery } from "@google-cloud/bigquery";

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

export type Dataset = {
  id: string;
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
    console.log(job);
    return {
      totalBytesProcessed: job.metadata.statistics.totalBytesProcessed,
    };
  }

  async getDatasets(): Promise<Dataset[]> {
    const [datasets] = await this.bigquery.getDatasets();
    return datasets
      .filter((dataset) => dataset.id)
      .map((dataset) => {
        return {
          id: dataset.id ?? "",
        };
      });
  }
}
