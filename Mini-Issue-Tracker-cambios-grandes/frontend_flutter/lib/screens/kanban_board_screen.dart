import 'package:flutter/material.dart';
import '../models/ticket.dart';
import '../models/project.dart';
import '../services/ticket_service.dart';
import '../services/project_service.dart';
import '../services/auth_service.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/kanban_column.dart';
import 'ticket_detail_screen.dart';

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
    } catch (e) {
      // Revert optimistic update
      _load();
      if (!mounted) return;
      // Show clear error dialog instead of silent snackbar
      final msg = e.toString().replaceAll('Exception: ', '');
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('No se puede mover el ticket'),
          content: Text(msg),
          actions: [
            ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Entendido')),
          ],
        ),
      );
    }
  }

  void _openDetail(Ticket ticket) async {
    final reloaded = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => TicketDetailScreen(
          ticket: ticket,
          projectId: widget.project.id,
          auth: widget.auth,
        ),
      ),
    );
    if (reloaded == true) _load();
  }

  void _showNewTicketDialog() {
    final titulo = TextEditingController();
    final desc = TextEditingController();
    int? selectedAssigneeId;
    List<dynamic> members = [];

    showDialog(
      context: context,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setStateDialog) {
          // Load members once
          if (members.isEmpty) {
            ProjectService().getMembers(widget.project.id).then((m) {
              setStateDialog(() => members = m);
            });
          }
          return AlertDialog(
            title: const Text('Nuevo Ticket'),
            content: SizedBox(
              width: 420,
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                TextField(controller: titulo, decoration: const InputDecoration(labelText: 'Titulo *')),
                const SizedBox(height: 12),
                TextField(controller: desc, maxLines: 3, decoration: const InputDecoration(labelText: 'Descripcion')),
                const SizedBox(height: 12),
                InputDecorator(
                  decoration: const InputDecoration(labelText: 'Responsable'),
                  child: DropdownButton<int?>(
                    value: selectedAssigneeId,
                    isExpanded: true,
                    underline: const SizedBox(),
                    items: [
                      const DropdownMenuItem<int?>(value: null, child: Text('Sin asignar')),
                      ...members.map((m) => DropdownMenuItem<int?>(
                        value: m['id'] as int,
                        child: Text(m['nombre'] as String? ?? ''),
                      )),
                    ],
                    onChanged: (v) => setStateDialog(() => selectedAssigneeId = v),
                  ),
                ),
              ]),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
              ElevatedButton(
                onPressed: () async {
                  if (titulo.text.trim().isEmpty) return;
                  Navigator.pop(ctx);
                  await _svc.create(widget.project.id, titulo.text, desc.text, selectedAssigneeId);
                  _load();
                },
                child: const Text('Crear'),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Issue Tracker', userName: widget.auth.currentUser?.nombre, auth: widget.auth),
      body: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    style: TextButton.styleFrom(padding: EdgeInsets.zero, foregroundColor: const Color(0xFF1D4ED8)),
                    child: Text(widget.project.nombre),
                  ),
                  const Text('Tablero de Trabajo', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                ]),
                ElevatedButton(onPressed: _showNewTicketDialog, child: const Text('+ Nuevo Ticket')),
              ],
            ),
            const SizedBox(height: 32),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          KanbanColumn(title: 'Pendiente', status: 'pendiente', indicatorColor: Colors.grey, tickets: _board['pendiente']!, onDrop: _onDrop, onTapTicket: _openDetail),
                          KanbanColumn(title: 'En Progreso', status: 'en_progreso', indicatorColor: Colors.blue, tickets: _board['en_progreso']!, onDrop: _onDrop, onTapTicket: _openDetail),
                          KanbanColumn(title: 'Completado', status: 'completado', indicatorColor: Colors.green, tickets: _board['completado']!, onDrop: _onDrop, onTapTicket: _openDetail),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
