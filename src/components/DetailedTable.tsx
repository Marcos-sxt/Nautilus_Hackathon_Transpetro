import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PrevisaoDia } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface DetailedTableProps {
  previsoes: PrevisaoDia[];
}

export const DetailedTable = ({ previsoes }: DetailedTableProps) => {
  const getRiscoBadge = (risco: string) => {
    const riscoLower = risco.toLowerCase();
    if (riscoLower.includes('baixo')) {
      return <Badge className="bg-success/20 text-success border-success/30">{risco}</Badge>;
    }
    if (riscoLower.includes('médio')) {
      return <Badge className="bg-warning/20 text-warning border-warning/30">{risco}</Badge>;
    }
    if (riscoLower.includes('alto')) {
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30">{risco}</Badge>;
    }
    return <Badge variant="outline">{risco}</Badge>;
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Detailed Predictions</h3>
        <p className="text-sm text-muted-foreground">60-day forecast timeline</p>
      </div>
      
      <ScrollArea className="h-[500px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Day</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>NORMAM Level</TableHead>
              <TableHead>Recommendation</TableHead>
              <TableHead>Regulatory Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previsoes.map((previsao) => (
              <TableRow key={previsao.dia} className="hover:bg-muted/50">
                <TableCell className="font-medium">{previsao.dia}</TableCell>
                <TableCell>
                  <span className="font-mono">{previsao.bioincrustacao_score.toFixed(4)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{previsao.normam_nivel}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{previsao.recomendacao}</TableCell>
                <TableCell>{getRiscoBadge(previsao.risco_regulatorio)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};
