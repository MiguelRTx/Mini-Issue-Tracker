import 'package:flutter/material.dart';
import 'services/auth_service.dart';
import 'theme/app_theme.dart';
import 'screens/login_screen.dart';
import 'screens/projects_screen.dart';

void main() {
  runApp(const App());
}

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = AuthService();
    return MaterialApp(
      title: 'Mini Issue Tracker',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: LoginScreen(auth: auth),
      onGenerateRoute: (settings) {
        if (settings.name == '/projects') {
          return MaterialPageRoute(builder: (_) => ProjectsScreen(auth: auth));
        }
        return MaterialPageRoute(builder: (_) => LoginScreen(auth: auth));
      },
    );
  }
}
