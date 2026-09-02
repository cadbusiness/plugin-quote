class Quote {
  const Quote({
    required this.id,
    required this.contactName,
    required this.contactEmail,
    this.contactPhone,
    this.contactCompany,
    required this.status,
    this.assignedTo,
    this.score,
    this.scoreLabel,
    required this.answers,
    required this.createdAt,
  });

  final String id;
  final String contactName;
  final String contactEmail;
  final String? contactPhone;
  final String? contactCompany;
  final String status;
  final String? assignedTo;
  final int? score;
  final String? scoreLabel;
  final Map<String, dynamic> answers;
  final DateTime createdAt;

  factory Quote.fromMap(Map<String, dynamic> map) {
    return Quote(
      id: map['id'] as String,
      contactName: map['contact_name'] as String? ?? '',
      contactEmail: map['contact_email'] as String? ?? '',
      contactPhone: map['contact_phone'] as String?,
      contactCompany: map['contact_company'] as String?,
      status: map['status'] as String? ?? 'new',
      assignedTo: map['assigned_to'] as String?,
      score: (map['score'] as num?)?.toInt(),
      scoreLabel: map['score_label'] as String?,
      answers: Map<String, dynamic>.from(map['answers'] as Map? ?? {}),
      createdAt: DateTime.parse(map['created_at'] as String),
    );
  }
}

class QuoteItem {
  const QuoteItem({
    required this.id,
    required this.name,
    required this.quantity,
    this.priceMin,
    this.priceMax,
  });

  final String id;
  final String name;
  final int quantity;
  final double? priceMin;
  final double? priceMax;

  factory QuoteItem.fromMap(Map<String, dynamic> map) {
    return QuoteItem(
      id: map['id'] as String,
      name: map['name'] as String? ?? '',
      quantity: (map['quantity'] as num?)?.toInt() ?? 1,
      priceMin: (map['price_min'] as num?)?.toDouble(),
      priceMax: (map['price_max'] as num?)?.toDouble(),
    );
  }
}
