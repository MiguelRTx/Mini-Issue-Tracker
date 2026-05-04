import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/user.dart';

class AuthService extends ChangeNotifier {
  static const String base = 'http://localhost:3000/api/auth';
  static String? _token;
  static User? _currentUser;

  User? get currentUser => _currentUser;
  String? get token => _token;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$base/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      _token = data['token'];
      _currentUser = User.fromJson(data['user']);
      notifyListeners();
      return {'ok': true};
    }
    return {'ok': false, 'error': jsonDecode(res.body)['error']};
  }

  Future<Map<String, dynamic>> register(String nombre, String email, String password) async {
    final res = await http.post(
      Uri.parse('$base/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'nombre': nombre, 'email': email, 'password': password}),
    );
    if (res.statusCode == 201) return {'ok': true};
    return {'ok': false, 'error': jsonDecode(res.body)['error']};
  }

  void logout() {
    _token = null;
    _currentUser = null;
    notifyListeners();
  }

  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };
}
