from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prever_60_dias import prever_60_dias

app = FastAPI(
    title="Biofouling Predict API",
    description="API para previsão de bioincrustação marítima baseada em métricas operacionais.",
    version="1.0.0",
)

# ----------------------
# 🔥 HABILITAR CORS
# ----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou coloque seu domínio Vercel depois
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de entrada
class EstadoNavio(BaseModel):
    distance: float
    duration: float
    draft_medio: float
    velocidade_media: float
    consumo_total: float
    consumo_por_milha: float
    dias_desde_docagem: float
    dias_parado_acumulado: float
    draft_ratio: float
    consumo_medio_30d: float
    distancia_90d: float
    ano: int
    mes: int
    trimestre: int


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "API de previsão de bioincrustação ativa"
    }


@app.post("/prever")
def prever(estado: EstadoNavio):
    estado_dict = estado.dict()
    resultado = prever_60_dias(estado_dict)
    return resultado
