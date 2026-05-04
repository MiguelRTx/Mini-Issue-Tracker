import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/project.dart';
import '../theme/app_theme.dart';

class ProjectCard extends StatelessWidget {
  final Project project;
  final VoidCallback onTablero;
  final VoidCallback onDetalles;

  const ProjectCard({super.key, required this.project, required this.onTablero, required this.onDetalles});

  @override
  Widget build(BuildContext context) {
    final tag = project.nombre.length >= 4 ? project.nombre.substring(0, 4).toUpperCase() : project.nombre.toUpperCase();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: AppTheme.background, borderRadius: BorderRadius.circular(4)),
                  child: Text(tag, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Color(0xFFDBEAFE), borderRadius: BorderRadius.circular(4)),
                  child: const Text('DUEÑO', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(project.nombre, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(project.descripcion, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary), maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 12),
            Text(
              'Dueño: ${project.owner?.nombre ?? '-'}   ${DateFormat('d/M/yyyy').format(project.createdAt)}',
              style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
            ),
            const Spacer(),
            const Divider(),
            Row(children: [
              ElevatedButton(onPressed: onTablero, child: const Text('Ver Tablero')),
              const SizedBox(width: 10),
              OutlinedButton(onPressed: onDetalles, child: const Text('Detalles')),
            ]),
          ],
        ),
      ),
    );
  }
}
