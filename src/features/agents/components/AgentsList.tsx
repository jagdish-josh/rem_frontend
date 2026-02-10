import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentsService } from '../api/agentsService';
import { authService } from '../../auth/api/authService';
import { Mail, Phone, Loader2, Pencil, Trash2, Search } from 'lucide-react';
import type { Agent } from '../types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AgentsListProps {
    onEdit: (agent: Agent) => void;
    onDelete: (agent: Agent) => void;
}

export default function AgentsList({ onEdit, onDelete }: AgentsListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: agents, isLoading, error } = useQuery({
        queryKey: ['agents'],
        queryFn: agentsService.getAgents,
    });

    const { data: currentUser } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authService.getUser,
    });

    // Only ORG_ADMIN can manage agents
    const canManageAgents = currentUser?.role === 'ORG_ADMIN';

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-destructive/15 text-destructive rounded-lg border border-destructive/20">
                Error loading agents. Please try again later.
            </div>
        )
    }

    const filteredAgents = agents?.filter(agent =>
        (agent.name || agent.full_name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Agent</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            {canManageAgents && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAgents?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={canManageAgents ? 5 : 4} className="h-24 text-center">
                                    No agents found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAgents?.map((agent) => (
                                <TableRow key={agent.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {(agent.name || agent.full_name)?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{agent.name || agent.full_name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5 mr-1.5" />
                                                {agent.email}
                                            </div>
                                            {agent.phone && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Phone className="h-3.5 w-3.5 mr-1.5" />
                                                    {agent.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {agent.role_name ? agent.role_name.replace('_', ' ').toLowerCase() : 'User'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                            Active
                                        </Badge>
                                    </TableCell>
                                    {canManageAgents && (
                                        <TableCell className="text-right">
                                            {agent.role_name === 'ORG_USER' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEdit(agent)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDelete(agent)}
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">No actions</span>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
