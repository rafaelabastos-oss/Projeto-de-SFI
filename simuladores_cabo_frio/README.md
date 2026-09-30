# Simuladores Prime 3D — Av. Henrique Terra, Novo Portinho, Cabo Frio

Cinco estudos de implantação no mesmo formato do `Planejado Prime 3D v1.0`: arquivo único, offline, com cena 3D, validação de layout, turno simulado, carteira mês a mês, sensibilidade, Monte Carlo e o veredicto contra o aluguel de **R$ 7 mil/mês** (R$ 84 mil/ano).

| Arquivo | Negócio | CAPEX | EBITDA ano 3 | Pessoas | (EBITDA − aluguel) ÷ CAPEX |
|---|---|---:|---:|---:|---:|
| `rota_prime_3d_v1.0.html` | Hub de entregas de última milha | R$ 132.595 | R$ 182.480 | 5 | 74% |
| `lona_prime_3d_v1.0.html` | Toldos, capotaria náutica e capas de barco | R$ 148.925 | R$ 179.882 | 5 | 64% |
| `envio_prime_3d_v1.0.html` | Fulfillment para marcas de moda praia | R$ 115.172 | R$ 152.037 | 5 | 59% |
| `piscina_prime_3d_v1.0.html` | Loja de piscina com manutenção mensal | R$ 123.280 | R$ 147.118 | 6 | 51% |
| `jardim_prime_3d_v1.0.html` | Garden center e paisagismo | R$ 122.187 | R$ 114.985 | 6 | 25% |

Números da configuração de abertura de cada arquivo (sem hora extra no pico, sem veículo próprio). Referências anteriores: marcenaria 99%, uniformes 87%, comunicação visual 69%.

Abra o `.html` no navegador (duplo clique). Tudo é editável nas fases 0 a 7; o botão **Salvar** grava o cenário em JSON.

## Como os arquivos são gerados

Os cinco saem do mesmo motor, extraído da referência:

- `referencia/planejado_prime_3d_v1.0.html` — o arquivo original da marcenaria.
- `gerador/template.html` — o motor comum (3D, validação Z, turno, economia, painéis), com os pontos em que o negócio entra.
- `gerador/negocios/<negocio>.js` — o bloco de dados de cada negócio: equipamentos, obra, pessoas, custos, linhas, planta, capacidade, regras Z próprias, formas 3D e textos. `planejado.js` reproduz a marcenaria e serve de teste de regressão do motor.
- `gerador/estudos.json` — a tabela de triagem da fase 0 (estudos anteriores e os irmãos desta rodada).

```
python3 gerador/gerar.py                    # gera todos (planejado vai para gerador/saida_teste)
python3 gerador/gerar.py rota lona          # só alguns
node gerador/testar.js rota_prime_3d_v1.0.html   # abre no Chromium e roda o autoteste embutido
node gerador/linha_base.js *.html           # remede a triagem da fase 0 (estudos.json)
```

O autoteste embutido (aba Diagnóstico) passa em todos, exceto a medição de quadros por segundo quando o navegador não tem GPU.
