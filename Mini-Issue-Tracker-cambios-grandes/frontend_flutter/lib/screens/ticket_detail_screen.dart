import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/ticket.dart';
import '../services/ticket_service.dart';
import '../services/project_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_app_bar.dart';

class TicketDetailScreen extends StatefulWidget {
  final Ticket ticket;
  final int projectId;
  final AuthService auth;

  const TicketDetailScreen({
    super.key,
    required this.ticket,
    required this.projectId,
    required this.auth,
  });

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  final _ticketSvc = TicketService();
  final _projectSvc = ProjectService();

  bool _editing = false;
  bool _saving = false;

  late TextEditingController _titulo;
  late TextEditingController _desc;

  List<Map<String, dynamic>> _members = [];
  int? _selectedAssigneeId;

  @override
  void initState() {
    super.initState();
    _titulo = TextEditingController(text: widget.ticket.titulo);
    _desc = TextEditingController(text: widget.ticket.descripcion);
    _selectedAssigneeId = widget.ticket.assigneeId;
    _loadMembers();
  }

  Future<void> _loadMembers() async {
    try {
      final raw = await _projectSvc.getMembers(widget.projectId);
      setState(() {
        _members = raw.map((m) => m as Map<String, dynamic>).toList();
      });
    } catch (_) {}
  }

  Color _estadoColor(String e) {
    switch (e) {
      case 'en_progreso': return Colors.blue;
      case 'completado': return Colors.green;
      default: return Colors.grey;
    }
  }

  String _estadoLabel(String e) {
    switch (e) {
      case 'en_progreso': return 'En Progreso';
      case 'completado': return 'Completado';
      default: return 'Pendiente';
    }
  }

  Future<void> _save() async {
    if (_titulo.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('El titulo es obligatorio'), backgroundColor: Colors.red));
      return;
    }
    setState(() => _saving = true);
    try {
      await _ticketSvc.update(widget.projectId, widget.ticket.id, _titulo.text, _desc.text, _selectedAssigneeId);
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(e.toString().replaceAll('Exception: ', '')),
        backgroundColor: Colors.red,
      ));
    }
  }

  Future<void> _delete() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Eliminar ticket'),
        content: Text('¿Seguro que queres eliminar "${widget.ticket.titulo}"?\nEsta acción no se puede deshacer.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await _ticketSvc.delete(widget.projectId, widget.ticket.id);
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error al eliminar'), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.ticket;
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
                  child: const Text('← Volver al tablero'),
                ),
                if (!_editing)
                  Row(children: [
                    OutlinedButton(onPressed: () => setState(() => _editing = true), child: const Text('Editar')),
                    const SizedBox(width: 10),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                      onPressed: _delete,
                      child: const Text('Eliminar'),
                    ),
                  ]),
              ],
            ),
            const SizedBox(height: 24),
            Container(
              constraints: const BoxConstraints(maxWidth: 720),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header: ID + Estado
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('#${t.id}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: _estadoColor(t.estado).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: _estadoColor(t.estado)),
                            ),
                            child: Text(
                              _estadoLabel(t.estado),
                              style: TextStyle(color: _estadoColor(t.estado), fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // TITULO
                      const Text('Titulo *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textSecondary)),
                      const SizedBox(height: 6),
                      _editing
                          ? TextField(controller: _titulo, decoration: const InputDecoration(hintText: 'Titulo del ticket'))
                          : Text(t.titulo, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 20),

                      // DESCRIPCION
                      const Text('Descripcion', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textSecondary)),
                      const SizedBox(height: 6),
                      _editing
                          ? TextField(controller: _desc, maxLines: 4, decoration: const InputDecoration(hintText: 'Descripcion del ticket'))
                          : Text(
                              t.descripcion.isEmpty ? 'Sin descripcion' : t.descripcion,
                              style: const TextStyle(fontSize: 14, height: 1.5),
                            ),
                      const SizedBox(height: 20),

                      // RESPONSABLE
                      const Text('Responsable', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textSecondary)),
                      const SizedBox(height: 6),
                      _editing
                          ? InputDecorator(
                              decoration: const InputDecoration(hintText: 'Seleccionar responsable'),
                              child: DropdownButton<int?>(
                                value: _selectedAssigneeId,
                                isExpanded: true,
                                underline: const SizedBox(),
                                items: [
                                  const DropdownMenuItem<int?>(value: null, child: Text('Sin asignar')),
                                  ..._members.map((m) => DropdownMenuItem<int?>(
                                    value: m['id'] as int,
                                    child: Text(m['nombre'] as String? ?? ''),
                                  )),
                                ],
                                onChanged: (v) => setState(() => _selectedAssigneeId = v),
                              ),
                            )
                          : Row(children: [
                              if (t.assignee != null) ...[
                                CircleAvatar(
                                  backgroundColor: AppTheme.primary,
                                  radius: 12,
                                  child: Text(t.assignee!.nombre[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 11)),
                                ),
                                const SizedBox(width: 8),
                              ],
                              Text(
                                t.assignee?.nombre ?? 'Sin asignar',
                                style: TextStyle(fontSize: 14, color: t.assignee == null ? AppTheme.textSecondary : AppTheme.textMain),
                              ),
                            ]),
                      const SizedBox(height: 20),

                      // FECHA
                      Row(children: [
                        const Icon(Icons.calendar_today_outlined, size: 14, color: AppTheme.textSecondary),
                        const SizedBox(width: 6),
                        Text(
                          'Creado el ${DateFormat('d/M/yyyy').format(t.createdAt)}',
                          style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                        ),
                      ]),

                      // BOTONES DE EDICION
                      if (_editing) ...[
                        const SizedBox(height: 24),
                        const Divider(),
                        const SizedBox(height: 16),
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
            ),
          ],
        ),
      ),
    );
  }
}
