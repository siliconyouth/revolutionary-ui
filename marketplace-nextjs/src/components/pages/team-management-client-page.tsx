'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface TeamMember {
  id: string;
  role: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

export default function TeamManagementClientPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/team');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch team members.');
      }
      const data = await response.json();
      setTeamMembers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (inviteEmail) {
      try {
        const response = await fetch('/api/team', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to send invite.');
        }
        setInviteEmail('');
        fetchTeamMembers(); // Refresh the list
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    // The DELETE endpoint is not yet implemented, this is a placeholder
    console.log(`Request to remove member ${memberId}`);
    // In a real app, you would call:
    // await fetch(`/api/team/${memberId}`, { method: 'DELETE' });
    // fetchTeamMembers();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite New Member</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input
            type="email"
            placeholder="member@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-grow"
          />
          <Select value={inviteRole} onValueChange={setInviteRole}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Member">Member</SelectItem>
              <SelectItem value="Viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleInvite} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Send Invite
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Team</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
          {error && <div className="text-red-500 flex items-center p-4"><AlertTriangle className="mr-2 h-4 w-4" />{error}</div>}
          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.profiles.avatar_url} />
                          <AvatarFallback>
                            {member.profiles.full_name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.profiles.full_name}</p>
                          <p className="text-sm text-muted-foreground">{member.profiles.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell className="text-right">
                      {member.role !== 'Owner' && (
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.profiles.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
