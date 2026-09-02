import 'package:supabase_flutter/supabase_flutter.dart';

class OrgInfo {
  const OrgInfo({required this.id, required this.slug, required this.name});
  final String id;
  final String slug;
  final String name;
}

class AuthService {
  AuthService(this._client);
  final SupabaseClient _client;
  OrgInfo? currentOrg;

  User? get user => _client.auth.currentUser;
  bool get hasOrg => currentOrg != null;
  Stream<AuthState> get onAuthStateChange => _client.auth.onAuthStateChange;

  Future<void> signIn(String email, String password) async {
    await _client.auth.signInWithPassword(email: email, password: password);
    await loadMembership();
  }

  Future<void> signUp(String email, String password) async {
    await _client.auth.signUp(email: email, password: password);
    await loadMembership();
  }

  Future<void> signOut() async {
    currentOrg = null;
    await _client.auth.signOut();
  }

  Future<OrgInfo?> loadMembership() async {
    final current = user;
    if (current == null) {
      currentOrg = null;
      return null;
    }
    final membership = await _client
        .from('memberships')
        .select('organization_id')
        .eq('user_id', current.id)
        .limit(1)
        .maybeSingle();
    if (membership == null) {
      currentOrg = null;
      return null;
    }
    final org = await _client
        .from('organizations')
        .select('id, slug, name')
        .eq('id', membership['organization_id'] as String)
        .maybeSingle();
    if (org == null) {
      currentOrg = null;
      return null;
    }
    currentOrg = OrgInfo(
      id: org['id'] as String,
      slug: org['slug'] as String,
      name: org['name'] as String,
    );
    return currentOrg;
  }

  Future<String?> organizationId() async {
    final org = currentOrg ?? await loadMembership();
    return org?.id;
  }

  String _slugify(String input) {
    final slug = input
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
    return slug.isEmpty ? 'espace' : slug;
  }

  Future<void> createOrganization(String name) async {
    final current = user;
    if (current == null) throw Exception('Non connecté');
    final trimmed = name.trim();
    if (trimmed.length < 2) throw Exception('Nom d’entreprise requis');

    var slug = _slugify(trimmed);
    var n = 2;
    while (true) {
      final existing = await _client.from('organizations').select('id').eq('slug', slug).maybeSingle();
      if (existing == null) break;
      slug = '${_slugify(trimmed)}-$n';
      n += 1;
    }

    final org = await _client
        .from('organizations')
        .insert({'name': trimmed, 'slug': slug, 'plan': 'pro'})
        .select('id, slug, name')
        .single();

    await _client.from('memberships').insert({
      'organization_id': org['id'],
      'user_id': current.id,
      'role': 'owner',
    });

    await _client.from('configurators').insert({
      'organization_id': org['id'],
      'name': 'Configurateur principal',
      'slug': 'principal',
      'sector': 'general',
      'wizard_enabled': true,
      'chat_enabled': true,
    });

    currentOrg = OrgInfo(
      id: org['id'] as String,
      slug: org['slug'] as String,
      name: org['name'] as String,
    );
  }

  Future<void> joinOrganization(String slug) async {
    final current = user;
    if (current == null) throw Exception('Non connecté');
    final clean = slug.trim().toLowerCase();
    final org = await _client.from('organizations').select('id, slug, name').eq('slug', clean).maybeSingle();
    if (org == null) throw Exception('Espace introuvable');

    final members = await _client.from('memberships').select('id').eq('organization_id', org['id'] as String);
    if ((members as List).isNotEmpty) {
      throw Exception('Cet espace a déjà une équipe. Demandez une invitation.');
    }

    await _client.from('memberships').insert({
      'organization_id': org['id'],
      'user_id': current.id,
      'role': 'owner',
    });
    currentOrg = OrgInfo(
      id: org['id'] as String,
      slug: org['slug'] as String,
      name: org['name'] as String,
    );
  }
}
