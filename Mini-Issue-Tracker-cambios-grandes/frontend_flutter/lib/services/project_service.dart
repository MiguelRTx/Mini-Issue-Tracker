import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/project.dart';
import 'auth_service.dart';

class ProjectService {
  static const String base = 'http://localhost:3000/api/projects';

  Future<List<Project>> getAll() async {
    final res = await http.get(Uri.parse(base), headers: AuthService.headers);
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return (data['projects'] as List).map((j) => Project.fromJson(j)).toList();
    }
    throw Exception('Error al cargar proyectos');
  }

  Future<Project> create(String nombre, String descripcion) async {
    final res = await http.post(
      Uri.parse(base),
      headers: AuthService.headers,
      body: jsonEncode({'nombre': nombre, 'descripcion': descripcion}),
    );
    if (res.statusCode == 201) return Project.fromJson(jsonDecode(res.body)['project']);
    throw Exception('Error al crear proyecto');
  }

  Future<Map<String, dynamic>> getDetail(int id) async {
    final res = await http.get(Uri.parse('$base/$id'), headers: AuthService.headers);
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception('Error al cargar detalle');
  }

  Future<void> delete(int id) async {
    await http.delete(Uri.parse('$base/$id'), headers: AuthService.headers);
  }

  Future<void> addMember(int projectId, String email) async {
    await http.post(
      Uri.parse('$base/$projectId/members'),
      headers: AuthService.headers,
      body: jsonEncode({'email': email}),
    );
  }

  Future<void> removeMember(int projectId, int memberId) async {
    await http.delete(Uri.parse('$base/$projectId/members/$memberId'), headers: AuthService.headers);
  }
}
