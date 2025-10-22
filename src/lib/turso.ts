import { createClient } from '@libsql/client';


// const tursoClient = createClient({
//   url: import.meta.env.TURSO_DATABASE_URL as string,
//   authToken: import.meta.env.TURSO_AUTH_TOKEN as string,
// });

// export default tursoClient;


const url = import.meta.env.TURSO_DATABASE_URL;
const token = import.meta.env.TURSO_AUTH_TOKEN;

// Solo para depurar localmente (NO subas esto a producción)
console.log("🔍 TURSO_DATABASE_URL:", JSON.stringify(url));
console.log("🔍 TURSO_AUTH_TOKEN:", token ? "(token presente)" : "❌ vacío");

const tursoClient = createClient({
  url,
  authToken: token,
});

export default tursoClient;