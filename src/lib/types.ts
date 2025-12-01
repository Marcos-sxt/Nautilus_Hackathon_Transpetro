// Type definitions for Nautilus maritime biofouling prediction

export interface NavioInput {
  distance: number;
  duration: number;
  draft_medio: number;
  velocidade_media: number;
  consumo_total: number;
  consumo_por_milha: number;
  dias_desde_docagem: number;
  dias_parado_acumulado: number;
  draft_ratio: number;
  consumo_medio_30d: number;
  distancia_90d: number;
  ano: number;
  mes: number;
  trimestre: number;
}

export interface PrevisaoDia {
  dia: number;
  bioincrustacao_score: number;
  normam_nivel: string;
  recomendacao: string;
  risco_regulatorio: string;
}

// Formato retornado pelo backend (atual)
export interface BackendPrevisaoDia {
  dia: number;
  data?: string; // Campo extra do backend
  bioincrustacao_score: number;
  normam_nivel: number | string; // Backend pode retornar número
  normam_label?: string; // Campo extra do backend
  recomendacao: string;
  risco_regulatorio: string;
  estado_entrada?: any; // Campo extra do backend
}

export interface BackendDiaLimpeza {
  dia: number;
  data: string;
  nivel: number;
  motivo: string;
  acao_recomendada: string;
}

// Formato esperado pelo frontend (processado)
export interface PreverResponse {
  dia_limpeza_recomendado: number;
  previsoes: PrevisaoDia[];
  score_inicial: number;
  nivel_normam_inicial: string;
  risco_regulatorio_inicial: string;
}

// Formato retornado pelo backend (raw)
export interface BackendPreverResponse {
  dia_limpeza_recomendado: number | BackendDiaLimpeza | null;
  previsoes: BackendPrevisaoDia[];
  // Campos opcionais que podem não existir
  score_inicial?: number;
  nivel_normam_inicial?: string;
  risco_regulatorio_inicial?: string;
}

export interface ResumoNavio {
  scoreInicial: number;
  nivelNormam: string;
  riscoRegulatorio: string;
  primeiroDialimpeza: number;
  ultimaPrevisao: PrevisaoDia;
}

export interface ProcessedData {
  input: NavioInput;
  response: PreverResponse;
  resumo: ResumoNavio;
}
