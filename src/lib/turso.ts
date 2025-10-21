import { createClient } from '@libsql/client';


// const tursoClient = createClient({
//   url: import.meta.env.TURSO_DATABASE_URL as string,
//   authToken: import.meta.env.TURSO_AUTH_TOKEN as string,
// });

// export default tursoClient;


export function getTursoClient(env: {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}) {
  if (!env?.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL is missing.');
  }

  if (!env.TURSO_DATABASE_URL.startsWith('libsql://')) {
    throw new Error(`Invalid TURSO_DATABASE_URL: ${env.TURSO_DATABASE_URL}`);
  }

  return createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
}
