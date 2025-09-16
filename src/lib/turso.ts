import { createClient } from '@libsql/client';


const tursoClient = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});

export default tursoClient;
