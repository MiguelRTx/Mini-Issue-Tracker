import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String? userName;
  final AuthService? auth;

  const CustomAppBar({super.key, required this.title, this.userName, this.auth});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Row(children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(4)),
          child: const Text('IT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        ),
        const SizedBox(width: 12),
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
      ]),
      actions: [
        if (userName != null)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(children: [
              CircleAvatar(
                backgroundColor: AppTheme.primary,
                radius: 14,
                child: Text(userName![0].toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 12)),
              ),
              const SizedBox(width: 8),
              Text(userName!, style: const TextStyle(fontSize: 14, color: Colors.white)),
              const SizedBox(width: 16),
              TextButton(
                onPressed: () {
                  auth?.logout();
                  Navigator.pushReplacementNamed(context, '/login');
                },
                style: TextButton.styleFrom(foregroundColor: Colors.white70),
                child: const Text('Cerrar sesion'),
              ),
            ]),
          )
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
