import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../models/quote.dart';
import '../services/quotes_service.dart';
import '../theme.dart';

class QuotesScreen extends StatefulWidget {
  const QuotesScreen({super.key, required this.quotes});
  final QuotesService quotes;

  @override
  State<QuotesScreen> createState() => _QuotesScreenState();
}

class _QuotesScreenState extends State<QuotesScreen> {
  late Future<List<Quote>> _future;
  String _status = '';
  final _query = TextEditingController();

  @override
  void initState() {
    super.initState();
    _future = widget.quotes.list();
  }

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  void _reload() {
    setState(() {
      _future = widget.quotes.list(status: _status, query: _query.text);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: qbBorder)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _query,
                  decoration: const InputDecoration(
                    hintText: 'Rechercher…',
                    isDense: true,
                    prefixIcon: Icon(Icons.search, size: 18),
                  ),
                  onSubmitted: (_) => _reload(),
                ),
              ),
              const SizedBox(width: 8),
              DropdownButton<String>(
                value: _status,
                underline: const SizedBox.shrink(),
                items: const [
                  DropdownMenuItem(value: '', child: Text('Tous')),
                  DropdownMenuItem(value: 'new', child: Text('Nouveau')),
                  DropdownMenuItem(value: 'contacted', child: Text('Contacté')),
                  DropdownMenuItem(value: 'won', child: Text('Gagné')),
                  DropdownMenuItem(value: 'lost', child: Text('Perdu')),
                ],
                onChanged: (value) {
                  _status = value ?? '';
                  _reload();
                },
              ),
            ],
          ),
        ),
        Expanded(
          child: ColoredBox(
            color: Colors.white,
            child: FutureBuilder<List<Quote>>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) {
                return Center(child: Text(snapshot.error.toString()));
              }
              final quotes = snapshot.data ?? [];
              if (quotes.isEmpty) {
                return const Center(child: Text('Aucun devis', style: TextStyle(color: qbMuted)));
              }
              return RefreshIndicator(
                onRefresh: () async => _reload(),
                child: ListView.separated(
                  itemCount: quotes.length,
                  separatorBuilder: (_, _) => const Divider(height: 1, color: qbBorder),
                  itemBuilder: (context, i) {
                    final quote = quotes[i];
                    return ListTile(
                      dense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      title: Text(quote.contactName, style: const TextStyle(fontWeight: FontWeight.w600)),
                      subtitle: Text(
                        [
                          quote.contactCompany,
                          quote.contactEmail,
                          DateFormat.MMMd('fr').add_Hm().format(quote.createdAt.toLocal()),
                        ].where((e) => e != null && e.toString().isNotEmpty).join(' · '),
                      ),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(quote.status, style: const TextStyle(fontSize: 12, color: qbMuted)),
                          if (quote.scoreLabel != null)
                            Text(
                              quote.scoreLabel!.toUpperCase(),
                              style: const TextStyle(fontSize: 11, color: qbMuted, fontWeight: FontWeight.w600),
                            ),
                        ],
                      ),
                      onTap: () => context.push('/devis/${quote.id}'),
                    );
                  },
                ),
              );
            },
          ),
          ),
        ),
      ],
    );
  }
}
