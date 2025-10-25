import { createClient } from '@libsql/client/web';


export const tursoClient = createClient({
  url:import.meta.env.TURSO_DATABASE_URL as string,
  authToken:import.meta.env.TURSO_AUTH_TOKEN as string,
});


export default tursoClient;