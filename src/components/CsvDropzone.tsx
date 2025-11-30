import { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CsvDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const CsvDropzone = ({ onFileSelect, disabled }: CsvDropzoneProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const csvFile = files.find(file => file.name.endsWith('.csv'));
      
      if (csvFile) {
        onFileSelect(csvFile);
      }
    },
    [onFileSelect, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <Card className="border-2 border-dashed border-border hover:border-primary transition-smooth">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="p-12 flex flex-col items-center justify-center text-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Upload className="w-10 h-10 text-primary" />
        </div>
        
        <h3 className="text-2xl font-semibold mb-2">Upload CSV File</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Drag and drop your vessel operational data CSV file here, or click to browse
        </p>
        
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
          />
          <div className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-smooth inline-flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Select CSV File
          </div>
        </label>
        
        <p className="text-xs text-muted-foreground mt-4">
          Maximum file size: 10MB
        </p>
      </div>
    </Card>
  );
};
