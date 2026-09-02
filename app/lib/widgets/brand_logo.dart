import 'package:flutter/material.dart';

class BrandLogo extends StatelessWidget {
  const BrandLogo({super.key, this.variant = BrandLogoVariant.wordmark, this.height = 32});

  final BrandLogoVariant variant;
  final double height;

  @override
  Widget build(BuildContext context) {
    if (variant == BrandLogoVariant.lockup) {
      return Image.asset(
        'assets/brand/quotebuilder-lockup.png',
        height: height,
        fit: BoxFit.contain,
        filterQuality: FilterQuality.high,
      );
    }

    final mark = Image.asset(
      'assets/brand/quotebuilder-mark.png',
      height: height,
      width: height,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
    );

    if (variant == BrandLogoVariant.mark) return mark;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        mark,
        const SizedBox(width: 8),
        Text(
          'QuoteBuilder',
          style: TextStyle(
            fontSize: height * 0.45,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.2,
            color: const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }
}

enum BrandLogoVariant { mark, wordmark, lockup }
