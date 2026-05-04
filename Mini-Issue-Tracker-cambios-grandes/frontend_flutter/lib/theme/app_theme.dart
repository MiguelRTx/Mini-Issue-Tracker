import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary = Color(0xFF1D4ED8);
  static const Color background = Color(0xFFF1F5F9);
  static const Color headerBg = Color(0xFF0F172A);
  static const Color textMain = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);

  static ThemeData get light {
    return ThemeData(
      primaryColor: primary,
      scaffoldBackgroundColor: background,
      appBarTheme: const AppBarTheme(
        backgroundColor: headerBg,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textMain,
          side: const BorderSide(color: Color(0xFFCBD5E1)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 1,
        shadowColor: Colors.black12,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        margin: EdgeInsets.zero,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: primary, width: 2)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      ),
    );
  }
}
