import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/quote.dart';
import '../services/quotes_service.dart';
import '../theme.dart';

class QuoteDetailScreen extends StatefulWidget {
  const QuoteDetailScreen({super.key, required this.quotes, required this.id});
  final QuotesService quotes;
  final String id;

  @override
  State<QuoteDetailScreen> createState() => _QuoteDetailScreenState();
}

class _QuoteDetailScreenState extends State<QuoteDetailScreen> {
  late Future<({Quote quote, List<QuoteItem> items})> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<({Quote quote, List<QuoteItem> items})> _load() async {
    final quote = await widget.quotes.getById(widget.id);
    final items = await widget.quotes.items(widget.id);
    return (quote: quote, items: items);
  }

  Future<void> _setStatus(String status) async {
    await widget.quotes.updateStatus(widget.id, status);
    setState(() => _future = _load());
  }

  @override
  Widget build(BuildContext context) {
    final money = NumberFormat.currency(locale: 'fr_FR', symbol: '€', decimalDigits: 0);
    return Scaffold(
      appBar: AppBar(title: const Text('Brief')),
      body: FutureBuilder(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final quote = snapshot.data!.quote;
          final items = snapshot.data!.items;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(quote.contactName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w600)),
              Text(quote.contactEmail, style: const TextStyle(color: qbMuted)),
              if (quote.contactCompany != null) Text(quote.contactCompany!),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                children: ['new', 'contacted', 'won', 'lost'].map((status) {
                  final selected = quote.status == status;
                  return ChoiceChip(
                    label: Text(status),
                    selected: selected,
                    onSelected: (_) => _setStatus(status),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              Text(
                'Score ${quote.score ?? '—'} · ${(quote.scoreLabel ?? '').toUpperCase()}',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 20),
              const Text('Paramètres', style: TextStyle(color: qbMuted, fontSize: 12)),
              const SizedBox(height: 8),
              ...quote.answers.entries.map(
                (e) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      Expanded(child: Text(e.key, style: const TextStyle(color: qbMuted))),
                      Text(e.value is List ? (e.value as List).join(', ') : '${e.value}'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text('Configuration', style: TextStyle(color: qbMuted, fontSize: 12)),
              ...items.map(
                (item) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text('${item.quantity} × ${item.name}'),
                  trailing: Text(
                    item.priceMin == null
                        ? 'Sur devis'
                        : '${money.format(item.priceMin)} – ${money.format(item.priceMax ?? item.priceMin)}',
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
