import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Card, Button, Badge, Textarea, Modal } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  user: {
    email: string;
    name: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export function SupportTicketsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => {
      return apiRequest<{ tickets: Ticket[] }>('/api/admin-support-tickets', {}, accessToken);
    },
    enabled: !!accessToken,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/admin-support-tickets?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
  });

  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    open: 'warning',
    in_progress: 'info',
    resolved: 'success',
    closed: 'default',
  };

  const filteredTickets = data?.tickets || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A3D35]">Support Tickets</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and respond to user support tickets</p>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-gray-500">Loading tickets...</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-[#18F59B]' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#0A3D35]">{ticket.subject}</h3>
                        <Badge variant={statusColors[ticket.status] || 'default'}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{ticket.user?.email || 'Anonymous'}</span>
                        <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {selectedTicket && (
            <div className="lg:col-span-1">
              <Card>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0A3D35] mb-2">{selectedTicket.subject}</h3>
                    <Badge variant={statusColors[selectedTicket.status] || 'default'}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: selectedTicket.id, status: 'in_progress' })}
                        className="flex-1"
                      >
                        <MessageSquare className="w-4 h-4" />
                        In Progress
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: selectedTicket.id, status: 'resolved' })}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: selectedTicket.id, status: 'closed' })}
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4" />
                      Close Ticket
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
