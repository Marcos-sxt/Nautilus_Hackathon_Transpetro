import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProcessedData } from '@/lib/types';
import { SummaryCards } from '@/components/SummaryCards';
import { ApiResultCharts } from '@/components/ApiResultCharts';
import { DetailedTable } from '@/components/DetailedTable';
import { Button } from '@/components/ui/button';
import { Ship, Upload, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Results = () => {
  const [data, setData] = useState<ProcessedData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem('nautilus-results');
    if (!storedData) {
      navigate('/');
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedData) as ProcessedData[];
      setData(parsedData);
    } catch (error) {
      console.error('Failed to parse stored data:', error);
      navigate('/');
    }
  }, [navigate]);

  if (data.length === 0) {
    return null;
  }

  const currentData = data[selectedIndex];

  const handleNewUpload = () => {
    localStorage.removeItem('nautilus-results');
    navigate('/');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nautilus-results-${new Date().toISOString()}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ship className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Nautilus Dashboard</h1>
              <p className="text-muted-foreground">Maritime biofouling prediction analysis</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button onClick={handleNewUpload} className="gap-2">
              <Upload className="w-4 h-4" />
              New Upload
            </Button>
          </div>
        </div>

        {/* Vessel Selector */}
        {data.length > 1 && (
          <Card className="p-4 mb-8">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Select Vessel Data:</label>
              <Tabs value={selectedIndex.toString()} onValueChange={(v) => setSelectedIndex(parseInt(v))}>
                <TabsList>
                  {data.map((_, index) => (
                    <TabsTrigger key={index} value={index.toString()}>
                      Vessel {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="mb-8">
          <SummaryCards resumo={currentData.resumo} />
        </div>

        {/* Charts */}
        <div className="mb-8">
          <ApiResultCharts previsoes={currentData.response.previsoes} />
        </div>

        {/* Detailed Table */}
        <DetailedTable previsoes={currentData.response.previsoes} />
      </div>
    </div>
  );
};

export default Results;
