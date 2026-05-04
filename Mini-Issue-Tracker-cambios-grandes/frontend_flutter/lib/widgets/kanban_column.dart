import 'package:flutter/material.dart';
import '../models/ticket.dart';
import '../theme/app_theme.dart';
import 'ticket_card.dart';

class KanbanColumn extends StatelessWidget {
  final String title;
  final String status;
  final Color indicatorColor;
  final List<Ticket> tickets;
  final Function(int ticketId, String newStatus) onDrop;

  const KanbanColumn({
    super.key,
    required this.title,
    required this.status,
    required this.indicatorColor,
    required this.tickets,
    required this.onDrop,
  });

  @override
  Widget build(BuildContext context) {
    return DragTarget<int>(
      onWillAcceptWithDetails: (_) => true,
      onAcceptWithDetails: (d) => onDrop(d.data, status),
      builder: (context, candidates, _) {
        return Container(
          width: 320,
          margin: const EdgeInsets.only(right: 20),
          decoration: BoxDecoration(
            color: candidates.isNotEmpty
                ? AppTheme.primary.withValues(alpha: 0.05)
                : AppTheme.background,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0)))),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(children: [
                      Container(width: 3, height: 16, color: indicatorColor),
                      const SizedBox(width: 8),
                      Text(title.toUpperCase(), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: indicatorColor)),
                    ]),
                    Text('${tickets.length}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: tickets.length,
                  itemBuilder: (_, i) {
                    final t = tickets[i];
                    return Draggable<int>(
                      data: t.id,
                      feedback: SizedBox(
                        width: 280,
                        child: Material(color: Colors.transparent, child: Opacity(opacity: 0.85, child: TicketCard(ticket: t))),
                      ),
                      childWhenDragging: Opacity(opacity: 0.3, child: TicketCard(ticket: t)),
                      child: TicketCard(ticket: t),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
