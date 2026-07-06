/**
 * Registers an OAuth 2.0 client for Okta to use against this SCIM server.
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/create-oauth-client.ts \
 *     --name "Okta" --redirect-uri "https://trial-1234.okta.com/oauth/callback"
 *
 * Multiple --redirect-uri flags are allowed (Okta's OIN wizard lists several
 * per environment - admin.okta.com, okta-emea.com, oktapreview.com, etc).
 */
import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

function parseArgs(argv: string[]) {
  const result: { name?: string; redirectUris: string[] } = { redirectUris: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--name') result.name = argv[++i];
    if (argv[i] === '--redirect-uri') result.redirectUris.push(argv[++i]);
  }
  return result;
}

async function main() {
  const { name, redirectUris } = parseArgs(process.argv.slice(2));
  if (!name || redirectUris.length === 0) {
    console.error('Usage: --name <name> --redirect-uri <uri> [--redirect-uri <uri> ...]');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const clientId = randomBytes(16).toString('hex');
  const clientSecret = randomBytes(32).toString('base64url');

  const client = await prisma.oAuthClient.create({
    data: { clientId, clientSecret, name, redirectUris, scopes: ['scim'] },
  });

  console.log('OAuth client created:\n');
  console.log(`  name:          ${client.name}`);
  console.log(`  client_id:     ${client.clientId}`);
  console.log(`  client_secret: ${client.clientSecret}`);
  console.log(`  redirect_uris: ${client.redirectUris.join(', ')}`);
  console.log('\nEnter these as the Client ID / Client Secret in Okta\'s SCIM OAuth 2.0 setup.');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
