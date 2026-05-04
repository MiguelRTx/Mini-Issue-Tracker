import 'package:flutter/material.dart';
import '../models/project.dart';
import '../models/ticket.dart';
import '../services/ticket_service.dart';
import '../services/auth_service.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/kanban_column.dart';

class KanbanBoardScreen extends StatefulWidget {
  final Project project;
  final AuthService auth;

  const KanbanBoardScreen({super.key, required this.project, required this.auth});

  @override
  State<KanbanBoardScreen> createState() => _KanbanBoardScreenState();
}

class _KanbanBoardScreenState extends State<KanbanBoardScreen> {
  final _svc = TicketService();
  Map<String, List<Ticket>> _board = {'pendiente': [], 'en_progreso': [], 'completado': []};
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final b = await _svc.getBoard(widget.project.id);
      setState(() { _board = b; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  void _onDrop(int ticketId, String newStatus) async {
    // Find ticket in all columns
    Ticket? found;
    String? oldStatus;
    _board.forEach((status, list) {
      for (final t in list) {
        if (t.id == ticketId) { found = t; oldStatus = status; }
      }
    });
    if (found == null || oldStatus == newStatus) return;

    // Optimistic update
    setState(() {
      _board[oldStatus!]!.removeWhere((t) => t.id == ticketId);
      _board[newStatus]!.add(found!.copyWith(estado: newStatus));
    });

    try {
      await _svc.changeStatus(widget.project.id, ticketId, newStatus);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error al cambiar estado'), backgroundColor: Colors.red));
      _load();
    }
  }

  void _showNewTicketDialog() {
    final titulo = TextEditingController();
    final desc = TextEditingController();
    showDialog(context: context, builder: (_) => AlertDialog(
      title: const Text('Nuevo Ticket'),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        TextField(controller: titulo, decoration: const InputDecoration(labelText: 'Titulo *')),
        const SizedBox(height: 12),
        TextField(controller: desc, maxLines: 3, decoration: const InputDecoration(labelText: 'Descripcion')),
      ]),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
        ElevatedButton(
          onPressed: () async {
            if (titulo.text.isEmpty) return;
            Navigator.pop(context);
            await _svc.create(widget.project.id, titulo.text, desc.text, null);
            _load();
          },
          child: const Text('Crear'),
        ),
      ],
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Issue Tracker', userName: widget.auth.currentUser?.nombre, auth: widget.auth),
      body: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                style: TextButton.styleFrom(padding: EdgeInsets.zero),
                child: Text(widget.project.nombre, style: const TextStyle(color: Color(0xFF1D4ED8))),
              ),
              const Text('Tablero de Trabajo', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            ]),
            ElevatedButton(onPressed: _showNewTicketDialog, child: const Text('+ Nuevo Ticket')),
          ]),
          const SizedBox(height: 32),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      KanbanColumn(title: 'Pendiente', status: 'pendiente', indicatorColor: Colors.grey, tickets: _board['pendiente']!, onDrop: _onDrop),
                      KanbanColumn(title: 'En Progreso', status: 'en_progreso', indicatorColor: Colors.blue, tickets: _board['en_progreso']!, onDrop: _onDrop),
                      KanbanColumn(title: 'Completado', status: 'completado', indicatorColor: Colors.green, tickets: _board['completado']!, onDrop: _onDrop),
                    ]),
                  ),
          ),
        ]),
      ),
    );
  }
}
