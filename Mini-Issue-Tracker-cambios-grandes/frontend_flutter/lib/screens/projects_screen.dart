import 'package:flutter/material.dart';
import '../models/project.dart';
import '../services/project_service.dart';
import '../services/auth_service.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/project_card.dart';
import 'create_project_screen.dart';
import 'kanban_board_screen.dart';
import 'project_detail_screen.dart';

class ProjectsScreen extends StatefulWidget {
  final AuthService auth;
  const ProjectsScreen({super.key, required this.auth});

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  final _svc = ProjectService();
  List<Project> _projects = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final p = await _svc.getAll();
      setState(() { _projects = p; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.auth.currentUser;
    return Scaffold(
      appBar: CustomAppBar(title: 'Issue Tracker', userName: user?.nombre, auth: widget.auth),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(32),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Proyectos', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                    Text('Proyectos a los que perteneces', style: TextStyle(color: Color(0xFF64748B))),
                  ]),
                  ElevatedButton(
                    onPressed: () async {
                      await Navigator.push(context, MaterialPageRoute(builder: (_) => CreateProjectScreen(auth: widget.auth)));
                      _load();
                    },
                    child: const Text('+ Nuevo Proyecto'),
                  ),
                ]),
                const SizedBox(height: 32),
                Expanded(
                  child: _projects.isEmpty
                      ? const Center(child: Text('No hay proyectos aun. Crea uno!'))
                      : GridView.builder(
                          gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                            maxCrossAxisExtent: 380,
                            crossAxisSpacing: 20,
                            mainAxisSpacing: 20,
                            childAspectRatio: 1.45,
                          ),
                          itemCount: _projects.length,
                          itemBuilder: (_, i) => ProjectCard(
                            project: _projects[i],
                            onTablero: () => Navigator.push(context, MaterialPageRoute(
                              builder: (_) => KanbanBoardScreen(project: _projects[i], auth: widget.auth),
                            )),
                            onDetalles: () async {
                              await Navigator.push(context, MaterialPageRoute(
                                builder: (_) => ProjectDetailScreen(project: _projects[i], auth: widget.auth),
                              ));
                              _load();
                            },
                          ),
                        ),
                ),
              ]),
            ),
    );
  }
}
