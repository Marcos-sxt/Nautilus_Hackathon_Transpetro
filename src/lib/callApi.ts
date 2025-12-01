import { NavioInput, PreverResponse, BackendPreverResponse } from './types';
import { transformBackendResponse } from './transformResponse';

const API_URL = 'http://35.192.46.221:8000/prever';

export const callPredictionApi = async (data: NavioInput): Promise<PreverResponse> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const backendResult: BackendPreverResponse = await response.json();
    
    // Transformar resposta do backend para formato esperado pelo frontend
    return transformBackendResponse(backendResult);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to call prediction API: ${error.message}`);
    }
    throw new Error('Failed to call prediction API: Unknown error');
  }
};

export const processAllRows = async (
  rows: NavioInput[],
  onProgress?: (current: number, total: number) => void
): Promise<PreverResponse[]> => {
  const results: PreverResponse[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    if (onProgress) {
      onProgress(i + 1, rows.length);
    }
    
    const result = await callPredictionApi(rows[i]);
    results.push(result);
  }
  
  return results;
};
