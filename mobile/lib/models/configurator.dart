class Choice {
  const Choice({required this.value, required this.label, this.description});
  final String value;
  final String label;
  final String? description;

  factory Choice.fromMap(Map<String, dynamic> map) => Choice(
        value: map['value'] as String? ?? '',
        label: map['label'] as String? ?? '',
        description: map['description'] as String?,
      );
}

class WizardQuestion {
  const WizardQuestion({
    required this.id,
    required this.key,
    required this.label,
    this.helpText,
    required this.type,
    required this.required,
    this.choices = const [],
    this.min,
    this.max,
    this.step,
    this.unit,
    this.placeholder,
  });

  final String id;
  final String key;
  final String label;
  final String? helpText;
  final String type;
  final bool required;
  final List<Choice> choices;
  final num? min;
  final num? max;
  final num? step;
  final String? unit;
  final String? placeholder;

  factory WizardQuestion.fromMap(Map<String, dynamic> map) {
    final options = Map<String, dynamic>.from(map['options'] as Map? ?? {});
    final rawChoices = (options['choices'] as List?) ?? [];
    return WizardQuestion(
      id: map['id'] as String,
      key: map['key'] as String,
      label: map['label'] as String,
      helpText: map['helpText'] as String?,
      type: map['type'] as String,
      required: map['required'] as bool? ?? true,
      choices: rawChoices
          .map((c) => Choice.fromMap(Map<String, dynamic>.from(c as Map)))
          .toList(),
      min: options['min'] as num?,
      max: options['max'] as num?,
      step: options['step'] as num?,
      unit: options['unit'] as String?,
      placeholder: options['placeholder'] as String?,
    );
  }
}

class WizardStep {
  const WizardStep({
    required this.id,
    required this.title,
    this.subtitle,
    required this.screenType,
    required this.questions,
  });

  final String id;
  final String title;
  final String? subtitle;
  final String screenType;
  final List<WizardQuestion> questions;

  factory WizardStep.fromMap(Map<String, dynamic> map) {
    return WizardStep(
      id: map['id'] as String,
      title: map['title'] as String,
      subtitle: map['subtitle'] as String?,
      screenType: map['screenType'] as String,
      questions: ((map['questions'] as List?) ?? [])
          .map((q) => WizardQuestion.fromMap(Map<String, dynamic>.from(q as Map)))
          .toList(),
    );
  }
}

class Product {
  const Product({
    required this.id,
    required this.name,
    this.description,
    this.priceMin,
    this.priceMax,
    this.options = const [],
  });

  final String id;
  final String name;
  final String? description;
  final double? priceMin;
  final double? priceMax;
  final List<ProductOption> options;

  factory Product.fromMap(Map<String, dynamic> map) {
    return Product(
      id: map['id'] as String,
      name: map['name'] as String,
      description: map['description'] as String?,
      priceMin: (map['priceMin'] as num?)?.toDouble(),
      priceMax: (map['priceMax'] as num?)?.toDouble(),
      options: ((map['options'] as List?) ?? [])
          .map((o) => ProductOption.fromMap(Map<String, dynamic>.from(o as Map)))
          .toList(),
    );
  }
}

class ProductOption {
  const ProductOption({required this.key, required this.label, required this.values});
  final String key;
  final String label;
  final List<Choice> values;

  factory ProductOption.fromMap(Map<String, dynamic> map) {
    return ProductOption(
      key: map['key'] as String,
      label: map['label'] as String,
      values: ((map['values'] as List?) ?? [])
          .map((v) => Choice.fromMap(Map<String, dynamic>.from(v as Map)))
          .toList(),
    );
  }
}

class Suggestion {
  const Suggestion({
    required this.id,
    required this.name,
    this.headline,
    this.description,
    this.priceMin,
    this.priceMax,
    this.products = const [],
  });

  final String id;
  final String name;
  final String? headline;
  final String? description;
  final double? priceMin;
  final double? priceMax;
  final List<Product> products;

  factory Suggestion.fromMap(Map<String, dynamic> map) {
    return Suggestion(
      id: map['id'] as String,
      name: map['name'] as String,
      headline: map['headline'] as String?,
      description: map['description'] as String?,
      priceMin: (map['priceMin'] as num?)?.toDouble(),
      priceMax: (map['priceMax'] as num?)?.toDouble(),
      products: ((map['products'] as List?) ?? [])
          .map((p) => Product.fromMap(Map<String, dynamic>.from(p as Map)))
          .toList(),
    );
  }
}

class ConfiguratorDefinition {
  const ConfiguratorDefinition({
    required this.organizationName,
    required this.configuratorName,
    required this.wizardEnabled,
    required this.chatEnabled,
    required this.steps,
  });

  final String organizationName;
  final String configuratorName;
  final bool wizardEnabled;
  final bool chatEnabled;
  final List<WizardStep> steps;

  factory ConfiguratorDefinition.fromMap(Map<String, dynamic> map) {
    final org = Map<String, dynamic>.from(map['organization'] as Map);
    final cfg = Map<String, dynamic>.from(map['configurator'] as Map);
    return ConfiguratorDefinition(
      organizationName: org['name'] as String? ?? '',
      configuratorName: cfg['name'] as String? ?? '',
      wizardEnabled: cfg['wizardEnabled'] as bool? ?? true,
      chatEnabled: cfg['chatEnabled'] as bool? ?? true,
      steps: ((map['steps'] as List?) ?? [])
          .map((s) => WizardStep.fromMap(Map<String, dynamic>.from(s as Map)))
          .toList(),
    );
  }
}

class QuoteSession {
  const QuoteSession({
    required this.id,
    required this.token,
    required this.mode,
    required this.currentStep,
    required this.answers,
    this.selectedSuggestionId,
    this.submittedQuoteId,
    this.chatMessages = const [],
  });

  final String id;
  final String token;
  final String mode;
  final int currentStep;
  final Map<String, dynamic> answers;
  final String? selectedSuggestionId;
  final String? submittedQuoteId;
  final List<ChatMessage> chatMessages;

  factory QuoteSession.fromMap(Map<String, dynamic> map) {
    return QuoteSession(
      id: map['id'] as String,
      token: map['token'] as String,
      mode: map['mode'] as String? ?? 'wizard',
      currentStep: (map['currentStep'] as num?)?.toInt() ?? 0,
      answers: Map<String, dynamic>.from(map['answers'] as Map? ?? {})
        ..addAll(Map<String, dynamic>.from(map['extractedParams'] as Map? ?? {})),
      selectedSuggestionId: map['selectedSuggestionId'] as String?,
      submittedQuoteId: map['submittedQuoteId'] as String?,
      chatMessages: ((map['chatMessages'] as List?) ?? [])
          .map((m) => ChatMessage.fromMap(Map<String, dynamic>.from(m as Map)))
          .toList(),
    );
  }
}

class ChatMessage {
  const ChatMessage({required this.role, required this.content});
  final String role;
  final String content;

  factory ChatMessage.fromMap(Map<String, dynamic> map) => ChatMessage(
        role: map['role'] as String,
        content: map['content'] as String,
      );
}
