import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { labelAnswers, type QuestionMeta } from "@/lib/crm/answers";
import { formatPrice } from "@/lib/format";
import { formatLineAmount } from "@/lib/quotes/price-range";
import type { Answers } from "@/lib/wizard/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#0f172a" },
  kicker: { fontSize: 10, color: "#d97706", marginBottom: 4, letterSpacing: 1 },
  title: { fontSize: 20, marginBottom: 8 },
  muted: { color: "#64748b", marginBottom: 16 },
  section: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  heading: { fontSize: 13, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#64748b", width: "40%" },
  value: { width: "60%" },
  item: { marginBottom: 8 },
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, fontSize: 9, color: "#94a3b8" },
});

export function QuotePdf(props: {
  organizationName: string;
  salesName: string | null;
  salesEmail: string | null;
  salesPhone: string | null;
  configuratorName: string;
  contactName: string;
  contactEmail: string;
  contactCompany: string | null;
  answers: Answers;
  items: {
    name: string;
    quantity: number;
    options: Record<string, string>;
    priceMin: number | null;
    priceMax: number | null;
    currency?: string | null;
  }[];
  suggestionName: string;
  priceMin: number | null;
  priceMax: number | null;
  currency?: string | null;
  questions?: QuestionMeta[];
}) {
  const answers = labelAnswers(props.answers, props.questions ?? []);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.kicker}>{props.organizationName.toUpperCase()}</Text>
        <Text style={styles.title}>Récapitulatif de configuration</Text>
        <Text style={styles.muted}>{props.configuratorName}</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>Prospect</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom</Text>
            <Text style={styles.value}>{props.contactName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{props.contactEmail}</Text>
          </View>
          {props.contactCompany ? (
            <View style={styles.row}>
              <Text style={styles.label}>Société</Text>
              <Text style={styles.value}>{props.contactCompany}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Paramètres saisis</Text>
          {answers.length ? (
            answers.map((row) => (
              <View key={row.key} style={styles.row}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.value}>{row.value}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.muted}>Aucun paramètre saisi.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>{props.suggestionName}</Text>
          <Text style={styles.muted}>
            Fourchette indicative : {formatPrice(props.priceMin, props.priceMax, props.currency)}
          </Text>
          {props.items.map((item, index) => (
            <View key={`${item.name}-${index}`} style={styles.item}>
              <Text>
                {item.quantity} × {item.name}
              </Text>
              <Text style={styles.muted}>
                {formatLineAmount(item, item.currency ?? props.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Contact commercial</Text>
          <Text>{props.salesName}</Text>
          <Text>{props.salesEmail}</Text>
          <Text>{props.salesPhone}</Text>
        </View>

        <Text style={styles.footer}>
          Document indicatif, non contractuel. {props.organizationName}
        </Text>
      </Page>
    </Document>
  );
}
