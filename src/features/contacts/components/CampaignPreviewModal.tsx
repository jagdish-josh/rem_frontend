import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { campaignsService } from '../../campaigns/api/campaignsService';
import { Loader2, Send } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface CampaignPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedEmails: string[];
    onSuccess?: () => void;
}

export default function CampaignPreviewModal({
    isOpen,
    onClose,
    selectedEmails,
    onSuccess
}: CampaignPreviewModalProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');

    // Fetch email templates
    const { data: templates, isLoading: loadingTemplates } = useQuery({
        queryKey: ['emailTemplates'],
        queryFn: campaignsService.getTemplates,
        enabled: isOpen,
    });

    const sendMutation = useMutation({
        mutationFn: (data: { emails: string[], email_template_id: number }) =>
            campaignsService.createInstantCampaign(data),
        onSuccess: (data) => {
            toast.success('Campaign sent successfully');
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || error.message || 'Failed to send campaign';
            toast.error(message);
        }
    });

    const handleSend = () => {
        if (!selectedTemplate) return;

        sendMutation.mutate({
            emails: selectedEmails,
            email_template_id: parseInt(selectedTemplate)
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Send Campaign</DialogTitle>
                    <DialogDescription>
                        You are about to send a campaign to {selectedEmails.length} contact{selectedEmails.length === 1 ? '' : 's'}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Email Template</label>
                        <Select
                            value={selectedTemplate}
                            onValueChange={setSelectedTemplate}
                            disabled={loadingTemplates}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent>
                                {templates?.map(template => (
                                    <SelectItem key={template.id} value={template.id.toString()}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Recipients Preview</label>
                        <div className="border rounded-md p-2 max-h-[150px] overflow-y-auto bg-muted/50">
                            <div className="flex flex-wrap gap-1">
                                {selectedEmails.map((email, i) => (
                                    <span key={i} className="text-xs bg-background border px-2 py-1 rounded-full">
                                        {email}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={sendMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={!selectedTemplate || sendMutation.isPending}
                    >
                        {sendMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        Send Campaign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
