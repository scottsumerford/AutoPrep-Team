'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Presentation, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FileUploadSectionProps {
  profileId: number;
  onUploadSuccess?: (fileType: string) => void;
  initialCompanyText?: string;
}

export function FileUploadSection({ profileId, onUploadSuccess, initialCompanyText }: FileUploadSectionProps) {
  const [companyInfoFile, setCompanyInfoFile] = useState<File | null>(null);
  const [companyInfoText, setCompanyInfoText] = useState(initialCompanyText || '');
  const [slidesFile, setSlidesFile] = useState<File | null>(null);
  const [uploadingCompanyInfo, setUploadingCompanyInfo] = useState(false);
  const [uploadingCompanyText, setUploadingCompanyText] = useState(false);
  const [uploadingSlides, setUploadingSlides] = useState(false);
  const [companyInfoSuccess, setCompanyInfoSuccess] = useState(false);
  const [companyTextSuccess, setCompanyTextSuccess] = useState(false);
  const [slidesSuccess, setSlidesSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyInfoTab, setCompanyInfoTab] = useState<'file' | 'text'>('file');

  useEffect(() => {
    if (initialCompanyText) {
      setCompanyInfoText(initialCompanyText);
    }
  }, [initialCompanyText]);

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.csv'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        setError(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('File size exceeds 50MB limit');
        return;
      }
      setError(null);
      setFile(file);
    }
  };

  const handleFileUpload = async (file: File | null, fileType: 'company_info' | 'slides', setUploading: (val: boolean) => void, setSuccess: (val: boolean) => void) => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('profileId', profileId.toString());
      formData.append('fileType', fileType);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      if (fileType === 'company_info') {
        setCompanyInfoFile(null);
      } else {
        setSlidesFile(null);
      }

      if (onUploadSuccess) {
        onUploadSuccess(fileType);
      }

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleTextSave = async () => {
    if (!companyInfoText.trim()) {
      setError('Please enter company information');
      return;
    }

    setUploadingCompanyText(true);
    setError(null);

    try {
      const response = await fetch('/api/files/upload-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profileId,
          companyInfoText: companyInfoText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Save failed');
      }

      setCompanyTextSuccess(true);

      if (onUploadSuccess) {
        onUploadSuccess('company_info_text');
      }

      // Reset success message after 3 seconds
      setTimeout(() => {
        setCompanyTextSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setUploadingCompanyText(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Company Files
        </CardTitle>
        <CardDescription>
          Upload your company information and slide templates for pre-sales reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Company Info Upload/Text */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Company Information
          </Label>
          <Tabs value={companyInfoTab} onValueChange={(v) => setCompanyInfoTab(v as 'file' | 'text')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="text">Enter Text</TabsTrigger>
            </TabsList>
            <TabsContent value="file" className="space-y-3">
              <p className="text-xs text-gray-500">
                Upload PDF, Word, Excel, or text files about your company
              </p>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="company-info-input"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  onChange={(e) => handleFileSelect(e, setCompanyInfoFile)}
                  disabled={uploadingCompanyInfo}
                />
                <label htmlFor="company-info-input" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer"
                    asChild
                    disabled={uploadingCompanyInfo}
                  >
                    <span>
                      {companyInfoFile ? companyInfoFile.name : 'Choose File'}
                    </span>
                  </Button>
                </label>
                <Button
                  onClick={() => handleFileUpload(companyInfoFile, 'company_info', setUploadingCompanyInfo, setCompanyInfoSuccess)}
                  disabled={!companyInfoFile || uploadingCompanyInfo}
                >
                  {uploadingCompanyInfo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : companyInfoSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Uploaded
                    </>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="text" className="space-y-3">
              <p className="text-xs text-gray-500">
                Enter a text description of your company
              </p>
              <Textarea
                placeholder="Enter company information here..."
                value={companyInfoText}
                onChange={(e) => setCompanyInfoText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <Button
                onClick={handleTextSave}
                disabled={!companyInfoText.trim() || uploadingCompanyText}
                className="w-full"
              >
                {uploadingCompanyText ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : companyTextSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : (
                  'Save Company Info'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Slides Upload */}
        <div className="space-y-3 border-t pt-6">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Presentation className="w-4 h-4" />
            Slide Templates
          </Label>
          <p className="text-xs text-gray-500">
            Upload PowerPoint or PDF files to use as slide templates
          </p>
          <div className="flex gap-2">
            <input
              type="file"
              id="slides-input"
              className="hidden"
              accept=".ppt,.pptx,.pdf"
              onChange={(e) => handleFileSelect(e, setSlidesFile)}
              disabled={uploadingSlides}
            />
            <label htmlFor="slides-input" className="flex-1">
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                asChild
                disabled={uploadingSlides}
              >
                <span>
                  {slidesFile ? slidesFile.name : 'Choose File'}
                </span>
              </Button>
            </label>
            <Button
              onClick={() => handleFileUpload(slidesFile, 'slides', setUploadingSlides, setSlidesSuccess)}
              disabled={!slidesFile || uploadingSlides}
            >
              {uploadingSlides ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : slidesSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Uploaded
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          ✓ Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV
          <br />
          ✓ Maximum file size: 50MB
          <br />
          ✓ Files are securely stored in Supabase and passed to webhooks
        </p>
      </CardContent>
    </Card>
  );
}
