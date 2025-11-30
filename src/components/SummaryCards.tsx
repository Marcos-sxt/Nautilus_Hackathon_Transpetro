import { Ship, AlertTriangle, Calendar, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ResumoNavio } from '@/lib/types';

interface SummaryCardsProps {
  resumo: ResumoNavio;
}

export const SummaryCards = ({ resumo }: SummaryCardsProps) => {
  const getRiscoColor = (risco: string) => {
    switch (risco.toLowerCase()) {
      case 'baixo':
        return 'text-success';
      case 'médio':
        return 'text-warning';
      case 'alto':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Score Inicial</h3>
        <p className="text-3xl font-bold">{resumo.scoreInicial.toFixed(2)}</p>
      </Card>

      <Card className="p-6 border-l-4 border-l-info">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
            <Ship className="w-6 h-6 text-info" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Nível NORMAM 401</h3>
        <p className="text-3xl font-bold">{resumo.nivelNormam}</p>
      </Card>

      <Card className="p-6 border-l-4 border-l-destructive">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Risco Regulatório</h3>
        <p className={`text-3xl font-bold ${getRiscoColor(resumo.riscoRegulatorio)}`}>
          {resumo.riscoRegulatorio}
        </p>
      </Card>

      <Card className="p-6 border-l-4 border-l-accent">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Limpeza Recomendada</h3>
        <p className="text-3xl font-bold">Dia {resumo.primeiroDialimpeza}</p>
      </Card>
    </div>
  );
};
