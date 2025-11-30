import { NavioInput } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreviewTableProps {
  data: NavioInput[];
}

export const PreviewTable = ({ data }: PreviewTableProps) => {
  if (!data || data.length === 0) return null;

  const displayData = data.slice(0, 10); // Show first 10 rows

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Data Preview</h3>
        <p className="text-sm text-muted-foreground">
          Showing {displayData.length} of {data.length} rows
        </p>
      </div>
      
      <ScrollArea className="h-[400px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Distance</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Draft Médio</TableHead>
              <TableHead>Velocidade</TableHead>
              <TableHead>Consumo Total</TableHead>
              <TableHead>Dias Docagem</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Mês</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell>{row.distance.toFixed(2)}</TableCell>
                <TableCell>{row.duration.toFixed(2)}</TableCell>
                <TableCell>{row.draft_medio.toFixed(2)}</TableCell>
                <TableCell>{row.velocidade_media.toFixed(2)}</TableCell>
                <TableCell>{row.consumo_total.toFixed(2)}</TableCell>
                <TableCell>{row.dias_desde_docagem}</TableCell>
                <TableCell>{row.ano}</TableCell>
                <TableCell>{row.mes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};
