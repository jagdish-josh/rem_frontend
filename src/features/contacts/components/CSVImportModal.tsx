import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../api/contactService';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CSVImportModal({ isOpen, onClose }: CSVImportModalProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const importMutation = useMutation({
        mutationFn: (file: File) => contactService.importCSV(file),
        onSuccess: (data) => {
            setSuccess(data.message || 'CSV import started successfully. Contacts will be processed in the background.');
            setSelectedFile(null);
            // Invalidate contacts query to refresh the list after a delay
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['contacts'] });
            }, 2000);
        },
        onError: (err: any) => {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to import CSV file';
            setError(errorMessage);
        },
    });

    const handleFileSelect = (file: File) => {
        setError('');
        setSuccess('');

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            setError('Invalid file type. Only CSV files are allowed.');
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError('File size exceeds 10MB limit.');
            return;
        }

        setSelectedFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleUpload = () => {
        if (!selectedFile) {
            setError('Please select a file first.');
            return;
        }

        importMutation.mutate(selectedFile);
    };

    const handleDownloadTemplate = () => {
        // Create CSV template
        const headers = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'bhk_type',
            'furnishing_type',
            'location',
            'property_type',
            'power_backup_type'
        ];
        const sampleRow = [
            'John',
            'Doe',
            'john.doe@example.com',
            '9876543210',
            '2BHK',
            'Fully Furnished',
            'Mumbai',
            'Apartment',
            'Full Backup'
        ];

        const csvContent = headers.join(',') + '\n' + sampleRow.join(',');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contacts_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleClose = () => {
        setSelectedFile(null);
        setError('');
        setSuccess('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Import Contacts from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to bulk import contacts into your organization.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Instructions */}
                    <div className="bg-muted/50 rounded-lg p-4 text-sm">
                        <h3 className="font-semibold mb-2">CSV Format Requirements</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>File must be in CSV format (.csv)</li>
                            <li>Maximum file size: 10MB</li>
                            <li>Required columns: first_name, last_name, email, phone</li>
                            <li>Phone must be exactly 10 digits</li>
                        </ul>
                        <Button
                            variant="link"
                            className="h-auto p-0 mt-3 text-primary"
                            onClick={handleDownloadTemplate}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download CSV Template
                        </Button>
                    </div>

                    {/* File Upload Area */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-primary/50'
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />

                        {selectedFile ? (
                            <div className="space-y-3">
                                <FileText className="h-12 w-12 text-primary mx-auto" />
                                <div>
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                    }}
                                >
                                    Remove file
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                                <div>
                                    <p className="text-sm font-medium mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        CSV files only (max 10MB)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Alerts */}
                    {success && (
                        <Alert className="bg-green-50 text-green-900 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || importMutation.isPending}
                    >
                        {importMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {importMutation.isPending ? 'Uploading...' : 'Upload and Import'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
