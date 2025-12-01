import { Card } from '@/components/ui/card';
import { PrevisaoDia } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ApiResultChartsProps {
  previsoes: PrevisaoDia[];
}

export const ApiResultCharts = ({ previsoes }: ApiResultChartsProps) => {
  const chartData = previsoes.map(p => ({
    dia: p.dia,
    score: p.bioincrustacao_score,
    nivel: getNivelNumerico(p.normam_nivel),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Biofouling Score Evolution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="dia" 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              name="Biofouling Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">NORMAM Level Evolution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="dia" 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Level', angle: -90, position: 'insideLeft' }}
              domain={[0, 4]}
              ticks={[0, 1, 2, 3, 4]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [getNivelTexto(value), 'NORMAM Level']}
            />
            <Legend />
            <Line 
              type="stepAfter" 
              dataKey="nivel" 
              stroke="hsl(var(--info))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--info))', r: 3 }}
              name="NORMAM Level"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

function getNivelNumerico(nivel: string): number {
  // Aceita tanto "0", "1", "2", "3", "4" quanto "Nível 0", "Nível 1", etc.
  const nivelStr = nivel.toString().trim();
  
  // Se for apenas número
  if (/^\d+$/.test(nivelStr)) {
    return parseInt(nivelStr, 10);
  }
  
  // Se for formato "Nível X"
  const nivelMap: { [key: string]: number } = {
    'nível 0': 0,
    'nível 1': 1,
    'nível 2': 2,
    'nível 3': 3,
    'nível 4': 4,
    'nivel 0': 0,
    'nivel 1': 1,
    'nivel 2': 2,
    'nivel 3': 3,
    'nivel 4': 4,
  };
  
  const nivelLower = nivelStr.toLowerCase();
  return nivelMap[nivelLower] ?? parseInt(nivelStr, 10) ?? 0;
}

function getNivelTexto(valor: number): string {
  return `Nível ${valor}`;
}
