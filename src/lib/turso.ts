// import { createClient } from '@libsql/client/web';


// const tursoClient = createClient({
//   url: import.meta.env.TURSO_DATABASE_URL as string,
//   authToken: import.meta.env.TURSO_AUTH_TOKEN as string,

// });

// export default tursoClient;

import { createClient } from "@libsql/client/web";

const url =
  import.meta.env.LIBSQL_DB_URL ?? process.env.LIBSQL_DB_URL;
const authToken =
  import.meta.env.LIBSQL_DB_AUTH_TOKEN ?? process.env.LIBSQL_DB_AUTH_TOKEN;

export const tursoClient = createClient({
  url: url?.trim(),
  authToken: authToken?.trim(),
});

export default tursoClient;
