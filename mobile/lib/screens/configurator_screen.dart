import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/configurator.dart';
import '../services/auth_service.dart';
import '../services/configurator_api.dart';
import '../theme.dart';

class ConfiguratorScreen extends StatefulWidget {
  const ConfiguratorScreen({super.key, required this.api, required this.auth});
  final ConfiguratorApi api;
  final AuthService auth;

  @override
  State<ConfiguratorScreen> createState() => _ConfiguratorScreenState();
}

class _ConfiguratorScreenState extends State<ConfiguratorScreen> {
  ConfiguratorDefinition? _definition;
  QuoteSession? _session;
  List<Suggestion> _suggestions = [];
  bool _loading = true;
  bool _busy = false;
  String? _error;
  String _mode = 'wizard';
  final _answers = <String, dynamic>{};
  final _contact = {
    'name': TextEditingController(),
    'email': TextEditingController(),
    'phone': TextEditingController(),
    'company': TextEditingController(),
  };
  final _chat = TextEditingController();
  bool _done = false;

  @override
  void initState() {
    super.initState();
    _boot();
  }

  @override
  void dispose() {
    for (final c in _contact.values) {
      c.dispose();
    }
    _chat.dispose();
    super.dispose();
  }

  Future<void> _boot() async {
    try {
      final org = widget.auth.currentOrg ?? await widget.auth.loadMembership();
      if (org == null) throw Exception('Aucun espace');
      final rows = await Supabase.instance.client
          .from('configurators')
          .select('slug')
          .eq('organization_id', org.id)
          .limit(1);
      final slug = (rows as List).isNotEmpty
          ? (rows.first as Map)['slug'] as String
          : 'principal';
      final definition = await widget.api.loadDefinition(org: org.slug, slug: slug);
      final session = await widget.api.createSession(org: org.slug, slug: slug);
      setState(() {
        _definition = definition;
        _session = session;
        _answers.addAll(session.answers);
        _mode = session.mode;
        _done = session.submittedQuoteId != null;
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _error = 'Lance le SaaS web (`npm run dev`) pour le configurateur.\n$error';
        _loading = false;
      });
    }
  }

  WizardStep? get _step {
    final def = _definition;
    final session = _session;
    if (def == null || session == null || def.steps.isEmpty) return null;
    final i = session.currentStep.clamp(0, def.steps.length - 1);
    return def.steps[i];
  }

  Future<void> _persist({int? step, String? suggestionId}) async {
    final session = _session;
    if (session == null) return;
    final next = await widget.api.patchSession(
      session,
      currentStep: step,
      answers: _answers,
      selectedSuggestionId: suggestionId,
      mode: _mode,
    );
    setState(() => _session = next);
    if (_definition?.steps[next.currentStep].screenType == 'suggestions') {
      _suggestions = await widget.api.suggestions(next);
      setState(() {});
    }
  }

  Future<void> _next() async {
    final def = _definition;
    final session = _session;
    final step = _step;
    if (def == null || session == null || step == null) return;
    if (step.screenType == 'questions') {
      for (final q in step.questions) {
        final value = _answers[q.key];
        if (q.required && (value == null || value == '' || (value is List && value.isEmpty))) {
          setState(() => _error = '${q.label} est requis');
          return;
        }
      }
    }
    setState(() => _error = null);
    await _persist(step: (session.currentStep + 1).clamp(0, def.steps.length - 1));
  }

  Future<void> _back() async {
    final session = _session;
    if (session == null || session.currentStep == 0) return;
    await _persist(step: session.currentStep - 1);
  }

  Future<void> _submit() async {
    final session = _session;
    if (session == null) return;
    setState(() => _busy = true);
    try {
      await widget.api.submit(
        session,
        name: _contact['name']!.text,
        email: _contact['email']!.text,
        phone: _contact['phone']!.text,
        company: _contact['company']!.text,
      );
      setState(() => _done = true);
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _sendChat() async {
    final session = _session;
    if (session == null || _chat.text.trim().isEmpty) return;
    setState(() => _busy = true);
    try {
      final next = await widget.api.sendChat(session, _chat.text.trim());
      _chat.clear();
      setState(() {
        _session = next;
        _answers.addAll(next.answers);
      });
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_definition == null || _session == null) {
      return Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error ?? 'Indisponible')));
    }
    if (_done) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text('Demande envoyée. L’équipe vous recontacte sous 24h.', textAlign: TextAlign.center),
        ),
      );
    }

    final def = _definition!;
    final session = _session!;
    final step = _step;

    return Column(
      children: [
        if (def.wizardEnabled && def.chatEnabled)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'wizard', label: Text('Wizard')),
                ButtonSegment(value: 'chat', label: Text('Chat IA')),
              ],
              selected: {_mode},
              onSelectionChanged: (s) => setState(() => _mode = s.first),
            ),
          ),
        if (_mode == 'wizard' && step != null) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: LinearProgressIndicator(
              value: (session.currentStep + 1) / def.steps.length,
              color: qbInk,
              backgroundColor: qbBorder,
            ),
          ),
          Expanded(child: _wizardBody(step)),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Row(
              children: [
                TextButton(onPressed: session.currentStep == 0 ? null : _back, child: const Text('Retour')),
                const Spacer(),
                FilledButton(
                  onPressed: _busy
                      ? null
                      : () {
                          if (step.screenType == 'contact') {
                            _submit();
                          } else {
                            _next();
                          }
                        },
                  child: Text(step.screenType == 'contact' ? 'Envoyer' : 'Continuer'),
                ),
              ],
            ),
          ),
        ] else
          Expanded(child: _chatBody()),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.all(12),
            child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
          ),
      ],
    );
  }

  Widget _wizardBody(WizardStep step) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(step.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w600)),
        if (step.subtitle != null) ...[
          const SizedBox(height: 6),
          Text(step.subtitle!, style: const TextStyle(color: qbMuted)),
        ],
        const SizedBox(height: 20),
        if (step.screenType == 'questions')
          ...step.questions.map(_question),
        if (step.screenType == 'suggestions') _suggestionsView(),
        if (step.screenType == 'customize') _customizeView(),
        if (step.screenType == 'contact') _contactView(),
      ],
    );
  }

  Widget _question(WizardQuestion q) {
    if (q.type == 'visual_choice' || q.type == 'select') {
      return Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(q.label, style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            ...q.choices.map((c) {
              final selected = _answers[q.key] == c.value;
              return Card(
                color: selected ? const Color(0xFFF1F5F9) : Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: selected ? qbInk : qbBorder),
                ),
                child: ListTile(
                  title: Text(c.label),
                  subtitle: c.description != null ? Text(c.description!) : null,
                  onTap: () => setState(() => _answers[q.key] = c.value),
                ),
              );
            }),
          ],
        ),
      );
    }
    if (q.type == 'multi_select') {
      final selected = List<String>.from(_answers[q.key] as List? ?? []);
      return Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Wrap(
          spacing: 8,
          children: q.choices.map((c) {
            final on = selected.contains(c.value);
            return FilterChip(
              label: Text(c.label),
              selected: on,
              onSelected: (v) {
                setState(() {
                  if (v) {
                    selected.add(c.value);
                  } else {
                    selected.remove(c.value);
                  }
                  _answers[q.key] = List<String>.from(selected);
                });
              },
            );
          }).toList(),
        ),
      );
    }
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextField(
        keyboardType: q.type == 'number' ? TextInputType.number : TextInputType.text,
        decoration: InputDecoration(labelText: q.label, suffixText: q.unit, hintText: q.placeholder),
        onChanged: (v) => _answers[q.key] = q.type == 'number' ? num.tryParse(v) : v,
      ),
    );
  }

  Widget _suggestionsView() {
    if (_suggestions.isEmpty) {
      return const Text('Calcul des configurations…');
    }
    final money = NumberFormat.currency(locale: 'fr_FR', symbol: '€', decimalDigits: 0);
    return Column(
      children: _suggestions.map((s) {
        final selected = _session?.selectedSuggestionId == s.id;
        return Card(
          color: selected ? const Color(0xFFF1F5F9) : Colors.white,
          child: ListTile(
            title: Text(s.headline ?? s.name),
            subtitle: Text(
              '${s.description ?? ''}\n${s.priceMin == null ? 'Sur devis' : '${money.format(s.priceMin)} – ${money.format(s.priceMax ?? s.priceMin)}'}',
            ),
            isThreeLine: true,
            onTap: () => _persist(suggestionId: s.id),
          ),
        );
      }).toList(),
    );
  }

  Widget _customizeView() {
    final selected = _suggestions.cast<Suggestion?>().firstWhere(
          (s) => s?.id == _session?.selectedSuggestionId,
          orElse: () => _suggestions.isEmpty ? null : _suggestions.first,
        );
    if (selected == null) return const Text('Choisissez d’abord une configuration.');
    return Column(
      children: selected.products
          .map((p) => ListTile(title: Text(p.name), subtitle: Text(p.description ?? '')))
          .toList(),
    );
  }

  Widget _contactView() {
    return Column(
      children: [
        TextField(controller: _contact['name'], decoration: const InputDecoration(labelText: 'Nom')),
        const SizedBox(height: 8),
        TextField(controller: _contact['email'], decoration: const InputDecoration(labelText: 'Email')),
        const SizedBox(height: 8),
        TextField(controller: _contact['phone'], decoration: const InputDecoration(labelText: 'Téléphone')),
        const SizedBox(height: 8),
        TextField(controller: _contact['company'], decoration: const InputDecoration(labelText: 'Société')),
      ],
    );
  }

  Widget _chatBody() {
    final messages = _session?.chatMessages ?? [];
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: messages.isEmpty ? 1 : messages.length,
            itemBuilder: (context, i) {
              if (messages.isEmpty) {
                return const Text(
                  'Décrivez votre projet — ex. « entrepôt 600 m², palettes 800 kg ».',
                  style: TextStyle(color: qbMuted),
                );
              }
              final m = messages[i];
              final mine = m.role == 'user';
              return Align(
                alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: mine ? qbInk : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: mine ? null : Border.all(color: qbBorder),
                  ),
                  child: Text(m.content, style: TextStyle(color: mine ? Colors.white : qbInk)),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _chat,
                  decoration: const InputDecoration(hintText: 'Votre besoin…'),
                  onSubmitted: (_) => _sendChat(),
                ),
              ),
              IconButton(onPressed: _busy ? null : _sendChat, icon: const Icon(Icons.send)),
            ],
          ),
        ),
      ],
    );
  }
}
