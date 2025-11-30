import Papa from 'papaparse';
import { NavioInput } from './types';

export const parseCsvFile = (file: File): Promise<NavioInput[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<NavioInput>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }
        
        // Validate that we have data
        if (!results.data || results.data.length === 0) {
          reject(new Error('No data found in CSV file'));
          return;
        }

        // Validate required fields
        const requiredFields: (keyof NavioInput)[] = [
          'distance', 'duration', 'draft_medio', 'velocidade_media',
          'consumo_total', 'consumo_por_milha', 'dias_desde_docagem',
          'dias_parado_acumulado', 'draft_ratio', 'consumo_medio_30d',
          'distancia_90d', 'ano', 'mes', 'trimestre'
        ];

        const firstRow = results.data[0];
        const missingFields = requiredFields.filter(field => !(field in firstRow));
        
        if (missingFields.length > 0) {
          reject(new Error(`Missing required fields: ${missingFields.join(', ')}`));
          return;
        }

        resolve(results.data);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
};
