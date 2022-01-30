import { BigQuery } from "@google-cloud/bigquery";

type BigQueryClientOption = {
  projectId: string;
  keyFilename?: string;
};

type QueryResponse = any;

export class BigQueryClient {
  private readonly bigquery: BigQuery;

  constructor(options: BigQueryClientOption) {
    this.bigquery = new BigQuery(options);
  }

  async executeQuery(query: string): Promise<QueryResponse> {
    const [job] = await this.bigquery.createQueryJob(query);
    const result = await job.getQueryResults();
    return result;
  }
}
