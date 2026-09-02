import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/quote.dart';
import 'auth_service.dart';

class QuotesService {
  QuotesService(this._client, this._auth);
  final SupabaseClient _client;
  final AuthService _auth;

  Future<List<Quote>> list({String? status, String? query}) async {
    final orgId = await _auth.organizationId();
    if (orgId == null) return [];

    var request = _client.from('quotes').select().eq('organization_id', orgId);
    if (status != null && status.isNotEmpty) {
      request = request.eq('status', status);
    }
    final rows = await request.order('created_at', ascending: false);
    var quotes = (rows as List)
        .map((row) => Quote.fromMap(Map<String, dynamic>.from(row as Map)))
        .toList();
    if (query != null && query.trim().isNotEmpty) {
      final q = query.toLowerCase();
      quotes = quotes.where((quote) {
        return quote.contactName.toLowerCase().contains(q) ||
            quote.contactEmail.toLowerCase().contains(q) ||
            (quote.contactCompany ?? '').toLowerCase().contains(q);
      }).toList();
    }
    return quotes;
  }

  Future<Quote> getById(String id) async {
    final row = await _client.from('quotes').select().eq('id', id).single();
    return Quote.fromMap(Map<String, dynamic>.from(row));
  }

  Future<List<QuoteItem>> items(String quoteId) async {
    final rows = await _client.from('quote_items').select().eq('quote_id', quoteId);
    return (rows as List)
        .map((row) => QuoteItem.fromMap(Map<String, dynamic>.from(row as Map)))
        .toList();
  }

  Future<void> updateStatus(String id, String status) async {
    final orgId = await _auth.organizationId();
    String? statusId;
    if (orgId != null) {
      final row = await _client
          .from('quote_statuses')
          .select('id')
          .eq('organization_id', orgId)
          .eq('slug', status)
          .maybeSingle();
      statusId = row?['id'] as String?;
    }
    final patch = <String, dynamic>{'status': status};
    if (statusId != null) {
      patch['status_id'] = statusId;
    }
    await _client.from('quotes').update(patch).eq('id', id);
  }

  Future<void> addNote(String quoteId, String content) async {
    final orgId = await _auth.organizationId();
    if (orgId == null || content.trim().isEmpty) return;
    await _client.from('quote_notes').insert({
      'organization_id': orgId,
      'quote_id': quoteId,
      'content': content.trim(),
    });
  }

  Future<List<({String slug, String label})>> statuses() async {
    final orgId = await _auth.organizationId();
    if (orgId == null) return [];
    final rows = await _client.from('quote_statuses').select('slug, label').eq('organization_id', orgId).order('position');
    return (rows as List)
        .map((row) => (slug: row['slug'] as String, label: row['label'] as String))
        .toList();
  }
}
