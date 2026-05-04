import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/ticket.dart';
import '../theme/app_theme.dart';

class TicketCard extends StatelessWidget {
  final Ticket ticket;
  final VoidCallback? onTap;

  const TicketCard({super.key, required this.ticket, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('#${ticket.id}', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
              const SizedBox(height: 4),
              Text(ticket.titulo, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              if (ticket.descripcion.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  ticket.descripcion,
                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (ticket.assignee != null)
                    Row(children: [
                      CircleAvatar(
                        backgroundColor: AppTheme.primary,
                        radius: 10,
                        child: Text(ticket.assignee!.nombre[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 9)),
                      ),
                      const SizedBox(width: 5),
                      Text(ticket.assignee!.nombre, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ])
                  else
                    const Text('Sin asignar', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  Text(DateFormat('d/M/yy').format(ticket.createdAt), style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
