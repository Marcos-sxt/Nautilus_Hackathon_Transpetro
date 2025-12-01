import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Caminho do modelo
MODEL_PATH = "/home/marcosextrem0123/hackathon_transpetro/dados_transpetro/modelo_transpetro/modelo_bioincrustacao.pkl"
MODEL = joblib.load(MODEL_PATH)

# Features oficiais do modelo
FEATURES = [
    "distance",
    "duration",
    "draft_medio",
    "velocidade_media",
    "consumo_total",
    "consumo_por_milha",
    "dias_desde_docagem",
    "dias_parado_acumulado",
    "draft_ratio",
    "consumo_medio_30d",
    "distancia_90d",
    "ano",
    "mes",
    "trimestre"
]

# -----------------------------
# NORMAM 401 — Classificação
# -----------------------------
def normam_classifier(score):
    """
    Converte o score contínuo do modelo na escala NORMAM 401 (0–4).
    """
    if score < 1:
        return 0, "Sem bioincrustação", "Nenhuma ação necessária", "Muito Baixo"
    elif score < 15:
        return 1, "Microincrustação", "Limpeza proativa", "Baixo"
    elif score < 30:
        return 2, "Macro leve", "Planejar limpeza e inspeção", "Moderado"
    elif score < 60:
        return 3, "Macro moderada", "Limpeza reativa com captura", "Alto"
    else:
        return 4, "Macro pesada", "Docagem / AFS recomendada", "Crítico"


# -----------------------------
# Simulação do estado futuro
# -----------------------------
def simular_proximo_estado(estado):
    novo = estado.copy()

    drift = {
        "distance": np.random.uniform(3, 10),
        "duration": np.random.uniform(0.95, 1.05),
        "draft_medio": np.random.uniform(-0.003, 0.003),
        "velocidade_media": np.random.uniform(-0.05, 0.05),
        "consumo_total": np.random.uniform(1, 4),
        "consumo_por_milha": np.random.uniform(-0.02, 0.02),
        "dias_desde_docagem": 1.0,
        "dias_parado_acumulado": np.random.uniform(0, 0.05),
        "draft_ratio": np.random.uniform(-0.001, 0.001),
        "consumo_medio_30d": np.random.uniform(-0.05, 0.05),
        "distancia_90d": np.random.uniform(1, 5),
    }

    # aplica drift
    for k, delta in drift.items():
        novo[k] = float(novo[k]) + delta

    # --------------------------
    # Atualização da linha do tempo
    # --------------------------
    current_date = datetime(
        estado["ano"], estado["mes"], 1
    ) + timedelta(days=estado.get("dias_passados", 0))

    next_date = current_date + timedelta(days=1)

    novo["ano"] = next_date.year
    novo["mes"] = next_date.month
    novo["trimestre"] = (next_date.month - 1) // 3 + 1
    novo["dias_passados"] = estado.get("dias_passados", 0) + 1

    return novo



# ---------------------------------------------------------
# Ajuste biológico baseado na NORMAM-401 para navio parado
# ---------------------------------------------------------
import math

def ajustar_por_parada(score_bruto, dias_parado):
    """
    Ajusta o score previsto pelo modelo levando em conta
    o crescimento biológico real (NORMAM-401).

    O modelo original subestima fouling quando o navio
    fica parado (porque o consumo cai). Esta função corrige isso.
    """


    # Crescimento suave baseado na NORMAM
    if dias_parado <= 30:
        fator = 1 + 0.01 * dias_parado
    elif dias_parado <= 120:
        fator = 1.3 + 0.003 * (dias_parado - 30)
    else:
        fator = 1.57 + 0.0025 * (dias_parado - 120)

    score = score_bruto * fator
    return min(score, 95)



# -----------------------------
# Previsão temporal de 60 dias
# -----------------------------
def prever_60_dias(estado_inicial):
    estado = estado_inicial.copy()
    previsoes = []
    base_date = datetime.now()

    dia_limpeza_recomendado = None

    for d in range(1, 61):
        X = pd.DataFrame([[estado[f] for f in FEATURES]], columns=FEATURES)
        score_bruto = float(MODEL.predict(X)[0])
        score = ajustar_por_parada(score_bruto, estado["dias_parado_acumulado"])

        nivel, label, acao, risco = normam_classifier(score)

        data_prevista = (base_date + timedelta(days=d)).strftime("%Y-%m-%d")

        registro = {
            "dia": d,
            "data": data_prevista,
            "bioincrustacao_score": score,
            "normam_nivel": nivel,
            "normam_label": label,
            "recomendacao": acao,
            "risco_regulatorio": risco,
            "estado_entrada": estado.copy()
        }

        previsoes.append(registro)

        # Marcar o primeiro dia em que o nível é 2 ou mais
        if dia_limpeza_recomendado is None and nivel >= 2:
            dia_limpeza_recomendado = {
                "dia": d,
                "data": data_prevista,
                "nivel": nivel,
                "motivo": label,
                "acao_recomendada": acao
            }

        estado = simular_proximo_estado(estado)

    return {
        "dia_limpeza_recomendado": dia_limpeza_recomendado,
        "previsoes": previsoes
    }


# Execução local
if __name__ == "__main__":
    exemplo = {
        "distance": 40,
        "duration": 1.0,
        "draft_medio": 10.1,
        "velocidade_media": 11.8,
        "consumo_total": 250,
        "consumo_por_milha": 1.9,
        "dias_desde_docagem": 280,
        "dias_parado_acumulado": 20,
        "draft_ratio": 0.02,
        "consumo_medio_30d": 200,
        "distancia_90d": 3100,
        "ano": 2025,
        "mes": 12,
        "trimestre": 4
    }

    saida = prever_60_dias(exemplo)

    print("DIA RECOMENDADO:")
    print(saida["dia_limpeza_recomendado"])

    print("\nPRIMEIROS 5 DIAS:")
    print(saida["previsoes"][:5])
