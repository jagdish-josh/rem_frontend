import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../api/contactService';
import { X, Upload, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Import Contacts from CSV</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Requirements</h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>File must be in CSV format (.csv)</li>
                            <li>Maximum file size: 10MB</li>
                            <li>Required columns: first_name, last_name, email, phone, bhk_type, furnishing_type, location, property_type, power_backup_type</li>
                            <li>Phone must be exactly 10 digits</li>
                            <li>Email must be unique within your organization</li>
                        </ul>
                        <button
                            onClick={handleDownloadTemplate}
                            className="mt-3 flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download CSV Template
                        </button>
                    </div>

                    {/* File Upload Area */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
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
                                <FileText className="h-12 w-12 text-green-500 mx-auto" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Click to upload
                                    </button>
                                    <span className="text-gray-600"> or drag and drop</span>
                                </div>
                                <p className="text-xs text-gray-500">CSV files only (max 10MB)</p>
                            </div>
                        )}
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-md">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!selectedFile || importMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {importMutation.isPending ? 'Uploading...' : 'Upload and Import'}
                    </button>
                </div>
            </div>
        </div>
    );
}
