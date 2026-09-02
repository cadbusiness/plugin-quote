import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../services/auth_service.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key, required this.auth});
  final AuthService auth;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _name = TextEditingController();
  final _slug = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _slug.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.auth.createOrganization(_name.text);
      if (mounted) context.go('/devis');
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _join() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.auth.joinOrganization(_slug.text);
      if (mounted) context.go('/devis');
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: ListView(
              padding: const EdgeInsets.all(24),
              children: [
                const BrandLogo(variant: BrandLogoVariant.lockup, height: 120),
                const SizedBox(height: 28),
                const Text('Votre espace', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                const Text('Créez l’espace de votre entreprise, ou rejoignez un espace encore vide.',
                    style: TextStyle(color: qbMuted)),
                const SizedBox(height: 28),
                const Text('Créer mon espace', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                TextField(
                  controller: _name,
                  decoration: const InputDecoration(labelText: 'Nom de l’entreprise'),
                ),
                const SizedBox(height: 12),
                FilledButton(onPressed: _busy ? null : _create, child: const Text('Créer l’espace')),
                const SizedBox(height: 28),
                const Text('Rejoindre un espace', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                TextField(
                  controller: _slug,
                  decoration: const InputDecoration(labelText: 'Identifiant (slug)', hintText: 'quickly'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(onPressed: _busy ? null : _join, child: const Text('Rejoindre')),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Text(_error!, style: const TextStyle(color: Colors.red)),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
