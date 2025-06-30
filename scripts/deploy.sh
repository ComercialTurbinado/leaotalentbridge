#!/bin/bash

echo "🚀 Iniciando deploy do Leao Talent Bridge..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 2. Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

# 3. Popular banco de dados (apenas se necessário)
echo "🗃️ Verificando banco de dados..."
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Populando banco de dados..."
    node scripts/seed-all.js
fi

# 4. Iniciar aplicação
echo "🎯 Iniciando aplicação..."
npm start 