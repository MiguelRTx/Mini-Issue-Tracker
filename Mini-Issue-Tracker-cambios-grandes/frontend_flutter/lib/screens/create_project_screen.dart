import 'package:flutter/material.dart';
import '../services/project_service.dart';
import '../services/auth_service.dart';
import '../widgets/custom_app_bar.dart';

class CreateProjectScreen extends StatefulWidget {
  final AuthService auth;
  const CreateProjectScreen({super.key, required this.auth});

  @override
  State<CreateProjectScreen> createState() => _CreateProjectScreenState();
}

class _CreateProjectScreenState extends State<CreateProjectScreen> {
  final _nombre = TextEditingController();
  final _desc = TextEditingController();
  bool _loading = false;

  void _crear() async {
    if (_nombre.text.isEmpty || _desc.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Completa todos los campos')));
      return;
    }
    setState(() => _loading = true);
    try {
      await ProjectService().create(_nombre.text, _desc.text);
      if (!mounted) return;
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error al crear proyecto'), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Issue Tracker', userName: widget.auth.currentUser?.nombre, auth: widget.auth),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Proyectos')),
          const Text('Nuevo Proyecto', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          Container(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Nombre del proyecto *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  TextField(controller: _nombre, decoration: const InputDecoration(hintText: 'Ej: Sistema de Inventario')),
                  const SizedBox(height: 16),
                  const Text('Descripcion *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  TextField(controller: _desc, maxLines: 5, decoration: const InputDecoration(hintText: 'Describe el objetivo y alcance del proyecto...')),
                  const SizedBox(height: 24),
                  Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                    OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _loading ? null : _crear,
                      child: _loading ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Crear proyecto'),
                    ),
                  ]),
                ]),
              ),
            ),
          ),
        ]),
      ),
    );
  }
}
