import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type DatabaseRunResult = {
  meta: { changes: number };
};

export type DatabaseAllResult<T> = {
  results: T[];
};

export interface DatabaseStatement {
  bind(...values: unknown[]): DatabaseStatement;
  all<T>(): Promise<DatabaseAllResult<T>>;
  first<T>(): Promise<T | null>;
  run(): Promise<DatabaseRunResult>;
}

export interface AppDatabase {
  prepare(query: string): DatabaseStatement;
  batch(statements: DatabaseStatement[]): Promise<DatabaseRunResult[]>;
}

type PreparedQuery = {
  text: string;
  values: unknown[];
};

function postgresSql(query: string): string {
  const pragma = query.trim().match(/^PRAGMA\s+table_info\(([A-Za-z0-9_]+)\)$/iu);
  if (pragma) {
    return `SELECT column_name AS name
      FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = '${pragma[1]}'
      ORDER BY ordinal_position`;
  }

  let parameter = 0;
  let result = query.replace(/\?/g, () => `$${++parameter}`);
  result = result.replace(/\bINSERT\s+OR\s+IGNORE\s+INTO\b/giu, "INSERT INTO");
  if (/\bINSERT\s+OR\s+IGNORE\s+INTO\b/iu.test(query) && !/\bON\s+CONFLICT\b/iu.test(result)) {
    result = `${result.trim().replace(/;$/u, "")} ON CONFLICT DO NOTHING`;
  }
  result = result.replace(/\s+COLLATE\s+NOCASE\b/giu, "");
  result = result.replace(/LIMIT\s+-1\s+OFFSET/giu, "LIMIT ALL OFFSET");
  result = result.replace(
    /datetime\(retention_until\)\s*<=\s*datetime\('now'\)/giu,
    "NULLIF(retention_until, '')::timestamptz <= CURRENT_TIMESTAMP",
  );
  result = result.replace(
    /datetime\(created_at\)\s*<=\s*datetime\('now',\s*'-365 days'\)/giu,
    "created_at::timestamptz <= CURRENT_TIMESTAMP - INTERVAL '365 days'",
  );
  result = result.replace(
    /datetime\(created_at\)\s*>=\s*datetime\('now',\s*'-30 days'\)/giu,
    "created_at::timestamptz >= CURRENT_TIMESTAMP - INTERVAL '30 days'",
  );
  return result;
}

class NeonStatement implements DatabaseStatement {
  constructor(
    private readonly client: NeonQueryFunction<false, true>,
    private readonly query: string,
    private readonly values: unknown[] = [],
  ) {}

  bind(...values: unknown[]) {
    return new NeonStatement(this.client, this.query, values);
  }

  prepared(): PreparedQuery {
    return { text: postgresSql(this.query), values: this.values };
  }

  private async execute() {
    const prepared = this.prepared();
    return this.client.query(prepared.text, prepared.values);
  }

  async all<T>() {
    const result = await this.execute();
    return { results: result.rows as T[] };
  }

  async first<T>() {
    const result = await this.execute();
    return (result.rows[0] as T | undefined) ?? null;
  }

  async run() {
    const result = await this.execute();
    return { meta: { changes: result.rowCount } };
  }
}

class NeonDatabase implements AppDatabase {
  private readonly client: NeonQueryFunction<false, true>;

  constructor(connectionString: string) {
    this.client = neon(connectionString, { fullResults: true });
  }

  prepare(query: string) {
    return new NeonStatement(this.client, query);
  }

  async batch(statements: DatabaseStatement[]) {
    const prepared = statements.map((statement) => {
      if (!(statement instanceof NeonStatement)) {
        throw new Error("Unsupported database statement.");
      }
      return statement.prepared();
    });
    const results = await this.client.transaction(
      (transaction) => prepared.map(({ text, values }) => transaction.query(text, values)),
      { fullResults: true },
    );
    return results.map((result) => ({ meta: { changes: result.rowCount } }));
  }
}

let database: AppDatabase | undefined;
let connectionString: string | undefined;

export function getDatabase() {
  const configured = process.env.DATABASE_URL?.trim();
  if (!configured) return undefined;
  if (!database || connectionString !== configured) {
    database = new NeonDatabase(configured);
    connectionString = configured;
  }
  return database;
}

export function requireDatabase() {
  const configured = getDatabase();
  if (!configured) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return configured;
}
