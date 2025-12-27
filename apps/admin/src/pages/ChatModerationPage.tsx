import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MessageCircle, Trash2, Users } from 'lucide-react';
import { Card, Button, Badge, Table, TableRow, TableCell } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface ChatRoom {
  id: string;
  name: string;
  isGroup: boolean;
  createdAt: string;
  _count: {
    members: number;
    messages: number;
  };
}

export function ChatModerationPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-chat-rooms'],
    queryFn: async () => {
      // This would need a dedicated admin endpoint
      return apiRequest<{ rooms: ChatRoom[] }>('/api/chat-rooms', {}, accessToken).catch(() => ({ rooms: [] }));
    },
    enabled: !!accessToken,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // This would need a dedicated admin endpoint
      return apiRequest(`/api/chat-rooms?id=${id}`, {
        method: 'DELETE',
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-rooms'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A3D35]">Chat Moderation</h1>
        <p className="text-sm text-gray-600 mt-1">Monitor and manage chat rooms</p>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-gray-500">Loading chat rooms...</div>
        </Card>
      ) : (
        <Card padding="none">
          <Table headers={['Room Name', 'Type', 'Members', 'Messages', 'Created', 'Actions']}>
            {data?.rooms?.map((room) => (
              <TableRow key={room.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#18F59B] to-[#0A3D35] flex items-center justify-center text-white">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-900">{room.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={room.isGroup ? 'info' : 'default'}>
                    {room.isGroup ? 'Group' : 'Direct'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{room._count.members}</span>
                  </div>
                </TableCell>
                <TableCell>{room._count.messages}</TableCell>
                <TableCell>{new Date(room.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this chat room?')) {
                        deleteMutation.mutate(room.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}
