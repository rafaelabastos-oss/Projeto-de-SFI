/* ==================================================================
   PLANEJADO PRIME 3D — v1.0 (motor herdado do Pastel Prime 3D v3.2, pelas
   versoes Gelo, Enxoval, Praia, Visual e Uniforme Prime 3D v1.0)
   Estudo de viabilidade de uma marcenaria de moveis planejados que compra
   a peca cortada, fitada e furada na revenda e so monta, confere, embala e
   instala, em Novo Portinho, Cabo Frio (RJ), com CAPEX abaixo de R$ 200
   mil, contra a alternativa de alugar o imovel por R$ 8 mil/mes. Arquivo
   unico, offline. A unidade do modelo e o metro linear instalado; o motor
   conta em mil metros lineares onde o pastel contava toneladas.
   O que mudou em relacao ao Pastel Prime: tabelas de dados (EQ, OBRA,
   POSTOS, FIXO, VARI, CANAIS, ROOM, FOOT), o motor calc() com o modelo mes
   a mes da carteira de pedidos (o que nao cabe no mes espera, e parte
   desiste), as regras Z04, Z08, Z10, Z11, Z14, Z19, Z20 e Z21,
   a simulacao de turno, as formas dos equipamentos e os paineis.

   MAPA DO ARQUIVO — treze blocos, nesta ordem:
   0  kernel   dados e motor herdados do simulador 2D: WI/HI, ROOM, FOOT,
               EQ, OBRA, POSTOS, FIXO, VARI, CANAIS, arvore BSP, derivar(),
               checkEq(), validaLayout() e calc(). Tres patches marcados.
   1  modelo   modelo3D(): extrusao da arvore BSP em caixas 3D.
   2  valida   malha de navegacao, largura maximin e regras Z01 a Z14.
   3  render   WebGL2 proprio: primitivas, transformacao por peca, shaders,
               cameras, rotulos, nivel de detalhe e selecao por raio.
   4  turno    simulacao de eventos discretos e realimentacao economica.
   5  paineis  as dez fases da interface.
   7  estado   historico, delta, custo da violacao, arranjos, relatorio.
   8  manipul  arraste de equipamento e divisoria, apresentacao.
   9  vista    oclusao dinamica, enquadramento garantido, planta-guia.
   10 ativos   forma dos equipamentos, veiculos, pessoas, produto.
   11 confia   autoteste embarcado, sensibilidade, Monte Carlo, auditoria.
   12 fecha    roteiro humano, relato de falha, migracao, plano de risco.
   6  app      render mestre, interacao, atalhos, save/load e init.

   REGRA QUE ATRAVESSA TUDO: o 2D e a fonte da verdade da geometria e
   nenhum numero do modelo muda por conta da apresentacao.
   ================================================================== */

/* ================= EQUIPAMENTOS ================= */
/* preço em R$; w/hh = pegada. Base: faixas de mercado, set/2026, ±40% —
   cotar. A tese é CAPEX baixo: a revenda de chapas corta, fita e fura pelo
   plano do software, e a oficina só monta, confere, embala e instala. Por
   isso não há seccionadora nem coladeira no nível básico.                  */
const EQ=[
 {id:"E01",n:"Serra de ajuste ou esquadrejadeira",req:"Com corte terceirizado, a serra só faz ajuste de obra e peça refeita; com esquadrejadeira, a oficina corta a chapa inteira",kw:3.0,etapa:"corte",
  t:[{k:"basico",n:"Serra circular de bancada, furadeira de coluna e tupia de mesa — corte e fita na revenda",p:12000,casa:0,w:2.00,hh:1.40},
     {k:"padrao",n:"Esquadrejadeira 2,9 m usada + coladeira de borda manual — corte e fita na casa, com operador",p:48000,casa:1,custoCorte:45,fat:1.00,w:3.00,hh:3.00},
     {k:"premium",n:"Esquadrejadeira 3,2 m nova + coladeira semiautomática — corte e fita na casa, com operador",p:110000,casa:1,custoCorte:35,fat:1.40,w:3.10,hh:3.40}]},
 {id:"E02",n:"Bancadas de montagem",req:"Onde a peça cortada vira módulo: caixa, porta, gaveta e ferragem — uma bancada por marceneiro",kw:0.5,etapa:"montagem",
  t:[{k:"basico",n:"2 bancadas de 2,40 × 1,20 m com gabaritos de furação",p:9000,banc:2,w:2.40,hh:2.80},
     {k:"padrao",n:"3 bancadas com tampo de MDF 30 mm, grampos e gabaritos",p:15000,banc:3,fat:1.05,w:3.80,hh:2.80}]},
 {id:"E03",n:"Furadeira múltipla de bancada",req:"Fura caneco de dobradiça e minifix de uma vez — tira a furação da mão do marceneiro",kw:1.5,etapa:"montagem",
  t:[{k:"none",n:"Não — furação por gabarito e parafusadeira",p:0},{k:"basico",n:"Furadeira múltipla de 21 brocas (+12% na montagem)",p:14000,fat:1.12,w:1.00,hh:0.80}]},
 {id:"E04",n:"Ferramentas portáteis",req:"Parafusadeiras a bateria, furadeira, tupia manual, serra tico-tico e lixadeira — a ferramenta de cada dia",kw:0.3,etapa:"-",
  t:[{k:"basico",n:"2 kits de parafusadeira e furadeira, tupia, tico-tico e lixadeira",p:9000,fat:1.00},{k:"padrao",n:"4 kits, lixadeira roto-orbital com aspirador e serra de meia-esquadria (+5%)",p:18000,fat:1.05}]},
 {id:"E05",n:"Aspiração de pó",req:"Pó fino de MDF: irrita, suja a peça montada e queima — a serra e a tupia precisam de captação",kw:1.5,etapa:"-",crit:true,
  t:[{k:"none",n:"Não — vassoura e ventilador",p:0},{k:"basico",n:"Aspirador industrial ligado à serra e à tupia",p:3500},{k:"padrao",n:"Coletor de pó com dutos até a sala de corte",p:12000}]},
 {id:"E06",n:"Climatização do showroom e do projeto",req:"O cliente senta para ver o projeto em 3D e aprovar o orçamento — no calor de Cabo Frio, sem ar ninguém fecha contrato",kw:1.5,etapa:"-",
  t:[{k:"basico",n:"Ventiladores (−4% de fechamento)",p:1500,f:0.96},{k:"padrao",n:"Split de 18 mil BTU no showroom",p:6500,f:1.00}]},
 {id:"E07",n:"Showroom",req:"Planejado se vende pelo que o cliente vê: acabamento, ferragem com amortecedor e cor do MDF",kw:0.3,etapa:"-",
  t:[{k:"basico",n:"Amostras de MDF e ferragens e um módulo de cozinha (−8%)",p:8000,f:0.92},{k:"padrao",n:"Cozinha montada de 3 m com aéreo e ferragens de exposição",p:18000,f:1.00},{k:"premium",n:"Cozinha e dormitório montados, com iluminação de LED (+5%)",p:34000,f:1.05}]},
 {id:"E08",n:"Veículo de entrega",req:"Levar módulo montado até a obra em Cabo Frio, Búzios, Arraial e São Pedro sem riscar",kw:0,etapa:"-",
  t:[{k:"none",n:"Não comprar — frete contratado por entrega",p:0,veic:0},{k:"basico",n:"Furgão ou baú leve usado",p:75000,veic:1}]},
 {id:"E09",n:"Software de projeto e plano de corte",req:"Projeto em 3D para vender e plano de corte para a revenda — sem ele não há corte terceirizado",kw:0.4,etapa:"-",
  t:[{k:"basico",n:"Assinatura anual e 2 computadores (arquiteto pede render: −10% nessa linha)",p:7000,f:1.00,render:0},{k:"padrao",n:"Licença com render realista e 2 computadores (+4%)",p:15000,f:1.04,render:1}]},
 {id:"E10",n:"Conforto térmico da oficina",req:"Galpão fechado no verão de Cabo Frio: sem ventilação o marceneiro rende menos",kw:0.8,etapa:"-",
  t:[{k:"basico",n:"Exaustores e ventiladores",p:3000,fat:1.00},{k:"padrao",n:"Climatização evaporativa (+4%)",p:9000,fat:1.04}]},
 {id:"E11",n:"Kit de instalação",req:"Nível a laser, furadeira de impacto, escadas, aspirador de obra e trena a laser — a instalação é metade da nota do cliente",kw:0,etapa:"instalação",
  t:[{k:"basico",n:"1 kit (uma equipe de instalação)",p:5000,equipes:1},{k:"padrao",n:"2 kits (duas equipes)",p:10000,equipes:2}]},
 {id:"E12",n:"Porta-chapas, carrinhos e estantes",req:"Peça cortada guardada em pé e separada por projeto — deitada empena, misturada some",kw:0,etapa:"-",
  t:[{k:"basico",n:"Porta-chapas vertical, carrinho de peças e estante de ferragens",p:5000,fat:1.00},{k:"padrao",n:"Mais carrinhos por projeto e estantes etiquetadas (+4%)",p:10000,fat:1.04}]},
 {id:"E13",n:"Mesas de conferência e embalagem",req:"Conferir porta, gaveta e ferragem antes de embalar: o que falta na obra custa uma viagem",kw:0,etapa:"-",
  t:[{k:"basico",n:"Mesa de conferência, cantoneiras e filme",p:3000},{k:"padrao",n:"Mesa com rolo de papelão e seladora de fita",p:6000}]},
 {id:"E14",n:"Compressor e pinador",req:"Fundo de 6 mm pregado, grampo de gaveta e limpeza de pó",kw:1.1,etapa:"-",
  t:[{k:"basico",n:"Compressor silencioso 50 L e pinador",p:3000},{k:"padrao",n:"Compressor 100 L, pinador e grampeador",p:5500}]}
];

/* ================= OBRA ================= */
const OBRA=[
 {id:"piso",n:"Piso da oficina regularizado e pintado (~85 m²)",min:4000,max:8000},
 {id:"eletr",n:"Elétrica: tomadas nas bancadas, circuito da serra e iluminação de montagem",min:5000,max:10000},
 {id:"vedac",n:"Divisórias: sala de corte fechada, showroom e projeto; forro",min:6000,max:12000},
 {id:"vest",n:"Vestiário, copa e sanitário (adequação)",min:3000,max:6000},
 {id:"fach",n:"Fachada e vitrine do showroom",min:3000,max:8000},
 {id:"inc",n:"Prevenção de incêndio: extintores, sinalização e iluminação de emergência (madeira e pó)",min:3000,max:6000},
 {id:"proj",n:"Projetos, ART/RRT e laudo do Corpo de Bombeiros",min:3000,max:6000},
 {id:"lic",n:"Licenças: alvará, bombeiros e dispensa ambiental municipal",min:2000,max:5000},
 {id:"marca",n:"Marca, catálogo, Google e visitas a arquitetos e construtoras",min:3000,max:8000}
];
const OBRA_DEP={};

/* ================= PESSOAS ================= */
/* proj = projeto e venda; mon = montagem na oficina; emb = conferencia e
   embalagem; ins = instalacao na obra; cor = corte e fita (so com
   esquadrejadeira). Valores fracionados = parte do dia.                   */
const POSTOS=[
 {id:"p1",n:"Gestor / sócio-operador (pró-labore; mede, vende e fecha com arquiteto e construtora)",sal:6000,fator:1.15,proj:0.4,on:true,fixo:true},
 {id:"p2",n:"Projetista-vendedor(a) — projeto 3D, orçamento e plano de corte",sal:3200,proj:1,on:true},
 {id:"p3",n:"Marceneiro montador (1)",sal:3000,mon:1,on:true},
 {id:"p4",n:"Marceneiro montador (2)",sal:3000,mon:1,on:true},
 {id:"p5",n:"Montador instalador",sal:2800,ins:1,on:true,dep:"instalacao"},
 {id:"p6",n:"Ajudante — embala de manhã, instala à tarde",sal:1900,emb:0.5,ins:0.5,on:true},
 {id:"p7",n:"2º montador instalador (opcional)",sal:2800,ins:1,on:false,dep:"instalacao"},
 {id:"p8",n:"3º marceneiro montador (opcional; pede 3 bancadas)",sal:3000,mon:1,on:false},
 {id:"p9",n:"Operador de corte e fita",sal:2600,cor:1,on:true,dep:"corte"},
 {id:"p10",n:"Motorista-entregador (opcional)",sal:2000,on:false,dep:"veiculo"},
 {id:"p11",n:"Vendedor(a) de showroom (opcional)",sal:2200,proj:0.6,on:false}
];

/* ================= FIXO ================= */
const FIXO=[
 {id:"energia",n:"Energia: iluminação, showroom e escritório",v:700},
 {id:"agua",n:"Água e esgoto",v:100},
 {id:"cont",n:"Contabilidade",v:1200},
 {id:"seg",n:"Seguros: patrimônio, estoque e responsabilidade na obra",v:400},
 {id:"mkt",n:"Marketing: Instagram, Google e relacionamento com arquitetos e construtoras",v:2500},
 {id:"ti",n:"Assinatura do software de projeto, internet e telefone",v:900},
 {id:"hig",n:"Limpeza, EPIs e uniformes da equipe",v:300},
 {id:"prag",n:"Controle de cupim e pragas",v:100},
 {id:"manref",n:"Lâminas, brocas, fresas e baterias",v:400},
 {id:"veic",n:"Veículo próprio: seguro, IPVA, manutenção fixa",v:1200,dep:"veiculo"}
];

/* ================= VARIÁVEL (por metro linear) ================= */
const VARI=[
 {id:"corte",n:"Corte e fita terceirizados na revenda, pelo plano de corte do software",cons:1,un:"—",preco:160,pun:"R$/m linear"},
 {id:"cons",n:"Parafusos, cavilhas, cola, fita dupla face e silicone",cons:1,un:"—",preco:30,pun:"R$/m linear"},
 {id:"emb",n:"Papelão, filme stretch e cantoneiras",cons:1,un:"—",preco:15,pun:"R$/m linear"},
 {id:"frete",n:"Frete das peças cortadas da revenda até a oficina",cons:1,un:"—",preco:30,pun:"R$/m linear"},
 {id:"entrega",n:"Entrega na obra por frete contratado",cons:1,un:"—",preco:55,pun:"R$/m linear"},
 {id:"energia",n:"Energia da serra, das ferramentas e do compressor",cons:0.8,un:"kWh/m",preco:0.98,pun:"R$/kWh"}
];

/* ================= LINHAS DE PRODUTO ================= */
/* share = fracao dos metros lineares vendidos; preco e mat (chapa de MDF e
   ferragens) em R$ por metro linear instalado; rt = reserva tecnica paga ao
   arquiteto; saz = curva propria da linha                                   */
const CANAIS=[
 {id:"cz",n:"Cozinhas e áreas gourmet de casa e apartamento (cliente final)",share:32,preco:2500,mat:720,rt:0,saz:"obra"},
 {id:"dm",n:"Dormitórios, closets e banheiros (cliente final)",share:23,preco:2600,mat:900,rt:0,saz:"obra"},
 {id:"ar",n:"Projetos de arquiteto e decorador (reserva técnica de 10%)",share:15,preco:3300,mat:1050,rt:0.10,saz:"obra"},
 {id:"po",n:"Pousadas, hostels e casas de aluguel por temporada (quartos em série)",share:15,preco:2000,mat:700,rt:0,saz:"pousada"},
 {id:"co",n:"Construtoras e comércio (kits de apartamento, balcões de loja e quiosque)",share:15,preco:1800,mat:640,rt:0,saz:"empresa"}
];

const SAZ=[["Janeiro",70,"Veranista na casa e obra parada: mês fraco"],["Fevereiro",75,"Carnaval; as obras voltam no fim do mês"],["Março",100,"Pousadas e casas reformam depois da temporada"],["Abril",105,"Baixa temporada: reformas"],["Maio",105,"Baixa temporada: reformas"],["Junho",95,"Inverno — a obra segue"],["Julho",100,"Férias de julho"],["Agosto",110,"O dono prepara a casa de praia para o verão"],["Setembro",120,"Pedido para entregar antes do verão"],["Outubro",125,"Pico: montar antes de dezembro"],["Novembro",120,"Última janela antes do réveillon"],["Dezembro",75,"Entregas finais; pedido novo para"]];
/* curvas proprias de cada linha (indice, media ~100) */
const SAZ_LINHA={
 obra:[70,75,100,105,105,95,100,110,120,125,120,75],
 pousada:[20,40,120,150,150,130,120,130,120,90,40,10],
 empresa:[85,90,100,100,100,100,100,105,105,105,110,100]
};

/* ================= PREMISSAS DA MARCENARIA (hipoteses declaradas) ================= */
const MARC_H=0.30;          /* m lineares/h por marceneiro na bancada, com peca cortada, fitada e furada */
const EMB_H=1.60;           /* m lineares/h por pessoa na conferencia e embalagem */
const INST_H=0.36;          /* m lineares/h por pessoa na instalacao, modulo ja montado */
const DESLOC=0.80;          /* fracao do dia de instalacao que sobra depois do deslocamento */
const CORTE_H=0.55;         /* m lineares/h por operador de esquadrejadeira e coladeira */
const PROJ_ML_MES=90;       /* m lineares fechados por mes por projetista (medir, projetar, orcar, revisar) */
const EFIC=0.85;            /* fracao produtiva do turno */
const GARANTIA=0.02;        /* assistencia e garantia, fracao do preco */
const INST_TERC=220;        /* R$/m linear pago ao montador autonomo quando a instalacao e terceirizada */
const DESISTE=0.30;         /* fracao da carteira que desiste quando o prazo passa de um mes */
const PICO_PROD=[7,8,9,10]; /* agosto a novembro */
const HORA_EXTRA=1.20;      /* producao no pico com hora extra */
const FV_KWH=700, FV_COMP=0.85, FV_CAPEX=25000;    /* 5 kWp em Cabo Frio, compensacao liquida */
const VAGA_M2=12.5, VAGAS_MIN=2;                    /* vaga de cliente e o minimo que a avenida pede */

/* ================= SETORES / PLANTA ================= */
const CLS={limpa:{n:"Oficina — montagem e embalagem",c:"#2E9C86"},
 circ:{n:"Circulação",c:"#5B7080"},
 frio:{n:"Módulo pronto",c:"#0F6B5F"},
 inter:{n:"Intermediária — corte, recebimento e expedição",c:"#D79A2E"},
 suja:{n:"Externa — resíduos e retalhos",c:"#AC5F48"},
 barreira:{n:"Vestiário e copa",c:"#6E5AB0"},
 publica:{n:"Pública — showroom e atendimento",c:"#3B7CA8"},
 adm:{n:"Administrativa — projeto e orçamento",c:"#7C93A1"},
 tec:{n:"Técnica",c:"#55707E"}};
/* ab:1 = faz parte do salao aberto da oficina */
const ROOM={
 cor:{n:"Sala de corte e ajuste: serra, tupia e furadeira",c:"inter",a:16,t:"fechada, com aspiração"},
 mon:{n:"Montagem: bancadas, furação e ferragens",c:"limpa",a:30,ab:1},
 emb:{n:"Conferência, embalagem e módulos prontos",c:"limpa",a:20,ab:1},
 ves:{n:"Vestiário, copa e sanitário",c:"barreira",a:7},
 est:{n:"Recebimento de peças cortadas / entrada de pessoal",c:"inter",a:12},
 esc:{n:"Projeto e orçamento",c:"adm",a:6},
 loj:{n:"Showroom e atendimento",c:"publica",a:14},
 exp:{n:"Expedição e carga",c:"inter",a:9}
};
const ROOM_P={
 ret:{n:"Reservatório de água",c:"tec",a:3},
 res:{n:"Abrigo de resíduos, retalhos de MDF e pó",c:"suja",a:3},
 fos:{n:"Fossa e filtro existentes",c:"tec",a:5},
 vag:{n:"Vagas de clientes, junto ao portão",c:"publica",a:25},
 man:{n:"Pátio de carga",c:"circ",a:0}
};
/* ligações obrigatórias; b:"*" = qualquer setor do salão aberto da oficina */
const LIG=[
 {a:"est",b:"mon",t:"porta",d:"Recebimento → montagem: peça cortada separada por projeto"},
 {a:"est",b:"ves",t:"porta",d:"Entrada de pessoal → vestiário"},
 {a:"ves",b:"cor",t:"porta",d:"Vestiário → sala de corte"},
 {a:"cor",b:"mon",t:"porta",d:"Sala de corte → montagem: a peça ajustada passa sem levar o pó"},
 {a:"esc",b:"*",t:"porta",d:"Projeto → oficina"},
 {a:"emb",b:"exp",t:"porta",d:"Embalagem → expedição"},
 {a:"loj",b:"esc",t:"porta",d:"Showroom → projeto"},
 {a:"loj",b:"exp",t:"porta",d:"Showroom → expedição (o cliente confere o pedido sem entrar na oficina)"}
];
/* passagens toleradas entre a oficina e o resto */
const CRUZA_OK=["est","ves","esc","cor","exp"];
const FLOW=["est","mon","emb","exp"];
const WI=14.70, HI=9.70, TP=0.15, TI=0.10;    /* interno útil e espessuras */
const WP=15.00, HP=13.00;                      /* pátio utilizado */

/* árvore de divisórias. Oficina ao fundo em linha — sala de corte fechada,
   montagem e embalagem; na fachada, da esquerda para a direita: vestiário,
   recebimento de peças com a porta A, projeto, showroom e a expedição com a
   porta B.
   x: 0 | corte / vestiário | 2,10 recebimento | 3,60 montagem | 5,90 projeto | 7,90 showroom | 10,00 embalagem | 11,90 expedição | 14,70 */
const L1=()=>({d:"v",cuts:[0.59794],kids:[
  {d:"h",cuts:[0.24490,0.68027],kids:[{r:"cor"},{r:"mon"},{r:"emb"}]},
  {d:"h",cuts:[0.14286,0.40136,0.53741,0.80952],kids:[{r:"ves"},{r:"est"},{r:"esc"},{r:"loj"},{r:"exp"}]}
]});
const L1P=()=>({d:"v",cuts:[0.62000],kids:[
  {r:"man"},
  {d:"h",cuts:[0.12000,0.24000,0.36000],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"vag"}]}
]});

/* equipamentos com pé real, em metros. z = zonas aceitas, op = faixa de operação, gp = conjunto acoplado.
   E01, E02 e E03 têm a pegada do nível comprado (ver eqList). */
const FOOT={
 E01:{n:"Serra de ajuste / esquadrejadeira",w:2.00,h:1.40,op:1.00,z:["inter"],x:0.25,y:0.30,
      s:"Com corte terceirizado, só ajuste de obra e peça refeita. Com esquadrejadeira, a chapa inteira entra aqui."},
 E02:{n:"Bancadas de montagem",w:2.40,h:2.80,op:0.90,z:["limpa"],x:5.40,y:0.60,
      s:"A peça cortada, fitada e furada vira caixa, porta e gaveta; a ferragem é regulada aqui, não na obra."},
 E03:{n:"Furadeira múltipla",w:1.00,h:0.80,op:0.90,z:["limpa"],x:8.70,y:4.20,
      s:"Caneco de dobradiça e minifix furados de uma vez."},
 M01:{n:"Bancada de portas e gavetas",w:1.20,h:2.40,op:0.90,z:["limpa"],x:8.30,y:0.60,mob:1,
      s:"Porta recebe dobradiça, gaveta recebe corrediça e as duas são reguladas antes de embalar."},
 M02:{n:"Carrinho de peças por projeto",w:1.20,h:0.60,op:0.70,z:["limpa"],x:4.20,y:3.90,mob:1,
      s:"Um carrinho por projeto: as peças em pé, com a etiqueta do plano de corte."},
 M03:{n:"Estante de ferragens",w:1.00,h:0.50,op:0.80,z:["limpa"],x:3.75,y:0.20,mob:1,
      s:"Dobradiça, corrediça, puxador e pé regulável por projeto. A altura é a da fase 2B."},
 M04:{n:"Mesa de conferência e embalagem",w:2.60,h:1.40,op:0.90,z:["limpa"],x:10.60,y:0.40,mob:1,
      s:"Todo módulo é conferido contra o projeto: medida, cor, ferragem e puxador. Depois, papelão e filme."},
 M05:{n:"Módulos montados aguardando embalagem",w:2.40,h:1.20,op:0.80,z:["limpa"],x:10.60,y:2.60,mob:1,
      s:"Caixas montadas sobre estrado, nunca no piso."},
 M06:{n:"Rolos de papelão e filme",w:0.80,h:0.60,op:0.70,z:["limpa"],x:13.70,y:0.40,mob:1,
      s:"Papelão ondulado, filme stretch e cantoneiras."},
 M07:{n:"Porta-chapas de peças cortadas",w:0.80,h:2.40,op:0.90,z:["inter"],x:5.00,y:6.20,mob:1,
      s:"Peça cortada guardada em pé e separada por projeto: deitada empena, misturada some."},
 M08:{n:"Estante de fitas de borda e retalhos",w:0.50,h:1.20,op:0.80,z:["inter"],x:0.15,y:3.90,mob:1,
      s:"Fita de borda por cor e retalho aproveitável para peça refeita. A altura é a da fase 2B."},
 M09:{n:"Armários da equipe",w:1.60,h:0.45,op:0.70,z:["barreira"],x:0.15,y:9.10,mob:1,
      s:"Roupa de rua e comida ficam aqui."},
 M10:{n:"Mesa de atendimento",w:1.80,h:0.90,op:0.80,z:["publica"],x:8.30,y:7.10,mob:1,
      s:"O cliente vê o projeto em 3D na tela e escolhe cor e puxador com a amostra na mão."},
 M11:{n:"Cozinha de mostruário",w:3.20,h:0.65,op:0.90,z:["publica"],x:8.30,y:6.00,mob:1,
      s:"Balcão e aéreo montados, com ferragem de amortecedor e gaveta telescópica para o cliente abrir."},
 M12:{n:"Estação de projeto",w:1.20,h:0.65,op:0.60,z:["adm"],x:6.30,y:8.80,mob:1,
      s:"Medição, projeto em 3D, orçamento e plano de corte para a revenda."},
 M13:{n:"Módulos embalados para carga",w:1.20,h:1.00,op:0.70,z:["inter"],x:13.30,y:6.20,mob:1,
      s:"Pedido pronto por obra, na ordem em que o montador vai instalar."}
};
const CAMADAS=[["zonas","Zonas da oficina"],["paredes","Paredes e portas"],["equip","Equipamentos"],
 ["cotas","Cotas"],["hidro","Água e esgoto"],["fluxo","Fluxo do processo"],["pilares","Pilares"],["texto","Etiquetas"]];
const HIDRO=[
 {t:"ralo",x:1.20,y:9.35,lab:"Ralo sifonado — sanitário e copa"},
 {t:"agua",x:0.30,y:6.20,lab:"Água do sanitário e da copa"},
 {t:"agua",x:9.60,y:9.40,lab:"Pia do showroom (cozinha de mostruário)"},
 {t:"caimento",x:1.20,y:8.50,lab:"Caimento do piso de 1% na copa"}
];
const PILARES=[[0,0],[4.90,0],[9.80,0],[14.70,0],[0,4.85],[4.90,4.85],[9.80,4.85],[14.70,4.85],
 [0,9.70],[4.90,9.70],[9.80,9.70],[14.70,9.70]];
/* ================= ESTADO ================= */
const S={
  alugMerc:8000,custoOp:false,tma:15,dias:24,horas:8,fatorMaq:1,
  alvara:false,pesquisa:false,prolagos:false,temporarios:false,treino:false,rt:false,
  mercado:3.5,vol1:0.50,cresc:20,shareMax:3,p3:false,instTerc:false,
  eq:{E01:"basico",E02:"basico",E03:"none",E04:"basico",E05:"basico",E06:"padrao",E07:"padrao",E08:"none",E09:"basico",E10:"basico",E11:"basico",E12:"basico",E13:"basico",E14:"basico"},
  obra:{},rota:"1",reservTerreo:true,trifasica:true,fv:false,eficiencia:false,cont:15,
  postos:{},fator:1.70,
  fixo:{},vari:{},canais:{},aliq:9.5,freteTerc:true,
  tree:null,treeP:null,pos:{},sel:null,view:"int",
  layers:{zonas:true,paredes:true,equip:true,cotas:true,hidro:false,fluxo:true,pilares:true,texto:true},
  vb:null,vbView:null,measure:false,mpts:[],dragDiv:null,dragEq:null,hoverDiv:null,
  /* --- estado do 3D --- */
  capEfetiva:0,penErros:0,impostoLayout:0,
  peLaje:4.00,peViga:3.60,espLaje:0.20,vigaH:0.40,vigaB:0.20,alturaAnexo:2.60,
  hPortaInt:2.10,hPortaEnrolar:3.00,hVisorPeit:1.00,hVisor:1.20,
  forro:true,dutoRota:"circ",lumDens:1.0,evapDreno:true,evapSobre:"circ",
  medido:{peDireito:false,vigas:false,pilares:false,portas:false,peitoril:false,forro:false,degrau:false,energia:false},
  rot:{},sim:null,fase:"0",semente:20260811,vertPatch:{},
  /* --- v3.2 --- */
  explode:0,
  fantasma:true,
  gradAresta:true,
  sol:{on:false,mes:0,hora:10,azFach:0,telhas:0},
  ladoALado:null
};
S.tree=L1();S.treeP=L1P();
OBRA.forEach(o=>S.obra[o.id]=0.5);
POSTOS.forEach(p=>S.postos[p.id]=p.on);
FIXO.forEach(f=>S.fixo[f.id]=f.v);
VARI.forEach(v=>S.vari[v.id]=v.preco);
CANAIS.forEach(c=>S.canais[c.id]={share:c.share,preco:c.preco});





/* ================= GANCHOS DO MOTOR ================= */
const VEIC_EQ="E08";                 /* o equipamento que e o veiculo proprio */
const TAXA_RECEB=0.030;              /* cartao parcelado antecipado e boleto */
const EFIC_GANHO=0.03, EFIC_CAPEX=3000;
/* papeis de trabalho: [chave, nome, produz (entra na hora extra do pico)] */
const PAPEIS=[["proj","Projeto e medição",false],["cor","Corte e fita",true],["mon","Montagem na oficina",true],
  ["emb","Conferência e embalagem",true],["ins","Instalação na obra",true]];
const H={
  flags(R){
    R.exaustao=S.eq.E05!=="none";              /* aspiracao de po */
    R.cortaCasa=!!eqT("E01").casa;
    R.temFuradeira=S.eq.E03!=="none";
    R.instTerc=!!S.instTerc;
    R.temCheck=R.exaustao;
  },
  /* operador de corte so com esquadrejadeira; instalador so com instalacao
     propria; motorista so com veiculo */
  dep(R){return {corte:R.cortaCasa,instalacao:!R.instTerc,veiculo:R.veiculo}},
  capacidade(R){
    const h=S.horas, fm=S.fatorMaq||1, conf=eqT("E10").fat||1, P=R.pessoas;
    R.pessoasProj=P.proj;R.pessoasMon=P.mon;R.pessoasEmb=P.emb;
    R.pessoasIns=R.instTerc?0:P.ins;R.pessoasCor=P.cor;
    R.bancadas=eqT("E02").banc||0;
    R.capProj=R.pessoasProj*PROJ_ML_MES/S.dias*(eqT("E09").f||1);
    R.capCor=R.cortaCasa?R.pessoasCor*CORTE_H*h*EFIC*fm*(eqT("E01").fat||1)*(R.exaustao?1:0.95)*conf:Infinity;
    R.capMon=Math.min(R.bancadas,R.pessoasMon)*MARC_H*h*EFIC*fm*(eqT("E02").fat||1)*(R.temFuradeira?(eqT("E03").fat||1):1)
      *(eqT("E04").fat||1)*(eqT("E12").fat||1)*conf;
    R.capEmb=R.pessoasEmb*EMB_H*h*EFIC*conf;
    R.equipes=eqT("E11").equipes||1;
    R.capIns=R.instTerc?Infinity:Math.min(R.pessoasIns,2*R.equipes)*INST_H*h*EFIC*DESLOC*fm;
    R.etapas=[{n:"Projeto e medição",v:R.capProj,sala:"esc"}];
    if(R.cortaCasa)R.etapas.push({n:"Corte e fita",v:R.capCor,sala:"cor"});
    R.etapas.push({n:"Montagem na oficina",v:R.capMon,sala:"mon"},{n:"Conferência e embalagem",v:R.capEmb,sala:"emb"});
    if(!R.instTerc)R.etapas.push({n:"Instalação na obra",v:R.capIns,sala:"exp"});
  },
  fGeral(R){return (eqT("E06").f||1)*(eqT("E07").f||1)*(eqT("E09").f||1)},
  vari(v,R){
    if(v.id==="corte"&&R.cortaCasa){v.preco=eqT("E01").custoCorte||0;v.n="Chapa inteira: fita, cola e desgaste de lâmina (corte e fita na casa)";v.fixoPreco=true;}
    if(v.id==="entrega"&&!S.freteTerc){v.preco=12;v.n="Combustível do veículo próprio até a obra";v.fixoPreco=true;}
    return v;
  },
  variExtra(R){return R.instTerc?[{id:"instTerc",n:"Instalação por montador autônomo",cons:1,un:"—",preco:INST_TERC,pun:"R$/m linear"}]:[]},
  canal(c,R){return (c.id==="ar"&&!eqT("E09").render)?0.90:1},
  /* a entrada de 40% paga a chapa, mas o saldo vem na entrega ou no cartao;
     fica um quinto da venda do mes a receber e duas semanas de ferragem e
     chapa compradas antes da entrada */
  giro(R){return S.vol1*1000/12*R.precoMedio*R.fatorDemanda*0.20+S.vol1*1000/12*R.fatorDemanda*R.matMedio*0.40},
  riscoSan(R,lay){
    let rs=15;
    if(!R.exaustao)rs+=12; if(R.instTerc)rs+=6; if(S.eq.E07==="basico")rs+=4;
    if(!S.rt)rs+=8; if(!S.treino)rs+=8;
    rs+=Math.min(20,lay.viol.length*7);
    if(lay.setoresFaltando.includes("ves"))rs+=8;
    return rs;
  },
  riscoReg(R){
    let rr=15;
    if(!S.alvara)rr+=30; if(!S.prolagos)rr+=12; if(!S.pesquisa)rr+=12;
    if(!S.reservTerreo)rr+=6;
    return rr;
  },
  gates(R,lay){return [
    {id:"alvara",n:"O Alvará",ok:S.alvara,xp:15},
    {id:"pesq",n:"A Pesquisa de Campo",ok:S.pesquisa,xp:15},
    {id:"efl",n:"Os Arquitetos Parceiros",ok:S.prolagos,xp:12},
    {id:"layout",n:"A Planta Fecha",ok:lay.deficit===0&&lay.viol.length===0&&lay.flowPct>=100,xp:15},
    {id:"pcc",n:"A Medida Conferida",ok:R.exaustao&&S.rt&&S.treino,xp:12},
    {id:"verao",n:"A Corrida do Verão",ok:S.p3&&S.temporarios,xp:10},
    {id:"gargalo",n:"A Carteira em Dia",ok:R.perda3Pct<5,xp:11},
    {id:"bench",n:"Bater a Locação",ok:R.dre[2].ebitda>S.alugMerc*12,xp:10}
  ]}
};

/* ================= EIXO VERTICAL (HIPOTESE DECLARADA) ================= */
const VERT={
 /* serra de bancada: a peca fica aberta sobre a mesa */
 E01:{hz:1.00,hop:0.95,hman:0.60,hac:"S",aberto:1},
 /* bancadas: o MDF acabado fica exposto sobre o tampo */
 E02:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 E03:{hz:1.40,hop:1.00,hman:0.40,hac:"S"},
 M01:{hz:0.90,hop:0.90,hman:0.40,hac:"O",aberto:1,banc:1},
 M02:{hz:1.50,hop:1.20,hman:0.30,hac:"N"},
 /* a altura das estantes de ferragens e de fitas e a da fase 2B (ver hzDe) */
 M03:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 M04:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 M05:{hz:1.50,hop:1.20,hman:0.30,hac:"S"},
 M06:{hz:1.10,hop:0.90,hman:0.20,hac:"O"},
 /* porta-chapas: peca de 2,75 m em pe, levemente inclinada */
 M07:{hz:2.65,hop:1.50,hman:0.20,hac:"O"},
 M08:{hz:1.80,hop:1.50,hman:0.20,hac:"L"},
 M09:{hz:1.80,hop:1.20,hman:0.20,hac:"N"},
 M10:{hz:0.75,hop:0.75,hman:0.30,hac:"S"},
 M11:{hz:2.20,hop:1.50,hman:0.20,hac:"S"},
 M12:{hz:1.15,hop:0.75,hman:0.30,hac:"N"},
 M13:{hz:1.60,hop:1.20,hman:0.20,hac:"O"}
};
const ESTANTES_IDS=["M03","M08"];   /* seguem a altura de empilhamento da fase 2B */
const ALT_ESTANTE=2.00;     /* acima disto a caixa de corredicas sai acima do ombro (hipotese de ergonomia) */

/* ================= INSTALACOES E VITRINE ================= */
const INST={
  abertos:["E01","E02","M01","M04"],     /* onde o MDF fica exposto */
  difSalas:["exp","est"], salaLinha:"mon", salaLoja:"loj",
  evap:()=>S.eq.E06==="padrao", evapLinhaEq:"E01", evapPos:{x:10.20,y:9.10}, evapSala:"loj", evapSalaLinha:"cor"
};
const VITRINE={a:"loj",b:["exp","cam"],nome:"Vitrine do showroom para a expedição"};
/* aspiracao da sala de corte: captacao na serra e duto pela laje. Sem
   aspiracao nao ha duto, e o po fino de MDF fica na oficina (Z20) */
H.exaustao3D=(B,eqs,pe)=>{
  if(S.eq.E05==="none")return;
  dutoSobre(B,eqs,pe,"E01",S.eq.E05==="padrao","Coletor de pó sobre a serra","Duto da aspiração de pó");
};
const PORTAS_FACHADA=[
 {r:"est",lado:"A",min:1.6,l:3.00,t:"enrolar",lab:"PORTA A · peças e pessoal"},
 {r:"exp",lado:"B",min:1.6,l:3.20,t:"enrolar",lab:"PORTA B · expedição"},
 {r:"loj",lado:"C",min:1.2,l:1.60,t:"vidro",lab:"Acesso da loja"}
];

/* ================= REGRAS Z DO NEGOCIO ================= */
H.zNegocio=(B,add,{eqs,D,M,dt})=>{
  /* Z04 — instalacao sobre MDF exposto (serra, bancadas e mesas) */
  zProjecao(B,add,eqs,{bloq:"MDF exposto: condensado estufa a chapa e mancha o acabamento",
    aviso:"MDF exposto — exigem luminaria fechada, sem ofuscamento, com temperatura de cor que nao engane a escolha do padrao de MDF"});
  /* Z08 — raio de giro do carrinho-plataforma de modulos */
  zGiro(B,add,dt,D,[["est","Recebimento de pecas cortadas"],["emb","Conferencia e embalagem"],["exp","Expedicao"]],1.80,
    "o carrinho-plataforma com um modulo montado");
  /* Z11 — vitrine do showroom: o cliente ve o pedido sem entrar na oficina */
  zVitrine(B,add,["O showroom nao encosta na expedicao: quem vem conferir o pedido teria de atravessar a oficina",
    "Manter o showroom junto a expedicao, com vitrine ou porta entre os dois."]);
  /* Z14 — estantes de ferragens e de fitas */
  zEstantes(B,add,D,"mon","Estantes de ferragens e de fitas");
  /* Z20 — sala de corte sem aspiracao: po fino de MDF */
  const e01=eqs.find(b=>b.id==="E01");
  if(S.eq.E05==="none"&&e01)add("Z20","erro",
    "Sala de corte sem aspiracao: o po fino de MDF irrita as vias aereas, assenta no modulo montado e e combustivel — pede captacao na serra e na tupia",
    e01,"Instalar aspirador industrial ligado a serra e a tupia (fase 3).");
  /* Z21 — loja de fabrica sem vaga de cliente no patio */
  zVagas(B,add,n=>`Showroom com ${n} vaga(s) de cliente no patio — minimo adotado de ${VAGAS_MIN}; sem vaga, quem vem ver o projeto vai embora (−5%)`,
    "Reservar a faixa do patio junto ao portao para as vagas (fase 2, vista do patio).");
};

/* ================= TURNO ================= */
/* estacoes da linha, na ordem do fluxo. cap = unidades por dia de trabalho;
   sem cap, a estacao e passagem                                            */
const ESTACOES=[
 {id:"est",n:"Porta-chapas de pecas cortadas",eq:"M07",sala:"est"},
 /* a bancada roda no ritmo do marceneiro; com corte na casa, no ritmo do
    que for menor, serra ou bancada */
 {id:"mon",n:"Bancadas de montagem",eq:"E02",sala:"mon",cap:R=>Math.min(R.capMon,R.capCor)},
 {id:"emb",n:"Conferencia e embalagem",eq:"M04",sala:"emb",cap:R=>R.capEmb},
 {id:"exp",n:"Expedicao",eq:"M13",sala:"exp"}
];
const BATELADA=0.5;             /* metros lineares por lote: um modulo */
const TURNO={carrinho:1.0,       /* metros lineares de peca por viagem de carrinho */
  rolo:3.0,                      /* metros lineares por carga de peca cortada da revenda */
  carga:{"est>mon":BATELADA}, salaRec:"est",
  cop:30};                       /* limpeza de po e separacao do projeto do dia, em minutos */
/* projeto, corte e instalacao acontecem fora da linha: o turno nao fecha
   mais metros do que o gargalo estatico dessas etapas deixa */
H.foraDaLinha=R=>Math.min(R.capIns,R.capProj,R.capCor);
//@@HTML
ARQUIVO=gerador/saida_teste/planejado_prime_3d_v1.0.html

//@@TARDIO
/* cores de MDF: so para dar leitura a cena */
MAT.tec={c:()=>hex2rgb("#E0707A"),m:0};
MAT.tec2={c:()=>hex2rgb("#2FA3A8"),m:0};
MAT.tec3={c:()=>hex2rgb("#E8B33A"),m:0};
MAT.mdf={c:()=>hex2rgb("#EEECE6"),m:0};          /* MDF branco */
MAT.mdf2={c:()=>hex2rgb("#B98B5A"),m:0};         /* MDF amadeirado */
MAT.mdf3={c:()=>hex2rgb("#5C6168"),m:0};         /* MDF grafite */
function detalhesEquip(e,B){
  const K=ctxEquip(e,B), P=LIB(K), {M,add,mat,hz,eixoT}=K;
  const cil=(u,v,uw,vw,y,h,k,o)=>add(mat(M(u,v,uw,vw,y,h,Object.assign({geo:"cil",eixo:eixoT},o)),k));
  const rolo=(u,v,uw,vw,y,h,k,o)=>add(mat(M(u,v,uw,vw,y,h,Object.assign({geo:"cil",eixo:K.eixoU},o)),k));
  const chapa=(u,v,uw,vw,y,h,k,lod)=>add(mat(M(u,v,uw,vw,y,h,{lod:lod||2,org:"visual"}),k));
  /* modulo de armario: caixa com porta e puxador, a leitura basica da cena */
  const modulo=(u,v,uw,vw,y,h,k,lod)=>{
    add(mat(M(u,v,uw,vw,y,h,{geo:"chanf",ch:0.008,lod:lod||1,org:"visual"}),k));
    add(mat(M(u+uw*0.08,v-0.01,uw*0.84,0.01,y+h*0.82,0.015,{lod:3,org:"visual"}),"inox"));
  };
  switch(e.id){
    case "E01": {                                   /* serra de ajuste ou esquadrejadeira */
      const casa=S.eq.E01!=="basico";
      [[0.04,0.10],[0.92,0.10],[0.04,0.82],[0.92,0.82]].forEach(([u,v])=>
        add(mat(M(u,v,0.04,0.08,0,0.86,{geo:"tubo",eixo:"y",esp:0.01,lod:2,org:"catalogo"}),"pint")));
      add(mat(M(0.30,0.25,0.40,0.50,0,0.86,{geo:"chanf",ch:0.02,lod:1,org:"catalogo"}),"pint"));      /* corpo da serra */
      add(mat(M(0.02,0.08,0.96,0.84,0.86,0.04,{lod:1,org:"envelope"}),"inox"));                      /* mesa */
      cil(0.46,0.40,0.10,0.20,0.78,0.16,"borr",{lod:2});                                            /* disco */
      add(mat(M(0.44,0.38,0.14,0.24,0.92,0.06,{lod:2,org:"catalogo"}),"acr"));                      /* coifa do disco */
      if(casa){
        add(mat(M(0.02,0.02,0.96,0.12,0.90,0.05,{lod:2,org:"catalogo"}),"inox"));                   /* carro da esquadrejadeira */
        chapa(0.04,0.10,0.70,0.45,0.905,0.018,"mdf",1);                                             /* chapa sobre a mesa */
        add(mat(M(0.70,0.72,0.28,0.24,0,0.95,{geo:"chanf",ch:0.02,lod:1,org:"catalogo"}),"plast")); /* coladeira */
        rolo(0.74,0.74,0.10,0.10,0.95,0.04,"mdf2",{lod:2});
      } else {
        chapa(0.10,0.55,0.35,0.30,0.905,0.018,"mdf2",2);
        add(mat(M(0.80,0.70,0.16,0.20,0.90,0.10,{geo:"cil",eixo:"y",lod:2,org:"catalogo"}),"pint")); /* tupia de mesa */
      }
      P.painel(0.10,0.70);
      break; }
    case "E02": {                                   /* bancadas de montagem, uma por marceneiro */
      const n=Math.max(1,eqT("E02").banc||2);
      for(let i=0;i<n;i++){
        const u0=i/n, uw=1/n;
        [[u0+0.03,0.06],[u0+uw-0.07,0.06],[u0+0.03,0.84],[u0+uw-0.07,0.84]].forEach(([u,v])=>
          add(mat(M(u,v,0.04,0.08,0,hz-0.04,{lod:2,org:"catalogo"}),"mad")));
        add(mat(M(u0+0.02,0.04,uw-0.04,0.90,hz-0.04,0.04,{lod:1,org:"envelope"}),"mad"));       /* tampo */
        add(mat(M(u0+0.03,0.10,uw-0.06,0.80,0.15,0.03,{lod:2,org:"catalogo"}),"mad"));          /* prateleira */
        chapa(u0+0.10,0.45,uw-0.20,0.30,hz,0.018,i%2?"mdf2":"mdf",1);                           /* lateral sobre o tampo */
      }
      break; }
    case "E03": {                                   /* furadeira multipla de bancada */
      P.corpo(0.62,"pint");
      add(mat(M(0.05,0.10,0.90,0.60,hz*0.62,0.04,{lod:1,org:"catalogo"}),"inox"));
      add(mat(M(0.35,0.70,0.30,0.20,hz*0.62,hz*0.38,{geo:"chanf",ch:0.02,lod:1,org:"catalogo"}),"pint"));
      for(let k=0;k<6;k++)cil(0.12+k*0.13,0.35,0.05,0.10,hz*0.62+0.06,0.10,"inox",{eixo:"y",lod:3});
      P.painel(0.80,0.60);
      break; }
    case "M01": case "M04": {                       /* bancada de portas e mesa de conferencia */
      P.tampo(hz-0.04); P.pe(hz-0.04); P.prateleira(hz*0.30);
      if(e.id==="M01"){
        for(let i=0;i<3;i++)chapa(0.10,0.10+i*0.28,0.75,0.24,hz+i*0.018,0.018,["mdf","mdf2","mdf3"][i],i?2:1);
      } else {
        modulo(0.10,0.25,0.35,0.55,hz,0.70,"mdf",1);
        add(mat(M(0.09,0.24,0.37,0.57,hz,0.72,{lod:2,org:"visual",a:0.35}),"acr"));             /* filme */
        rolo(0.60,0.30,0.30,0.40,hz,0.25,"mad",{lod:2});                                        /* rolo de papelao */
      }
      break; }
    case "M02": {                                   /* carrinho de pecas por projeto: pecas em pe */
      [[0.03,0.05],[0.91,0.05],[0.03,0.85],[0.91,0.85]].forEach(([u,v])=>
        add(mat(M(u,v,0.06,0.10,0.10,hz-0.10,{geo:"tubo",eixo:"y",esp:0.01,lod:2,org:"catalogo"}),"pint")));
      add(mat(M(0.02,0.05,0.96,0.90,0.10,0.04,{lod:1,org:"catalogo"}),"pint"));
      for(let k=0;k<7;k++)chapa(0.06+k*0.13,0.12,0.02,0.76,0.14,hz*(0.55+0.05*(k%3))-0.14,["mdf","mdf2","mdf"][k%3],k%2?2:1);
      P.rodizio(0.04,0.08); P.rodizio(0.88,0.08); P.rodizio(0.04,0.84); P.rodizio(0.88,0.84);
      break; }
    case "M03": case "M08": {                       /* estantes de ferragens e de fitas de borda */
      [[0.02,0.06],[0.94,0.06],[0.02,0.86],[0.94,0.86]].forEach(([u,v])=>
        add(mat(M(u,v,0.045,0.08,0,hz,{geo:"tubo",eixo:"y",esp:0.01,lod:2,org:"catalogo"}),"inox")));
      const nP=Math.max(3,Math.round(hz/0.40));
      for(let i=0;i<nP;i++){
        const y=0.12+i*(hz-0.22)/nP, hc=Math.min(0.20,(hz-0.22)/nP-0.05);
        P.prateleira(y);
        if(e.id==="M08")for(let k=0;k<3;k++)cil(0.08+k*0.30,0.20,0.24,0.60,y+0.03,hc,["mdf2","mdf","mdf3"][(i+k)%3],{eixo:"y",lod:k?2:1});
        else for(let k=0;k<3;k++)add(mat(M(0.06+k*0.31,0.12,0.26,0.76,y+0.03,hc,{geo:"chanf",ch:0.01,lod:k?2:1,org:"visual"}),k===1?"tec2":"pint"));
      }
      break; }
    case "M05": case "M13": {                       /* modulos montados e embalados sobre estrado */
      add(mat(M(0.02,0.02,0.96,0.96,0,0.12,{lod:1,org:"catalogo"}),"mad"));
      const nx=Math.max(1,Math.round(K.L/0.65)), camadas=Math.max(1,Math.floor((hz-0.12)/0.72));
      for(let c=0;c<camadas;c++)for(let i=0;i<nx;i++){
        const u0=0.03+i*0.94/nx;
        modulo(u0,0.08,0.94/nx-0.02,0.84,0.12+c*0.72,0.70,e.id==="M13"?"mad":(i%2?"mdf2":"mdf"),c?2:1);
        if(e.id==="M13")add(mat(M(u0-0.005,0.07,0.94/nx-0.01,0.86,0.12+c*0.72,0.71,{lod:2,org:"visual",a:0.35}),"acr"));
      }
      break; }
    case "M06": {                                   /* rolos de papelao e filme */
      rolo(0.05,0.10,0.90,0.40,0,0.40,"mad",{lod:1});
      rolo(0.05,0.55,0.90,0.35,0,0.30,"acr",{lod:2});
      add(mat(M(0.05,0.10,0.90,0.80,0.42,hz-0.42,{lod:2,org:"visual"}),"mad"));
      break; }
    case "M07": {                                   /* porta-chapas: pecas cortadas em pe, separadas por projeto */
      add(mat(M(0.02,0.02,0.96,0.96,0,0.08,{lod:1,org:"catalogo"}),"pint"));
      [[0.00],[0.96]].forEach(([u])=>add(mat(M(u,0.02,0.04,0.96,0,hz,{lod:1,org:"catalogo"}),"pint")));
      const n=Math.max(6,Math.round(K.L/0.18));
      for(let k=0;k<n;k++){
        const cor=["mdf","mdf","mdf2","mdf3","mdf"][k%5];
        chapa(0.08,0.06+k*0.88/n,0.84,0.02,0.08,(hz-0.12)*(0.65+0.35*((k*7)%5)/4),cor,k%3?2:1);
      }
      break; }
    case "M09": {                                   /* armarios da equipe */
      const n=Math.max(3,Math.round(K.L/0.35));
      for(let i=0;i<n;i++){
        add(mat(M(i/n+0.006,0.05,1/n-0.012,0.90,0.12,hz-0.16,{geo:"chanf",ch:0.012,lod:1,org:"catalogo"}),"pint"));
        add(mat(M(i/n+0.03,0.94,0.025,0.03,hz*0.52,0.06,{geo:"cil",eixo:"y",lod:3,org:"visual"}),"inox"));
      }
      break; }
    case "M10": {                                   /* mesa de atendimento com tela e amostras */
      P.tampo(hz-0.04); P.pe(hz-0.04);
      add(mat(M(0.35,0.70,0.30,0.05,hz,0.35,{geo:"chanf",ch:0.01,lod:1,org:"catalogo"}),"borr"));     /* tela */
      for(let k=0;k<4;k++)chapa(0.08+k*0.06,0.15,0.05,0.25,hz,0.012,["mdf","mdf2","mdf3","tec2"][k],2);
      break; }
    case "M11": {                                   /* cozinha de mostruario: balcao, tampo e aereo */
      const n=Math.max(3,Math.round(K.L/0.60));
      for(let i=0;i<n;i++){
        const u0=i/n, uw=1/n;
        modulo(u0+0.004,0.10,uw-0.008,0.88,0.10,0.72,i%2?"mdf2":"mdf3",1);                     /* balcao */
        modulo(u0+0.004,0.40,uw-0.008,0.58,1.50,0.70,"mdf",i?2:1);                               /* aereo */
      }
      add(mat(M(0.00,0.06,1.00,0.94,0.82,0.04,{lod:1,org:"visual"}),"borr"));                     /* tampo */
      add(mat(M(0.00,0.00,1.00,0.08,0.00,0.10,{lod:2,org:"visual"}),"borr"));                     /* rodape */
      break; }
    case "M12": {                                   /* estacao de projeto */
      P.tampo(hz*0.62); P.pe(hz*0.62);
      add(mat(M(0.18,0.30,0.55,0.05,hz*0.66,hz*0.30,{geo:"chanf",ch:0.01,inc:0.12,piv:[0.5,0,1],lod:1,org:"catalogo"}),"borr"));
      add(mat(M(0.20,0.28,0.51,0.02,hz*0.70,hz*0.22,{inc:0.12,piv:[0.5,0,1],lod:2,org:"visual"}),"acr"));
      break; }
  }
}
//@@DADOS

/* ================= PRODUTO NA CENA ================= */
function produtoNaCena(B){
  if(!S.produto||!B.D)return;
  const sim=(typeof SIM!=="undefined")&&SIM;
  const sala=r=>B.D.leaves.find(l=>l.r===r);
  /* modulos embalados, junto a porta B: o que o turno fecha */
  const exp=sala("exp");
  if(exp){
    const ml=sim?Math.max(1,sim.kgTurno):3;
    pilha(B,exp.x+0.25,exp.y+exp.h-1.40,"modulo",Math.min(8,Math.max(2,Math.round(ml*1.6))),"Módulos embalados para a obra de amanhã",ml,0,"m lineares");
  }
  /* pecas cortadas recem-chegadas da revenda pela porta A */
  const est=sala("est");
  if(est)pilha(B,est.x+0.30,est.y+est.h-1.30,"peca",36,"Peças cortadas e fitadas recebidas da revenda",6,0,"m lineares");
}


/* ================= SENSIBILIDADE, CETICO E MONTE CARLO ================= */
const VARS=[
 {id:"preco",n:"Preço médio ponderado",un:"R$/m linear",geo:false,
  val:()=>calc().precoMedio,
  set:f=>CANAIS.forEach(c=>S.canais[c.id].preco=+(S.canais[c.id].preco*f).toFixed(3))},
 {id:"vol",n:"Volume do ano 1",un:"mil m lineares/ano",geo:false,val:()=>S.vol1,set:f=>{S.vol1=S.vol1*f}},
 {id:"cresc",n:"Crescimento anual",un:"%",geo:false,val:()=>S.cresc,set:f=>{S.cresc=S.cresc*f}},
 {id:"cap",n:"Rendimento da montagem e da instalação",un:"m lineares/dia",geo:false,
  val:()=>calc().capKgDia,set:f=>{S.fatorMaq=(S.fatorMaq||1)*f}},
 /* v1.0 do gelo: na v3.2 este val lia calc().cv, que nao existe, e o botao da
    sensibilidade quebrava ao desenhar o tornado */
 {id:"cv",n:"Custo de chapa, ferragem, corte e entrega",un:"R$/m linear",geo:false,
  val:()=>calc().matMedio,set:f=>{S.fatMat=+((S.fatMat||1)*f).toFixed(4);VARI.forEach(v=>S.vari[v.id]=+(S.vari[v.id]*f).toFixed(4))}},
 {id:"folha",n:"Folha com encargos",un:"R$/mês",geo:false,
  val:()=>calc().folha,set:f=>{S.fator=+(S.fator*f).toFixed(4)}},
 {id:"perda",n:"Plano de corte otimizado (−3% do variável)",un:"—",geo:false,
  val:()=>S.eficiencia?2:3,set:f=>{if(f<1)S.eficiencia=true;else S.eficiencia=false}},
 {id:"obra",n:"Custo de obra",un:"R$",geo:false,
  val:()=>calc().obraTotal,set:f=>OBRA.forEach(o=>{S.obra[o.id]=Math.min(1.6,S.obra[o.id]*f)})},
 {id:"cont",n:"Contingência",un:"%",geo:false,val:()=>S.cont,set:f=>{S.cont=S.cont*f}},
 {id:"aliq",n:"Alíquota efetiva",un:"%",geo:false,val:()=>S.aliq,set:f=>{S.aliq=S.aliq*f}},
 {id:"tma",n:"TMA",un:"% a.a.",geo:false,val:()=>S.tma,set:f=>{S.tma=S.tma*f}},
 {id:"peLaje",n:"Pé-direito sob laje",un:"m",geo:true,faixa:[3.00,4.50],
  val:()=>S.peLaje,set:f=>{S.peLaje=S.peLaje*f},setAbs:v=>{S.peLaje=v}},
 {id:"vigaH",n:"Altura da viga",un:"m",geo:true,faixa:[0.20,1.00],
  val:()=>S.vigaH,set:f=>{S.vigaH=S.vigaH*f},setAbs:v=>{S.vigaH=v}},
 {id:"hPorta",n:"Vão livre da porta de carga",un:"m",geo:true,faixa:[2.20,4.00],
  val:()=>S.hPortaEnrolar,set:f=>{S.hPortaEnrolar=S.hPortaEnrolar*f},setAbs:v=>{S.hPortaEnrolar=v}}
];

const CETICO=[["preço 10% menor",()=>CANAIS.forEach(c=>S.canais[c.id].preco*=0.90)],
              ["volume 15% menor",()=>{S.vol1*=0.85}],
              ["chapa, ferragem e variáveis 10% mais caros",()=>{S.fatMat=(S.fatMat||1)*1.10;VARI.forEach(v=>S.vari[v.id]*=1.10)}],
              ["CAPEX 10% maior",()=>{S.cont=S.cont+10}],
              ["montagem e instalação rendendo 10% menos",()=>{S.fatorMaq=(S.fatorMaq||1)*0.9}]];

const DISTR=[
 {id:"preco",n:"Preço médio",tri:[0.85,1.00,1.10]},
 {id:"vol",n:"Volume do ano 1",tri:[0.70,1.00,1.15]},
 {id:"cv",n:"Custo variável",tri:[0.92,1.00,1.15]},
 {id:"cap",n:"Rendimento da montagem e da instalação",tri:[0.85,1.00,1.05]},
 {id:"obra",n:"Custo de obra",tri:[0.90,1.00,1.25]}
];
const NAO_RESPONDE=[
 "Quanto o cliente de Cabo Frio paga por metro linear, e se indica a marcenaria depois — o preco medio e premissa, e e a variavel de que tudo depende.",
 "Quantas marcenarias e lojas de planejados ja atendem a regiao, a que preco e com que prazo: o simulador nao conhece o concorrente.",
 "Se o volume projetado se vende: o simulador dimensiona a oficina, nao fecha contrato com arquiteto, construtora nem pousada.",
 "Quanto a revenda cobra de verdade pelo corte, pela fita e pela furacao, e com que prazo: o corte terceirizado e a tese que segura o CAPEX baixo.",
 "Se o dono tem tempo e jeito para vender e medir: numa marcenaria pequena, quem fecha o projeto e o socio.",
 "Se o predio tem o pe-direito que a hipotese diz para o porta-chapas e se a laje aceita a passagem do duto da aspiracao.",
 "Se o aluguel de R$ 8 mil/mes e real: ele e o adversario, e se for maior a marcenaria ganha com menos folga.",
 "Se voce quer isso: o modelo compara EBITDA com aluguel, nao com sossego nem com o que voce prefere fazer da vida."
];


/* ================= CHEFE DO PICO ================= */
/* texto original:
  boss_sabado(){
    /* agosto a novembro: todo mundo quer o movel montado antes do verao * /
    const R=calc(), T=R.temporada, pico=T.meses.filter(x=>PICO_PROD.includes(x.m));
    const txt=[];
    const dem=pico.reduce((a,x)=>a+x.dem,0), prod=pico.reduce((a,x)=>a+x.prod,0), des=pico.reduce((a,x)=>a+x.perda,0);
    const nov=T.meses[10];
    txt.push(`Agosto a novembro, ano 3: entram ${NUM(dem*1000,0)} metros lineares de pedido novo, e a oficina instala até ${NUM(prod*1000,0)} nesses quatro meses${S.p3?" com a hora extra":""}.`);
    txt.push(des*1000<=1?"A carteira fica dentro de um mês de prazo: dá para montar tudo antes do réveillon.":`A carteira passa de um mês e ${NUM(des*1000,0)} metros desistem no pico (${BRL(des*1000*R.precoMedio)} de venda). No fim de novembro ainda esperam ${NUM(nov.carteira*1000,0)} metros. O gargalo é ${R.gargalo.n.toLowerCase()}: um segundo montador instalador, a instalação terceirizada ou a hora extra seguram a carteira.`);
    ZV.filter(v=>["Z03","Z08","Z19"].includes(v.cod)).forEach(v=>txt.push(`${v.cod} — ${v.msg}`));
    const exp=MOD.D.leaves.find(l=>l.r==="exp");
    const c=maiorCirculo(MOD.dt,exp||{x:0,y:0,w:1,h:1});
    txt.push(`Maior círculo livre na expedição: ${N2(c.raio*2)} m (o carrinho-plataforma com um módulo precisa de 1,80 m para girar).`);
    $$("#bossOut").innerHTML=`<div class="hint ${des*1000>1?"bad":""}"><b>Novembro: Tudo Montado Antes do Réveillon</b><br>${txt.join("<br>")}</div>`;
  }
};
*/

/* ================= IDENTIDADE E TEXTOS ================= */
const NEG={titulo:"Planejado Prime",slug:"planejado_prime",negocio:"marcenaria de móveis planejados",
  leiame:"uma marcenaria de moveis planejados",
  ele:"a marcenaria",pron:"ela",Curto:"Marcenaria",
  un:"metro linear",uns:"metros lineares",unsCurto:"metros",ud:"m",dec:1,unMil:"mil metros lineares",unPreco:"R$/m linear"};
const FASES3=[["0","Briefing"],["1","Mercado"],["2","Planta baixa"],["2B","O terceiro eixo"],["3","A oficina e a carteira"],
  ["4","Obra"],["5","Pessoas"],["6","Custo"],["6B","Turno cheio"],["7","Veredicto"]];
const SAZ_NOMES={obra:"antes do verão",pousada:"baixa temporada",empresa:"ano inteiro"};
const SAZ_COLS={obra:"Casa e apartamento",pousada:"Pousada",empresa:"Construtora e comércio"};
const ALTO_ID="M07";
const REF_VIOL=["Z04","Z06"];
const PORTOES=[
 ["alvara","Consulta de uso do solo na PMCF","Gratuita antes do projeto. Marcenaria faz barulho e pó: numa avenida mista costuma caber como oficina de montagem sem corte de chapa, e confirmar antes custa nada."],
 ["pesquisa","Pesquisa de campo com arquitetos, construtoras, pousadas e marcenarias da cidade","Quanto se cobra por metro linear em Cabo Frio, qual o prazo das marcenarias estabelecidas e quem está insatisfeito com a instalação."],
 ["prolagos","Parcerias fechadas com arquitetos e construtoras","Dois escritórios de arquitetura e uma construtora com lançamento na região."],
 ["rt","Medição conferida e projeto assinado antes do corte","Peça cortada errada vira retalho."],
 ["treino","Treinamento no software de projeto e no plano de corte",""],
 ["temporarios","Montador temporário contratado para agosto a novembro",""]];
const ITENS_CAMPO=[
 ["peDireito","Pe-direito livre sob laje","medir em tres pontos afastados; anotar o menor",""],
 ["vigas","Altura e largura das vigas e o vao entre elas","medir da face inferior da viga ate o piso",""],
 ["pilares","Posicao e secao dos pilares","trena a partir das duas empenas; anotar secao em cm",""],
 ["portas","Altura livre sob as portas de enrolar","com a porta totalmente recolhida",""],
 ["peitoril","Passagem do duto da aspiracao de po pela laje","um duto de 150 mm sobre a serra; conferir armadura e impermeabilizacao",""],
 ["forro","Forro existente: material e altura","",""],
 ["degrau","Cota do patio em relacao ao piso interno","o degrau na porta de carga decide o carrinho de modulos e a acessibilidade do showroom",""],
 ["energia","Entrada de energia, quadro e demanda disponivel","anotar disjuntor geral, se ha trifasico e a carga liberada",""]];
const CORRIGE_NEG={
  Z20:{lab:"ligar a aspiracao na serra e na tupia",ok:()=>S.eq.E05==="none",fn:()=>{S.eq.E05="basico"}}};
const PROVAS=[
 ["Pé-direito de 2,30 m bloqueia o porta-chapas","Z01",()=>{S.peLaje=2.30}],
 ["Difusor sobre a linha vira bloqueio","Z04",()=>{S.dutoRota="linha";S.evapSobre="linha"}],
 ["Evaporador sem dreno vira bloqueio","Z12",()=>{S.eq.E10="premium";S.evapDreno=false}],
 ["Estante acima do ombro vira aviso","Z14",()=>{S.alturaEmp=2.60}],
 ["Sala de corte sem aspiração vira erro","Z20",()=>{S.eq.E05="none"}],
 ["Pátio sem vaga de cliente vira aviso","Z21",()=>{S.treeP={d:"v",cuts:[0.62],kids:[{r:"man"},{d:"h",cuts:[0.12,0.24,0.36],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"man"}]}]}}]];
const VISTAS=[
 {id:"geral",n:"Geral",ap(){CAM.modo="orb";ACOES3.fit();CAM.corte=1.20;S.corteLocal=null}},
 {id:"linha",n:"Oficina",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["mon","emb"]);
   CAM.yaw=-1.15;CAM.pitch=0.92;CAM.dist=11;CAM.corte=2.40;S.corteLocal=null;S.layers3.equip=true}},
 {id:"oper",n:"Do marceneiro",ap(){const c=centroSala("mon");CAM.modo="fp";CAM.fp=[c[0],1.65,c[2]+1.4];
   CAM.fyaw=-Math.PI/2;CAM.fpit=-0.05}}];
const TXT={
  f0lead:"Esta versão testa uma <b>marcenaria de móveis planejados</b> que compra a peça cortada na revenda e só monta.",
  f0porqueTit:"Por que planejados.",f0porque:"A Região dos Lagos constrói o ano inteiro.",
  f0decide:"Ele verifica layout, alturas, rota de fuga e a carteira mês a mês.",
  regiao:"Regiao dos Lagos",faixaMercado:[0.5,15,0.1],faixaVol:[0.10,3.00,0.05],passoPreco:50,
  p3Nome:"Hora extra no pico — agosto a novembro",p3Desc:R=>`Eleva a montagem e a instalação em ${PCT((HORA_EXTRA-1)*100)}.`,
  matNome:"chapa e ferragem",f1preco:"O preço é por metro linear instalado.",f1curva:"O que não cabe no mês vai para a carteira.",
  f2lead:"A oficina fica ao fundo, em linha.",producao:"oficina",vagasNome:"Vagas de cliente no patio",
  f2blead:"Pe-direito, vigas, forro, duto da aspiracao e a altura do porta-chapas.",
  estantesNome:"estantes de ferragens e de fitas",forroDesc:"Sem forro, poeira da laje cai no MDF branco já montado.",
  dutoOps:[["circ","a expedicao e o recebimento"],["linha","as bancadas e as mesas"]],
  evapOps:[["circ","a parede da fachada do showroom"],["linha","a serra de ajuste"]],
  drenoDesc:"Sem dreno, condensado pinga no MDF e estufa a chapa. Bloqueio.",
  altoNome:"o porta-chapas, com a peça de 2,75 m em pé",altoRisco:"Se cair sob a viga, muda de lugar.",
  f3lead:R=>R.cortaCasa?"Corte e fita na casa, com operador.":"Corte e fita na revenda.",
  f3cap:R=>`Cada marceneiro monta ${N2(MARC_H)} m/h na bancada.`,carteiraNome:"A carteira",perdaNome:"Pedido que desistiu",
  f3pico:"De agosto a novembro todo mundo quer o móvel montado antes do verão.",
  trifDesc:"Conferir a entrada antes de ligar tudo junto.",incDesc:"Carga de incêndio alta.",
  eficNome:"Plano de corte otimizado e controle de retalho",eficDesc:"Corta 3% do custo variavel, com R$ 3.000 de CAPEX.",
  giroDesc:"a entrada de 40% paga a chapa",
  depFora:{corte:"corte e fita na revenda",instalacao:"instalação terceirizada",veiculo:"sem veículo próprio"},
  f5hint:"Quem vende é o sócio com o projetista.",garantiaNome:"Assistência e garantia",
  freteNome:"Entrega por frete contratado",freteDesc:"Não compra o furgão.",
  f6blead:"peça cortada do porta-chapas para a bancada, módulo montado para a conferência e a embalagem.",
  copNome:"Janela perdida com limpeza de pó e separação do projeto do dia",
  bossFiscalNome:"O Fiscal Sobe na Escada",bossPicoNome:"Novembro: Tudo Montado Antes do Réveillon",
  fiscalOk:"Nada acima da linha reprova: forro, dutos e evaporadores estao fora da projecao do MDF exposto.",
  sol:"Sol direto sobre o showroom desbota o MDF de exposicao e engana a escolha de cor: o cliente quer luz difusa e constante.",
  r07:"a mesa de conferencia",cvNome:"Chapa, ferragem, corte e entrega",
  z19quando:"de agosto a novembro (a corrida antes do verao)",
  z19como:"Hora extra no pico (fase 1), segundo montador instalador ou instalacao terceirizada (fase 5)."
};
H.fase5ok=R=>R.pessoasProj>0&&R.pessoasMon>0&&R.pessoasEmb>0&&(R.instTerc||R.pessoasIns>0);
H.f5extra=R=>cChk("instTerc","Instalação por montador autônomo",`O montador de fora cobra ${BRL(INST_TERC)} por metro linear e some da folha.`);
H.bossPico=()=>{
  const R=calc(), T=R.temporada, pico=T.meses.filter(x=>PICO_PROD.includes(x.m));
  const dem=pico.reduce((a,x)=>a+x.dem,0), prod=pico.reduce((a,x)=>a+x.prod,0), des=pico.reduce((a,x)=>a+x.perda,0);
  return `<div class="hint ${des*1000>1?"bad":""}"><b>${TXT.bossPicoNome}</b><br>Entram ${NUM(dem*1000,0)} m e a oficina instala até ${NUM(prod*1000,0)}.</div>`;
};
H.auditoria=p=>{
  p("Montagem por marceneiro",N2(MARC_H),"m lineares/h","hipótese","capacidade");
  p("Instalação por pessoa",N2(INST_H),"m lineares/h","hipótese","capacidade");
};
//@@HTML
TITULO=Planejado Prime
NEGOCIO=marcenaria de móveis planejados
NAO_AJUDA=preco por metro linear que o mercado aceita, carteira de clientes
