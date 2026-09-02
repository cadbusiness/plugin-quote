import 'package:flutter_test/flutter_test.dart';
import 'package:quotebuilder_app/config.dart';

void main() {
  test('config defaults to Quickly', () {
    expect(AppConfig.orgSlug, 'quickly');
    expect(AppConfig.configuratorSlug, 'rayonnage');
  });
}
