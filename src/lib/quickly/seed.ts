/**
 * Ancien seed catalogue Quickly. Il insérait trois fiches manuelles et
 * verrouillait des SKU à côté de l'import Woo. Il ne touche plus la base.
 */
export async function seedQuicklyCatalog(): Promise<never> {
  throw new Error(
    "seed:quickly est retiré. Le catalogue vient de l'import Woo. sync_lock se pose sur une fiche déjà importée, pas par un seed.",
  );
}
