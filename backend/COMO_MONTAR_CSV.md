# 📋 Como Montar o CSV para Predição de Bioincrustação

Este documento explica como criar um arquivo CSV com as features necessárias para o modelo de predição de bioincrustação do Nautilus, baseado nos dados originais da Transpetro.

---

## 📊 Estrutura do CSV

O CSV deve conter **14 colunas** (features) na seguinte ordem:

```csv
distance,duration,draft_medio,velocidade_media,consumo_total,consumo_por_milha,dias_desde_docagem,dias_parado_acumulado,draft_ratio,consumo_medio_30d,distancia_90d,ano,mes,trimestre
```

### Exemplo de CSV:

```csv
distance,duration,draft_medio,velocidade_media,consumo_total,consumo_por_milha,dias_desde_docagem,dias_parado_acumulado,draft_ratio,consumo_medio_30d,distancia_90d,ano,mes,trimestre
45.5,1.2,10.3,12.5,280,6.15,180,15,0.85,250,3200,2025,1,1
```

---

## 📁 Dados Originais da Transpetro

As features são calculadas a partir dos seguintes arquivos fornecidos pela Transpetro:

### 1. **ResultadoQueryEventos.csv**
- Contém eventos de navegação de cada embarcação
- Colunas principais:
  - `shipName`: Nome do navio
  - `startGMTDate`: Data/hora de início do evento
  - `distance`: Distância percorrida (milhas náuticas)
  - `duration`: Duração do evento (dias)
  - `aftDraft`, `fwdDraft`, `midDraft`: Calados (popa, proa, meio)
  - `speed`, `speedGps`: Velocidades (nós)

### 2. **ResultadoQueryConsumo.csv**
- Contém dados de consumo de combustível
- Colunas principais:
  - `sessionId`: ID da sessão (liga com eventos)
  - `consumoTotal`: Consumo total de combustível

### 3. **Dados navios Hackathon.xlsx** (aba "Lista de docagens")
- Contém histórico de docagens (limpezas)
- Colunas principais:
  - `Navio`: Nome do navio
  - `Docagem`: Data da docagem

### 4. **Dados navios Hackathon.xlsx** (aba "Dados navios")
- Características técnicas dos navios
- Usado para normalizações e cálculos auxiliares

---

## 🔢 Cálculo das Features

### 1. **distance** (Distância)
**Fonte:** `ResultadoQueryEventos.csv` → coluna `distance`

**Descrição:** Distância percorrida em milhas náuticas durante o evento.

**Cálculo:**
```python
distance = evento['distance']  # Direto do CSV
```

**Exemplo:** `45.5` milhas náuticas

---

### 2. **duration** (Duração)
**Fonte:** `ResultadoQueryEventos.csv` → coluna `duration`

**Descrição:** Duração do evento em dias.

**Cálculo:**
```python
duration = evento['duration']  # Direto do CSV
```

**Exemplo:** `1.2` dias

---

### 3. **draft_medio** (Calado Médio)
**Fonte:** `ResultadoQueryEventos.csv` → colunas `aftDraft`, `fwdDraft`, `midDraft`

**Descrição:** Calado médio do navio (indicador de carga).

**Cálculo:**
```python
draft_medio = (aftDraft + fwdDraft) / 2
# Ou, se disponível:
draft_medio = (aftDraft + fwdDraft + midDraft) / 3
```

**Exemplo:** `10.3` metros

---

### 4. **velocidade_media** (Velocidade Média)
**Fonte:** `ResultadoQueryEventos.csv` → colunas `speed`, `speedGps`

**Descrição:** Velocidade média durante o evento (nós).

**Cálculo:**
```python
velocidade_media = (speed + speedGps) / 2
# Se speedGps não disponível, usar apenas speed:
velocidade_media = speed.fillna(speedGps)
```

**Exemplo:** `12.5` nós

---

### 5. **consumo_total** (Consumo Total)
**Fonte:** `ResultadoQueryConsumo.csv` → coluna `consumoTotal`

**Descrição:** Consumo total de combustível durante o evento.

**Cálculo:**
```python
# Merge entre eventos e consumo usando sessionId
consumo_total = consumo['consumoTotal']
```

**Exemplo:** `280` (unidade de combustível)

---

### 6. **consumo_por_milha** (Consumo por Milha)
**Fonte:** Calculado a partir de `consumo_total` e `distance`

**Descrição:** Eficiência de consumo (quanto combustível por milha náutica).

**Cálculo:**
```python
consumo_por_milha = consumo_total / (distance + 1e-6)
# O 1e-6 evita divisão por zero
```

**Exemplo:** `280 / 45.5 = 6.15`

**Interpretação:** Valores maiores indicam menor eficiência (possível bioincrustação).

---

### 7. **dias_desde_docagem** (Dias desde Última Docagem)
**Fonte:** `Dados navios Hackathon.xlsx` (aba "Lista de docagens") + `ResultadoQueryEventos.csv`

**Descrição:** Quantos dias se passaram desde a última limpeza/docagem do navio.

**Cálculo:**
```python
def calcular_dias_desde_docagem(navio, data_evento):
    # Buscar todas as docagens do navio
    docagens_navio = df_docagens[df_docagens['Navio'] == navio]
    
    if len(docagens_navio) > 0:
        # Pegar a docagem mais recente antes do evento
        docagem_mais_recente = docagens_navio[
            docagens_navio['Docagem'] <= data_evento
        ]['Docagem'].max()
        
        if pd.notna(docagem_mais_recente):
            return (data_evento - docagem_mais_recente).days
    
    return None  # Se não houver docagem registrada

dias_desde_docagem = calcular_dias_desde_docagem(shipName, startGMTDate)
```

**Exemplo:** `180` dias

**Interpretação:** Quanto maior, maior a probabilidade de bioincrustação acumulada.

---

### 8. **dias_parado_acumulado** (Dias Parado Acumulado)
**Fonte:** Calculado a partir de `ResultadoQueryEventos.csv`

**Descrição:** Total de dias que o navio ficou parado (distância < 10 milhas) acumulados ao longo do tempo.

**Cálculo:**
```python
# Ordenar eventos por navio e data
df_eventos = df_eventos.sort_values(['shipName', 'startGMTDate'])

# Identificar eventos parados (distância muito baixa)
df_eventos['tempo_parado'] = (df_eventos['distance'] < 10).astype(int)

# Acumular por navio
df_eventos['dias_parado_acumulado'] = df_eventos.groupby('shipName')['tempo_parado'].cumsum()
```

**Exemplo:** `15` dias

**Interpretação:** Navios parados acumulam mais bioincrustação (água parada favorece crescimento).

---

### 9. **draft_ratio** (Razão do Calado)
**Fonte:** Calculado a partir de `draft_medio`

**Descrição:** Calado normalizado (0-1), indicando carga relativa.

**Cálculo:**
```python
# Normalizar pelo calado máximo do dataset
draft_max = df_eventos['draft_medio'].max()
draft_ratio = draft_medio / (draft_max + 1e-6)
```

**Exemplo:** `10.3 / 12.1 = 0.85`

**Interpretação:** Valores próximos de 1 indicam navio carregado (mais resistência à água).

---

### 10. **consumo_medio_30d** (Consumo Médio dos Últimos 30 Dias)
**Fonte:** Calculado a partir de `ResultadoQueryConsumo.csv` e `ResultadoQueryEventos.csv`

**Descrição:** Média móvel do consumo total dos últimos 30 eventos do navio.

**Cálculo:**
```python
# Ordenar por navio e data
df_eventos = df_eventos.sort_values(['shipName', 'startGMTDate'])

# Rolling window de 30 eventos
df_eventos['consumo_medio_30d'] = df_eventos.groupby('shipName')['consumo_total'].transform(
    lambda x: x.rolling(window=30, min_periods=1).mean()
)
```

**Exemplo:** `250` (média dos últimos 30 eventos)

**Interpretação:** Tendência de consumo ao longo do tempo (aumento indica possível bioincrustação).

---

### 11. **distancia_90d** (Distância dos Últimos 90 Dias)
**Fonte:** Calculado a partir de `ResultadoQueryEventos.csv`

**Descrição:** Soma da distância percorrida nos últimos 90 eventos do navio.

**Cálculo:**
```python
# Rolling window de 90 eventos
df_eventos['distancia_90d'] = df_eventos.groupby('shipName')['distance'].transform(
    lambda x: x.rolling(window=90, min_periods=1).sum()
)
```

**Exemplo:** `3200` milhas náuticas

**Interpretação:** Atividade recente do navio (mais atividade = mais exposição à água).

---

### 12. **ano** (Ano)
**Fonte:** `ResultadoQueryEventos.csv` → coluna `startGMTDate`

**Descrição:** Ano do evento.

**Cálculo:**
```python
ano = startGMTDate.dt.year
```

**Exemplo:** `2025`

---

### 13. **mes** (Mês)
**Fonte:** `ResultadoQueryEventos.csv` → coluna `startGMTDate`

**Descrição:** Mês do evento (1-12).

**Cálculo:**
```python
mes = startGMTDate.dt.month
```

**Exemplo:** `1` (janeiro)

---

### 14. **trimestre** (Trimestre)
**Fonte:** `ResultadoQueryEventos.csv` → coluna `startGMTDate`

**Descrição:** Trimestre do evento (1-4).

**Cálculo:**
```python
trimestre = startGMTDate.dt.quarter
# Ou manualmente:
trimestre = (mes - 1) // 3 + 1
```

**Exemplo:** `1` (Q1: janeiro-março)

---

## 🔄 Fluxo de Processamento Completo

### Passo 1: Carregar Dados
```python
import pandas as pd

# Eventos
df_eventos = pd.read_csv('ResultadoQueryEventos.csv')
df_eventos['startGMTDate'] = pd.to_datetime(df_eventos['startGMTDate'])

# Consumo
df_consumo = pd.read_csv('ResultadoQueryConsumo.csv')

# Docagens
df_docagens = pd.read_excel('Dados navios Hackathon.xlsx', sheet_name='Lista de docagens')
df_docagens['Docagem'] = pd.to_datetime(df_docagens['Docagem'])
```

### Passo 2: Merge Consumo com Eventos
```python
df_eventos = df_eventos.merge(
    df_consumo[['sessionId', 'consumoTotal']],
    on='sessionId',
    how='left'
)
df_eventos.rename(columns={'consumoTotal': 'consumo_total'}, inplace=True)
```

### Passo 3: Calcular Features Básicas
```python
# Draft médio
df_eventos['draft_medio'] = (df_eventos['aftDraft'] + df_eventos['fwdDraft']) / 2

# Velocidade média
df_eventos['velocidade_media'] = df_eventos['speed'].fillna(df_eventos['speedGps'])

# Consumo por milha
df_eventos['consumo_por_milha'] = df_eventos['consumo_total'] / (df_eventos['distance'] + 1e-6)

# Features temporais
df_eventos['ano'] = df_eventos['startGMTDate'].dt.year
df_eventos['mes'] = df_eventos['startGMTDate'].dt.month
df_eventos['trimestre'] = df_eventos['startGMTDate'].dt.quarter
```

### Passo 4: Calcular Dias desde Docagem
```python
# Normalizar nomes
df_eventos['shipName'] = df_eventos['shipName'].str.strip().str.upper()
df_docagens['Navio'] = df_docagens['Navio'].str.strip().str.upper()

# Última docagem por navio
ultima_docagem = df_docagens.groupby('Navio')['Docagem'].last().reset_index()
ultima_docagem.columns = ['shipName', 'ultima_docagem']

# Merge
df_eventos = df_eventos.merge(ultima_docagem, on='shipName', how='left')
df_eventos['dias_desde_docagem'] = (
    df_eventos['startGMTDate'] - df_eventos['ultima_docagem']
).dt.days
```

### Passo 5: Calcular Features Agregadas
```python
# Ordenar por navio e data
df_eventos = df_eventos.sort_values(['shipName', 'startGMTDate'])

# Dias parado acumulado
df_eventos['tempo_parado'] = (df_eventos['distance'] < 10).astype(int)
df_eventos['dias_parado_acumulado'] = df_eventos.groupby('shipName')['tempo_parado'].cumsum()

# Consumo médio 30 dias
df_eventos['consumo_medio_30d'] = df_eventos.groupby('shipName')['consumo_total'].transform(
    lambda x: x.rolling(window=30, min_periods=1).mean()
)

# Distância 90 dias
df_eventos['distancia_90d'] = df_eventos.groupby('shipName')['distance'].transform(
    lambda x: x.rolling(window=90, min_periods=1).sum()
)

# Draft ratio
draft_max = df_eventos['draft_medio'].max()
df_eventos['draft_ratio'] = df_eventos['draft_medio'] / (draft_max + 1e-6)
```

### Passo 6: Selecionar Colunas Finais
```python
features_finais = [
    'distance', 'duration', 'draft_medio', 'velocidade_media',
    'consumo_total', 'consumo_por_milha', 'dias_desde_docagem',
    'dias_parado_acumulado', 'draft_ratio', 'consumo_medio_30d',
    'distancia_90d', 'ano', 'mes', 'trimestre'
]

df_final = df_eventos[features_finais]

# Salvar CSV
df_final.to_csv('navio_features.csv', index=False)
```

---

## 📝 Valores Padrão (Medianas)

Se algum valor estiver faltando, o modelo usa as seguintes medianas como fallback:

| Feature | Mediana |
|---------|--------|
| `distance` | 10.0 |
| `duration` | 1.0 |
| `draft_medio` | 9.0 |
| `velocidade_media` | 11.2 |
| `consumo_total` | 11.5 |
| `consumo_por_milha` | 0.9 |
| `dias_desde_docagem` | 120 |
| `dias_parado_acumulado` | 10 |
| `draft_ratio` | 0.8 |
| `consumo_medio_30d` | 12.0 |
| `distancia_90d` | 2500.0 |
| `ano` | 2024 |
| `mes` | 6 |
| `trimestre` | 2 |

---

## ⚠️ Observações Importantes

1. **Ordem das Colunas:** O CSV deve ter as colunas na ordem exata especificada.

2. **Valores Numéricos:** Todas as features devem ser numéricas (float ou int).

3. **Valores Faltantes:** Se uma feature não estiver disponível, use a mediana correspondente da tabela acima.

4. **Normalização de Nomes:** Nomes de navios devem ser normalizados (uppercase, sem espaços extras) para fazer match com docagens.

5. **Rolling Windows:** As features `consumo_medio_30d` e `distancia_90d` são calculadas sobre os últimos 30 e 90 eventos do mesmo navio, respectivamente.

6. **Dias Parado:** Um navio é considerado "parado" quando `distance < 10` milhas náuticas.

---

## 📚 Referências

- Scripts de processamento: `modelo_bioincrustacao_vm.py`, `modelo_bioincrustacao_interno.py`
- Pré-processamento: `Modelo/preprocess.py`
- Dados originais: `Hackathon Transpetro-20251129T132126Z-1-001/Hackathon Transpetro/`

---

**Última atualização:** 2024-11-30

