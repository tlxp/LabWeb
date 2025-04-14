#!/bin/bash

echo "🟢 GET - Ver todas as notas"
curl -s http://localhost:3000/
echo -e "\n-------------------------"

echo "➕ POST - Adicionar nota (via body)"
curl -s -X POST -H "Content-Type: application/json" -d '{"nota": 19}' http://localhost:3000/
echo -e "\n-------------------------"

echo "➕ POST - Adicionar nota (via parâmetro)"
curl -s -X POST http://localhost:3000/132
echo -e "\n-------------------------"

echo "📥 GET - Ver nota na posição 1"
curl -s http://localhost:3000/1
echo -e "\n-------------------------"

echo "✏️ PATCH - Atualizar nota na posição 0 para 20"
curl -s -X PATCH -H "Content-Type: application/json" -d '{"nota": 20}' http://localhost:3000/0
echo -e "\n-------------------------"

echo "❌ DELETE - Remover nota na posição 2"
curl -s -X DELETE http://localhost:3000/2
echo -e "\n-------------------------"

echo "🧹 DELETE - Remover todas as notas"
curl -s -X DELETE http://localhost:3000/
echo -e "\n-------------------------"
