import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config.dart';
import 'screens/configurator_screen.dart';
import 'screens/home_shell.dart';
import 'screens/login_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/quote_detail_screen.dart';
import 'screens/quotes_screen.dart';
import 'services/auth_service.dart';
import 'services/configurator_api.dart';
import 'services/quotes_service.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('fr');
  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    publishableKey: AppConfig.supabasePublishableKey,
  );
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  final client = Supabase.instance.client;
  final auth = AuthService(client);
  await auth.loadMembership();
  runApp(QuoteBuilderApp(client: client, auth: auth));
}

class QuoteBuilderApp extends StatefulWidget {
  const QuoteBuilderApp({super.key, required this.client, required this.auth});
  final SupabaseClient client;
  final AuthService auth;

  @override
  State<QuoteBuilderApp> createState() => _QuoteBuilderAppState();
}

class _QuoteBuilderAppState extends State<QuoteBuilderApp> {
  late final AuthService _auth = widget.auth;
  late final QuotesService _quotes = QuotesService(widget.client, _auth);
  late final ConfiguratorApi _api = ConfiguratorApi();
  late final GoRouter _router = GoRouter(
    initialLocation: _auth.user == null ? '/login' : '/devis',
    refreshListenable: GoRouterRefreshStream(_auth.onAuthStateChange),
    redirect: (context, state) {
      final signedIn = _auth.user != null;
      final loc = state.matchedLocation;
      final loggingIn = loc == '/login';
      final onboarding = loc == '/onboarding';
      if (!signedIn && !loggingIn) return '/login';
      if (signedIn && loggingIn) return _auth.hasOrg ? '/devis' : '/onboarding';
      if (signedIn && !_auth.hasOrg && !onboarding) return '/onboarding';
      if (signedIn && _auth.hasOrg && onboarding) return '/devis';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => LoginScreen(auth: _auth),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => OnboardingScreen(auth: _auth),
      ),
      GoRoute(
        path: '/devis/:id',
        builder: (context, state) => QuoteDetailScreen(
          quotes: _quotes,
          id: state.pathParameters['id']!,
        ),
      ),
      ShellRoute(
        builder: (context, state, child) => HomeShell(auth: _auth, child: child),
        routes: [
          GoRoute(
            path: '/devis',
            builder: (context, state) => QuotesScreen(quotes: _quotes),
          ),
          GoRoute(
            path: '/configurateur',
            builder: (context, state) => ConfiguratorScreen(api: _api, auth: _auth),
          ),
        ],
      ),
    ],
  );

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'QuoteBuilder',
      debugShowCheckedModeBanner: false,
      theme: quoteBuilderTheme(),
      routerConfig: _router,
    );
  }
}

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    _sub = stream.listen((_) => notifyListeners());
  }
  late final StreamSubscription<dynamic> _sub;

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}
