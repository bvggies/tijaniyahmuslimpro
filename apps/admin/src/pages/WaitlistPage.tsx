import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserPlus, Mail, MessageSquare } from 'lucide-react';
import { Card, Badge, Table, TableRow, TableCell } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export function WaitlistPage() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'waitlist' | 'contacts'>('waitlist');

  const { data: waitlistData, isLoading: waitlistLoading } = useQuery({
    queryKey: ['admin-waitlist'],
    queryFn: async () => {
      return apiRequest<{ subscribers: Subscriber[] }>('/api/admin-waitlist', {}, accessToken);
    },
    enabled: !!accessToken && activeTab === 'waitlist',
  });

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => {
      return apiRequest<{ contacts: Contact[] }>('/api/admin-waitlist', {}, accessToken).catch(() => ({ contacts: [] }));
    },
    enabled: !!accessToken && activeTab === 'contacts',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A3D35]">Waitlist & Contacts</h1>
        <p className="text-sm text-gray-600 mt-1">Manage subscribers and contact submissions</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('waitlist')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'waitlist'
              ? 'text-[#18F59B] border-b-2 border-[#18F59B]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Waitlist ({waitlistData?.subscribers?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'contacts'
              ? 'text-[#18F59B] border-b-2 border-[#18F59B]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Contacts ({contactsData?.contacts?.length || 0})
        </button>
      </div>

      {activeTab === 'waitlist' ? (
        waitlistLoading ? (
          <Card>
            <div className="p-8 text-center text-gray-500">Loading waitlist...</div>
          </Card>
        ) : (
          <Card padding="none">
            <Table headers={['Email', 'Subscribed Date']}>
              {waitlistData?.subscribers?.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{subscriber.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(subscriber.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </Table>
          </Card>
        )
      ) : (
        contactsLoading ? (
          <Card>
            <div className="p-8 text-center text-gray-500">Loading contacts...</div>
          </Card>
        ) : (
          <div className="space-y-4">
            {contactsData?.contacts?.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#0A3D35] mb-1">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                    <Badge>{new Date(contact.createdAt).toLocaleDateString()}</Badge>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
