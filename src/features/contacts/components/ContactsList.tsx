import { useQuery } from '@tanstack/react-query';
import { contactService } from '../api/contactService';
import { useState } from 'react';
import { UserPlus, Upload, ChevronLeft, ChevronRight, Loader2, Send, Filter, X } from 'lucide-react';
import CreateContactModal from './CreateContactModal';
import CSVImportModal from './CSVImportModal';
import CampaignPreviewModal from './CampaignPreviewModal';
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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ContactsList() {
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showCampaignModal, setShowCampaignModal] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        bhk_type_id: '',
        furnishing_type_id: '',
        location_id: '',
        property_type_id: '',
        power_backup_type_id: ''
    });

    // Selection state
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

    const { data, isLoading, error } = useQuery({
        queryKey: ['contacts', 'paginated', page, perPage, filters],
        queryFn: () => contactService.getPaginatedContacts(page, perPage, filters),
    });

    const { data: preferencesData } = useQuery({
        queryKey: ['preferences'],
        queryFn: () => contactService.getPreferences(),
    });



    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page on filter change
        setSelectedEmails([]); // Clear selection on filter change to avoid confusion
    };

    const clearFilters = () => {
        setFilters({
            bhk_type_id: '',
            furnishing_type_id: '',
            location_id: '',
            property_type_id: '',
            power_backup_type_id: ''
        });
        setPage(1);
    };

    const toggleSelection = (email: string) => {
        setSelectedEmails(prev =>
            prev.includes(email)
                ? prev.filter(e => e !== email)
                : [...prev, email]
        );
    };

    const toggleAllPage = () => {
        if (!data?.contacts) return;

        const allPageEmails = data.contacts.map(c => c.email).filter(Boolean);
        const allSelected = allPageEmails.every(email => selectedEmails.includes(email));

        if (allSelected) {
            setSelectedEmails(prev => prev.filter(email => !allPageEmails.includes(email)));
        } else {
            const newEmails = allPageEmails.filter(email => !selectedEmails.includes(email));
            setSelectedEmails(prev => [...prev, ...newEmails]);
        }
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);

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

            {/* Filters & Actions */}
            <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground">
                            <X className="h-3 w-3 mr-1" />
                            Clear all
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Select value={filters.bhk_type_id} onValueChange={(v) => handleFilterChange('bhk_type_id', v)}>
                        <SelectTrigger className="h-8 bg-background">
                            <SelectValue placeholder="BHK Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all_bhk">All BHK Types</SelectItem>
                            {preferencesData?.bhk_types.map(i => (
                                <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.furnishing_type_id} onValueChange={(v) => handleFilterChange('furnishing_type_id', v)}>
                        <SelectTrigger className="h-8 bg-background">
                            <SelectValue placeholder="Furnishing" />
                        </SelectTrigger>
                        <SelectContent>
                            {preferencesData?.furnishing_types.map(i => (
                                <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.location_id} onValueChange={(v) => handleFilterChange('location_id', v)}>
                        <SelectTrigger className="h-8 bg-background">
                            <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                            {preferencesData?.locations.map(i => (
                                <SelectItem key={i.id} value={i.id.toString()}>{i.city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.property_type_id} onValueChange={(v) => handleFilterChange('property_type_id', v)}>
                        <SelectTrigger className="h-8 bg-background">
                            <SelectValue placeholder="Property Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {preferencesData?.property_types.map(i => (
                                <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.power_backup_type_id} onValueChange={(v) => handleFilterChange('power_backup_type_id', v)}>
                        <SelectTrigger className="h-8 bg-background">
                            <SelectValue placeholder="Power Backup" />
                        </SelectTrigger>
                        <SelectContent>
                            {preferencesData?.power_backup_types.map(i => (
                                <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                        {selectedEmails.length > 0 ? (
                            <span className="text-primary font-medium">{selectedEmails.length} contacts selected</span>
                        ) : (
                            <span>Select contacts to send a campaign</span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        disabled={selectedEmails.length === 0}
                        onClick={() => setShowCampaignModal(true)}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Send Campaign
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
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        checked={
                                            data?.contacts &&
                                            data.contacts.length > 0 &&
                                            data.contacts.every(c => c.email && selectedEmails.includes(c.email))
                                        }
                                        onCheckedChange={toggleAllPage}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Preferences</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.contacts.map((contact) => (
                                <TableRow key={contact.id} data-state={contact.email && selectedEmails.includes(contact.email) ? "selected" : undefined}>
                                    <TableCell>
                                        <Checkbox
                                            checked={!!contact.email && selectedEmails.includes(contact.email)}
                                            onCheckedChange={() => contact.email && toggleSelection(contact.email)}
                                            disabled={!contact.email}
                                            aria-label={`Select ${contact.first_name} ${contact.last_name}`}
                                        />
                                    </TableCell>
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
                                        {(() => {
                                            if (!contact.preferences || contact.preferences.length === 0) return '-';
                                            const pref = contact.preferences[0]; // Assuming one preference set per contact for now
                                            const parts = [];

                                            if (pref.bhk_type_id && preferencesData?.bhk_types) {
                                                const item = preferencesData.bhk_types.find(i => i.id === pref.bhk_type_id);
                                                if (item) parts.push(item.name);
                                            }
                                            if (pref.furnishing_type_id && preferencesData?.furnishing_types) {
                                                const item = preferencesData.furnishing_types.find(i => i.id === pref.furnishing_type_id);
                                                if (item) parts.push(item.name);
                                            }
                                            if (pref.location_id && preferencesData?.locations) {
                                                const item = preferencesData.locations.find(i => i.id === pref.location_id);
                                                if (item) parts.push(item.city);
                                            }
                                            if (pref.property_type_id && preferencesData?.property_types) {
                                                const item = preferencesData.property_types.find(i => i.id === pref.property_type_id);
                                                if (item) parts.push(item.name);
                                            }
                                            if (pref.power_backup_type_id && preferencesData?.power_backup_types) {
                                                const item = preferencesData.power_backup_types.find(i => i.id === pref.power_backup_type_id);
                                                if (item) parts.push(item.name);
                                            }

                                            return parts.length > 0 ? parts.join(', ') : '-';
                                        })()}
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
            <CampaignPreviewModal
                isOpen={showCampaignModal}
                onClose={() => setShowCampaignModal(false)}
                selectedEmails={selectedEmails}
                onSuccess={() => setSelectedEmails([])}
            />
        </div>
    );
}
