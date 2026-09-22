import { seedQuicklyCatalog } from "@/lib/quickly/seed";

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`seed:quickly ne modifie pas le catalogue.

Les fiches viennent de l'import Woo. Aucun e-mail, aucune invitation, aucun produit inventé.
`);
    return;
  }
  await seedQuicklyCatalog();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
