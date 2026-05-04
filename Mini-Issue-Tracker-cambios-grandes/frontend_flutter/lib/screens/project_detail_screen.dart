import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../models/project.dart';
import '../services/project_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_app_bar.dart';
import 'kanban_board_screen.dart';

class ProjectDetailScreen extends StatefulWidget {
  final Project project;
  final AuthService auth;

  const ProjectDetailScreen({super.key, required this.project, required this.auth});

  @override
  State<ProjectDetailScreen> createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends State<ProjectDetailScreen> {
  final _svc = ProjectService();
  List<dynamic> _members = [];
  bool _loadingMembers = true;
  bool _editing = false;
  bool _saving = false;

  late TextEditingController _nombre;
  late TextEditingController _desc;

  // User search
  List<Map<String, dynamic>> _allUsers = [];
  List<Map<String, dynamic>> _filteredUsers = [];
  final _searchCtrl = TextEditingController();
  bool _addingMember = false;

  @override
  void initState() {
    super.initState();
    _nombre = TextEditingController(text: widget.project.nombre);
    _desc = TextEditingController(text: widget.project.descripcion);
    _loadMembers();
    _loadAllUsers();
    _searchCtrl.addListener(() => _onSearchChanged(_searchCtrl.text));
  }

  Future<void> _loadMembers() async {
    setState(() => _loadingMembers = true);
    try {
      final m = await _svc.getMembers(widget.project.id);
      setState(() { _members = m; _loadingMembers = false; });
    } catch (_) { setState(() => _loadingMembers = false); }
  }

  Future<void> _loadAllUsers() async {
    try {
      final res = await http.get(
        Uri.parse('http://localhost:3000/api/auth/users'),
        headers: AuthService.headers,
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() {
          _allUsers = (data['users'] as List).map((u) => u as Map<String, dynamic>).toList();
        });
      }
    } catch (_) {}
  }

  void _onSearchChanged(String query) {
    final q = query.toLowerCase().trim();
    final currentMemberIds = _members.map((m) => m['id']).toSet();
    setState(() {
      _filteredUsers = q.isEmpty
          ? []
          : _allUsers.where((u) {
              if (currentMemberIds.contains(u['id'])) return false; // ya es miembro
              final nombre = (u['nombre'] as String? ?? '').toLowerCase();
              final email = (u['email'] as String? ?? '').toLowerCase();
              return nombre.contains(q) || email.contains(q);
            }).toList();
    });
  }

  Future<void> _addMember(Map<String, dynamic> user) async {
    setState(() => _addingMember = true);
    try {
      await _svc.addMember(widget.project.id, user['email'] as String);
      _searchCtrl.clear();
      setState(() => _filteredUsers = []);
      await _loadMembers();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${user['nombre']} agregado al proyecto'), backgroundColor: Colors.green),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _addingMember = false);
    }
  }

  Future<void> _save() async {
    if (_nombre.text.trim().isEmpty) return;
    setState(() => _saving = true);
    try {
      await _svc.update(widget.project.id, _nombre.text, _desc.text);
      if (!mounted) return;
      setState(() { _saving = false; _editing = false; });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Proyecto actualizado'), backgroundColor: Colors.green));
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.project;
    return Scaffold(
      appBar: CustomAppBar(title: 'Issue Tracker', userName: widget.auth.currentUser?.nombre, auth: widget.auth),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  style: TextButton.styleFrom(padding: EdgeInsets.zero, foregroundColor: AppTheme.primary),
                  child: const Text('← Mis proyectos'),
                ),
                Row(children: [
                  ElevatedButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(
                      builder: (_) => KanbanBoardScreen(project: p, auth: widget.auth),
                    )),
                    child: const Text('Ver Tablero'),
                  ),
                  if (!_editing) ...[
                    const SizedBox(width: 10),
                    OutlinedButton(onPressed: () => setState(() => _editing = true), child: const Text('Editar')),
                  ],
                ]),
              ],
            ),
            const SizedBox(height: 24),
            Container(
              constraints: const BoxConstraints(maxWidth: 720),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Datos del proyecto
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Datos del proyecto', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 20),
                          const Text('Nombre *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textSecondary)),
                          const SizedBox(height: 6),
                          _editing
                              ? TextField(controller: _nombre)
                              : Text(p.nombre, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          const Text('Descripcion', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textSecondary)),
                          const SizedBox(height: 6),
                          _editing
                              ? TextField(controller: _desc, maxLines: 3)
                              : Text(p.descripcion.isEmpty ? 'Sin descripcion' : p.descripcion, style: const TextStyle(fontSize: 14)),
                          const SizedBox(height: 16),
                          Row(children: [
                            const Icon(Icons.calendar_today_outlined, size: 14, color: AppTheme.textSecondary),
                            const SizedBox(width: 6),
                            Text('Creado el ${DateFormat('d/M/yyyy').format(p.createdAt)}',
                                style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                          ]),
                          if (_editing) ...[
                            const SizedBox(height: 20),
                            Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                              OutlinedButton(onPressed: () => setState(() => _editing = false), child: const Text('Cancelar')),
                              const SizedBox(width: 12),
                              ElevatedButton(
                                onPressed: _saving ? null : _save,
                                child: _saving
                                    ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                    : const Text('Guardar cambios'),
                              ),
                            ]),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Miembros
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Miembros del proyecto', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 16),
                          // Buscador de usuarios
                          TextField(
                            controller: _searchCtrl,
                            decoration: InputDecoration(
                              hintText: 'Buscar usuario por nombre o email...',
                              prefixIcon: const Icon(Icons.search),
                              suffixIcon: _addingMember
                                  ? const Padding(
                                      padding: EdgeInsets.all(12),
                                      child: SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                                    )
                                  : null,
                            ),
                          ),
                          // Resultados de búsqueda
                          if (_filteredUsers.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Container(
                              decoration: BoxDecoration(
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Column(
                                children: _filteredUsers.map((u) {
                                  final nombre = u['nombre'] as String? ?? '';
                                  final email = u['email'] as String? ?? '';
                                  return ListTile(
                                    dense: true,
                                    leading: CircleAvatar(
                                      backgroundColor: AppTheme.primary.withValues(alpha: 0.15),
                                      radius: 16,
                                      child: Text(nombre.isNotEmpty ? nombre[0].toUpperCase() : '?',
                                          style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.bold)),
                                    ),
                                    title: Text(nombre, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                    subtitle: Text(email, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                    trailing: TextButton(
                                      onPressed: _addingMember ? null : () => _addMember(u),
                                      child: const Text('Agregar'),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                          ],
                          const SizedBox(height: 16),
                          // Lista de miembros actuales
                          _loadingMembers
                              ? const Center(child: CircularProgressIndicator())
                              : _members.isEmpty
                                  ? const Text('No hay miembros aun', style: TextStyle(color: AppTheme.textSecondary))
                                  : Column(
                                      children: _members.map((m) {
                                        final nombre = m['nombre'] as String? ?? '';
                                        final email = m['email'] as String? ?? '';
                                        return ListTile(
                                          contentPadding: EdgeInsets.zero,
                                          leading: CircleAvatar(
                                            backgroundColor: AppTheme.primary,
                                            child: Text(nombre.isNotEmpty ? nombre[0].toUpperCase() : '?',
                                                style: const TextStyle(color: Colors.white)),
                                          ),
                                          title: Text(nombre, style: const TextStyle(fontWeight: FontWeight.bold)),
                                          subtitle: Text(email, style: const TextStyle(color: AppTheme.textSecondary)),
                                        );
                                      }).toList(),
                                    ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
