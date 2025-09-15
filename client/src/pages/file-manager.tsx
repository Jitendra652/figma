import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Label } from "@/components/ui/label";
import type { File as FileType } from "@shared/schema";

export default function FileManager() {
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery<FileType[]>({
    queryKey: ["/api/files"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "File has been uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiRequest("DELETE", `/api/files/${fileId}`);
    },
    onSuccess: () => {
      toast({
        title: "File deleted",
        description: "File has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadMutation.mutateAsync(file);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'fas fa-image';
    if (mimeType.startsWith('video/')) return 'fas fa-video';
    if (mimeType.startsWith('audio/')) return 'fas fa-music';
    if (mimeType === 'application/pdf') return 'fas fa-file-pdf';
    if (mimeType.includes('word')) return 'fas fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fas fa-file-powerpoint';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'fas fa-file-archive';
    return 'fas fa-file';
  };

  const getFileIconColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'text-green-600';
    if (mimeType.startsWith('video/')) return 'text-red-600';
    if (mimeType.startsWith('audio/')) return 'text-purple-600';
    if (mimeType === 'application/pdf') return 'text-red-500';
    if (mimeType.includes('word')) return 'text-blue-600';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'text-green-500';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'text-orange-600';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const filteredFiles = files?.filter(file =>
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="File Manager" onAIHelperToggle={() => setShowAIHelper(!showAIHelper)} />

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">File Manager</h1>
              <p className="text-muted-foreground">Upload, organize, and manage your files</p>
            </div>

            {/* Upload Area */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  data-testid="file-upload-area"
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-cloud-upload-alt text-2xl text-primary"></i>
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        {isDragActive ? 'Drop the file here' : 'Drag & drop files here'}
                      </p>
                      <p className="text-muted-foreground">
                        or click to browse • Max size: 10MB
                      </p>
                    </div>
                  </div>
                </div>
                
                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uploading...</span>
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                  data-testid="file-search-input"
                />
                <div className="flex items-center space-x-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    data-testid="grid-view-button"
                  >
                    <i className="fas fa-th"></i>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    data-testid="list-view-button"
                  >
                    <i className="fas fa-list"></i>
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {filteredFiles.length} files
                </Badge>
                <Badge variant="outline">
                  {formatFileSize(filteredFiles.reduce((acc, file) => acc + file.size, 0))} total
                </Badge>
              </div>
            </div>

            {/* Files Display */}
            {filteredFiles.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
                  : 'space-y-2'
              }>
                {filteredFiles.map((file) => (
                  <Card
                    key={file.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      viewMode === 'list' ? 'p-4' : ''
                    }`}
                    onClick={() => setSelectedFile(file)}
                    data-testid={`file-item-${file.id}`}
                  >
                    <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-0'}>
                      {viewMode === 'grid' ? (
                        <div className="space-y-3">
                          {isImage(file.mimeType) ? (
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                              <img
                                src={`/api/files/${file.id}/preview`}
                                alt={file.originalName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden flex items-center justify-center w-full h-full">
                                <i className={`${getFileIcon(file.mimeType)} ${getFileIconColor(file.mimeType)} text-4xl`}></i>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                              <i className={`${getFileIcon(file.mimeType)} ${getFileIconColor(file.mimeType)} text-4xl`}></i>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm truncate" title={file.originalName}>
                              {file.originalName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <i className={`${getFileIcon(file.mimeType)} ${getFileIconColor(file.mimeType)} text-2xl`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.originalName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)} • {new Date(file.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {file.mimeType.split('/')[0]}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                {searchQuery ? (
                  <>
                    <i className="fas fa-search text-6xl text-muted-foreground mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">No files found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search query
                    </p>
                  </>
                ) : (
                  <>
                    <i className="fas fa-folder-open text-6xl text-muted-foreground mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">No files yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Upload your first file to get started
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* File Details Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-2xl" data-testid="file-details-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <i className={`${selectedFile ? getFileIcon(selectedFile.mimeType) : ''} ${selectedFile ? getFileIconColor(selectedFile.mimeType) : ''}`}></i>
              <span>{selectedFile?.originalName}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-6">
              {/* Preview */}
              {isImage(selectedFile.mimeType) && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={`/api/files/${selectedFile.id}/preview`}
                    alt={selectedFile.originalName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* File Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">File Name</Label>
                  <p className="text-sm">{selectedFile.originalName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">File Size</Label>
                  <p className="text-sm">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">File Type</Label>
                  <p className="text-sm">{selectedFile.mimeType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Uploaded</Label>
                  <p className="text-sm">{new Date(selectedFile.createdAt!).toLocaleString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `/api/files/${selectedFile.id}/download`;
                    link.download = selectedFile.originalName;
                    link.click();
                  }}
                  data-testid="download-file-button"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(selectedFile.id)}
                  disabled={deleteMutation.isPending}
                  data-testid="delete-file-button"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2"></i>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash mr-2"></i>
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
