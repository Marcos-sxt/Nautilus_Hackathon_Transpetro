import pandas as pd
import numpy as np
import joblib
from pathlib import Path

# ======================================================
# Carregar recursos (modelo + colunas + medianas)
# ======================================================

BASE_DIR = Path(__file__).resolve().parent
ANALISE_DIR = BASE_DIR / "analise_interna"

CAMINHO_DATASET = ANALISE_DIR / "dataset_treino_vm.csv"
CAMINHO_MODELO = ANALISE_DIR / "modelo_bioincrustacao_vm.pkl"

# Carrega dataset de treino para extrair estrutura e medianas
df_treino = pd.read_csv(CAMINHO_DATASET)

# Mantém apenas colunas numéricas
df_num = df_treino.select_dtypes(include=["number"]).copy()

# Remove colunas totalmente NaN
df_num = df_num.dropna(axis=1, how="all")

# Garante que o target existe
TARGET_COL = "target_bioincrustacao"
if TARGET_COL not in df_num.columns:
    raise ValueError(f"Coluna de target '{TARGET_COL}' não encontrada no dataset de treino.")

# Remove linhas sem target
df_num = df_num.dropna(subset=[TARGET_COL])

# Calcula medianas para imputação (exceto target)
MEDIANAS = df_num.drop(columns=[TARGET_COL]).median().to_dict()

# Lista exata de colunas usadas pelo modelo
COLUNAS_MODELO = [col for col in df_num.columns if col != TARGET_COL]

# Carrega o modelo treinado
MODEL = joblib.load(CAMINHO_MODELO)


# ======================================================
# Função de pré-processamento
# ======================================================

def preprocessar_estado(estado_json: dict) -> pd.DataFrame:
    """
    Recebe um dicionário com os dados do navio (estado atual)
    e devolve um DataFrame pronto para ser usado em MODEL.predict().
    """
    # Converte para DataFrame de uma linha
    df = pd.DataFrame([estado_json])

    # Garante que TODAS as colunas esperadas existem (mesmo que venham faltando no JSON)
    # e na ordem correta usada pelo modelo.
    df = df.reindex(columns=COLUNAS_MODELO)

    # Preenche NaNs com as medianas calculadas a partir do dataset de treino
    for col in COLUNAS_MODELO:
        if df[col].isna().any():
            # Se não tiver mediana (coluna nova ou problema), fallback = 0
            mediana = MEDIANAS.get(col, 0)
            df[col] = df[col].fillna(mediana)

    # Garante que tudo é numérico (se vier string, tenta converter)
    df = df.apply(pd.to_numeric, errors="coerce").fillna(0)

    return df


# ======================================================
# Previsão da condição atual
# ======================================================

def prever_bioincrustacao_atual(estado_json: dict) -> float:
    """
    Dado o estado atual do navio (features no formato JSON/dict),
    retorna o índice de bioincrustação previsto para AGORA.
    """
    X = preprocessar_estado(estado_json)
    y_pred = MODEL.predict(X)[0]
    return float(y_pred)


# ======================================================
# Previsão para os próximos N dias (timeline)
# ======================================================

def prever_bioincrustacao_60_dias(estado_atual_json: dict, dias: int = 60):
    """
    Simula a evolução da bioincrustação pelos próximos 'dias' (default: 60),
    assumindo operação semelhante ao padrão atual.

    Retorna:
        {
            "condicao_atual": F0,
            "projecao": [
                {"dia": 1, "indice_bioincrustacao": ...},
                ...
            ]
        }
    """
    resultados = []

    # Previsão do estado atual
    X0 = preprocessar_estado(estado_atual_json)
    F0 = float(MODEL.predict(X0)[0])

    # Usaremos um estado mutável para simular dia a dia
    estado = estado_atual_json.copy()

    for d in range(1, dias + 1):
        # ----------------------------
        # Atualizar variáveis temporais
        # ----------------------------
        if "dias_desde_docagem" in estado:
            estado["dias_desde_docagem"] = estado.get("dias_desde_docagem", 0) + 1

        if "dias_desde_inicio_ano" in estado:
            estado["dias_desde_inicio_ano"] = estado.get("dias_desde_inicio_ano", 0) + 1

        if "dias_ate_inspecao" in estado:
            estado["dias_ate_inspecao"] = max(0, estado.get("dias_ate_inspecao", 0) - 1)

        # ----------------------------
        # Atualizar levemente distancia_90d, se existir
        # assumindo "business as usual" (operação estável)
        # ----------------------------
        if "distancia_90d" in estado:
            dist_atual = estado.get("distancia_90d", 0)
            # Aproximação: adiciona 1/90 da própria distância (como se mantivesse ritmo)
            estado["distancia_90d"] = dist_atual + (dist_atual / 90.0 if dist_atual > 0 else 0)

        # Preprocessa e prevê
        Xd = preprocessar_estado(estado)
        Fd = float(MODEL.predict(Xd)[0])

        resultados.append({
            "dia": d,
            "indice_bioincrustacao": Fd
        })

    return {
        "condicao_atual": F0,
        "projecao": resultados
    }


# ======================================================
# Bloco de teste rápido em linha de comando
# ======================================================

if __name__ == "__main__":
    # Exemplo: pegar a primeira linha do dataset de treino e usar como estado atual
    exemplo = df_num.drop(columns=[TARGET_COL]).iloc[0].to_dict()

    print("Exemplo de estado atual (features):")
    for k, v in list(exemplo.items())[:10]:
        print(f"  {k}: {v}")

    atual = prever_bioincrustacao_atual(exemplo)
    print(f"\nCondição atual prevista: {atual:.4f}")

    forecast = prever_bioincrustacao_60_dias(exemplo, dias=10)
    print("\nProjeção para 10 dias:")
    for r in forecast["projecao"]:
        print(f"  Dia +{r['dia']:2d}: índice = {r['indice_bioincrustacao']:.4f}")
