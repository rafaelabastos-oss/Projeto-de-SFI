/* ==================================================================
   PISCINA PRIME 3D — v1.0 (motor herdado do Pastel Prime 3D v3.2, pelas
   versoes Gelo, Enxoval, Praia, Visual, Uniforme e Planejado Prime 3D)
   Estudo de viabilidade de uma loja de produtos para piscina com equipe
   propria de manutencao mensal — casas de veraneio, condominios e
   pousadas —, recuperacao de piscina verde e conserto de bomba e filtro,
   em Novo Portinho, Cabo Frio (RJ), com CAPEX abaixo de R$ 200 mil,
   contra a alternativa de alugar o imovel por R$ 7 mil/mes. Arquivo
   unico, offline. A unidade do modelo e o atendimento — uma visita
   tecnica ou uma venda de balcao —; o motor conta em mil atendimentos.
   O que e deste negocio: tabelas de dados, capacidade por etapa (tecnicos
   em campo, balcao, oficina e agenda) pelas horas que cada linha consome,
   os depositos separados de cloro e de acido, as regras Z04, Z08, Z11,
   Z14, Z20 a Z22, o turno, as formas e os textos das fases.
   ================================================================== */

/* ================= EQUIPAMENTOS ================= */
/* preço em R$; w/hh = pegada. Base: faixas de mercado, set/2026, ±40% —
   cotar. A tese é CAPEX baixo: a loja vende o produto que o técnico
   aplica; o estoque inicial é capital de giro, não CAPEX.                 */
const EQ=[
 {id:"E01",n:"Gôndolas e expositores da loja",req:"O cliente de balcão compra o que vê: cloro, clarificante, peneira, bomba e filtro à mão",kw:0.2,etapa:"balcão",
  t:[{k:"basico",n:"Gôndolas de aço e expositor de bombas e filtros (−5%)",p:9000,f:0.95,w:4.00,hh:0.60},
     {k:"padrao",n:"Gôndolas, balcão de vidro e mostruário de iluminação e aquecimento",p:22000,f:1.00,w:4.00,hh:0.60},
     {k:"premium",n:"Mais painel de automação e aquecimento solar de mostruário (+4%)",p:32000,f:1.04,w:4.00,hh:0.60}]},
 {id:"E02",n:"Kits dos técnicos",req:"Aspirador, peneira, escova, cabo telescópico e mangueira: um kit por técnico",kw:0,etapa:"campo",
  t:[{k:"basico",n:"4 kits completos",p:9000,fat:1.00},{k:"padrao",n:"4 kits e 2 aspiradores robô de apoio (+15%)",p:28000,fat:1.15}]},
 {id:"E03",n:"Análise de água",req:"O laudo da visita é o que o dono ausente vê: cloro, pH e alcalinidade, com foto",kw:0,etapa:"campo",
  t:[{k:"basico",n:"Kits colorimétricos",p:1200,f:1.00},{k:"padrao",n:"Fotômetros digitais e laudo por piscina no celular (+4% de retenção)",p:6000,f:1.04}]},
 {id:"E04",n:"Estantes do depósito",req:"Produto, peça e acessório endereçados; a rota da manhã é separada aqui",kw:0,etapa:"-",
  t:[{k:"basico",n:"Estantes de aço de 4 m",p:6000,w:4.00,hh:0.60},{k:"padrao",n:"Estantes mais fundas e porta-paletes baixo",p:12000,w:4.00,hh:0.90}]},
 {id:"E05",n:"Ventilação dos depósitos de químicos",req:"Cloro e tricloro no calor soltam gás; ácido evapora: os dois depósitos pedem ventilação permanente",kw:0.4,etapa:"-",crit:true,
  t:[{k:"none",n:"Não — porta fechada",p:0},{k:"basico",n:"Venezianas e exaustor nos dois depósitos",p:4500},{k:"padrao",n:"Exaustão com detector de cloro e alarme",p:9000}]},
 {id:"E06",n:"Climatização da loja",req:"Balcão no verão de Cabo Frio: o cliente entra, olha e compra com calma",kw:2.5,etapa:"-",
  t:[{k:"basico",n:"Ventiladores (−4% no balcão)",p:1500,f:0.96},{k:"padrao",n:"Split de 30 mil BTU na loja",p:9000,f:1.00}]},
 {id:"E07",n:"Oficina de bombas e filtros",req:"Bomba queimada, selo vazando e filtro com areia velha: o conserto que vira venda de peça",kw:1.5,etapa:"oficina",
  t:[{k:"basico",n:"Bancada com morsa, multímetro e ferramentas",p:6000,fat:1.00,f:1.00},
     {k:"padrao",n:"Mais tanque de teste de bomba e filtro (+20% na oficina; +5% em equipamentos)",p:12000,fat:1.20,f:1.05}]},
 {id:"E08",n:"Motos dos técnicos",req:"Visitar sete piscinas por dia em Cabo Frio, no Peró e no Jardim Esperança",kw:0,etapa:"-",
  t:[{k:"none",n:"Não comprar — técnico com moto própria e reembolso por quilômetro",p:0,veic:0},{k:"basico",n:"4 motos 160 cc com baú e suporte de cabo",p:64000,veic:4}]},
 {id:"E09",n:"Roteiro e ordem de serviço",req:"Quem monta a rota decide quantas piscinas cabem no dia; o laudo com foto segura o contrato",kw:0,etapa:"agenda",
  t:[{k:"basico",n:"Agenda no celular e planilha",p:1000,des:1.00,f:1.00},{k:"padrao",n:"Sistema de roteiro e ordem de serviço com foto (+50% na agenda; +3% de retenção)",p:6000,des:1.50,f:1.03}]},
 {id:"E10",n:"Caixa e emissor fiscal",req:"Balcão com cartão, PIX e nota",kw:0.1,etapa:"-",
  t:[{k:"basico",n:"PDV com maquininha e emissor fiscal",p:3500}]},
 {id:"E12",n:"Chuveiro e lava-olhos de emergência",req:"Respingo de ácido ou de cloro no olho: dez segundos até a água",kw:0,etapa:"-",
  t:[{k:"basico",n:"Chuveiro com lava-olhos e EPIs de químicos",p:2500}]},
 {id:"E13",n:"Carrinho de bombonas",req:"Bombona de 50 L de ácido e balde de 40 kg de cloro não se carregam no braço",kw:0,etapa:"-",
  t:[{k:"basico",n:"Carrinho de bombonas e paleteira pequena",p:2500}]}
];

/* ================= OBRA ================= */
const OBRA=[
 {id:"piso",n:"Piso da loja e do depósito regularizado; piso resistente a químico nos dois depósitos",min:5000,max:11000},
 {id:"eletr",n:"Elétrica: iluminação da loja, tomada de teste de bomba e quadro",min:4000,max:9000},
 {id:"vedac",n:"Divisórias: depósitos de cloro e de ácido em alvenaria, oficina e escritório",min:6000,max:12000},
 {id:"vest",n:"Vestiário, copa e sanitário (adequação)",min:3000,max:6000},
 {id:"fach",n:"Fachada e vitrine da loja",min:4000,max:9000},
 {id:"inc",n:"Prevenção de incêndio: extintores, sinalização, iluminação de emergência e ficha dos químicos",min:3000,max:6000},
 {id:"proj",n:"Projetos, ART e laudo do Corpo de Bombeiros (produto oxidante)",min:3000,max:7000},
 {id:"lic",n:"Licenças: alvará, bombeiros e cadastro de produtos químicos",min:2000,max:5000},
 {id:"marca",n:"Marca, uniformes, Google e visitas a condomínios e administradoras",min:3000,max:8000}
];
const OBRA_DEP={};

/* ================= PESSOAS ================= */
/* des = agenda, vendas e pos-venda; tec = tecnico em campo; bal = balcao;
   ofi = oficina de bombas e filtros                                       */
const POSTOS=[
 {id:"p1",n:"Gestor / sócio-operador (pró-labore; vende contratos a condomínios e casas, compra e fica no balcão)",sal:6000,fator:1.15,des:0.5,bal:0.2,on:true,fixo:true},
 {id:"p2",n:"Técnico(a) de piscina 1",sal:2400,tec:1,on:true},
 {id:"p3",n:"Técnico(a) de piscina 2",sal:2400,tec:1,on:true},
 {id:"p4",n:"Técnico(a) de piscina 3",sal:2400,tec:1,on:true},
 {id:"p5",n:"Técnico(a) chefe — equipamento, recuperação e oficina",sal:2900,tec:0.5,ofi:0.5,on:true},
 {id:"p6",n:"Balconista",sal:1900,bal:1,des:0.2,on:true},
 {id:"p7",n:"Técnico(a) de piscina 4 (opcional)",sal:2400,tec:1,on:false},
 {id:"p8",n:"Atendente de agenda e pós-venda (opcional)",sal:2000,des:1,on:false}
];

/* ================= FIXO ================= */
const FIXO=[
 {id:"energia",n:"Energia: loja, ar, oficina e escritório",v:700},
 {id:"agua",n:"Água e esgoto (teste de bomba e lava-olhos)",v:150},
 {id:"cont",n:"Contabilidade",v:1100},
 {id:"seg",n:"Seguros: patrimônio, estoque e responsabilidade na casa do cliente",v:500},
 {id:"mkt",n:"Marketing: Google, Instagram e visitas a condomínios e administradoras",v:1800},
 {id:"ti",n:"Sistema, internet e telefone",v:400},
 {id:"hig",n:"Uniformes, EPIs de químicos e limpeza",v:350},
 {id:"veic",n:"Motos: seguro, IPVA e manutenção fixa",v:900,dep:"veiculo"}
];

/* ================= VARIÁVEL (por atendimento) ================= */
/* a venda de balcao nao usa moto nem reagente: cvf da linha = 0,1        */
const VARI=[
 {id:"moto",n:"Reembolso de quilometragem ao técnico (moto própria)",cons:1,un:"—",preco:11,pun:"R$/atendimento"},
 {id:"reag",n:"Reagentes de análise e EPI descartável",cons:1,un:"—",preco:3,pun:"R$/atendimento"},
 {id:"emb",n:"Sacola, nota e embalagem",cons:1,un:"—",preco:0.5,pun:"R$/atendimento"},
 {id:"energia",n:"Energia por atendimento",cons:0.3,un:"kWh",preco:0.98,pun:"R$/kWh"}
];

/* ================= LINHAS ================= */
/* share = fracao dos atendimentos; preco e mat (produto aplicado ou
   vendido) em R$ por atendimento; hTec, hBal, hOfi = horas de tecnico,
   de balcao e de oficina por atendimento; cvf = fracao dos variaveis    */
const CANAIS=[
 {id:"mm",n:"Manutenção mensal — casas de veraneio, condomínios e pousadas (por visita)",share:55,preco:130,mat:30,saz:"piscina",hTec:0.70,hBal:0,hOfi:0},
 {id:"rv",n:"Recuperação de piscina verde, limpeza pesada e pré-temporada",share:3,preco:520,mat:150,saz:"pretemp",hTec:5.0,hBal:0,hOfi:0},
 {id:"eq",n:"Instalação e conserto de bomba, filtro, aquecedor e iluminação",share:3,preco:680,mat:400,saz:"pretemp",hTec:4.0,hBal:0,hOfi:1.5},
 {id:"bl",n:"Venda de balcão: cloro, químicos, acessórios e peças",share:39,preco:170,mat:110,saz:"balcao",hTec:0,hBal:0.25,hOfi:0,cvf:0.1}
];
const SAZ=[["Janeiro",130,"Casa cheia: piscina usada todo dia"],["Fevereiro",125,"Carnaval"],["Março",110,"Fim da temporada"],["Abril",90,"O veranista vai embora; o condomínio fica"],["Maio",80,"Baixa"],["Junho",70,"Inverno: piscina parada, contrato suspenso"],["Julho",75,"Férias de julho"],["Agosto",80,"Começa a recuperação"],["Setembro",90,"Pré-temporada: piscina verde vira azul"],["Outubro",105,"Pré-temporada"],["Novembro",115,"Última janela antes do verão"],["Dezembro",130,"Réveillon com piscina pronta"]];
const SAZ_LINHA={
 piscina:[130,125,110,90,80,70,75,80,90,105,115,130],
 pretemp:[110,80,70,60,60,50,60,90,140,160,160,140],
 balcao:[150,130,100,80,70,60,65,75,90,105,120,155]
};

/* ================= PREMISSAS DA LOJA E DA MANUTENCAO (hipoteses declaradas) ================= */
const DES_DIA=80;           /* atendimentos agendados, vendidos e acompanhados por pessoa por dia */
const DESLOC=0.80;          /* fracao do dia do tecnico que sobra depois do deslocamento entre piscinas */
const EFIC=0.90;            /* fracao produtiva do turno */
const GARANTIA=0.01;        /* retorno de visita e troca de peca em garantia, fracao do preco */
const DESISTE=0.40;         /* quem espera mais de um mes troca de piscineiro ou compra em outra loja */
const PICO_PROD=[11,0,1];   /* dezembro, janeiro e fevereiro */
const HORA_EXTRA=1.20;      /* sabado e hora extra no verao */
const FV_KWH=700, FV_COMP=0.85, FV_CAPEX=25000;    /* 5 kWp em Cabo Frio, compensacao liquida */
const VAGA_M2=12.5, VAGAS_MIN=3;                    /* vaga de cliente da loja */

/* ================= SETORES / PLANTA ================= */
const CLS={limpa:{n:"Oficina de bombas e filtros",c:"#2E9C86"},
 circ:{n:"Circulação",c:"#5B7080"},
 frio:{n:"Ácidos e corretores de pH — isolado",c:"#0F6B5F"},
 inter:{n:"Depósito, recebimento e carga das motos",c:"#D79A2E"},
 suja:{n:"Oxidantes: cloro e tricloro — isolado",c:"#AC5F48"},
 barreira:{n:"Vestiário e copa",c:"#6E5AB0"},
 publica:{n:"Loja e balcão",c:"#3B7CA8"},
 adm:{n:"Agenda e escritório",c:"#7C93A1"},
 tec:{n:"Técnica",c:"#55707E"}};
const ROOM={
 clo:{n:"Oxidantes: cloro e tricloro",c:"suja",a:8,t:"alvenaria, ventilado, sem ralo para a rede"},
 dep:{n:"Depósito de produtos e peças",c:"inter",a:30},
 ofi:{n:"Oficina de bombas e filtros",c:"limpa",a:16},
 aci:{n:"Ácidos e corretores de pH",c:"frio",a:8,t:"alvenaria, ventilado, longe do cloro"},
 car:{n:"Recebimento e carga das motos",c:"inter",a:12},
 ves:{n:"Vestiário, copa e sanitário",c:"barreira",a:7},
 esc:{n:"Agenda e escritório",c:"adm",a:6},
 loj:{n:"Loja e balcão",c:"publica",a:24}
};
const ROOM_P={
 ret:{n:"Reservatório de água",c:"tec",a:3},
 res:{n:"Abrigo de bombonas vazias e resíduos",c:"suja",a:3},
 fos:{n:"Fossa e filtro existentes",c:"tec",a:5},
 vag:{n:"Vagas de clientes da loja",c:"publica",a:37},
 man:{n:"Pátio de carga e estacionamento das motos",c:"circ",a:0}
};
const LIG=[
 {a:"car",b:"dep",t:"porta",d:"Carga → depósito: a mercadoria entra e a rota da manhã sai"},
 {a:"car",b:"clo",t:"porta",d:"Carga → oxidantes: o cloro entra e sai sem passar pela loja"},
 {a:"car",b:"ves",t:"porta",d:"Entrada de pessoal → vestiário"},
 {a:"dep",b:"ofi",t:"porta",d:"Depósito → oficina: a peça de reposição"},
 {a:"dep",b:"loj",t:"porta",d:"Depósito → loja: reposição da gôndola"},
 {a:"esc",b:"loj",t:"porta",d:"Agenda → loja"},
 {a:"ofi",b:"loj",t:"porta",d:"Oficina → balcão: o cliente deixa a bomba para conserto"},
 {a:"aci",b:"ofi",t:"porta",d:"Ácidos → oficina"}
];
const CRUZA_OK=["dep","loj","car","ves","esc"];
const FLOW=["car","dep","ofi","loj"];
const WI=14.70, HI=9.70, TP=0.15, TI=0.10;
const WP=15.00, HP=13.00;

/* árvore de divisórias. Ao fundo: o depósito de cloro (à esquerda), o
   depósito de produtos, a oficina e o depósito de ácido (à direita), a
   quase dez metros do cloro; na fachada: recebimento e carga das motos
   com a porta A, vestiário, agenda e a loja com a porta de vidro.
   x: 0 | cloro / carga 2,40 depósito | 3,60 vestiário | 5,60 agenda | 7,60 loja 8,60 oficina | 12,20 ácido | 14,70 */
const L1=()=>({d:"v",cuts:[0.59794],kids:[
  {d:"h",cuts:[0.16327,0.58503,0.82993],kids:[{r:"clo"},{r:"dep"},{r:"ofi"},{r:"aci"}]},
  {d:"h",cuts:[0.24490,0.38095,0.51701],kids:[{r:"car"},{r:"ves"},{r:"esc"},{r:"loj"}]}
]});
const L1P=()=>({d:"v",cuts:[0.45000],kids:[
  {r:"man"},
  {d:"h",cuts:[0.10000,0.20000,0.30000],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"vag"}]}
]});

const FOOT={
 E01:{n:"Gôndola A — químicos e acessórios",w:4.00,h:0.60,op:0.90,z:["publica"],x:8.20,y:6.00,
      s:"Cloro, clarificante, algicida, peneira e escova: o giro do balcão."},
 E04:{n:"Estantes do depósito — corredor A",w:4.00,h:0.60,op:0.90,z:["inter"],x:2.80,y:0.20,
      s:"Produto, peça e acessório endereçados. A altura é a da fase 2B."},
 E07:{n:"Bancada de bombas e filtros",w:2.20,h:0.80,op:0.90,z:["limpa"],x:9.00,y:0.40,
      s:"A bomba chega queimada ou vazando: aberta, testada e trocada a peça."},
 E12:{n:"Chuveiro e lava-olhos de emergência",w:0.60,h:0.60,op:0.90,z:["inter"],x:2.50,y:4.70,
      s:"Na porta dos químicos: respingo no olho pede água em dez segundos."},
 M01:{n:"Gôndola B — bombas, filtros e iluminação",w:4.00,h:0.60,op:0.90,z:["publica"],x:8.20,y:7.60,mob:1,
      s:"O equipamento que o técnico recomenda na visita, à vista do cliente."},
 M02:{n:"Balcão e caixa",w:2.00,h:0.70,op:0.80,z:["publica"],x:12.40,y:8.40,mob:1,
      s:"Venda, nota e a análise de água que o cliente traz no potinho."},
 M03:{n:"Expositor de bombas e filtros",w:1.40,h:0.80,op:0.80,z:["publica"],x:13.00,y:6.10,mob:1,
      s:"Bomba e filtro de verdade, para o cliente ver o tamanho."},
 M04:{n:"Estantes do depósito — corredor B",w:4.00,h:0.60,op:0.90,z:["inter"],x:2.80,y:1.70,mob:1,
      s:"Segunda fileira: peças, acessórios e a reserva do verão."},
 M05:{n:"Mesa de separação da rota da manhã",w:1.60,h:0.80,op:0.90,z:["inter"],x:6.60,y:3.40,mob:1,
      s:"O kit de produto de cada piscina do dia, separado e conferido antes das 8 h."},
 M06:{n:"Bombas e filtros aguardando conserto",w:1.40,h:0.80,op:0.80,z:["limpa"],x:10.40,y:3.40,mob:1,
      s:"Etiquetados por cliente, com a ordem de serviço."},
 M07:{n:"Estrado de baldes de cloro e tricloro",w:1.60,h:1.20,op:0.80,z:["suja"],x:0.40,y:0.40,mob:1,
      s:"Oxidante isolado, no estrado, longe de umidade e de ácido."},
 M08:{n:"Estrado de ácido e corretores de pH",w:1.60,h:1.20,op:0.80,z:["frio"],x:12.70,y:0.40,mob:1,
      s:"Ácido do outro lado do galpão: um vazamento não encontra o cloro."},
 M09:{n:"Caixas de rota das motos",w:1.40,h:0.70,op:0.80,z:["inter"],x:1.80,y:6.10,mob:1,
      s:"Uma caixa por técnico: o produto do dia vai no baú."},
 M10:{n:"Armários da equipe",w:1.60,h:0.45,op:0.70,z:["barreira"],x:3.80,y:9.10,mob:1,
      s:"Uniforme e EPI de químico ficam aqui."},
 M11:{n:"Estação de agenda e ordem de serviço",w:1.20,h:0.65,op:0.60,z:["adm"],x:6.00,y:8.80,mob:1,
      s:"Rota do dia, laudo com foto e o contrato que vence."}
};
const CAMADAS=[["zonas","Zonas da loja"],["paredes","Paredes e portas"],["equip","Equipamentos"],
 ["cotas","Cotas"],["hidro","Água e esgoto"],["fluxo","Fluxo do produto"],["pilares","Pilares"],["texto","Etiquetas"]];
const HIDRO=[
 {t:"ralo",x:4.60,y:9.35,lab:"Ralo sifonado — sanitário e copa"},
 {t:"agua",x:2.80,y:5.25,lab:"Chuveiro e lava-olhos de emergência"},
 {t:"agua",x:11.60,y:1.60,lab:"Tanque de teste de bomba"},
 {t:"caimento",x:4.60,y:8.50,lab:"Caimento do piso de 1% na copa"}
];
const PILARES=[[0,0],[4.90,0],[9.80,0],[14.70,0],[0,4.85],[4.90,4.85],[9.80,4.85],[14.70,4.85],
 [0,9.70],[4.90,9.70],[9.80,9.70],[14.70,9.70]];
/* ================= ESTADO ================= */
const S={
  alugMerc:7000,custoOp:false,tma:15,dias:24,horas:8,fatorMaq:1,
  alvara:false,pesquisa:false,prolagos:false,temporarios:false,treino:false,rt:false,
  mercado:26,vol1:6.5,cresc:20,shareMax:5,p3:false,
  eq:{E01:"basico",E02:"basico",E03:"basico",E04:"basico",E05:"basico",E06:"padrao",E07:"basico",E08:"none",E09:"basico",E10:"basico",E12:"basico",E13:"basico"},
  obra:{},rota:"1",reservTerreo:true,trifasica:true,fv:false,eficiencia:false,cont:15,
  postos:{},fator:1.70,
  fixo:{},vari:{},canais:{},aliq:9.5,freteTerc:true,
  tree:null,treeP:null,pos:{},sel:null,view:"int",
  layers:{zonas:true,paredes:true,equip:true,cotas:true,hidro:false,fluxo:true,pilares:true,texto:true},
  vb:null,vbView:null,measure:false,mpts:[],dragDiv:null,dragEq:null,hoverDiv:null,
  capEfetiva:0,penErros:0,impostoLayout:0,
  peLaje:4.00,peViga:3.60,espLaje:0.20,vigaH:0.40,vigaB:0.20,alturaAnexo:2.60,
  hPortaInt:2.10,hPortaEnrolar:3.00,hVisorPeit:1.00,hVisor:1.20,
  forro:true,dutoRota:"circ",lumDens:1.0,evapDreno:true,evapSobre:"circ",
  medido:{peDireito:false,vigas:false,pilares:false,portas:false,peitoril:false,forro:false,degrau:false,energia:false},
  rot:{},sim:null,fase:"0",semente:20260930,vertPatch:{},
  explode:0,fantasma:true,gradAresta:true,
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
const VEIC_EQ="E08";
const TAXA_RECEB=0.030;        /* cartao no balcao e boleto do contrato */
const EFIC_GANHO=0.10, EFIC_CAPEX=3000;
const PAPEIS=[["des","Agenda, vendas e pós-venda",false],["tec","Técnicos em campo",true],
  ["bal","Balcão da loja",true],["ofi","Oficina de bombas e filtros",true]];
/* horas medias por atendimento de uma etapa, pela participacao das linhas */
function horasLinhas(k){
  const tot=CANAIS.reduce((a,c)=>a+S.canais[c.id].share,0)||1;
  return CANAIS.reduce((a,c)=>a+S.canais[c.id].share*(c[k]||0),0)/tot;
}
const H={
  flags(R){
    R.ventila=S.eq.E05!=="none";
    R.motos=S.freteTerc?Infinity:R.nVeic;
  },
  dep(R){return {veiculo:R.veiculo}},
  capacidade(R){
    const h=S.horas, fm=S.fatorMaq||1, P=R.pessoas;
    const w=k=>Math.max(0.005,horasLinhas(k));
    R.tecEf=Math.min(P.tec,R.motos);
    R.capTec=R.tecEf*h*EFIC*DESLOC*fm*(eqT("E02").fat||1)/w("hTec");
    R.capBal=P.bal*h*EFIC*fm/w("hBal");
    R.capOfi=P.ofi*h*EFIC*fm*(eqT("E07").fat||1)/w("hOfi");
    R.capDes=P.des*DES_DIA*(eqT("E09").des||1)*fm;
    R.etapas=[
      {n:"Técnicos em campo",v:R.capTec,sala:"car",d:`${N2(R.tecEf,1)} técnico(s) com moto; ${N2(w("hTec"),2)} h de técnico por atendimento, em média`},
      {n:"Balcão da loja",v:R.capBal,sala:"loj"},
      {n:"Oficina de bombas e filtros",v:R.capOfi,sala:"ofi"},
      {n:"Agenda, vendas e pós-venda",v:R.capDes,sala:"esc"}
    ];
  },
  fGeral(R){return eqT("E06").f||1},
  vari(v,R){
    if(v.id==="moto"&&!S.freteTerc){v.preco=5;v.n="Combustível e manutenção das motos da empresa";v.fixoPreco=true;}
    return v;
  },
  canal(c,R){
    if(c.id==="mm")return (eqT("E03").f||1)*(eqT("E09").f||1);
    if(c.id==="bl")return eqT("E01").f||1;
    if(c.id==="eq")return eqT("E07").f||1;
    return 1;
  },
  /* contrato mensal pago no mes seguinte (cerca de 20 dias de venda a
     receber) e um mes e meio de produto em estoque na loja                 */
  giro(R){
    const dia=S.vol1*1000/365*R.fatorDemanda;
    return dia*R.precoMedio*20+dia*R.materialMedio*45;
  },
  riscoSan(R,lay){
    let rs=15;
    if(!R.ventila)rs+=15;
    if(!S.rt)rs+=8; if(!S.treino)rs+=8;
    rs+=Math.min(20,lay.viol.length*7);
    if(lay.setoresFaltando.includes("ves"))rs+=8;
    return rs;
  },
  riscoReg(R){
    let rr=15;
    if(!S.alvara)rr+=25; if(!S.prolagos)rr+=12; if(!S.pesquisa)rr+=12;
    if(!S.reservTerreo)rr+=8;
    return rr;
  },
  gates(R,lay){return [
    {id:"alvara",n:"O Alvará",ok:S.alvara,xp:15},
    {id:"pesq",n:"A Pesquisa de Campo",ok:S.pesquisa,xp:15},
    {id:"efl",n:"Os Condomínios Parceiros",ok:S.prolagos,xp:12},
    {id:"layout",n:"A Planta Fecha",ok:lay.deficit===0&&lay.viol.length===0&&lay.flowPct>=100,xp:15},
    {id:"pcc",n:"O Químico no Lugar Certo",ok:R.ventila&&S.rt&&S.treino,xp:12},
    {id:"verao",n:"A Virada do Verão",ok:S.p3&&S.temporarios,xp:10},
    {id:"gargalo",n:"A Carteira em Dia",ok:R.perda3Pct<5,xp:11},
    {id:"bench",n:"Bater a Locação",ok:R.dre[2].ebitda>S.alugMerc*12,xp:10}
  ]}
};

/* ================= EIXO VERTICAL (HIPOTESE DECLARADA) ================= */
const VERT={
 E01:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 E04:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 /* bancada: o motor fica aberto sobre o tampo */
 E07:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 /* chuveiro de emergencia: o crivo fica a 2,20 m */
 E12:{hz:2.20,hop:2.00,hman:0.20,hac:"S"},
 M01:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 M02:{hz:1.05,hop:1.05,hman:0.30,hac:"S"},
 M03:{hz:1.20,hop:1.20,hman:0.20,hac:"S"},
 M04:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 M05:{hz:0.90,hop:0.90,hman:0.40,hac:"S",banc:1},
 M06:{hz:1.00,hop:1.00,hman:0.30,hac:"O"},
 M07:{hz:1.20,hop:1.20,hman:0.30,hac:"O"},
 M08:{hz:1.20,hop:1.20,hman:0.30,hac:"O"},
 M09:{hz:1.10,hop:1.00,hman:0.30,hac:"O"},
 M10:{hz:1.80,hop:1.20,hman:0.20,hac:"N"},
 M11:{hz:1.15,hop:0.75,hman:0.30,hac:"N"}
};
const ESTANTES_IDS=["E04","M04"];
const ALT_ESTANTE=2.00;

/* ================= INSTALACOES E FACHADA ================= */
const INST={
  abertos:["E07"],                       /* o motor aberto na bancada */
  difSalas:["car","dep"], salaLinha:"ofi", salaLoja:"loj",
  evap:()=>S.eq.E06==="padrao", evapLinhaEq:"E07", evapPos:{x:10.00,y:9.10}, evapSala:"loj", evapSalaLinha:"ofi"
};
const VITRINE=null;
/* exaustao dos depositos de quimicos */
H.exaustao3D=(B,eqs,pe)=>{
  if(S.eq.E05==="none")return;
  dutoSobre(B,eqs,pe,"M07",S.eq.E05==="padrao","Exaustão do depósito de cloro","Duto da exaustão do cloro");
  dutoSobre(B,eqs,pe,"M08",S.eq.E05==="padrao","Exaustão do depósito de ácido","Duto da exaustão do ácido");
};
const PORTAS_FACHADA=[
 {r:"car",lado:"A",min:1.6,l:3.00,t:"enrolar",lab:"PORTA A · recebimento, motos e pessoal"},
 {r:"loj",lado:"C",min:1.2,l:2.00,t:"vidro",lab:"Porta da loja"}
];

/* ================= REGRAS Z DO NEGOCIO ================= */
H.zNegocio=(B,add,{eqs,D,M,dt})=>{
  /* Z04 — instalacao sobre o motor aberto */
  zProjecao(B,add,eqs,{bloq:"motor aberto na bancada: a gota no enrolamento queima a bomba no teste",
    aviso:"a bancada de bombas — exigem luminária sem ofuscamento para ler placa e enrolamento"});
  /* Z08 — giro do carrinho de bombonas */
  zGiro(B,add,dt,D,[["car","Recebimento e carga"],["dep","Depósito"]],1.40,"o carrinho com uma bombona de 50 L");
  /* Z11 — a loja precisa de frente para a rua */
  const lj=D.leaves.find(l=>l.r==="loj");
  if(!lj||Math.abs(lj.y+lj.h-HI)>EPS)add("Z11","aviso","A loja não encosta na fachada: o cliente de balcão não vê a vitrine nem entra direto",
    lj?{x:lj.x,z:lj.y,w:lj.w,d:lj.h,y:0,h:0.3}:null,"Manter a loja na fachada, com porta de vidro.");
  /* Z14 — estantes do deposito */
  zEstantes(B,add,D,"dep","Estantes do depósito");
  /* Z20 — cloro e acido: separados e ventilados */
  const clo=D.leaves.find(l=>l.r==="clo"), aci=D.leaves.find(l=>l.r==="aci");
  const alvoC=clo?{x:clo.x,z:clo.y,w:clo.w,d:clo.h,y:0,h:2}:null;
  if(S.eq.E05==="none")add("Z20","erro",
    "Depósitos de químicos sem ventilação: o tricloro no calor solta gás de cloro, e o ácido evapora e corrói a estrutura",
    alvoC,"Venezianas e exaustor nos dois depósitos (fase 3).");
  if(clo&&aci){
    const d=Math.hypot((clo.x+clo.w/2)-(aci.x+aci.w/2),(clo.y+clo.h/2)-(aci.y+aci.h/2));
    const encosta=D.adj.some(k=>[k.a.r,k.b.r].includes("clo")&&[k.a.r,k.b.r].includes("aci"));
    if(encosta)add("Z20","bloqueio","Depósito de cloro e depósito de ácido com parede comum: um vazamento alcança o outro pelo rodapé e a mistura solta gás de cloro",
      alvoC,"Separar os dois depósitos por outro ambiente (fase 2).");
    else if(d<6)add("Z20","erro",`Cloro e ácido a ${N2(d,1)} m um do outro — mínimo adotado de 6 m entre os centros dos depósitos`,
      alvoC,"Afastar os depósitos para lados opostos do galpão.");
  }else add("Z20","bloqueio","Falta um depósito isolado para o cloro ou para o ácido: químico oxidante e ácido no depósito geral",null,"Manter os dois depósitos na árvore de divisórias.");
  /* Z21 — vagas da loja */
  zVagas(B,add,n=>`Loja com ${n} vaga(s) de cliente no pátio — mínimo adotado de ${VAGAS_MIN}; o cliente de balcão com balde de cloro no porta-malas não para na avenida (−5%)`,
    "Reservar a faixa do pátio junto ao portão para as vagas (fase 2, vista do pátio).");
  /* Z22 — lava-olhos longe dos quimicos */
  const lava=eqs.find(b=>b.id==="E12");
  if(lava&&clo){
    const dl=Math.hypot((lava.x+lava.w/2)-(clo.x+clo.w/2),(lava.z+lava.d/2)-(clo.y+clo.h/2));
    if(dl>5)add("Z22","aviso",`Chuveiro e lava-olhos a ${N2(dl,1)} m do depósito de cloro — referência de dez segundos de caminhada, cerca de 5 m`,lava,"Aproximar o chuveiro da porta dos químicos.");
  }
};

/* ================= TURNO ================= */
/* o turno da loja: o produto chega pela porta A, vai para a estante, e sai
   ou na caixa de rota das motos ou pela gondola e o balcao               */
const ESTACOES=[
 {id:"dep",n:"Estantes do depósito",eq:"E04",sala:"dep"},
 {id:"sep",n:"Separação da rota",eq:"M05",sala:"dep"},
 {id:"gon",n:"Gôndola da loja",eq:"E01",sala:"loj"},
 {id:"bal",n:"Balcão e caixa",eq:"M02",sala:"loj",cap:R=>R.capBal}
];
const BATELADA=2;               /* atendimentos por lote: um kit de produto */
const TURNO={carrinho:10,       /* kits por viagem do carrinho */
  rolo:20,                      /* atendimentos por pallet recebido */
  carga:{"dep>sep":10}, salaRec:"car",
  cop:30,                       /* separacao da rota da manha e fechamento do caixa */
  inicio:7};
H.foraDaLinha=R=>Math.min(R.capTec,R.capOfi,R.capDes);

/* ================= PRODUTO NA CENA ================= */
function produtoNaCena(B){
  if(!S.produto||!B.D)return;
  const sala=r=>B.D.leaves.find(l=>l.r===r);
  const car=sala("car");
  if(car)pilha(B,car.x+0.30,car.y+car.h-1.30,"caixa",6,"Produto recebido para a estante",6,0,"caixas");
  const clo=sala("clo");
  if(clo)pilha(B,clo.x+0.40,clo.y+clo.h-1.40,"saco",4,"Baldes de cloro de reserva",4,0,"baldes");
}

/* ================= SENSIBILIDADE, CETICO E MONTE CARLO ================= */
const VARS=[
 {id:"preco",n:"Preço médio por atendimento",un:"R$/atendimento",geo:false,
  val:()=>calc().precoMedio,
  set:f=>CANAIS.forEach(c=>S.canais[c.id].preco=+(S.canais[c.id].preco*f).toFixed(3))},
 {id:"vol",n:"Volume do ano 1",un:"mil atendimentos/ano",geo:false,val:()=>S.vol1,set:f=>{S.vol1=S.vol1*f}},
 {id:"cresc",n:"Crescimento anual",un:"%",geo:false,val:()=>S.cresc,set:f=>{S.cresc=S.cresc*f}},
 {id:"cap",n:"Piscinas por técnico por dia",un:"atendimentos/dia",geo:false,
  val:()=>calc().capKgDia,set:f=>{S.fatorMaq=(S.fatorMaq||1)*f}},
 {id:"cv",n:"Produto aplicado e vendido, e variáveis",un:"R$/atendimento",geo:false,
  val:()=>calc().matMedio,set:f=>{S.fatMat=+((S.fatMat||1)*f).toFixed(4);VARI.forEach(v=>S.vari[v.id]=+(S.vari[v.id]*f).toFixed(4))}},
 {id:"folha",n:"Folha com encargos",un:"R$/mês",geo:false,
  val:()=>calc().folha,set:f=>{S.fator=+(S.fator*f).toFixed(4)}},
 {id:"perda",n:"Roteiro por bairro e dosagem padronizada (−10% do variável)",un:"—",geo:false,
  val:()=>S.eficiencia?2:3,set:f=>{if(f<1)S.eficiencia=true;else S.eficiencia=false}},
 {id:"obra",n:"Custo de obra",un:"R$",geo:false,
  val:()=>calc().obraTotal,set:f=>OBRA.forEach(o=>{S.obra[o.id]=Math.min(1.6,S.obra[o.id]*f)})},
 {id:"cont",n:"Contingência",un:"%",geo:false,val:()=>S.cont,set:f=>{S.cont=S.cont*f}},
 {id:"aliq",n:"Alíquota efetiva",un:"%",geo:false,val:()=>S.aliq,set:f=>{S.aliq=S.aliq*f}},
 {id:"tma",n:"TMA",un:"% a.a.",geo:false,val:()=>S.tma,set:f=>{S.tma=S.tma*f}},
 {id:"peLaje",n:"Pé-direito sob laje",un:"m",geo:true,faixa:[2.40,4.50],
  val:()=>S.peLaje,set:f=>{S.peLaje=S.peLaje*f},setAbs:v=>{S.peLaje=v}},
 {id:"vigaH",n:"Altura da viga",un:"m",geo:true,faixa:[0.20,1.40],
  val:()=>S.vigaH,set:f=>{S.vigaH=S.vigaH*f},setAbs:v=>{S.vigaH=v}},
 {id:"hPorta",n:"Vão livre da porta de carga",un:"m",geo:true,faixa:[2.20,4.00],
  val:()=>S.hPortaEnrolar,set:f=>{S.hPortaEnrolar=S.hPortaEnrolar*f},setAbs:v=>{S.hPortaEnrolar=v}}
];
const CETICO=[["preço 10% menor",()=>CANAIS.forEach(c=>S.canais[c.id].preco*=0.90)],
              ["volume 15% menor",()=>{S.vol1*=0.85}],
              ["produto e variáveis 10% mais caros",()=>{S.fatMat=(S.fatMat||1)*1.10;VARI.forEach(v=>S.vari[v.id]*=1.10)}],
              ["CAPEX 10% maior",()=>{S.cont=S.cont+10}],
              ["técnico rendendo 10% menos",()=>{S.fatorMaq=(S.fatorMaq||1)*0.9}]];
const DISTR=[
 {id:"preco",n:"Preço médio",tri:[0.88,1.00,1.08]},
 {id:"vol",n:"Volume do ano 1",tri:[0.70,1.00,1.15]},
 {id:"cv",n:"Custo variável",tri:[0.92,1.00,1.15]},
 {id:"cap",n:"Rendimento do técnico",tri:[0.85,1.00,1.05]},
 {id:"obra",n:"Custo de obra",tri:[0.90,1.00,1.25]}
];
const NAO_RESPONDE=[
 "Quantas piscinas de casa de veraneio, condomínio e pousada fecham contrato de manutenção mensal, e por quanto: o preço da visita e a carteira são premissas.",
 "Quantos piscineiros autônomos e lojas já atendem Cabo Frio, e a que preço: o simulador não conhece o concorrente, e o autônomo cobra menos.",
 "Se o técnico fica: piscineiro bom sai para trabalhar por conta própria levando os clientes.",
 "Se o contrato resiste ao inverno: parte das casas de veraneio suspende a manutenção de maio a agosto.",
 "Quanto a margem do produto de balcão aguenta a concorrência dos atacadistas e da internet.",
 "Se a prefeitura e o Corpo de Bombeiros aceitam o depósito de oxidante na avenida mista e com que exigência.",
 "Se o aluguel de R$ 7 mil/mês é real: ele é o adversário.",
 "Se você quer isso: o modelo compara EBITDA com aluguel, não com sossego nem com o que você prefere fazer da vida."
];

/* ================= IDENTIDADE E TEXTOS ================= */
const NEG={titulo:"Piscina Prime",slug:"piscina_prime",negocio:"loja de piscina com manutenção mensal",
  leiame:"uma loja de produtos para piscina com equipe propria de manutencao mensal",
  ele:"a loja",pron:"ela",Curto:"Loja",
  un:"atendimento",uns:"atendimentos",unsCurto:"atendimentos",ud:"atend",dec:1,unMil:"mil atendimentos",unPreco:"R$/atendimento"};
const FASES3=[["0","Briefing"],["1","Mercado"],["2","Planta baixa"],["2B","O terceiro eixo"],["3","A loja e a rota"],
  ["4","Obra"],["5","Pessoas"],["6","Custo"],["6B","Turno cheio"],["7","Veredicto"]];
const SAZ_NOMES={piscina:"verão",pretemp:"pré-temporada",balcao:"verão"};
const SAZ_COLS={piscina:"Manutenção",pretemp:"Recuperação e equipamento",balcao:"Balcão"};
const ALTO_ID="E12";
const REF_VIOL=["Z04","Z06"];
const PORTOES=[
 ["alvara","Consulta de uso do solo na PMCF","Gratuita antes de qualquer obra. Loja com depósito de produto oxidante (cloro) numa avenida mista: o uso e a quantidade armazenada decidem a exigência. Confirmar antes custa nada."],
 ["pesquisa","Pesquisa com condomínios, administradoras, pousadas e donos de casa de veraneio","Quanto pagam hoje ao piscineiro, quantas visitas por mês, quem está insatisfeito e quanto a loja da cidade cobra pelo balde de cloro."],
 ["prolagos","Contratos com três condomínios ou administradoras de temporada","Três contratos grandes pagam o técnico do primeiro ano e dão a rota inicial."],
 ["rt","Laudo de água por visita e procedimento de químicos","Análise, foto e dosagem registradas em cada piscina; cloro e ácido nunca no mesmo baú."],
 ["treino","Treinamento dos técnicos em química da água, bomba e filtro",""],
 ["temporarios","Técnico temporário para dezembro a fevereiro",""]];
const ITENS_CAMPO=[
 ["peDireito","Pe-direito livre sob laje","medir em tres pontos afastados; anotar o menor",""],
 ["vigas","Altura e largura das vigas e o vao entre elas","medir da face inferior da viga ate o piso",""],
 ["pilares","Posicao e secao dos pilares","trena a partir das duas empenas; anotar secao em cm",""],
 ["portas","Altura livre sob a porta de enrolar","com a porta recolhida",""],
 ["peitoril","Ventilação natural nos futuros depósitos de cloro e de ácido","janela alta ou veneziana para fora em cada um; anotar a direção do vento",""],
 ["forro","Forro existente: material e altura","",""],
 ["degrau","Cota do patio em relacao ao piso interno","o degrau decide o carrinho de bombonas e a acessibilidade da loja",""],
 ["energia","Entrada de energia, quadro e demanda disponivel","o teste de bomba e o split da loja",""]];
const CORRIGE_NEG={
  Z20:{lab:"ventilar os dois depósitos de químicos",ok:()=>S.eq.E05==="none",fn:()=>{S.eq.E05="basico"}}};
const PROVAS=[
 ["Pé-direito de 2,40 m bloqueia o chuveiro de emergência","Z01",()=>{S.peLaje=2.40}],
 ["Difusor sobre a bancada de bombas vira bloqueio","Z04",()=>{S.dutoRota="linha";S.evapSobre="linha"}],
 ["Evaporador sem dreno vira bloqueio","Z12",()=>{S.evapDreno=false}],
 ["Estante acima do ombro vira aviso","Z14",()=>{S.alturaEmp=2.60}],
 ["Depósitos de químicos sem ventilação viram erro","Z20",()=>{S.eq.E05="none"}],
 ["Pátio sem vaga de cliente vira aviso","Z21",()=>{S.treeP={d:"v",cuts:[0.45],kids:[{r:"man"},{d:"h",cuts:[0.10,0.20,0.30],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"man"}]}]}}]];
const VISTAS=[
 {id:"geral",n:"Geral",ap(){CAM.modo="orb";ACOES3.fit();CAM.corte=1.20;S.corteLocal=null}},
 {id:"linha",n:"Loja",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["loj"]);
   CAM.yaw=1.2;CAM.pitch=0.6;CAM.dist=10;CAM.corte=2.40;S.corteLocal=null;S.layers3.equip=true}},
 {id:"barreira",n:"Depósito e carga",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["dep","car"]);
   CAM.yaw=-0.6;CAM.pitch=0.7;CAM.dist=9;CAM.corte=1.40;S.corteLocal=null;S.corMode="zona";S.layers3.zonas=true}},
 {id:"frio",n:"Cloro e ácido",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["clo","aci"]);
   CAM.yaw=-1.6;CAM.pitch=0.9;CAM.dist=14;CAM.corte=2.40;S.corteLocal=null}},
 {id:"receb",n:"Oficina",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["ofi"]);
   CAM.yaw=-2.1;CAM.pitch=0.62;CAM.dist=7.5;CAM.corte=2.40;S.corteLocal=null}},
 {id:"oper",n:"Do balconista",ap(){const c=centroSala("loj");CAM.modo="fp";CAM.fp=[c[0],1.65,c[2]+1.4];
   CAM.fyaw=-Math.PI/2;CAM.fpit=-0.05}}];
const TXT={
  f0lead:"Esta versão testa uma <b>loja de produtos para piscina com equipe própria de manutenção mensal</b>: o técnico visita a piscina da casa de veraneio, do condomínio e da pousada toda semana, aplica o produto que a loja vende, recupera a piscina verde antes do verão e conserta bomba e filtro. A loja na avenida vende o balde de cloro ao dono que cuida sozinho. Gôndola, kit de técnico e dois depósitos de químicos mantêm o CAPEX abaixo de R$ 200 mil; o estoque é capital de giro. A régua é a mesma que julgou a marcenaria e o pastel.",
  f0porqueTit:"Por que piscina.",
  f0porque:"Cabo Frio tem milhares de piscinas em casa de veraneio, condomínio e pousada, com dono ausente a maior parte do ano: alguém precisa cuidar da água toda semana, e o dono quer ver o laudo. A receita é recorrente (contrato mensal), o produto aplicado sai da própria loja, e o verão garante o pico. O imóvel serve: frente para a avenida para a loja, galpão para o depósito e o pátio para as motos e o cliente estacionar. O risco é o técnico, que é a mão de obra escassa e pode sair levando clientes, o inverno, quando parte das casas suspende o contrato, e a guarda de químicos — cloro e ácido separados e ventilados, que o Corpo de Bombeiros confere.",
  f0decide:"Ele verifica a loja na fachada, os depósitos de cloro e de ácido separados e ventilados, o chuveiro de emergência perto dos químicos, a oficina de bombas, a altura livre sob viga, o giro do carrinho de bombonas, as vagas da loja, a rota de fuga, os metros caminhados por atendimento e a demanda mês a mês com o pico do verão. Ele <b>não</b> substitui projeto executivo, ART, projeto de incêndio nem a pesquisa com os condomínios.",
  regiao:"Cabo Frio",faixaMercado:[5,80,1],faixaVol:[1,25,0.5],passoPreco:5,
  p3Nome:"Sábado e hora extra no verão — dezembro a fevereiro",
  p3Desc:R=>`Eleva o campo, o balcão e a oficina em ${PCT((HORA_EXTRA-1)*100)} no verão, a 150% da hora: cerca de ${BRL(R.folhaProd*(HORA_EXTRA-1)*1.5*PICO_PROD.length)}/ano de folha.`,
  matNome:"produto aplicado ou vendido",
  f1preco:"O preço é por atendimento: a visita de manutenção com o produto básico incluído, a recuperação e o conserto por serviço, e o cupom médio do balcão. O laudo digital e o sistema de roteiro seguram o contrato; a gôndola e o mostruário vendem no balcão; o tanque de teste vende a bomba nova.",
  f1curva:"A manutenção segue o uso da piscina: cheia no verão, suspensa por parte das casas no inverno. A recuperação e o equipamento vêm na pré-temporada, de setembro a novembro; o balcão vende no verão. Quem espera mais de um mês troca de piscineiro — 40% não volta.",
  f2lead:"Ao fundo, o depósito de cloro à esquerda, o depósito de produtos e peças, a oficina de bombas e o depósito de ácido à direita, a quase dez metros do cloro. Na fachada, o recebimento e a carga das motos com a porta A, o vestiário, a agenda e a loja com a porta de vidro, junto às vagas.",
  producao:"oficina",vagasNome:"Vagas de cliente no patio",
  f2blead:"Pe-direito, vigas, forro, os dutos de exaustão dos químicos e a altura do chuveiro de emergência e das gôndolas.",
  estantesNome:"estantes do depósito",forroDesc:"Sem forro, a loja fica quente e a poeira da laje cai na gôndola.",
  dutoOps:[["circ","a carga e o depósito"],["linha","a bancada de bombas"]],
  evapOps:[["circ","a parede da fachada da loja"],["linha","a bancada de bombas"]],
  drenoDesc:"Sem dreno, condensado pinga na bomba aberta. Bloqueio.",
  altoNome:"o chuveiro de emergência",altoRisco:"Se ele cair sob a viga, muda de lugar — e precisa continuar a cinco metros do cloro.",
  f3lead:R=>`${N2(R.tecEf,1)} técnico(s) em campo${S.freteTerc?", com moto própria e reembolso por quilômetro":", com as motos da empresa"}.`,
  f3cap:R=>`Cada linha consome horas diferentes: a visita de manutenção pesa ${N2(CANAIS[0].hTec,2)} h de técnico, a recuperação ${N2(CANAIS[1].hTec,1)} h, o conserto ${N2(CANAIS[2].hTec,1)} h; o balcão pesa ${N2(CANAIS[3].hBal,2)} h de balconista. O deslocamento entre piscinas come ${PCT((1-DESLOC)*100)} do dia do técnico. A capacidade de cada etapa é contada em atendimentos totais, na mistura atual das linhas.`,
  carteiraNome:"A demanda mês a mês",perdaNome:"Atendimento perdido para outro piscineiro ou outra loja",
  f3pico:"De dezembro a fevereiro a piscina é usada todo dia e o balcão enche; de setembro a novembro vem a recuperação. Sábado no verão, técnico temporário e o quarto técnico seguram o pico; no inverno, a equipe faz a oficina e a recuperação.",
  trifDesc:"Split da loja, teste de bomba e exaustores dos químicos: conferir a entrada e o quadro.",
  incDesc:"Oxidante (cloro e tricloro) em quantidade: o Corpo de Bombeiros confere a segregação, a ventilação, o extintor certo e a ficha de emergência dos produtos.",
  eficNome:"Roteiro por bairro e dosagem padronizada",eficDesc:"Rota fechada por bairro e tabela de dosagem por volume de piscina: corta 10% dos variáveis, com R$ 3.000 de CAPEX em treinamento.",
  giroDesc:"contrato mensal pago no mês seguinte; um mês e meio de produto em estoque na loja",
  depFora:{veiculo:"sem motos da empresa"},
  f5hint:"Quem vende é o sócio: o contrato com o condomínio e a administradora de temporada. O técnico é o ativo do negócio — é ele que o cliente conhece e é ele que pode sair levando a carteira; o laudo com foto no sistema é o que prende o cliente à loja, não à pessoa.",
  garantiaNome:"Retorno de visita e peça em garantia",
  freteNome:"Técnico com moto própria",freteDesc:"Não compra as motos; o técnico roda com a própria moto e recebe reembolso por quilômetro, cobrado por atendimento.",
  f6blead:"o produto sai da estante do depósito, vai para a mesa de separação da rota ou para a gôndola, e a venda fecha no balcão. O técnico sai às 8 h com a caixa de rota no baú.",
  copNome:"Janela perdida com a separação da rota da manhã e o fechamento do caixa",
  bossFiscalNome:"O Bombeiro Abre o Depósito",bossPicoNome:"Réveillon: Piscina Azul na Casa de Todo Mundo",
  fiscalOk:"Nada acima da linha reprova: difusores e evaporadores estão fora da projeção da bancada de bombas.",
  sol:"Sol direto sobre a vitrine esquenta o balde de cloro da gôndola: tricloro no calor solta gás e perde força. Produto oxidante fica na sombra.",
  r07:"a mesa de separação da rota",cvNome:"Produto e variáveis",
  z19quando:"de dezembro a fevereiro (o verão)",
  z19como:"Sábado e hora extra no verão (fase 1), quarto técnico ou técnico temporário (fase 5), sistema de roteiro (fase 3)."
};
H.fase5ok=R=>R.pessoas.des>0&&R.pessoas.tec>0&&R.pessoas.bal>0&&R.pessoas.ofi>0;
H.f5extra=R=>`<div class="hint">Técnicos em campo: <b>${N2(R.tecEf,1)}</b>${S.freteTerc?" (moto própria, reembolso por km)":` — limitados a ${R.nVeic} motos da empresa`}. Um técnico visita cerca de ${NUM(S.horas*EFIC*DESLOC/CANAIS[0].hTec,0)} piscinas por dia quando só faz manutenção. <span class="b b-hip">HIPOTESE</span></div>`;
H.bossPico=()=>{
  const R=calc(), T=R.temporada, pico=T.meses.filter(x=>PICO_PROD.includes(x.m));
  const dem=pico.reduce((a,x)=>a+x.dem,0), prod=pico.reduce((a,x)=>a+x.prod,0), des=pico.reduce((a,x)=>a+x.perda,0);
  const txt=[`Dezembro a fevereiro, ano 3: entram ${NUM(dem*1000,0)} atendimentos, e a loja atende até ${NUM(prod*1000,0)}${S.p3?" com o sábado e a hora extra":""}.`];
  txt.push(des*1000<=1?"Ninguém troca de piscineiro no verão.":`${NUM(des*1000,0)} atendimentos vão para outro piscineiro ou outra loja (${BRL(des*1000*R.precoMedio)} de venda). O gargalo é ${R.gargalo.n.toLowerCase()}.`);
  ZV.filter(v=>["Z08","Z19","Z20","Z21","Z22"].includes(v.cod)).forEach(v=>txt.push(`${v.cod} — ${v.msg}`));
  return `<div class="hint ${des*1000>1?"bad":""}"><b>${TXT.bossPicoNome}</b><br>${txt.join("<br>")}</div>`;
};
H.auditoria=p=>{
  p("Caixa de produto na cena","0,50 × 0,35 × 0,30","m","catálogo","produto na cena");
  CANAIS.forEach(c=>p("Horas por atendimento — "+c.n.split(" (")[0].split(" —")[0],"técnico "+N2(c.hTec,2)+" · balcão "+N2(c.hBal,2)+" · oficina "+N2(c.hOfi,2),"h","hipótese","capacidade"));
  p("Dia do técnico que sobra depois do deslocamento",PCT(DESLOC*100),"","hipótese","capacidade");
  p("Agenda e vendas",NUM(DES_DIA,0),"atendimentos/dia por pessoa","hipótese","capacidade");
  p("Distância mínima entre cloro e ácido","6","m","hipótese","Z20");
  p("Distância máxima do lava-olhos ao cloro","5","m","hipótese","Z22");
};
//@@HTML
TITULO=Piscina Prime
NEGOCIO=loja de piscina com manutenção mensal
NAO_AJUDA=preço da visita e carteira de contratos, técnico que fica, contrato que resiste ao inverno
ARQUIVO=piscina_prime_3d_v1.0.html
//@@TARDIO
function detalhesEquip(e,B){
  const quim={cores:["azul","plast","amarelo","lona2","papelao"]};
  switch(e.id){
    case "E01": case "M01": forma(e,B,"estante",Object.assign({niveis:4,n:5},quim)); break;
    case "E04": case "M04": forma(e,B,"estante",Object.assign({niveis:4,n:4},quim)); break;
    case "E07": forma(e,B,"bancada",{n:2,cores:["azul","inox"]}); break;
    case "E12": {                                   /* chuveiro e lava-olhos */
      const K=ctxEquip(e,B), {M,add,mat,hz}=K;
      add(mat(M(0.45,0.45,0.10,0.10,0,hz,{geo:"tubo",eixo:"y",esp:0.01,lod:1,org:"catalogo"}),"amarelo"));
      add(mat(M(0.20,0.20,0.60,0.60,hz-0.10,0.10,{geo:"cil",eixo:"y",lod:1,org:"catalogo"}),"amarelo"));
      add(mat(M(0.30,0.05,0.40,0.30,1.00,0.08,{geo:"cil",eixo:"y",lod:2,org:"catalogo"}),"verde"));
      break; }
    case "M02": forma(e,B,"balcao",Object.assign({vidro:true,n:2},quim)); break;
    case "M03": forma(e,B,"tanque",{n:2,cor:"azul"}); break;
    case "M05": forma(e,B,"bancada",Object.assign({n:4},quim)); break;
    case "M06": forma(e,B,"tanque",{n:2,cor:"azul"}); break;
    case "M07": forma(e,B,"pallet",{cores:["plast","azul"]}); break;
    case "M08": forma(e,B,"pallet",{cores:["amarelo","plast"]}); break;
    case "M09": forma(e,B,"caixas",Object.assign({n:3},quim)); break;
    case "M10": forma(e,B,"armario",{portas:4}); break;
    case "M11": forma(e,B,"estacao",{telas:1}); break;
  }
}
