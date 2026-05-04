import 'user.dart';

class Project {
  final int id;
  final String nombre;
  final String descripcion;
  final int ownerId;
  final DateTime createdAt;
  final User? owner;

  Project({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.ownerId,
    required this.createdAt,
    this.owner,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'],
      nombre: json['nombre'],
      descripcion: json['descripcion'],
      ownerId: json['owner_id'],
      createdAt: DateTime.parse(json['createdAt']),
      owner: json['Owner'] != null ? User.fromJson(json['Owner']) : null,
    );
  }
}
