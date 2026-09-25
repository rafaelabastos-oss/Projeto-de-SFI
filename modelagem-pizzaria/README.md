# Modelagem da Pizzaria (AS-IS revisado)

Remodelagem do modelo AS-IS da Pizzaria no Bizagi, com correção do uso de gateways (exclusivo, inclusivo, paralelo e baseado em eventos), dos laços e dos erros lógicos. Os critérios vêm da aula de 24/09/2026 e de Dumas et al., van der Aalst, Mendling et al. e Silver.

| Arquivo | O que é |
|---|---|
| `Pizzaria_AS-IS_Revisado.bpm` | Modelo revisado. Abre no Bizagi Modeler. |
| `Relatorio_Remodelagem_Pizzaria.docx` | O que mudou e por quê, com o diagnóstico de cada erro e o antes e depois dos diagramas. |
| `diagramas/` | Prévia em PNG dos 16 diagramas revisados. |
| `original/` | O `.bpm` original, usado como base. |
| `ferramentas/` | Scripts que aplicam as correções e verificam o modelo. |

## Verificação

`ferramentas/check.py` simula os tokens de cada processo e procura deadlock, falta de sincronização, livelock, nós mortos e caminhos sem desfecho. `ferramentas/modelcheck.py` confere se cada subprocesso abre o diagrama certo e se o processo pai trata os estados de fim do filho. No original foram 22 ocorrências em 5 diagramas, mais 3 problemas entre diagramas. No revisado não há nenhuma.

## Como regerar

```bash
cd ferramentas
python3 gerar.py          # regera o .bpm a partir de original/ e roda as verificações
python3 gerar.py --png    # também redesenha as prévias (precisa de Node e Playwright)
```

As correções de cada diagrama estão em `ferramentas/build.py`, uma função por diagrama.
