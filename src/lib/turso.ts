import { createClient } from '@libsql/client';


// const tursoClient = createClient({
//   url: import.meta.env.TURSO_DATABASE_URL as string,
//   authToken: import.meta.env.TURSO_AUTH_TOKEN as string,
// });

// export default tursoClient;


const url = import.meta.env.TURSO_DATABASE_URL;
const authToken = import.meta.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL no está configurada.");
}
if (!authToken) {
  throw new Error("TURSO_AUTH_TOKEN no está configurado.");
}

export const tursoClient = createClient({
  url: url,
  authToken: authToken,
});


export default tursoClient;