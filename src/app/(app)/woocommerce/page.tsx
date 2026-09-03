import { redirect } from "next/navigation";

/** L'écran WooCommerce a fusionné avec les connexions boutique. */
export default function WooPage() {
  redirect("/integrations");
}
