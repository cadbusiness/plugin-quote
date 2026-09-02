import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';
import '../models/configurator.dart';

class ConfiguratorApi {
  ConfiguratorApi({this.baseUrl = AppConfig.apiBase});
  final String baseUrl;

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Future<ConfiguratorDefinition> loadDefinition({
    String org = AppConfig.orgSlug,
    String slug = AppConfig.configuratorSlug,
  }) async {
    final res = await http.get(_uri('/api/public/configurator/$org/$slug'));
    return ConfiguratorDefinition.fromMap(_json(res));
  }

  Future<QuoteSession> createSession({
    String org = AppConfig.orgSlug,
    String slug = AppConfig.configuratorSlug,
  }) async {
    final res = await http.post(
      _uri('/api/public/sessions'),
      headers: {'content-type': 'application/json'},
      body: jsonEncode({'orgSlug': org, 'configuratorSlug': slug}),
    );
    return QuoteSession.fromMap(_json(res));
  }

  Future<QuoteSession> patchSession(
    QuoteSession session, {
    String? mode,
    int? currentStep,
    Map<String, dynamic>? answers,
    String? selectedSuggestionId,
    Map<String, dynamic>? customization,
  }) async {
    final body = <String, dynamic>{};
    if (mode != null) body['mode'] = mode;
    if (currentStep != null) body['currentStep'] = currentStep;
    if (answers != null) body['answers'] = answers;
    if (selectedSuggestionId != null) {
      body['selectedSuggestionId'] = selectedSuggestionId;
    }
    if (customization != null) body['customization'] = customization;
    final res = await http.patch(
      _uri('/api/public/sessions/${session.id}'),
      headers: {
        'content-type': 'application/json',
        'x-session-token': session.token,
      },
      body: jsonEncode(body),
    );
    return QuoteSession.fromMap(_json(res));
  }

  Future<List<Suggestion>> suggestions(QuoteSession session) async {
    final res = await http.get(
      _uri('/api/public/sessions/${session.id}/suggestions'),
      headers: {'x-session-token': session.token},
    );
    final data = _json(res);
    return ((data['suggestions'] as List?) ?? [])
        .map((s) => Suggestion.fromMap(Map<String, dynamic>.from(s as Map)))
        .toList();
  }

  Future<QuoteSession> sendChat(QuoteSession session, String message) async {
    final res = await http.post(
      _uri('/api/public/sessions/${session.id}/chat'),
      headers: {
        'content-type': 'application/json',
        'x-session-token': session.token,
      },
      body: jsonEncode({'message': message}),
    );
    final data = _json(res);
    return QuoteSession.fromMap(Map<String, dynamic>.from(data['session'] as Map));
  }

  Future<void> submit(
    QuoteSession session, {
    required String name,
    required String email,
    String? phone,
    String? company,
  }) async {
    final res = await http.post(
      _uri('/api/public/sessions/${session.id}/submit'),
      headers: {
        'content-type': 'application/json',
        'x-session-token': session.token,
      },
      body: jsonEncode({
        'name': name,
        'email': email,
        'phone': phone,
        'company': company,
      }),
    );
    _json(res);
  }

  Map<String, dynamic> _json(http.Response res) {
    final decoded = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      final message = decoded is Map ? decoded['error'] : res.body;
      throw Exception(message ?? 'Erreur ${res.statusCode}');
    }
    return Map<String, dynamic>.from(decoded as Map);
  }
}
