# QuoteBuilder — app Flutter

iOS / Android. Même backend que le SaaS web (Supabase + API Next.js).

## Lancer

```bash
cd mobile
flutter pub get
flutter run
```

Le configurateur appelle `http://127.0.0.1:3000` (SaaS web en `npm run dev`).
Sur un iPhone physique, passe l’IP de ta machine :

```bash
flutter run --dart-define=API_BASE=http://192.168.x.x:3000
```

Onglets : **Devis** (liste + brief) et **Configurateur** (wizard + chat).
