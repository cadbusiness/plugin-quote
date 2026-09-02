import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../services/auth_service.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';

class HomeShell extends StatelessWidget {
  const HomeShell({super.key, required this.auth, required this.child});
  final AuthService auth;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final path = GoRouterState.of(context).uri.path;
    final index = path.startsWith('/configurateur') ? 1 : 0;

    return Scaffold(
      backgroundColor: qbSurface,
      appBar: AppBar(
        titleSpacing: 12,
        leadingWidth: 44,
        leading: const Padding(
          padding: EdgeInsets.only(left: 12),
          child: BrandLogo(variant: BrandLogoVariant.mark, height: 28),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(index == 0 ? 'Devis' : 'Configurateur',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            if (auth.currentOrg != null)
              Text(auth.currentOrg!.name, style: const TextStyle(fontSize: 12, color: qbMuted)),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Déconnexion',
            onPressed: () async {
              await auth.signOut();
              if (context.mounted) context.go('/login');
            },
            icon: const Icon(Icons.logout, size: 20, color: qbMuted),
          ),
        ],
      ),
      body: child,
      bottomNavigationBar: NavigationBar(
        height: 64,
        selectedIndex: index,
        onDestinationSelected: (i) {
          context.go(i == 0 ? '/devis' : '/configurateur');
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.inbox_outlined), selectedIcon: Icon(Icons.inbox), label: 'Devis'),
          NavigationDestination(
            icon: Icon(Icons.tune_outlined),
            selectedIcon: Icon(Icons.tune),
            label: 'Configurateur',
          ),
        ],
      ),
    );
  }
}
