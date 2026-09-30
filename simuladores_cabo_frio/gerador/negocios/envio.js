/* ==================================================================
   ENVIO PRIME 3D — v1.0 (motor herdado do Pastel Prime 3D v3.2, pelas
   versoes Gelo, Enxoval, Praia, Visual, Uniforme e Planejado Prime 3D)
   Estudo de viabilidade de uma operacao de fulfillment para as marcas de
   moda praia de Cabo Frio (a Rua dos Biquinis vende para o Brasil inteiro
   pela internet): guardar o estoque da marca, separar, embalar com o
   padrao dela e despachar pelas transportadoras — em Novo Portinho, Cabo
   Frio (RJ), com CAPEX abaixo de R$ 200 mil, contra a alternativa de
   alugar o imovel por R$ 7 mil/mes. Arquivo unico, offline.
   A unidade do modelo e o pedido despachado; o motor conta em mil pedidos.
   O que e deste negocio: tabelas de dados, capacidade por etapa
   (recebimento, separacao, embalagem, expedicao, atendimento e posicoes de
   estoque) ponderada pelo que cada linha pede, as regras Z04, Z08, Z11,
   Z14, Z20 a Z22, o turno, as formas e os textos das fases.
   ================================================================== */

/* ================= EQUIPAMENTOS ================= */
/* preço em R$; w/hh = pegada. Base: faixas de mercado, set/2026, ±40% —
   cotar. A tese é CAPEX baixo: estante de aço, bancada, impressora térmica
   e um WMS por assinatura; a esteira e o sorter nunca entram.            */
const EQ=[
 {id:"E01",n:"Bancadas de embalagem",req:"Onde o biquíni vira pedido: papel de seda, cartão da marca, envelope e etiqueta — uma bancada por embaladora",kw:0.3,etapa:"embalagem",
  t:[{k:"basico",n:"2 bancadas com rolo de papel de seda, fita e balança",p:5000,banc:2,fat:1.00,w:3.00,hh:0.80},
     {k:"padrao",n:"3 bancadas com impressora por posto e seladora (+10%)",p:11000,banc:3,fat:1.10,w:4.00,hh:0.80}]},
 {id:"E02",n:"Impressoras e leitores",req:"Cada pedido é bipado na separação e na embalagem: o que não bipou não saiu",kw:0.3,etapa:"separação",
  t:[{k:"basico",n:"2 impressoras térmicas e 2 leitores de código",p:4000,fat:1.00},
     {k:"padrao",n:"Impressora por bancada e 3 coletores Android (+10%)",p:9000,fat:1.10}]},
 {id:"E03",n:"Sistema de armazém (WMS) e integrações",req:"Liga o estoque às lojas virtuais das marcas: sem integração, a marca média não entra",kw:0,etapa:"separação",
  t:[{k:"basico",n:"Planilha e emissor de etiquetas das plataformas (−15% na separação; −10% de alcance)",p:1000,fat:0.85,f:0.90},
     {k:"padrao",n:"WMS por assinatura integrado às lojas das marcas",p:6000,fat:1.00,f:1.00},
     {k:"premium",n:"WMS com separação por onda e conferência por bipagem (+15%; +3%)",p:12000,fat:1.15,f:1.03}]},
 {id:"E04",n:"Estantes endereçadas",req:"Cada endereço é um SKU de uma marca: tamanho, cor e modelo, sem misturar",kw:0,etapa:"estoque",
  t:[{k:"basico",n:"Estantes de aço com 300 posições endereçadas",p:12000,pos:300,w:5.60,hh:0.60},
     {k:"padrao",n:"Estantes mais fundas com 600 posições e escadas",p:22000,pos:600,w:5.60,hh:0.90}]},
 {id:"E05",n:"Câmeras e controle de acesso",req:"O estoque é da marca: sem imagem, peça que some vira desconto na fatura e a marca não volta",kw:0.3,etapa:"-",crit:true,
  t:[{k:"none",n:"Não — sem câmera",p:0,f:0.85,extr:1.8},{k:"basico",n:"8 câmeras com gravação de 30 dias",p:6500,f:1.00,extr:1.0},
     {k:"padrao",n:"16 câmeras sobre as bancadas e controle de acesso",p:14000,f:1.03,extr:0.7}]},
 {id:"E06",n:"Desumidificação do estoque",req:"Lycra e aviamento de metal a 200 m do canal: a maresia mofa o tecido e oxida o fecho",kw:1.0,etapa:"-",
  t:[{k:"none",n:"Não — janela aberta",p:0,umid:1.5},{k:"basico",n:"Ventilação e desumidificador portátil",p:3500,umid:1.0},
     {k:"padrao",n:"Split no estoque e desumidificador",p:9000,umid:0.8}]},
 {id:"E07",n:"Estúdio de fotos para as marcas",req:"A marca pequena que manda o estoque quer a foto do produto no mesmo lugar",kw:0.8,etapa:"-",
  t:[{k:"none",n:"Não",p:0,f:1.00},{k:"basico",n:"Fundo infinito, 2 softboxes e mesa de still (+5% nas marcas pequenas)",p:4500,f:1.05,w:1.60,hh:1.20}]},
 {id:"E08",n:"Veículo de coleta",req:"Buscar o estoque e a devolução nas lojas da Rua dos Biquínis",kw:0,etapa:"-",
  t:[{k:"none",n:"Não comprar — a marca traz o estoque",p:0,veic:0},{k:"basico",n:"Fiorino usada para coleta na Gamboa",p:68000,veic:1}]},
 {id:"E09",n:"Carrinhos de separação",req:"Separar vários pedidos numa volta pelo corredor",kw:0,etapa:"separação",
  t:[{k:"basico",n:"2 carrinhos com cestos",p:1800,fat:1.00},{k:"padrao",n:"4 carrinhos com divisória por pedido — separação em lote (+15%)",p:4500,fat:1.15}]},
 {id:"E10",n:"Energia de reserva",req:"Etiqueta e integração caem junto com a luz",kw:0,etapa:"-",
  t:[{k:"basico",n:"Nobreak para rede, impressoras e câmeras",p:2000}]},
 {id:"E11",n:"Seladora e balança da expedição",req:"Peso conferido antes da coleta: frete cobrado errado sai da margem",kw:0.2,etapa:"expedição",
  t:[{k:"basico",n:"Seladora de caixa e balança de 30 kg",p:2500}]},
 {id:"E12",n:"Mesa de recebimento",req:"Conferir a nota da marca peça por peça antes de endereçar",kw:0,etapa:"recebimento",
  t:[{k:"basico",n:"Mesa de conferência com leitor",p:2000}]},
 {id:"E13",n:"Gaiolas por transportadora",req:"Correios, Jadlog, Loggi e Mercado Envios coletam em horários diferentes",kw:0,etapa:"expedição",
  t:[{k:"basico",n:"6 gaiolas aramadas",p:3600}]}
];

/* ================= OBRA ================= */
const OBRA=[
 {id:"piso",n:"Piso do galpão regularizado e pintado (~100 m²)",min:4000,max:9000},
 {id:"eletr",n:"Elétrica: iluminação de 500 lx nas bancadas, tomadas e quadro",min:4000,max:9000},
 {id:"vedac",n:"Divisórias: devoluções, atendimento, estúdio e integração; forro",min:5000,max:10000},
 {id:"vest",n:"Vestiário, copa e sanitário (adequação)",min:3000,max:6000},
 {id:"fach",n:"Fachada e atendimento às marcas",min:2500,max:6000},
 {id:"inc",n:"Prevenção de incêndio: extintores, sinalização e iluminação de emergência (tecido e papelão)",min:3000,max:6000},
 {id:"proj",n:"Projetos, ART e laudo do Corpo de Bombeiros",min:3000,max:6000},
 {id:"lic",n:"Licenças: alvará, bombeiros e cadastro nas transportadoras",min:2000,max:4000},
 {id:"marca",n:"Marca, site, visitas às marcas da Rua dos Biquínis e integração das primeiras lojas",min:3000,max:8000}
];
const OBRA_DEP={};

/* ================= PESSOAS ================= */
/* des = atendimento e integracao das marcas; rec = recebimento e
   enderecamento; sep = separacao; emb = embalagem; exp = expedicao        */
const POSTOS=[
 {id:"p1",n:"Gestor / sócio-operador (pró-labore; vende para as marcas e integra as lojas virtuais)",sal:6000,fator:1.15,des:0.4,on:true,fixo:true},
 {id:"p2",n:"Líder de operação — recebe, confere e fecha a expedição",sal:2600,rec:0.4,exp:0.4,des:0.2,on:true},
 {id:"p3",n:"Separador(a) — endereça de manhã e separa o dia todo",sal:1850,sep:0.7,rec:0.3,on:true},
 {id:"p4",n:"Embalador(a) 1",sal:1850,emb:1,on:true},
 {id:"p5",n:"Embalador(a) 2",sal:1850,emb:1,on:true},
 {id:"p6",n:"Auxiliar — separa de manhã e embala à tarde (opcional)",sal:1850,sep:0.5,emb:0.5,on:false},
 {id:"p7",n:"Atendente das marcas e SAC (opcional)",sal:2300,des:1,on:false},
 {id:"p8",n:"3ª embaladora (opcional; pede 3 bancadas)",sal:1850,emb:1,on:false},
 {id:"p9",n:"Motorista de coleta",sal:2200,on:true,dep:"veiculo"}
];

/* ================= FIXO ================= */
const FIXO=[
 {id:"energia",n:"Energia: iluminação, impressoras, desumidificador e escritório",v:700},
 {id:"agua",n:"Água e esgoto",v:100},
 {id:"cont",n:"Contabilidade",v:1200},
 {id:"seg",n:"Seguros: patrimônio e responsabilidade civil",v:500},
 {id:"ti",n:"WMS, integrações e internet redundante",v:1150},
 {id:"mkt",n:"Marketing para as marcas: visitas, Instagram e indicação",v:1000},
 {id:"hig",n:"Limpeza, EPIs e uniformes",v:250},
 {id:"vig",n:"Monitoramento das câmeras e alarme",v:300},
 {id:"man",n:"Manutenção de estantes, impressoras e desumidificador",v:150},
 {id:"veic",n:"Veículo próprio: seguro, IPVA e manutenção fixa",v:1200,dep:"veiculo"}
];

/* ================= VARIÁVEL (por pedido) ================= */
const VARI=[
 {id:"etiq",n:"Etiqueta térmica e ribbon",cons:1,un:"—",preco:0.10,pun:"R$/pedido"},
 {id:"fita",n:"Fita, lacre e enchimento",cons:1,un:"—",preco:0.08,pun:"R$/pedido"},
 {id:"extr",n:"Peça sumida ou avariada descontada da fatura da marca",cons:1,un:"—",preco:0.10,pun:"R$/pedido"},
 {id:"seg",n:"Seguro do estoque de terceiros (ad valorem)",cons:1,un:"—",preco:0.08,pun:"R$/pedido"},
 {id:"energia",n:"Energia por pedido",cons:0.05,un:"kWh/ped",preco:0.98,pun:"R$/kWh"}
];

/* ================= LINHAS (CLIENTES) ================= */
/* share = fracao dos pedidos; preco = o que a marca paga por pedido
   (armazenagem incluida); mat = a embalagem que vai no pedido; rec, sep,
   emb, exp = peso de cada etapa por pedido da linha; saz = curva          */
const CANAIS=[
 {id:"pq",n:"Marcas pequenas da Rua dos Biquínis (até 500 pedidos/mês)",share:45,preco:9.90,mat:2.60,saz:"moda",rec:1.0,sep:1.0,emb:1.1,exp:1.0},
 {id:"md",n:"Marcas médias (500 a 3.000 pedidos/mês)",share:35,preco:7.90,mat:2.20,saz:"moda",rec:1.0,sep:1.0,emb:1.0,exp:1.0},
 {id:"mk",n:"Preparação para o Full dos marketplaces (etiquetar e mandar em lote ao CD)",share:10,preco:3.20,mat:0.40,saz:"moda",rec:1.5,sep:0.3,emb:0.3,exp:0.2},
 {id:"dv",n:"Trocas e devoluções (receber, conferir, higienizar e reembalar)",share:10,preco:12.00,mat:1.50,saz:"troca",rec:2.0,sep:0.0,emb:1.0,exp:1.0}
];
const SAZ=[["Janeiro",120,"Verão: a marca vende o estoque de praia"],["Fevereiro",100,"Carnaval"],["Março",80,"Fim do verão"],["Abril",70,"Baixa"],["Maio",80,"Dia das Mães"],["Junho",60,"Inverno: moda praia quase para"],["Julho",65,"Férias no Nordeste"],["Agosto",75,"Coleção nova"],["Setembro",100,"Lançamento do verão"],["Outubro",115,"Esquenta"],["Novembro",155,"Black Friday: o mês que decide o ano"],["Dezembro",165,"Natal e réveillon de biquíni novo"]];
const SAZ_LINHA={
 moda:[120,100,80,70,80,60,65,75,100,115,155,165],
 troca:[160,120,80,70,80,60,60,70,80,90,110,150]
};

/* ================= PREMISSAS DO FULFILLMENT (hipoteses declaradas) ================= */
const REC_H=100;            /* pedidos-equivalentes/h por pessoa no recebimento e enderecamento */
const SEP_H=60;             /* pedidos/h por separador, com WMS e carrinho */
const EMB_H=30;             /* pedidos/h por embaladora, no padrao da marca */
const EXP_H=150;            /* pedidos/h por pessoa na conferencia e no romaneio */
const DES_DIA=700;          /* pedidos/dia acompanhados por pessoa no atendimento as marcas */
const PED_POS=1.3;          /* pedidos/dia sustentados por posicao de estoque enderecada */
const EFIC=0.85;            /* fracao produtiva do turno */
const GARANTIA=0.015;       /* erro de separacao: reenvio e frete por conta da operacao */
const DESISTE=0.70;         /* pedido que nao sai no dia a marca despacha sozinha */
const PICO_PROD=[10,11,0];  /* novembro, dezembro e janeiro */
const HORA_EXTRA=1.25;      /* hora extra e segundo turno curto no pico */
const FV_KWH=700, FV_COMP=0.85, FV_CAPEX=25000;    /* 5 kWp em Cabo Frio, compensacao liquida */
const VAGA_M2=12.5, VAGAS_MIN=2;                    /* coleta das transportadoras e das marcas */

/* ================= SETORES / PLANTA ================= */
const CLS={limpa:{n:"Operação — estoque e embalagem",c:"#2E9C86"},
 circ:{n:"Circulação",c:"#5B7080"},
 frio:{n:"Trocas e devoluções",c:"#0F6B5F"},
 inter:{n:"Doca — recebimento e expedição",c:"#D79A2E"},
 suja:{n:"Externa — papelão e plástico",c:"#AC5F48"},
 barreira:{n:"Vestiário e copa",c:"#6E5AB0"},
 publica:{n:"Atendimento às marcas e estúdio",c:"#3B7CA8"},
 adm:{n:"Integração e SAC",c:"#7C93A1"},
 tec:{n:"Técnica",c:"#55707E"}};
const ROOM={
 arm:{n:"Estoque endereçado das marcas",c:"limpa",a:40,ab:1},
 emb:{n:"Bancadas de embalagem",c:"limpa",a:24,ab:1},
 dev:{n:"Trocas e devoluções",c:"frio",a:14,t:"fechada: peça que volta não se mistura com a nova"},
 rec:{n:"Recebimento e conferência de nota",c:"inter",a:13},
 ves:{n:"Vestiário, copa e sanitário",c:"barreira",a:7},
 atd:{n:"Atendimento às marcas e estúdio de fotos",c:"publica",a:9},
 esc:{n:"Integração e SAC",c:"adm",a:5},
 exp:{n:"Expedição por transportadora",c:"inter",a:13}
};
const ROOM_P={
 ret:{n:"Reservatório de água",c:"tec",a:3},
 res:{n:"Abrigo de papelão e plástico",c:"suja",a:3},
 fos:{n:"Fossa e filtro existentes",c:"tec",a:5},
 vag:{n:"Vagas de coleta: transportadoras e marcas",c:"publica",a:25},
 man:{n:"Pátio de manobra do VUC da transportadora",c:"circ",a:0}
};
const LIG=[
 {a:"rec",b:"arm",t:"porta",d:"Recebimento → estoque: a peça conferida vai para o endereço"},
 {a:"rec",b:"ves",t:"porta",d:"Entrada de pessoal → vestiário"},
 {a:"ves",b:"arm",t:"porta",d:"Vestiário → estoque"},
 {a:"emb",b:"exp",t:"porta",d:"Embalagem → expedição: o pedido fechado vai para a gaiola da transportadora"},
 {a:"dev",b:"emb",t:"porta",d:"Devoluções → embalagem: a peça conferida volta ao estoque pela bancada"},
 {a:"esc",b:"*",t:"porta",d:"Integração → operação"},
 {a:"atd",b:"esc",t:"porta",d:"Atendimento → integração"}
];
const CRUZA_OK=["rec","ves","esc","exp"];
const FLOW=["rec","arm","emb","exp"];
const WI=14.70, HI=9.70, TP=0.15, TI=0.10;
const WP=15.00, HP=13.00;

/* árvore de divisórias. Operação ao fundo: o estoque endereçado, as
   bancadas de embalagem e a sala fechada de devoluções; na fachada, o
   recebimento com a porta A, o vestiário, o atendimento às marcas com o
   estúdio, a integração e a expedição com a porta B.
   x: 0 | estoque / recebimento 4,20 | vestiário 6,20 | atendimento 7,40 embalagem 9,00 | integração 10,60 | expedição 12,00 devoluções | 14,70 */
const L1=()=>({d:"v",cuts:[0.62887],kids:[
  {d:"h",cuts:[0.50340,0.81633],kids:[{r:"arm"},{r:"emb"},{r:"dev"}]},
  {d:"h",cuts:[0.28571,0.42177,0.61224,0.72109],kids:[{r:"rec"},{r:"ves"},{r:"atd"},{r:"esc"},{r:"exp"}]}
]});
const L1P=()=>({d:"v",cuts:[0.62000],kids:[
  {r:"man"},
  {d:"h",cuts:[0.12000,0.24000,0.36000],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"vag"}]}
]});

const FOOT={
 E01:{n:"Bancadas de embalagem",w:3.00,h:0.80,op:0.90,z:["limpa"],x:7.80,y:0.30,
      s:"Papel de seda, cartão da marca, envelope e etiqueta: o pedido sai com a cara da marca."},
 E04:{n:"Estantes endereçadas — corredor A",w:5.60,h:0.60,op:0.90,z:["limpa"],x:0.40,y:0.20,
      s:"Um endereço por SKU. A altura é a da fase 2B."},
 E07:{n:"Estúdio de fotos (fundo infinito)",w:1.60,h:1.20,op:0.80,z:["publica"],x:7.20,y:8.25,
      s:"A foto do produto no mesmo lugar do estoque: o serviço que traz a marca pequena."},
 E12:{n:"Mesa de recebimento e conferência",w:1.60,h:0.80,op:0.90,z:["inter"],x:0.20,y:6.30,
      s:"A nota da marca é conferida peça por peça antes de ir para o endereço."},
 M01:{n:"Estantes endereçadas — corredor B",w:5.60,h:0.60,op:0.90,z:["limpa"],x:0.40,y:1.80,mob:1,
      s:"Corredor de separação de 1 m entre as estantes."},
 M02:{n:"Estantes endereçadas — corredor C",w:5.60,h:0.60,op:0.90,z:["limpa"],x:0.40,y:3.40,mob:1,
      s:"O terceiro corredor: coleção da estação e reposição."},
 M03:{n:"Carrinho de separação",w:0.90,h:0.60,op:0.70,z:["limpa"],x:6.30,y:4.70,mob:1,
      s:"Vários pedidos numa volta pelo corredor, um cesto por pedido."},
 M04:{n:"Mesa de conferência e fechamento",w:2.40,h:0.80,op:0.90,z:["limpa"],x:7.80,y:2.30,mob:1,
      s:"Pedido bipado de novo antes de fechar: tamanho e cor conferidos."},
 M05:{n:"Gaiolas por transportadora",w:1.00,h:2.40,op:0.90,z:["inter"],x:13.50,y:6.30,mob:1,
      s:"Correios, Jadlog, Loggi e Mercado Envios coletam em horários diferentes."},
 M06:{n:"Estação de expedição e romaneio",w:0.70,h:1.20,op:0.70,z:["inter"],x:10.65,y:7.60,mob:1,
      s:"Romaneio por transportadora e peso conferido antes da coleta."},
 M07:{n:"Caixas das marcas aguardando endereçamento",w:2.00,h:1.10,op:0.80,z:["inter"],x:2.00,y:6.30,mob:1,
      s:"O estoque que a marca trouxe hoje: conferido antes de subir para a estante."},
 M08:{n:"Armários da equipe",w:1.60,h:0.45,op:0.70,z:["barreira"],x:4.40,y:9.10,mob:1,
      s:"Bolsa e celular pessoal ficam aqui: estoque de terceiros não convive com sacola própria."},
 M09:{n:"Mesa de atendimento às marcas",w:1.60,h:0.80,op:0.80,z:["publica"],x:6.40,y:6.60,mob:1,
      s:"A dona da marca vê o painel do estoque e dos pedidos do dia."},
 M10:{n:"Estação de integração e SAC",w:1.20,h:0.65,op:0.60,z:["adm"],x:9.20,y:8.80,mob:1,
      s:"Lojas virtuais integradas, estoque sincronizado e o SAC das marcas."},
 M11:{n:"Mesa de trocas e devoluções",w:1.60,h:0.80,op:0.90,z:["frio"],x:12.40,y:0.40,mob:1,
      s:"A peça que voltou é conferida, higienizada e reembalada — ou separada como avaria."},
 M12:{n:"Estante de devoluções",w:0.60,h:2.00,op:0.80,z:["frio"],x:14.00,y:2.00,mob:1,
      s:"Troca aguardando o cliente e avaria aguardando a marca."}
};
const CAMADAS=[["zonas","Zonas da operação"],["paredes","Paredes e portas"],["equip","Equipamentos"],
 ["cotas","Cotas"],["hidro","Água e esgoto"],["fluxo","Fluxo do pedido"],["pilares","Pilares"],["texto","Etiquetas"]];
const HIDRO=[
 {t:"ralo",x:5.20,y:9.35,lab:"Ralo sifonado — sanitário e copa"},
 {t:"agua",x:4.40,y:6.30,lab:"Água do sanitário e da copa"},
 {t:"agua",x:14.40,y:5.60,lab:"Tanque de higienização das devoluções"},
 {t:"caimento",x:5.20,y:8.50,lab:"Caimento do piso de 1% na copa"}
];
const PILARES=[[0,0],[4.90,0],[9.80,0],[14.70,0],[0,4.85],[4.90,4.85],[9.80,4.85],[14.70,4.85],
 [0,9.70],[4.90,9.70],[9.80,9.70],[14.70,9.70]];
/* ================= ESTADO ================= */
const S={
  alugMerc:7000,custoOp:false,tma:15,dias:26,horas:8,fatorMaq:1,
  alvara:false,pesquisa:false,prolagos:false,temporarios:false,treino:false,rt:false,
  mercado:60,vol1:70,cresc:22,shareMax:20,p3:false,
  eq:{E01:"basico",E02:"basico",E03:"padrao",E04:"basico",E05:"basico",E06:"basico",E07:"basico",E08:"none",E09:"basico",E10:"basico",E11:"basico",E12:"basico",E13:"basico"},
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
const TAXA_RECEB=0.010;        /* boleto e PIX das marcas */
const EFIC_GANHO=0.10, EFIC_CAPEX=3000;
const PAPEIS=[["des","Atendimento às marcas",false],["rec","Recebimento e endereçamento",true],
  ["sep","Separação",true],["emb","Embalagem",true],["exp","Expedição",true]];
/* peso medio de uma etapa por pedido, pela participacao de cada linha */
function pesoLinhas(k){
  const tot=CANAIS.reduce((a,c)=>a+S.canais[c.id].share,0)||1;
  return CANAIS.reduce((a,c)=>a+S.canais[c.id].share*(c[k]||0),0)/tot;
}
const H={
  flags(R){
    R.cftv=S.eq.E05!=="none";
    R.umid=eqT("E06").umid||1;
    R.pos=eqT("E04").pos||300;
    R.bancadas=eqT("E01").banc||2;
  },
  dep(R){return {veiculo:R.veiculo}},
  capacidade(R){
    const h=S.horas, fm=S.fatorMaq||1, P=R.pessoas;
    const w=k=>Math.max(0.05,pesoLinhas(k));
    R.capRec=P.rec*REC_H*h*EFIC*fm/w("rec");
    R.capSep=P.sep*SEP_H*h*EFIC*fm*(eqT("E03").fat||1)*(eqT("E09").fat||1)*(eqT("E02").fat||1)/w("sep");
    R.capEmb=Math.min(P.emb,R.bancadas)*EMB_H*h*EFIC*fm*(eqT("E01").fat||1)*(eqT("E02").fat||1)/w("emb");
    R.capExp=P.exp*EXP_H*h*EFIC*fm/w("exp");
    R.capDes=P.des*DES_DIA*fm;
    R.capArm=R.pos*PED_POS;
    R.etapas=[
      {n:"Recebimento e endereçamento",v:R.capRec,sala:"rec"},
      {n:"Separação",v:R.capSep,sala:"arm"},
      {n:"Embalagem",v:R.capEmb,sala:"emb",d:`${Math.min(P.emb,R.bancadas)} embaladora(s) em ${R.bancadas} bancada(s)`},
      {n:"Expedição",v:R.capExp,sala:"exp"},
      {n:"Atendimento às marcas",v:R.capDes,sala:"esc"},
      {n:"Posições de estoque",v:R.capArm,sala:"arm",d:`${R.pos} endereços × ${N2(PED_POS,1)} pedido/dia`}
    ];
  },
  fGeral(R){return (eqT("E05").f||1)*(eqT("E03").f||1)},
  vari(v,R){
    if(v.id==="extr"){v.preco=S.vari.extr*(eqT("E05").extr||1)*R.umid;
      v.n="Peça sumida ou avariada descontada da fatura da marca"+(R.cftv?"":" (sem câmera: ×1,8)")+(R.umid>1?" (sem desumidificação: ×1,5)":"");}
    return v;
  },
  canal(c,R){
    let f=1;
    if(c.id==="pq")f*=(eqT("E07").f||1)*(R.veiculo?1:0.92);
    return f;
  },
  /* a marca paga a fatura do mes no dia 10 do mes seguinte (cerca de 25
     dias de venda a receber) e a operacao compra um mes de embalagem       */
  giro(R){
    const dia=S.vol1*1000/365*R.fatorDemanda;
    return dia*R.precoMedio*25+dia*R.materialMedio*30;
  },
  riscoSan(R,lay){
    let rs=15;
    if(!R.cftv)rs+=15; if(R.umid>1)rs+=8;
    if(!S.rt)rs+=8; if(!S.treino)rs+=8;
    rs+=Math.min(20,lay.viol.length*7);
    if(lay.setoresFaltando.includes("ves"))rs+=8;
    return rs;
  },
  riscoReg(R){
    let rr=15;
    if(!S.alvara)rr+=25; if(!S.prolagos)rr+=15; if(!S.pesquisa)rr+=15;
    if(!S.reservTerreo)rr+=6;
    return rr;
  },
  gates(R,lay){return [
    {id:"alvara",n:"O Alvará",ok:S.alvara,xp:15},
    {id:"pesq",n:"A Rua dos Biquínis",ok:S.pesquisa,xp:15},
    {id:"efl",n:"As Cinco Marcas Âncora",ok:S.prolagos,xp:12},
    {id:"layout",n:"A Planta Fecha",ok:lay.deficit===0&&lay.viol.length===0&&lay.flowPct>=100,xp:15},
    {id:"pcc",n:"O Estoque Confere",ok:R.cftv&&S.rt&&S.treino,xp:12},
    {id:"verao",n:"A Black Friday",ok:S.p3&&S.temporarios,xp:10},
    {id:"gargalo",n:"Pedido no Prazo",ok:R.perda3Pct<5,xp:11},
    {id:"bench",n:"Bater a Locação",ok:R.dre[2].ebitda>S.alugMerc*12,xp:10}
  ]}
};

/* ================= EIXO VERTICAL (HIPOTESE DECLARADA) ================= */
const VERT={
 /* bancada: a peca fica fora do saco enquanto e dobrada e embalada */
 E01:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 E04:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 /* estudio: o suporte do fundo infinito sobe a 2,40 m */
 E07:{hz:2.40,hop:1.50,hman:0.20,hac:"S"},
 E12:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 M01:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 M02:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 M03:{hz:1.10,hop:1.00,hman:0.30,hac:"O"},
 M04:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 M05:{hz:1.80,hop:1.20,hman:0.30,hac:"O"},
 M06:{hz:1.15,hop:0.75,hman:0.30,hac:"N"},
 M07:{hz:1.40,hop:1.20,hman:0.30,hac:"O"},
 M08:{hz:1.80,hop:1.20,hman:0.20,hac:"N"},
 M09:{hz:0.75,hop:0.75,hman:0.30,hac:"S"},
 M10:{hz:1.15,hop:0.75,hman:0.30,hac:"N"},
 M11:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 M12:{hz:1.80,hop:1.50,hman:0.20,hac:"S"}
};
const ESTANTES_IDS=["E04","M01","M02","M12"];
const ALT_ESTANTE=2.00;

/* ================= INSTALACOES E FACHADA ================= */
const INST={
  abertos:["E01","M04","E12","M11"],     /* onde a peca fica fora do saco */
  difSalas:["exp","rec"], salaLinha:"emb", salaLoja:"atd",
  evap:()=>S.eq.E06==="padrao", evapLinhaEq:"E01", evapPos:{x:2.50,y:5.50}, evapSala:"arm", evapSalaLinha:"emb"
};
const VITRINE=null;
const PORTAS_FACHADA=[
 {r:"rec",lado:"A",min:1.6,l:3.00,t:"enrolar",lab:"PORTA A · estoque das marcas e pessoal"},
 {r:"exp",lado:"B",min:1.6,l:3.00,t:"enrolar",lab:"PORTA B · coleta das transportadoras"},
 {r:"atd",lado:"C",min:1.2,l:1.20,t:"vidro",lab:"Porta da loja · atendimento às marcas"}
];

/* ================= REGRAS Z DO NEGOCIO ================= */
H.zNegocio=(B,add,{eqs,D,M,dt})=>{
  /* Z04 — instalacao sobre a peca fora do saco */
  zProjecao(B,add,eqs,{bloq:"peça fora do saco: condensado mancha a lycra e molha o papel de seda e a etiqueta",
    aviso:"as bancadas de embalagem e de conferência — exigem luminária sem ofuscamento e com boa reprodução de cor: a embaladora confere cor e tamanho"});
  /* Z08 — giro do carrinho de separacao e da gaiola */
  zGiro(B,add,dt,D,[["rec","Recebimento"],["emb","Embalagem"],["exp","Expedição"]],1.20,"o carrinho de separação");
  /* Z11 — atendimento com porta para a rua */
  const a=D.leaves.find(l=>l.r==="atd");
  if(!a||Math.abs(a.y+a.h-HI)>EPS)add("Z11","aviso","O atendimento às marcas não encosta na fachada: a dona da marca teria de entrar pelo estoque de terceiros",
    a?{x:a.x,z:a.y,w:a.w,d:a.h,y:0,h:0.3}:null,"Manter o atendimento na fachada, com porta própria.");
  /* Z14 — estantes enderecadas */
  zEstantes(B,add,D,"arm","Estantes endereçadas");
  /* Z20 — estoque de terceiros sem camera */
  const arm=D.leaves.find(l=>l.r==="arm");
  if(S.eq.E05==="none")add("Z20","erro",
    "Estoque de terceiros sem câmera nem controle de acesso: a marca não confia, o seguro não cobre e peça sumida vira desconto na fatura",
    arm?{x:arm.x,z:arm.y,w:arm.w,d:arm.h,y:0,h:2}:null,"Instalar ao menos 8 câmeras com gravação (fase 3).");
  /* Z21 — vagas de coleta */
  zVagas(B,add,n=>`Pátio com ${n} vaga(s) de coleta — mínimo adotado de ${VAGAS_MIN}; sem vaga, o VUC da transportadora para na avenida e a coleta vira multa`,
    "Reservar a faixa do pátio junto ao portão para a coleta (fase 2, vista do pátio).");
  /* Z22 — estoque de lycra sem desumidificacao */
  if(S.eq.E06==="none")add("Z22","erro","Estoque de lycra sem desumidificação a 200 m do canal: a maresia mofa o tecido e oxida o fecho de metal — a avaria sobe 50%",
    arm?{x:arm.x,z:arm.y,w:arm.w,d:arm.h,y:0,h:2}:null,"Ao menos ventilação e desumidificador portátil (fase 3).");
};

/* ================= TURNO ================= */
const ESTACOES=[
 {id:"arm",n:"Separação no estoque",eq:"M01",sala:"arm",cap:R=>R.capSep},
 {id:"emb",n:"Bancadas de embalagem",eq:"E01",sala:"emb",cap:R=>R.capEmb},
 {id:"con",n:"Conferência e fechamento",eq:"M04",sala:"emb"},
 {id:"exp",n:"Expedição",eq:"M05",sala:"exp",cap:R=>R.capExp}
];
const BATELADA=5;               /* pedidos por lote de separacao */
const TURNO={carrinho:20,       /* pedidos por viagem do carrinho */
  rolo:40,                      /* pedidos-equivalentes por caixa de reposicao */
  carga:{"arm>emb":20}, salaRec:"rec",
  cop:30,                       /* integracao dos pedidos da noite, onda da manha e fechamento */
  inicio:8};
H.foraDaLinha=R=>Math.min(R.capRec,R.capDes,R.capArm);

/* ================= PRODUTO NA CENA ================= */
function produtoNaCena(B){
  if(!S.produto||!B.D)return;
  const sim=(typeof SIM!=="undefined")&&SIM;
  const sala=r=>B.D.leaves.find(l=>l.r===r);
  const exp=sala("exp");
  if(exp){const q=sim?Math.max(1,sim.kgTurno):300;
    pilha(B,exp.x+0.35,exp.y+exp.h-1.30,"pacote",Math.min(16,Math.max(4,Math.round(q/25))),"Pedidos embalados aguardando a coleta",q,0,"pedidos");}
  const rec=sala("rec");
  if(rec)pilha(B,rec.x+0.30,rec.y+rec.h-1.25,"caixa",6,"Caixas de estoque trazidas pelas marcas",6,0,"caixas");
}

/* ================= SENSIBILIDADE, CETICO E MONTE CARLO ================= */
const VARS=[
 {id:"preco",n:"Preço médio por pedido",un:"R$/pedido",geo:false,
  val:()=>calc().precoMedio,
  set:f=>CANAIS.forEach(c=>S.canais[c.id].preco=+(S.canais[c.id].preco*f).toFixed(4))},
 {id:"vol",n:"Volume do ano 1",un:"mil pedidos/ano",geo:false,val:()=>S.vol1,set:f=>{S.vol1=S.vol1*f}},
 {id:"cresc",n:"Crescimento anual",un:"%",geo:false,val:()=>S.cresc,set:f=>{S.cresc=S.cresc*f}},
 {id:"cap",n:"Rendimento da separação e da embalagem",un:"pedidos/dia",geo:false,
  val:()=>calc().capKgDia,set:f=>{S.fatorMaq=(S.fatorMaq||1)*f}},
 {id:"cv",n:"Embalagem e variáveis",un:"R$/pedido",geo:false,
  val:()=>calc().matMedio,set:f=>{S.fatMat=+((S.fatMat||1)*f).toFixed(4);VARI.forEach(v=>S.vari[v.id]=+(S.vari[v.id]*f).toFixed(4))}},
 {id:"folha",n:"Folha com encargos",un:"R$/mês",geo:false,
  val:()=>calc().folha,set:f=>{S.fator=+(S.fator*f).toFixed(4)}},
 {id:"perda",n:"Inventário cíclico e padrão de embalagem (−10% do variável)",un:"—",geo:false,
  val:()=>S.eficiencia?2:3,set:f=>{if(f<1)S.eficiencia=true;else S.eficiencia=false}},
 {id:"obra",n:"Custo de obra",un:"R$",geo:false,
  val:()=>calc().obraTotal,set:f=>OBRA.forEach(o=>{S.obra[o.id]=Math.min(1.6,S.obra[o.id]*f)})},
 {id:"cont",n:"Contingência",un:"%",geo:false,val:()=>S.cont,set:f=>{S.cont=S.cont*f}},
 {id:"aliq",n:"Alíquota efetiva",un:"%",geo:false,val:()=>S.aliq,set:f=>{S.aliq=S.aliq*f}},
 {id:"tma",n:"TMA",un:"% a.a.",geo:false,val:()=>S.tma,set:f=>{S.tma=S.tma*f}},
 {id:"peLaje",n:"Pé-direito sob laje",un:"m",geo:true,faixa:[2.20,4.50],
  val:()=>S.peLaje,set:f=>{S.peLaje=S.peLaje*f},setAbs:v=>{S.peLaje=v}},
 {id:"vigaH",n:"Altura da viga",un:"m",geo:true,faixa:[0.20,1.80],
  val:()=>S.vigaH,set:f=>{S.vigaH=S.vigaH*f},setAbs:v=>{S.vigaH=v}},
 {id:"hPorta",n:"Vão livre da porta de carga",un:"m",geo:true,faixa:[2.20,4.00],
  val:()=>S.hPortaEnrolar,set:f=>{S.hPortaEnrolar=S.hPortaEnrolar*f},setAbs:v=>{S.hPortaEnrolar=v}}
];
const CETICO=[["preço por pedido 10% menor",()=>CANAIS.forEach(c=>S.canais[c.id].preco*=0.90)],
              ["volume 15% menor",()=>{S.vol1*=0.85}],
              ["embalagem e variáveis 10% mais caros",()=>{S.fatMat=(S.fatMat||1)*1.10;VARI.forEach(v=>S.vari[v.id]*=1.10)}],
              ["CAPEX 10% maior",()=>{S.cont=S.cont+10}],
              ["separação e embalagem rendendo 10% menos",()=>{S.fatorMaq=(S.fatorMaq||1)*0.9}]];
const DISTR=[
 {id:"preco",n:"Preço por pedido",tri:[0.85,1.00,1.08]},
 {id:"vol",n:"Volume do ano 1",tri:[0.60,1.00,1.15]},
 {id:"cv",n:"Embalagem e variáveis",tri:[0.92,1.00,1.15]},
 {id:"cap",n:"Rendimento",tri:[0.85,1.00,1.05]},
 {id:"obra",n:"Custo de obra",tri:[0.90,1.00,1.25]}
];
const NAO_RESPONDE=[
 "Se as marcas de moda praia de Cabo Frio terceirizam a embalagem: hoje muitas embalam no fundo da loja, e a mudança de hábito é a premissa mais frágil do estudo.",
 "Quanto a marca paga por pedido e em quantos dias: o preço é premissa, e é a variável de que tudo depende.",
 "Se o volume das marcas aguenta o inverno: moda praia vende o dobro em novembro e dezembro do que em junho, e o fixo é o mesmo.",
 "Quantos concorrentes atendem as marcas da cidade: fulfillment do Rio, o Full dos marketplaces e a própria marca embalando.",
 "Quanto custa de verdade a peça que some ou mofa no estoque de terceiros: a taxa é hipótese.",
 "Se o prédio tem a altura para as estantes e se a maresia do canal exige desumidificação o ano inteiro.",
 "Se o aluguel de R$ 7 mil/mês é real: ele é o adversário.",
 "Se você quer isso: o modelo compara EBITDA com aluguel, não com sossego nem com o que você prefere fazer da vida."
];

/* ================= IDENTIDADE E TEXTOS ================= */
const NEG={titulo:"Envio Prime",slug:"envio_prime",negocio:"fulfillment de e-commerce para marcas de moda praia",
  leiame:"uma operacao de fulfillment (guardar, separar, embalar e despachar) para as marcas de moda praia",
  ele:"a operação",pron:"ela",Curto:"Operação",
  un:"pedido",uns:"pedidos",unsCurto:"pedidos",ud:"ped",dec:0,unMil:"mil pedidos",unPreco:"R$/pedido"};
const FASES3=[["0","Briefing"],["1","Mercado"],["2","Planta baixa"],["2B","O terceiro eixo"],["3","O estoque e a bancada"],
  ["4","Obra"],["5","Pessoas"],["6","Custo"],["6B","Turno cheio"],["7","Veredicto"]];
const SAZ_NOMES={moda:"verão e Black Friday",troca:"depois do pico"};
const SAZ_COLS={moda:"Pedidos das marcas",troca:"Trocas e devoluções"};
const ALTO_ID="E07";
const REF_VIOL=["Z04","Z06"];
const PORTOES=[
 ["alvara","Consulta de uso do solo na PMCF","Gratuita antes de qualquer obra. Armazém e expedição de e-commerce é serviço de baixo impacto; o que pesa é o VUC da transportadora na avenida. Confirmar antes custa nada."],
 ["pesquisa","Pesquisa com as marcas da Rua dos Biquínis e do e-commerce local","Quantas marcas vendem online, quantos pedidos por mês, quem embala hoje (a dona, no fundo da loja) e quanto pagariam por pedido. Dez conversas valem mais do que qualquer premissa."],
 ["prolagos","Contratos com cinco marcas âncora","Cinco marcas com 500 pedidos por mês pagam o fixo do primeiro ano; sem elas, o galpão fica cheio de estante vazia."],
 ["rt","Inventário cíclico e conferência por bipagem","O estoque é da marca: peça que some é descontada da fatura. Contagem semanal por endereço e bipagem na embalagem."],
 ["treino","Treinamento da equipe no WMS e no padrão de embalagem de cada marca",""],
 ["temporarios","Embaladoras temporárias para novembro a janeiro",""]];
const ITENS_CAMPO=[
 ["peDireito","Pe-direito livre sob laje","medir em tres pontos afastados; anotar o menor",""],
 ["vigas","Altura e largura das vigas e o vao entre elas","medir da face inferior da viga ate o piso",""],
 ["pilares","Posicao e secao dos pilares","trena a partir das duas empenas; anotar secao em cm",""],
 ["portas","Altura livre sob as portas de enrolar","com a porta recolhida: o VUC da transportadora encosta na porta B",""],
 ["peitoril","Umidade: manchas, mofo e ventilação cruzada","a lycra mofa: medir a umidade relativa num dia de vento do canal",""],
 ["forro","Forro existente: material e altura","",""],
 ["degrau","Cota do patio em relacao ao piso interno","o degrau decide o carrinho de caixas e a acessibilidade do atendimento",""],
 ["energia","Entrada de energia, quadro e demanda disponivel","impressoras, desumidificador e o split do estoque",""]];
const CORRIGE_NEG={
  Z20:{lab:"instalar 8 câmeras com gravação",ok:()=>S.eq.E05==="none",fn:()=>{S.eq.E05="basico"}},
  Z22:{lab:"instalar ventilação e desumidificador portátil",ok:()=>S.eq.E06==="none",fn:()=>{S.eq.E06="basico"}}};
const PROVAS=[
 ["Pé-direito de 2,30 m bloqueia as estantes","Z01",()=>{S.peLaje=2.30}],
 ["Difusor sobre as bancadas vira bloqueio","Z04",()=>{S.dutoRota="linha";S.evapSobre="linha";S.eq.E06="padrao"}],
 ["Evaporador sem dreno vira bloqueio","Z12",()=>{S.eq.E06="padrao";S.evapDreno=false}],
 ["Estante acima do ombro vira aviso","Z14",()=>{S.alturaEmp=2.60}],
 ["Estoque sem câmera vira erro","Z20",()=>{S.eq.E05="none"}],
 ["Pátio sem vaga de coleta vira aviso","Z21",()=>{S.treeP={d:"v",cuts:[0.62],kids:[{r:"man"},{d:"h",cuts:[0.12,0.24,0.36],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"man"}]}]}}],
 ["Estoque sem desumidificação vira erro","Z22",()=>{S.eq.E06="none"}]];
const VISTAS=[
 {id:"geral",n:"Geral",ap(){CAM.modo="orb";ACOES3.fit();CAM.corte=1.20;S.corteLocal=null}},
 {id:"linha",n:"Estoque",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["arm"]);
   CAM.yaw=-1.15;CAM.pitch=0.92;CAM.dist=10;CAM.corte=2.40;S.corteLocal=null;S.layers3.equip=true}},
 {id:"barreira",n:"Recebimento",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["rec","ves"]);
   CAM.yaw=-0.6;CAM.pitch=0.7;CAM.dist=8;CAM.corte=1.40;S.corteLocal=null;S.corMode="zona";S.layers3.zonas=true}},
 {id:"frio",n:"Embalagem e expedição",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["emb","exp"]);
   CAM.yaw=-2.1;CAM.pitch=0.62;CAM.dist=9.5;CAM.corte=3.00;S.corteLocal=null}},
 {id:"receb",n:"Atendimento e estúdio",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["atd","esc"]);
   CAM.yaw=1.4;CAM.pitch=0.35;CAM.dist=7.5;CAM.corte=2.60;S.corteLocal=null}},
 {id:"oper",n:"Da embaladora",ap(){const c=centroSala("emb");CAM.modo="fp";CAM.fp=[c[0],1.65,c[2]+1.4];
   CAM.fyaw=-Math.PI/2;CAM.fpit=-0.05}}];
const TXT={
  f0lead:"Esta versão testa uma <b>operação de fulfillment para as marcas de moda praia</b>: a marca manda o estoque, a operação guarda cada SKU num endereço, separa o pedido que entrou na loja virtual, embala com o papel de seda e o cartão da marca e despacha pela transportadora. Estante, bancada e um sistema de armazém por assinatura mantêm o CAPEX abaixo de R$ 200 mil. A régua é a mesma que julgou a marcenaria e a confecção de moda praia.",
  f0porqueTit:"Por que fulfillment de moda praia.",
  f0porque:"A Rua dos Biquínis, na Gamboa, é um polo de moda praia que vende para o Brasil inteiro pela internet, e muitas marcas ainda embalam no fundo da loja, com a dona na bancada em dezembro. Terceirizar a embalagem libera a marca para vender e desenhar. O imóvel serve: galpão seco para estante, pátio para a coleta das transportadoras e perto das marcas. A margem vem de volume e de padrão (pedido certo, embalado bonito, no dia); o risco é a sazonalidade — junho vende um terço de dezembro — e a mudança de hábito da marca, que precisa confiar o estoque a outra pessoa.",
  f0decide:"Ele verifica o estoque endereçado com a altura das estantes sob a viga, as bancadas de embalagem, a sala fechada de devoluções, a câmera e a desumidificação do estoque de terceiros, a iluminância de conferência, o giro do carrinho, as vagas de coleta, a rota de fuga, os metros caminhados por pedido e a demanda mês a mês com o pico de novembro e dezembro. Ele <b>não</b> substitui os contratos com as marcas, projeto executivo, ART nem projeto de incêndio.",
  regiao:"marcas de Cabo Frio e da Região dos Lagos",faixaMercado:[10,300,5],faixaVol:[10,400,5],passoPreco:0.10,
  p3Nome:"Hora extra e turno curto extra no pico — novembro a janeiro",
  p3Desc:R=>`Eleva a separação e a embalagem em ${PCT((HORA_EXTRA-1)*100)} na Black Friday e no verão, a 150% da hora: cerca de ${BRL(R.folhaProd*(HORA_EXTRA-1)*1.5*PICO_PROD.length)}/ano de folha.`,
  matNome:"embalagem",
  f1preco:"O preço é o que a marca paga por pedido despachado, com a armazenagem incluída; a embalagem (envelope, papel de seda, cartão) vai no pedido. Sem câmera, a marca não entrega o estoque (−15%); sem sistema de armazém integrado, a marca média não entra (−10%); o estúdio de fotos traz a marca pequena (+5%).",
  f1curva:"O pedido de e-commerce não espera: o que não sai no dia a marca despacha sozinha, e 70% disso não volta. Novembro e dezembro vendem mais que o dobro de junho; a troca e a devolução chegam depois do pico.",
  f2lead:"A operação fica ao fundo: o estoque endereçado em três corredores, as bancadas de embalagem e a sala fechada de trocas e devoluções. Na fachada, o recebimento com a porta A, o vestiário, o atendimento às marcas com o estúdio de fotos, a integração e a expedição com a porta B, junto às vagas de coleta.",
  producao:"operação",vagasNome:"Vagas de coleta no patio",
  f2blead:"Pe-direito, vigas, forro e a altura das estantes endereçadas e do estúdio.",
  estantesNome:"estantes endereçadas",forroDesc:"Sem forro, poeira da laje cai no estoque e na peça fora do saco.",
  dutoOps:[["circ","a expedição e o recebimento"],["linha","as bancadas de embalagem"]],
  evapOps:[["circ","a parede do estoque"],["linha","as bancadas de embalagem"]],
  drenoDesc:"Sem dreno, condensado pinga na peça e no papel de seda. Bloqueio.",
  altoNome:"o suporte do fundo infinito do estúdio",altoRisco:"Se ele cair sob a viga, o estúdio muda de lugar — as estantes de 1,80 m vêm logo atrás.",
  f3lead:R=>`O estoque tem ${R.pos} endereços; cada um sustenta ${N2(PED_POS,1)} pedido por dia. ${R.cftv?"":"<b>Sem câmera, a marca não entrega o estoque.</b>"}`,
  f3cap:R=>`Uma separadora tira ${SEP_H} pedidos por hora com o sistema de armazém e o carrinho; uma embaladora fecha ${EMB_H} pedidos por hora no padrão da marca (uma por bancada); a expedição confere ${EXP_H} por hora. Cada linha pesa diferente: o lote para o Full dos marketplaces quase não passa pela bancada, e a devolução pesa o dobro no recebimento.`,
  carteiraNome:"A demanda mês a mês",perdaNome:"Pedido que a marca despachou sozinha",
  f3pico:"De novembro a janeiro o volume mais que dobra. A operação que atrasa na Black Friday perde a marca para o ano seguinte. Hora extra, embaladora temporária e a terceira bancada seguram o pico; em junho a equipe folga e faz inventário.",
  trifDesc:"Impressoras, desumidificador, split do estoque e o estúdio: a carga é pequena, mas conferir a entrada antes custa pouco.",
  incDesc:"Tecido, papelão e plástico: carga de incêndio alta para um galpão pequeno. Extintor certo e rota livre são o que o Corpo de Bombeiros confere.",
  eficNome:"Inventário cíclico e padrão de embalagem por marca",eficDesc:"Contagem semanal, foto do pedido fechado e gabarito de embalagem: corta 10% dos variáveis (sumiço, avaria, etiqueta refeita), com R$ 3.000 de CAPEX.",
  giroDesc:"a marca paga a fatura do mês no dia 10 do mês seguinte; um mês de embalagem em estoque",
  depFora:{veiculo:"sem veículo próprio"},
  f5hint:"Quem vende é o sócio, de loja em loja na Rua dos Biquínis. A embaladora é quem faz a marca parecer grande: o padrão de cada marca fica na bancada, com foto.",
  garantiaNome:"Erro de separação: reenvio e frete por conta da operação",
  freteNome:"Sem veículo de coleta",freteDesc:"Não compra a Fiorino; a marca traz o estoque e busca a avaria. A marca pequena fica 8% menor.",
  f6blead:"o pedido é separado no corredor, levado à bancada, embalado, conferido e posto na gaiola da transportadora.",
  copNome:"Janela perdida com a integração dos pedidos da noite e o fechamento",
  bossFiscalNome:"A Dona da Marca Sobe na Escada",bossPicoNome:"Black Friday: a Semana que Paga o Ano",
  fiscalOk:"Nada acima da linha reprova: difusores e evaporadores estão fora da projeção das bancadas.",
  sol:"Sol direto sobre o estoque desbota a estampa na prateleira e esquenta o elástico: a peça que sai amarelada volta como troca.",
  r07:"a mesa de conferência",cvNome:"Embalagem e variáveis",
  z19quando:"de novembro a janeiro (Black Friday e verão)",
  z19como:"Hora extra no pico (fase 1), embaladora temporária e terceira bancada (fases 3 e 5)."
};
H.fase5ok=R=>R.pessoas.des>0&&R.pessoas.rec>0&&R.pessoas.sep>0&&R.pessoas.emb>0&&R.pessoas.exp>0;
H.bossPico=()=>{
  const R=calc(), T=R.temporada, pico=T.meses.filter(x=>PICO_PROD.includes(x.m));
  const dem=pico.reduce((a,x)=>a+x.dem,0), prod=pico.reduce((a,x)=>a+x.prod,0), des=pico.reduce((a,x)=>a+x.perda,0);
  const txt=[`Novembro a janeiro, ano 3: entram ${NUM(dem*1000,0)} pedidos, e a operação despacha até ${NUM(prod*1000,0)}${S.p3?" com a hora extra":""}.`];
  txt.push(des*1000<=1?"Nenhum pedido fica para a marca despachar: a operação segura o pico.":`${NUM(des*1000,0)} pedidos a marca despacha sozinha (${BRL(des*1000*R.precoMedio)} de receita). O gargalo é ${R.gargalo.n.toLowerCase()}.`);
  ZV.filter(v=>["Z08","Z19","Z21","Z22"].includes(v.cod)).forEach(v=>txt.push(`${v.cod} — ${v.msg}`));
  return `<div class="hint ${des*1000>1?"bad":""}"><b>${TXT.bossPicoNome}</b><br>${txt.join("<br>")}</div>`;
};
H.auditoria=p=>{
  p("Pedido embalado na cena","0,30 × 0,22 × 0,05","m","catálogo","produto na cena");
  p("Recebimento e endereçamento",NUM(REC_H,0),"pedidos-equivalentes/h por pessoa","hipótese","capacidade");
  p("Separação",NUM(SEP_H,0),"pedidos/h por separador","hipótese","capacidade");
  p("Embalagem",NUM(EMB_H,0),"pedidos/h por embaladora","hipótese","capacidade");
  p("Expedição",NUM(EXP_H,0),"pedidos/h por pessoa","hipótese","capacidade");
  p("Atendimento às marcas",NUM(DES_DIA,0),"pedidos/dia por pessoa","hipótese","capacidade");
  p("Pedidos por posição de estoque",N2(PED_POS,1),"por dia","hipótese","capacidade");
  CANAIS.forEach(c=>p("Pesos rec/sep/emb/exp — "+c.n.split(" (")[0],[c.rec,c.sep,c.emb,c.exp].map(v=>N2(v,1)).join(" / "),"","hipótese","capacidade"));
  p("Avaria sem desumidificação","1,5","× a taxa","hipótese","custo variável, Z22");
  p("Sumiço sem câmera","1,8","× a taxa","hipótese","custo variável, Z20");
  p("Marcas sem câmera","−15","%","hipótese","receita");
};
//@@HTML
TITULO=Envio Prime
NEGOCIO=fulfillment de e-commerce para marcas de moda praia
NAO_AJUDA=preço por pedido que as marcas aceitam, adesão das marcas à terceirização, sazonalidade real
ARQUIVO=envio_prime_3d_v1.0.html
//@@TARDIO
function detalhesEquip(e,B){
  const moda={cores:["rosa","azul","amarelo","lona2","papelao"]};
  switch(e.id){
    case "E01": forma(e,B,"bancada",Object.assign({n:4},moda)); break;
    case "E04": case "M01": case "M02": forma(e,B,"estante",Object.assign({niveis:5,n:6},moda)); break;
    case "E07": {                                   /* estudio: fundo infinito e softboxes */
      const K=ctxEquip(e,B), {M,add,mat,hz}=K;
      add(mat(M(0.05,0.85,0.90,0.08,0.00,hz,{lod:1,org:"visual"}),"plast"));
      add(mat(M(0.05,0.30,0.90,0.55,0.00,0.02,{lod:1,org:"visual"}),"plast"));
      [0.02,0.88].forEach(u=>{add(mat(M(u,0.10,0.04,0.04,0,hz*0.75,{lod:2,org:"catalogo"}),"borr"));
        add(mat(M(u-0.01,0.05,0.10,0.12,hz*0.70,0.25,{geo:"chanf",ch:0.02,lod:2,org:"catalogo"}),"plast"));});
      break; }
    case "E12": forma(e,B,"bancada",{n:3}); break;
    case "M03": forma(e,B,"carrinho",Object.assign({n:3},moda)); break;
    case "M04": forma(e,B,"bancada",Object.assign({n:3},moda)); break;
    case "M05": forma(e,B,"gaiola",{larg:0.80,cheio:0.6,cores:["papelao","plast"]}); break;
    case "M06": forma(e,B,"estacao",{telas:1}); break;
    case "M07": forma(e,B,"caixas",{n:3}); break;
    case "M08": forma(e,B,"armario",{portas:4}); break;
    case "M09": forma(e,B,"mesa",Object.assign({n:3},moda)); break;
    case "M10": forma(e,B,"estacao",{telas:2}); break;
    case "M11": forma(e,B,"bancada",Object.assign({n:2},moda)); break;
    case "M12": forma(e,B,"estante",Object.assign({niveis:4,n:3},moda)); break;
  }
}
