import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  final AuthService auth;
  const LoginScreen({super.key, required this.auth});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _pass = TextEditingController();
  bool _loading = false;
  bool _showRegister = false;
  final _nombre = TextEditingController();

  void _login() async {
    setState(() => _loading = true);
    final r = await widget.auth.login(_email.text, _pass.text);
    if (!mounted) return;
    setState(() => _loading = false);
    if (r['ok']) {
      Navigator.pushReplacementNamed(context, '/projects');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(r['error'] ?? 'Error'),
        backgroundColor: Colors.red,
      ));
    }
  }

  void _register() async {
    setState(() => _loading = true);
    final r = await widget.auth.register(_nombre.text, _email.text, _pass.text);
    if (!mounted) return;
    setState(() => _loading = false);
    if (r['ok']) {
      setState(() => _showRegister = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cuenta creada. Ahora inicia sesion.')));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(r['error'] ?? 'Error'), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Center(
        child: Container(
          width: 420,
          padding: const EdgeInsets.all(36),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 16)],
          ),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(4)),
                child: const Text('IT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 10),
              const Text('Issue Tracker', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            ]),
            const SizedBox(height: 28),
            Text(_showRegister ? 'Crear cuenta' : 'Iniciar sesion', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            if (_showRegister) ...[
              const Text('Nombre *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(controller: _nombre, decoration: const InputDecoration(hintText: 'Tu nombre')),
              const SizedBox(height: 14),
            ],
            const Text('Email *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 6),
            TextField(controller: _email, decoration: const InputDecoration(hintText: 'correo@ejemplo.com')),
            const SizedBox(height: 14),
            const Text('Contraseña *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 6),
            TextField(controller: _pass, obscureText: true, decoration: const InputDecoration(hintText: '••••••••')),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : (_showRegister ? _register : _login),
                child: _loading
                    ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(_showRegister ? 'Crear cuenta' : 'Iniciar sesion'),
              ),
            ),
            const SizedBox(height: 14),
            Center(
              child: TextButton(
                onPressed: () => setState(() => _showRegister = !_showRegister),
                child: Text(_showRegister ? '¿Ya tienes cuenta? Inicia sesion' : '¿No tienes cuenta? Registrate'),
              ),
            )
          ]),
        ),
      ),
    );
  }
}
