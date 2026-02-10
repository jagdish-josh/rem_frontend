import { useQuery } from '@tanstack/react-query';
import { contactService } from '../api/contactService';
import { useState } from 'react';
import { UserPlus, Upload, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import CreateContactModal from './CreateContactModal';
import CSVImportModal from './CSVImportModal';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ContactsList() {
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['contacts', 'paginated', page, perPage],
        queryFn: () => contactService.getPaginatedContacts(page, perPage),
    });

    if (error) {
        return (
            <div className="bg-destructive/15 border-destructive/20 border rounded-lg p-4 text-destructive">
                Error loading contacts: {(error as any).message || 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                    <p className="text-muted-foreground">
                        Manage your organization's contacts
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowImportModal(true)}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                    </Button>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Contact
                    </Button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && (!data?.contacts || data.contacts.length === 0) && (
                <div className="bg-card rounded-lg border p-12 text-center text-muted-foreground">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No contacts yet</h3>
                    <p className="mb-6">
                        Get started by creating your first contact or importing from a CSV file.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setShowImportModal(true)}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import CSV
                        </Button>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Contact
                        </Button>
                    </div>
                </div>
            )}

            {/* Contacts Table */}
            {!isLoading && data?.contacts && data.contacts.length > 0 && (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.contacts.map((contact) => (
                                <TableRow key={contact.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                    {contact.first_name.charAt(0).toUpperCase()}
                                                    {contact.last_name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">
                                                {contact.first_name} {contact.last_name}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{contact.email}</TableCell>
                                    <TableCell>{contact.phone}</TableCell>
                                    <TableCell>
                                        {new Date(contact.created_at).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && data?.pagination && data.pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Showing page {data.pagination.current_page} of {data.pagination.total_pages}
                        {' '}- Total: {data.pagination.total_count} contacts
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(data.pagination.total_pages, p + 1))}
                            disabled={page === data.pagination.total_pages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <CreateContactModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
            <CSVImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
            />
        </div>
    );
}
