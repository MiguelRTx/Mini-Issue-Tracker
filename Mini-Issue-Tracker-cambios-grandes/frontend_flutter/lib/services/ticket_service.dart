import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/ticket.dart';
import 'auth_service.dart';

class TicketService {
  static const String base = 'http://localhost:3000/api/projects';

  // boardGet devuelve { project, tickets: { pendiente:[], en_progreso:[], completado:[] } }
  Future<Map<String, List<Ticket>>> getBoard(int projectId) async {
    final res = await http.get(Uri.parse('$base/$projectId/tickets'), headers: AuthService.headers);
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      final grouped = data['tickets'] as Map<String, dynamic>;
      return {
        'pendiente':   (grouped['pendiente']   as List).map((j) => Ticket.fromJson(j)).toList(),
        'en_progreso': (grouped['en_progreso'] as List).map((j) => Ticket.fromJson(j)).toList(),
        'completado':  (grouped['completado']  as List).map((j) => Ticket.fromJson(j)).toList(),
      };
    }
    throw Exception('Error al cargar tablero');
  }

  Future<void> changeStatus(int projectId, int ticketId, String estado) async {
    final res = await http.patch(
      Uri.parse('$base/$projectId/tickets/$ticketId/status'),
      headers: AuthService.headers,
      body: jsonEncode({'estado': estado}),
    );
    if (res.statusCode != 200) {
      final error = jsonDecode(res.body)['error'] ?? 'Error al cambiar estado';
      throw Exception(error);
    }
  }

  Future<Ticket> create(int projectId, String titulo, String descripcion, int? assignedTo) async {
    final body = <String, dynamic>{'titulo': titulo, 'descripcion': descripcion};
    if (assignedTo != null) body['assigned_to'] = assignedTo;
    final res = await http.post(
      Uri.parse('$base/$projectId/tickets'),
      headers: AuthService.headers,
      body: jsonEncode(body),
    );
    if (res.statusCode == 201) return Ticket.fromJson(jsonDecode(res.body)['ticket']);
    throw Exception('Error al crear ticket');
  }

  Future<void> update(int projectId, int ticketId, String titulo, String descripcion, int? assignedTo) async {
    final body = <String, dynamic>{'titulo': titulo, 'descripcion': descripcion};
    if (assignedTo != null) body['assigned_to'] = assignedTo;
    final res = await http.put(
      Uri.parse('$base/$projectId/tickets/$ticketId'),
      headers: AuthService.headers,
      body: jsonEncode(body),
    );
    if (res.statusCode != 200) {
      final error = jsonDecode(res.body)['error'] ?? 'Error al actualizar ticket';
      throw Exception(error);
    }
  }

  Future<void> delete(int projectId, int ticketId) async {
    await http.delete(Uri.parse('$base/$projectId/tickets/$ticketId'), headers: AuthService.headers);
  }
}
