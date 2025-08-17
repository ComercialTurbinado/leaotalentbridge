#!/bin/bash

echo "🚀 Iniciando deploy no Amplify..."

# Verificar se o git está configurado
if [ -z "$(git config --get user.name)" ]; then
    echo "❌ Git não está configurado. Configure seu usuário:"
    echo "git config --global user.name 'Seu Nome'"
    echo "git config --global user.email 'seu.email@exemplo.com'"
    exit 1
fi

# Adicionar todas as alterações
echo "📝 Adicionando alterações..."
git add .

# Fazer commit
echo "💾 Fazendo commit..."
git commit -m "🔧 Fix: Configuração de variáveis de ambiente para produção

- Atualizado next.config.ts para carregar variáveis de ambiente
- Configurado amplify.yml com variáveis corretas
- Fix para erro 500 na API de registro"

# Fazer push para o repositório
echo "📤 Fazendo push para o repositório..."
git push origin main

echo "✅ Deploy iniciado! O Amplify irá fazer o build automaticamente."
echo "🌐 Acompanhe o progresso em: https://console.aws.amazon.com/amplify/"
echo "⏳ Aguarde alguns minutos para o deploy ser concluído."
