/**
 * Transforma a resposta do backend para o formato esperado pelo frontend
 */
import { BackendPreverResponse, PreverResponse, PrevisaoDia } from './types';

/**
 * Converte nível NORMAM de número para string
 */
function nivelToString(nivel: number | string): string {
  if (typeof nivel === 'string') {
    return nivel;
  }
  return nivel.toString();
}

/**
 * Obtém o nível NORMAM baseado no score
 */
function getNivelFromScore(score: number): string {
  if (score < 1) return '0';
  if (score < 15) return '1';
  if (score < 30) return '2';
  if (score < 60) return '3';
  return '4';
}

/**
 * Obtém o risco regulatório baseado no score
 */
function getRiscoFromScore(score: number): string {
  if (score < 1) return 'Muito Baixo';
  if (score < 15) return 'Baixo';
  if (score < 30) return 'Moderado';
  if (score < 60) return 'Alto';
  return 'Crítico';
}

/**
 * Transforma a resposta do backend para o formato esperado pelo frontend
 */
export function transformBackendResponse(
  backendResponse: BackendPreverResponse
): PreverResponse {
  // Processar previsões
  const previsoes: PrevisaoDia[] = backendResponse.previsoes.map((p) => ({
    dia: p.dia,
    bioincrustacao_score: p.bioincrustacao_score,
    normam_nivel: nivelToString(p.normam_nivel),
    recomendacao: p.recomendacao,
    risco_regulatorio: p.risco_regulatorio,
  }));

  // Processar dia_limpeza_recomendado
  let dia_limpeza_recomendado: number;
  if (typeof backendResponse.dia_limpeza_recomendado === 'number') {
    dia_limpeza_recomendado = backendResponse.dia_limpeza_recomendado;
  } else if (
    backendResponse.dia_limpeza_recomendado &&
    typeof backendResponse.dia_limpeza_recomendado === 'object' &&
    'dia' in backendResponse.dia_limpeza_recomendado
  ) {
    dia_limpeza_recomendado = backendResponse.dia_limpeza_recomendado.dia;
  } else {
    // Se não houver recomendação, usar o último dia (60)
    dia_limpeza_recomendado = 60;
  }

  // Obter dados iniciais (dia 1)
  const primeiraPrevisao = previsoes[0];
  const score_inicial =
    backendResponse.score_inicial ?? primeiraPrevisao.bioincrustacao_score;
  const nivel_normam_inicial =
    backendResponse.nivel_normam_inicial ??
    getNivelFromScore(score_inicial);
  const risco_regulatorio_inicial =
    backendResponse.risco_regulatorio_inicial ??
    getRiscoFromScore(score_inicial);

  return {
    dia_limpeza_recomendado,
    previsoes,
    score_inicial,
    nivel_normam_inicial: nivelToString(nivel_normam_inicial),
    risco_regulatorio_inicial,
  };
}

