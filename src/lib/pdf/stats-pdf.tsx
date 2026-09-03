import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { StatsDashboard } from "@/lib/stats/dashboard";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#0f172a" },
  kicker: { fontSize: 10, color: "#E85D04", marginBottom: 4, letterSpacing: 1 },
  title: { fontSize: 20, marginBottom: 4 },
  muted: { color: "#64748b", marginBottom: 16 },
  kpis: { flexDirection: "row", gap: 8, marginBottom: 8 },
  kpi: { flex: 1, borderWidth: 1, borderColor: "#e2e8f0", padding: 8 },
  kpiLabel: { fontSize: 8, color: "#64748b", textTransform: "uppercase" },
  kpiValue: { fontSize: 14, marginTop: 4 },
  section: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  heading: { fontSize: 12, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#64748b" },
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, fontSize: 9, color: "#94a3b8" },
});

const RANGE_LABEL = { day: "24 h", week: "7 jours", month: "30 jours" };

export function StatsPdf({
  organizationName,
  stats,
}: {
  organizationName: string;
  stats: StatsDashboard;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.kicker}>{organizationName.toUpperCase()}</Text>
        <Text style={styles.title}>Pilotage commercial</Text>
        <Text style={styles.muted}>Période : {RANGE_LABEL[stats.range]}</Text>

        <View style={styles.kpis}>
          {stats.kpis.map((kpi) => (
            <View key={kpi.label} style={styles.kpi}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.label}>{kpi.hint}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Tunnel de conversion</Text>
          {stats.funnel.map((step) => (
            <View key={step.key} style={styles.row}>
              <Text>{step.label}</Text>
              <Text>
                {step.count}
                {step.rateFromPrevious != null ? `  (${Math.round(step.rateFromPrevious)}%)` : ""}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Sources de trafic</Text>
          {stats.sources.length === 0 ? (
            <Text style={styles.label}>Pas encore de source UTM.</Text>
          ) : (
            stats.sources.map((row) => (
              <View key={row.source} style={styles.row}>
                <Text>{row.source}</Text>
                <Text>
                  {row.quotes} demandes · {row.conversion != null ? `${Math.round(row.conversion)}%` : "—"} ·{" "}
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
                    row.pipeline,
                  )}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Pipeline</Text>
          {stats.pipeline.map((row) => (
            <View key={row.slug} style={styles.row}>
              <Text>
                {row.label} · {row.quotes} demandes
              </Text>
              <Text>
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
                  row.value,
                )}
              </Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text>Total pipeline</Text>
            <Text>
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
                stats.pipelineTotal,
              )}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>QuoteBuilder · rapport d’agence · {new Date().toLocaleDateString("fr-FR")}</Text>
      </Page>
    </Document>
  );
}
