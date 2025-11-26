import { buildServer } from '@/server';

buildServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
