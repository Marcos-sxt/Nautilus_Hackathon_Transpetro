# 🚢 Nautilus - Sistema de Predição de Bioincrustação Marítima

Nautilus é uma plataforma web desenvolvida para prever e monitorar a bioincrustação (biofouling) em embarcações, auxiliando na manutenção preventiva e no cumprimento de regulamentações ambientais como a NORMAM-401.

## 📋 Sobre o Projeto

O Nautilus foi desenvolvido para o **Hackathon Transpetro** com o objetivo de:

- **Prever bioincrustação** em embarcações baseado em métricas operacionais
- **Classificar níveis de risco** conforme a NORMAM-401 (norma brasileira de controle de bioincrustação)
- **Recomendar ações** de limpeza e manutenção preventiva
- **Visualizar tendências** de bioincrustação ao longo de 60 dias

### 🎯 Funcionalidades Principais

- 📤 **Upload de CSV**: Envie dados operacionais de embarcações em formato CSV
- 🔮 **Predição Inteligente**: Análise de 60 dias de previsão de bioincrustação
- 📊 **Dashboard Interativo**: Visualizações gráficas e tabelas detalhadas
- ⚠️ **Alertas de Risco**: Identificação automática de riscos regulatórios
- 📅 **Recomendações**: Sugestões de dias ideais para limpeza

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - React 18 com TypeScript
  - Vite (build tool)
  - Tailwind CSS + shadcn/ui (componentes)
  - Recharts (gráficos)
  - React Router (navegação)
  - PapaParse (parsing de CSV)

- **Backend**:
  - FastAPI (Python)
  - Modelos de Machine Learning (Random Forest, Gradient Boosting)
  - Pydantic (validação de dados)

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js 18+ e npm
- Backend API rodando (veja o repositório do backend)

### Instalação

```sh
# 1. Clone o repositório
git clone https://github.com/Marcos-sxt/Nautilus_Hackathon_Transpetro.git
cd Nautilus_Hackathon_Transpetro

# 2. Instale as dependências
npm install

# 3. Configure a variável de ambiente
# Crie um arquivo .env na raiz do projeto:
echo "VITE_API_URL=http://35.192.46.221:8000/prever" > .env

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:8080`

## 📦 Formato do CSV

O sistema espera um CSV com as seguintes colunas (features):

```csv
distance,duration,draft_medio,velocidade_media,consumo_total,consumo_por_milha,dias_desde_docagem,dias_parado_acumulado,draft_ratio,consumo_medio_30d,distancia_90d,ano,mes,trimestre
45.5,1.2,10.3,12.5,280,6.15,180,15,0.85,250,3200,2025,1,1
```

### Descrição das Features

- `distance`: Distância percorrida (milhas náuticas)
- `duration`: Duração da viagem (dias)
- `draft_medio`: Calado médio (metros)
- `velocidade_media`: Velocidade média (nós)
- `consumo_total`: Consumo total de combustível
- `consumo_por_milha`: Consumo por milha náutica
- `dias_desde_docagem`: Dias desde a última docagem
- `dias_parado_acumulado`: Dias parado acumulados
- `draft_ratio`: Razão do calado
- `consumo_medio_30d`: Consumo médio dos últimos 30 dias
- `distancia_90d`: Distância percorrida nos últimos 90 dias
- `ano`, `mes`, `trimestre`: Informações temporais

## 🌐 Deploy no Vercel

### Via Dashboard

1. Acesse [vercel.com](https://vercel.com)
2. Importe este repositório Git
3. **⚠️ IMPORTANTE**: Configure a variável de ambiente:
   - Nome: `VITE_API_URL`
   - Valor: URL do seu backend (ex: `http://35.192.46.221:8000/prever`)
   - Ambientes: Production, Preview, Development
4. Deploy!

### Via CLI

```sh
# Instale o Vercel CLI
npm i -g vercel

# Faça login e configure
vercel

# Configure a variável de ambiente
vercel env add VITE_API_URL
```

### Build de Produção

```sh
npm run build
```

O build será gerado na pasta `dist/`

## 🔧 Variáveis de Ambiente

**⚠️ OBRIGATÓRIO**: A variável `VITE_API_URL` é necessária para o funcionamento da aplicação.

### Desenvolvimento Local

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://35.192.46.221:8000/prever
```

### Produção (Vercel)

Configure no painel do Vercel em **Project Settings > Environment Variables**.

## 📊 Estrutura do Projeto

```
frontend/marine-biofouling-predictor/
├── public/              # Arquivos estáticos (logo, favicon)
├── src/
│   ├── components/      # Componentes React reutilizáveis
│   ├── lib/            # Utilitários (API, parsing, tipos)
│   ├── pages/          # Páginas da aplicação
│   └── hooks/          # React hooks customizados
├── vercel.json         # Configuração do Vercel
└── package.json        # Dependências do projeto
```

## 📝 Scripts Disponíveis

- `npm run dev`: Inicia servidor de desenvolvimento
- `npm run build`: Gera build de produção
- `npm run preview`: Preview do build de produção
- `npm run lint`: Executa o linter

## 🤝 Contribuindo

Este projeto foi desenvolvido para o Hackathon Transpetro. Para contribuições:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais no contexto do Hackathon Transpetro.

## 👥 Equipe

Desenvolvido pela equipe do Hackathon Transpetro.

---

**Nautilus** - Navegando rumo à eficiência marítima sustentável 🌊
