import '../models/user.dart';

class Ticket {
  final int id;
  final String titulo;
  final String descripcion;
  final String estado;
  final int projectId;
  final int? assigneeId;
  final DateTime createdAt;
  final User? assignee;

  Ticket({
    required this.id,
    required this.titulo,
    required this.descripcion,
    required this.estado,
    required this.projectId,
    this.assigneeId,
    required this.createdAt,
    this.assignee,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['id'],
      titulo: json['titulo'],
      descripcion: json['descripcion'] ?? '',
      estado: json['estado'],
      projectId: json['project_id'],
      assigneeId: json['assigned_to'],
      createdAt: DateTime.parse(json['createdAt']),
      assignee: json['Assignee'] != null ? User.fromJson(json['Assignee']) : null,
    );
  }

  Ticket copyWith({String? estado}) => Ticket(
    id: id, titulo: titulo, descripcion: descripcion,
    estado: estado ?? this.estado, projectId: projectId,
    assigneeId: assigneeId, createdAt: createdAt, assignee: assignee,
  );
}
