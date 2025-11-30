import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CsvDropzone } from '@/components/CsvDropzone';
import { PreviewTable } from '@/components/PreviewTable';
import { Button } from '@/components/ui/button';
import { NavioInput, PreverResponse, ProcessedData } from '@/lib/types';
import { parseCsvFile } from '@/lib/parseCsv';
import { processAllRows } from '@/lib/callApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Ship, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

const Upload = () => {
  const [csvData, setCsvData] = useState<NavioInput[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    try {
      setFileName(file.name);
      const data = await parseCsvFile(file);
      setCsvData(data);
      toast({
        title: 'File loaded successfully',
        description: `${data.length} rows parsed from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: 'Error parsing CSV',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleProcess = async () => {
    if (csvData.length === 0) {
      toast({
        title: 'No data to process',
        description: 'Please upload a CSV file first',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const results = await processAllRows(csvData, (current, total) => {
        setProgress((current / total) * 100);
      });

      // Process results into structured data
      const processedData: ProcessedData[] = csvData.map((input, index) => {
        const response = results[index];
        return {
          input,
          response,
          resumo: {
            scoreInicial: response.score_inicial,
            nivelNormam: response.nivel_normam_inicial,
            riscoRegulatorio: response.risco_regulatorio_inicial,
            primeiroDialimpeza: response.dia_limpeza_recomendado,
            ultimaPrevisao: response.previsoes[response.previsoes.length - 1],
          },
        };
      });

      // Store in localStorage
      localStorage.setItem('nautilus-results', JSON.stringify(processedData));

      toast({
        title: 'Processing complete',
        description: `Successfully processed ${csvData.length} rows`,
      });

      // Navigate to results
      navigate('/results');
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ship className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold">Nautilus</h1>
          </div>
          <p className="text-xl text-muted-foreground">Maritime Biofouling Prediction System</p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <CsvDropzone onFileSelect={handleFileSelect} disabled={isProcessing} />
        </div>

        {/* File Info */}
        {fileName && (
          <Card className="p-4 mb-6 bg-secondary/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Loaded file: {fileName}</p>
                <p className="text-sm text-muted-foreground">{csvData.length} rows</p>
              </div>
              <Button
                onClick={handleProcess}
                disabled={isProcessing || csvData.length === 0}
                size="lg"
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Process Data
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Progress */}
        {isProcessing && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Processing vessel data...</h3>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              {progress.toFixed(0)}% complete
            </p>
          </Card>
        )}

        {/* Preview */}
        {csvData.length > 0 && !isProcessing && (
          <PreviewTable data={csvData} />
        )}
      </div>
    </div>
  );
};

export default Upload;
