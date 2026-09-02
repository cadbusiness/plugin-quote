class AppConfig {
  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://spgskgtycqxjziwjpjol.supabase.co',
  );

  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3NrZ3R5Y3F4anppd2pwam9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDc4MDAsImV4cCI6MjEwMzkyMzgwMH0.2dtLyVZtpPGqWkCgaSj_Dim-efANRg-IVN01OJDAd0o',
  );

  static const supabasePublishableKey = String.fromEnvironment(
    'SUPABASE_PUBLISHABLE_KEY',
    defaultValue: 'sb_publishable_kklfzkqrqfudPRCTZqn0NQ_lek_M0PF',
  );

  /// Next.js public API (wizard / chat / submit).
  static const apiBase = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'http://127.0.0.1:3000',
  );

  static const orgSlug = String.fromEnvironment(
    'ORG_SLUG',
    defaultValue: 'quickly',
  );

  static const configuratorSlug = String.fromEnvironment(
    'CONFIGURATOR_SLUG',
    defaultValue: 'rayonnage',
  );
}
