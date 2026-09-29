# Projeto SFI — Rota da Tilápia

Material didático para oficinas com cooperativas de pesca no âmbito do PEA Pescarte (Norte Fluminense).

Abra `index.html` no navegador para acessar o portal do projeto.

| Conteúdo | Caminho | Descrição |
|---|---|---|
| **Aquipólis Tycoon** | [`jogo/index.html`](jogo/index.html) | Simulação 3D de gestão da Unidade de Produção Aquícola (UPA), com expansão para UBP e UPP |
| Oficina UPA | [`oficinas/oficina-upa.html`](oficinas/oficina-upa.html) | Modelagem BPMN — Unidade de Produção Aquícola (Rio das Ostras) |
| Oficina UBP-M | [`oficinas/oficina-ubp-m.html`](oficinas/oficina-ubp-m.html) | Modelagem BPMN — Unidade de Beneficiamento de Pescado (Campos dos Goytacazes) |
| Oficina UPP | [`oficinas/oficina-upp.html`](oficinas/oficina-upp.html) | Modelagem BPMN — Unidade de Processamento de Pescado (Rio das Ostras) |
| Documentos | [`docs/`](docs/) | Análises de impacto e comparação de layouts da UBP |

## Aquipólis Tycoon v1.0

Jogo de gestão em que o grupo conduz, por 12 meses, a unidade aquícola de uma cooperativa de 22 famílias:
organizar equipes, cuidar da água e da ração, negociar com compradores e decidir diante de imprevistos.
Com boa gestão, a cooperativa conquista os convênios da UBP (beneficiamento) e da UPP (processamento),
completando a Rota da Tilápia.

### Novidades da edição profissional (base Rev. 18.3)

- **Tela de carregamento e menu principal** com o cenário 3D em órbita ao fundo.
- **Salvar e continuar**: salvamento automático ao fim de cada mês e ao fechar a aba; botão “Continuar” no menu.
- **Menu de pausa** (Esc ou ☰): continuar, salvar, configurações, atalhos, tutorial e voltar ao menu.
- **Configurações persistentes**: qualidade gráfica (baixa/média/alta), placas, efeitos sonoros, som ambiente,
  volume, tamanho da interface (90–130%, útil em projetores) e avisos de rotina.
- **Interface redesenhada** com ícones vetoriais consistentes no HUD, na barra de ações e nos controles,
  mais uma barra de progresso dos 12 meses.
- **Dicas ao passar o mouse** sobre tanques (estado, ciclo, biomassa, água) e prédios.
- **Atalhos de teclado**: `Espaço` pausa · `1–8` ações · `WASD`/setas câmera · `Q/E` girar · `F` centralizar ·
  `L` placas · `M` som · `H` lista de atalhos · `Esc` fechar/menu.
- **Balanço mensal** com indicadores e gráfico do resultado de cada mês.
- **Relatório final** com pontuação (0–100), conceito, gráfico da evolução do caixa e estrelas por dimensão.
- **Menos ruído**: avisos repetitivos (ração baixa, fome, despesca) passam a ter intervalo mínimo.
- **Correções**: o relatório final não sobrescreve mais a decisão e o balanço do 12º mês; as placas
  “Filtro rizosférico” agora respeitam o botão de mostrar/ocultar placas; o fundo do modal não fecha mais a introdução.
- Links para as oficinas de processos no menu **Aprender**.

### Como executar

Basta abrir `jogo/index.html` em um navegador moderno com WebGL (Chrome, Edge, Firefox ou Safari).
É necessária conexão com a internet para carregar o three.js (cdnjs) e as fontes (Google Fonts).
Para que os links entre o jogo, o portal e as oficinas funcionem, mantenha a estrutura de pastas do repositório.

O progresso do jogo e as anotações das oficinas ficam salvos apenas no navegador (`localStorage`).
