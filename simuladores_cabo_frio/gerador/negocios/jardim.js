/* ==================================================================
   JARDIM PRIME 3D — v1.0 (motor herdado do Pastel Prime 3D v3.2, pelas
   versoes Gelo, Enxoval, Praia, Visual, Uniforme e Planejado Prime 3D)
   Estudo de viabilidade de um garden center com paisagismo — loja de
   plantas, vasos e insumos com viveiro no patio, equipes de manutencao
   mensal de jardins de casas de veraneio, condominios e pousadas, poda e
   implantacao de paisagismo — em Novo Portinho, Cabo Frio (RJ), com
   CAPEX abaixo de R$ 200 mil, contra a alternativa de alugar o imovel por
   R$ 7 mil/mes. Arquivo unico, offline. A unidade do modelo e o
   atendimento — uma venda de balcao, uma visita de manutencao, uma poda
   ou uma implantacao —; o motor conta em mil atendimentos.
   O que e deste negocio: tabelas de dados, capacidade por etapa (equipes
   em campo, balcao, preparo e envasamento, o viveiro do patio pela area
   de sombrite, projeto e agenda), as regras Z04, Z08, Z11, Z14, Z20 a Z22,
   o turno, as formas, o viveiro na cena e os textos das fases.
   ================================================================== */

/* ================= EQUIPAMENTOS ================= */
/* preço em R$; w/hh = pegada. Base: faixas de mercado, set/2026, ±40% —
   cotar. A tese é CAPEX baixo: sombrite, bancada, ferramenta de jardim e
   uma loja simples; a planta é estoque (capital de giro), não CAPEX.       */
const EQ=[
 {id:"E01",n:"Bancada de envasamento",req:"Onde a muda do produtor vira planta de vitrine: vaso, substrato, adubo e acabamento",kw:0.2,etapa:"preparo",
  t:[{k:"basico",n:"Bancada de alvenaria com tampo e peneira",p:3500,fat:1.00,w:2.40,hh:0.90},
     {k:"padrao",n:"Bancada com misturador de substrato e peneira elétrica (+25%)",p:12000,fat:1.25,w:3.00,hh:0.90}]},
 {id:"E02",n:"Ferramentas das equipes",req:"Roçadeira, cortador, soprador, tesoura e podão: um kit por dupla de jardineiros",kw:0,etapa:"campo",
  t:[{k:"basico",n:"2 kits a gasolina",p:14000,fat:1.00,kits:2},
     {k:"padrao",n:"2 kits a bateria e cortador autopropelido (+12%)",p:26000,fat:1.12,kits:2},
     {k:"premium",n:"3 kits a bateria (três duplas)",p:39000,fat:1.12,kits:3}]},
 {id:"E03",n:"Viveiro no pátio",req:"Planta viva vende; planta murcha vira perda. Sombrite, bancada e irrigação decidem quanto o pátio sustenta",kw:0.5,etapa:"viveiro",
  t:[{k:"basico",n:"Sombrite 50%, bancadas de bloco e gotejamento",p:12000,fat:1.00},
     {k:"padrao",n:"Estufa leve com nebulização e bancadas metálicas (+25% de plantas por m²)",p:30000,fat:1.25}]},
 {id:"E04",n:"Estantes do depósito",req:"Adubo, fertilizante, vaso, pedra e ferramenta endereçados",kw:0,etapa:"-",
  t:[{k:"basico",n:"Estantes de aço de 4 m",p:5000,w:4.00,hh:0.60},{k:"padrao",n:"Estantes mais fundas e porta-paletes baixo",p:10000,w:4.00,hh:0.90}]},
 {id:"E05",n:"Oficina de ferramentas",req:"Afiar lâmina, trocar fio e regular carburador: roçadeira parada é equipe parada",kw:0.8,etapa:"-",
  t:[{k:"basico",n:"Bancada com esmeril e ferramentas",p:3000}]},
 {id:"E06",n:"Climatização da loja",req:"Planta de interior e cliente no verão de Cabo Frio",kw:1.5,etapa:"-",
  t:[{k:"basico",n:"Ventilação natural e ventiladores (−4% no balcão)",p:1500,f:0.96},{k:"padrao",n:"Split de 24 mil BTU na loja",p:7500,f:1.00}]},
 {id:"E07",n:"Armário corta-fogo para combustível",req:"Gasolina e óleo 2T das roçadeiras guardados longe da loja e do adubo",kw:0,etapa:"-",crit:true,
  t:[{k:"none",n:"Não — galão no chão da oficina",p:0},{k:"basico",n:"Armário corta-fogo de 90 L",p:3500}]},
 {id:"E08",n:"Veículo",req:"Planta de 2 m, pallet de grama, ferramenta e resíduo verde até a casa do cliente",kw:0,etapa:"-",
  t:[{k:"none",n:"Não comprar — carreto e aplicativo de frete",p:0,veic:0},{k:"basico",n:"Picape usada com caçamba",p:72000,veic:1}]},
 {id:"E09",n:"Projeto de paisagismo",req:"O cliente de implantação compra o desenho antes de comprar a planta",kw:0.3,etapa:"projeto",
  t:[{k:"basico",n:"Projeto 2D e fotos",p:1500,f:1.00,proj:1.00},{k:"padrao",n:"Software de paisagismo 3D e tablet (+6% na implantação; +30% no projeto)",p:7000,f:1.06,proj:1.30}]},
 {id:"E11",n:"Caixa e emissor fiscal",req:"Balcão com cartão, PIX e nota",kw:0.1,etapa:"-",
  t:[{k:"basico",n:"PDV com maquininha e emissor fiscal",p:3000}]},
 {id:"E12",n:"Compostagem",req:"Poda e roçada geram resíduo verde: composto vira substrato e o descarte cai à metade",kw:0,etapa:"-",
  t:[{k:"none",n:"Não — descarte em caçamba",p:0,comp:1.0},{k:"basico",n:"Composteira de resíduo verde no pátio",p:2500,comp:0.5}]}
];

/* ================= OBRA ================= */
const OBRA=[
 {id:"piso",n:"Piso da loja e do depósito regularizado",min:4000,max:9000},
 {id:"eletr",n:"Elétrica: iluminação da loja, bomba da irrigação e quadro",min:4000,max:8000},
 {id:"vedac",n:"Divisórias: defensivos em alvenaria trancada, oficina e escritório",min:5000,max:10000},
 {id:"vest",n:"Vestiário, copa e sanitário (adequação)",min:3000,max:6000},
 {id:"fach",n:"Fachada, vitrine e portão para o viveiro",min:3500,max:8000},
 {id:"patio",n:"Pátio do viveiro: piso drenante, caimento e ponto de água",min:5000,max:12000},
 {id:"inc",n:"Prevenção de incêndio: extintores, sinalização e iluminação de emergência",min:3000,max:6000},
 {id:"proj",n:"Projetos, ART e laudo do Corpo de Bombeiros",min:3000,max:6000},
 {id:"lic",n:"Licenças: alvará, bombeiros e registro de comércio de defensivos",min:2000,max:5000},
 {id:"marca",n:"Marca, Google, Instagram e visitas a condomínios, pousadas e imobiliárias",min:3000,max:8000}
];
const OBRA_DEP={};

/* ================= PESSOAS ================= */
/* des = agenda e vendas; proj = projeto de paisagismo; cam = jardineiro em
   campo; bal = balcao da loja; pre = preparo, envasamento e rega         */
const POSTOS=[
 {id:"p1",n:"Gestor / sócio-paisagista (pró-labore; projeta, vende e fecha com condomínio e pousada)",sal:6000,fator:1.15,proj:0.4,des:0.4,bal:0.1,on:true,fixo:true},
 {id:"p2",n:"Jardineiro(a) 1",sal:2200,cam:1,on:true},
 {id:"p3",n:"Jardineiro(a) 2",sal:2200,cam:1,on:true},
 {id:"p4",n:"Jardineiro(a) 3",sal:2200,cam:1,on:true},
 {id:"p5",n:"Jardineiro(a) 4 — líder de equipe",sal:2500,cam:1,on:true},
 {id:"p6",n:"Vendedor(a) do viveiro — rega, envasa e atende",sal:1900,bal:0.5,pre:0.5,on:true},
 {id:"p7",n:"Jardineiro(a) 5 (opcional; pede o terceiro kit)",sal:2200,cam:1,on:false},
 {id:"p8",n:"Auxiliar de viveiro (opcional)",sal:1800,pre:0.6,bal:0.4,on:false}
];

/* ================= FIXO ================= */
const FIXO=[
 {id:"energia",n:"Energia: loja, bomba da irrigação e escritório",v:500},
 {id:"agua",n:"Água: rega do viveiro todo dia",v:900},
 {id:"cont",n:"Contabilidade",v:1100},
 {id:"seg",n:"Seguros: patrimônio e responsabilidade na casa do cliente",v:400},
 {id:"mkt",n:"Marketing: Google, Instagram e visitas a condomínios, pousadas e imobiliárias",v:1800},
 {id:"ti",n:"Sistema, internet e telefone",v:400},
 {id:"hig",n:"Uniformes, EPIs e limpeza",v:350},
 {id:"man",n:"Manutenção das roçadeiras, cortadores e da irrigação",v:400},
 {id:"veic",n:"Veículo próprio: seguro, IPVA e manutenção fixa",v:1200,dep:"veiculo"}
];

/* ================= VARIÁVEL (por atendimento) ================= */
/* a venda de balcao quase nao usa variavel de campo: cvf da linha = 0,05 */
const VARI=[
 {id:"frete",n:"Carreto e aplicativo de frete para as equipes",cons:1,un:"—",preco:14,pun:"R$/atendimento"},
 {id:"comb",n:"Combustível das roçadeiras e do soprador",cons:1,un:"—",preco:4,pun:"R$/atendimento"},
 {id:"res",n:"Descarte de resíduo verde (poda e roçada)",cons:1,un:"—",preco:6,pun:"R$/atendimento"},
 {id:"sac",n:"Sacola, vaso de transporte e nota",cons:1,un:"—",preco:1,pun:"R$/atendimento"},
 {id:"energia",n:"Energia por atendimento",cons:0.2,un:"kWh",preco:0.98,pun:"R$/kWh"}
];

/* ================= LINHAS ================= */
/* share = fracao dos atendimentos; preco e mat (planta, insumo, grama) em
   R$ por atendimento; hCampo, hBal, hProj = horas por atendimento; pl =
   plantas que saem do viveiro por atendimento                            */
const CANAIS=[
 {id:"vb",n:"Venda de balcão: plantas, vasos, terra, adubo e ferramentas",share:75,preco:85,mat:48,saz:"primavera",hCampo:0,hBal:0.20,hProj:0,pl:2.5,cvf:0.05},
 {id:"mj",n:"Manutenção mensal de jardins — casas de veraneio, condomínios e pousadas (por visita)",share:20,preco:220,mat:20,saz:"jardim",hCampo:2.5,hBal:0,hProj:0,pl:0.5},
 {id:"pd",n:"Poda, roçada e limpeza de terreno avulsa",share:4.3,preco:420,mat:30,saz:"obra",hCampo:5.0,hBal:0,hProj:0,pl:0},
 {id:"pi",n:"Implantação de paisagismo (projeto e plantio)",share:0.7,preco:5500,mat:2500,saz:"obra",hCampo:32,hBal:0,hProj:6,pl:80}
];
const SAZ=[["Janeiro",110,"Veranista em casa: jardim bonito para o verão"],["Fevereiro",90,"Carnaval"],["Março",85,"Fim da temporada"],["Abril",80,"Baixa"],["Maio",95,"Dia das Mães: a planta de presente"],["Junho",75,"Inverno"],["Julho",75,"Inverno"],["Agosto",90,"A poda antes da primavera"],["Setembro",130,"Primavera: a loja enche"],["Outubro",130,"Plantio e implantação antes do verão"],["Novembro",120,"Última janela antes do réveillon"],["Dezembro",120,"Natal e casa pronta"]];
const SAZ_LINHA={
 primavera:[110,90,85,80,95,75,75,90,130,130,120,120],
 jardim:[115,110,105,95,85,80,80,85,100,110,115,120],
 obra:[90,80,90,90,85,80,85,105,130,130,125,110]
};

/* ================= PREMISSAS DO GARDEN (hipoteses declaradas) ================= */
const PRE_H=20;             /* plantas envasadas e preparadas por hora por pessoa */
const PLANTAS_M2=12;        /* plantas por m² de bancada de viveiro */
const GIRO_DIAS=18;         /* dias que a planta fica no viveiro antes de vender */
const DES_DIA=80;           /* atendimentos agendados e vendidos por pessoa por dia */
const DESLOC=0.80;          /* fracao do dia da equipe que sobra depois do deslocamento */
const EFIC=0.90;            /* fracao produtiva do turno */
const GARANTIA=0.02;        /* replantio de muda que morreu, fracao do preco */
const DESISTE=0.35;         /* quem espera mais de um mes procura outro jardineiro ou outra loja */
const PICO_PROD=[8,9,10];   /* setembro a novembro */
const HORA_EXTRA=1.20;      /* sabado e hora extra na primavera */
const FV_KWH=700, FV_COMP=0.85, FV_CAPEX=25000;    /* 5 kWp em Cabo Frio, compensacao liquida */
const VAGA_M2=12.5, VAGAS_MIN=3;                    /* vaga de cliente da loja */

/* ================= SETORES / PLANTA ================= */
const CLS={limpa:{n:"Preparo e envasamento",c:"#2E9C86"},
 circ:{n:"Circulação",c:"#5B7080"},
 frio:{n:"Viveiro — sombrite e irrigação",c:"#4E8A4A"},
 inter:{n:"Depósito, oficina e carga das equipes",c:"#D79A2E"},
 suja:{n:"Defensivos e adubos químicos — trancado",c:"#AC5F48"},
 barreira:{n:"Vestiário e copa",c:"#6E5AB0"},
 publica:{n:"Loja e balcão",c:"#3B7CA8"},
 adm:{n:"Projeto de paisagismo e agenda",c:"#7C93A1"},
 tec:{n:"Técnica",c:"#55707E"}};
const ROOM={
 agr:{n:"Defensivos e adubos químicos",c:"suja",a:5,t:"alvenaria trancada, ventilada"},
 pro:{n:"Preparo e envasamento",c:"limpa",a:18},
 dep:{n:"Depósito de insumos: substrato, adubo, vaso e pedra",c:"inter",a:28},
 ofi:{n:"Oficina de ferramentas e combustível",c:"inter",a:10},
 loj:{n:"Loja e balcão",c:"publica",a:24},
 esc:{n:"Projeto de paisagismo e agenda",c:"adm",a:6},
 ves:{n:"Vestiário, copa e sanitário",c:"barreira",a:7},
 car:{n:"Carga das equipes e recebimento",c:"inter",a:10}
};
const ROOM_P={
 ret:{n:"Reservatório de água da irrigação",c:"tec",a:3},
 res:{n:"Compostagem e resíduo verde",c:"suja",a:3},
 fos:{n:"Fossa e filtro existentes",c:"tec",a:5},
 vag:{n:"Vagas de clientes da loja",c:"publica",a:37},
 viv:{n:"Viveiro com sombrite e irrigação",c:"frio",a:90},
 man:{n:"Faixa de acesso junto à fachada",c:"circ",a:0}
};
const LIG=[
 {a:"car",b:"dep",t:"porta",d:"Carga → depósito: pallet de substrato e vaso"},
 {a:"car",b:"ofi",t:"porta",d:"Carga → oficina: a equipe sai com a roçadeira"},
 {a:"car",b:"ves",t:"porta",d:"Entrada de pessoal → vestiário"},
 {a:"ves",b:"dep",t:"porta",d:"Vestiário → depósito"},
 {a:"dep",b:"pro",t:"porta",d:"Depósito → preparo: substrato e vaso"},
 {a:"pro",b:"loj",t:"porta",d:"Preparo → loja: a planta envasada vai para a venda"},
 {a:"esc",b:"loj",t:"porta",d:"Projeto → loja: o cliente vê o desenho na tela"},
 {a:"agr",b:"loj",t:"porta",d:"Defensivos → balcão: vendido com receituário, fica trancado"}
];
const CRUZA_OK=["dep","loj","car","ves","esc"];
const FLOW=["car","dep","pro","loj"];
const WI=14.70, HI=9.70, TP=0.15, TI=0.10;
const WP=15.00, HP=13.00;

/* árvore de divisórias. Ao fundo: defensivos trancados, preparo e
   envasamento, depósito de insumos e a oficina de ferramentas; na
   fachada, que dá para o viveiro: a loja com a porta de vidro, o projeto,
   o vestiário e a carga das equipes com a porta B.
   x: 0 | defensivos / loja 2,00 preparo | 6,00 depósito 7,10 projeto | 9,10 vestiário | 11,10 carga | 12,30 oficina | 14,70 */
const L1=()=>({d:"v",cuts:[0.59794],kids:[
  {d:"h",cuts:[0.13605,0.40816,0.83673],kids:[{r:"agr"},{r:"pro"},{r:"dep"},{r:"ofi"}]},
  {d:"h",cuts:[0.48299,0.61905,0.75510],kids:[{r:"loj"},{r:"esc"},{r:"ves"},{r:"car"}]}
]});
/* patio: faixa de acesso junto a fachada, o viveiro no meio e, junto ao
   portao, compostagem, reservatorio, fossa e as vagas                    */
const L1P=()=>({d:"v",cuts:[0.12000,0.62000],kids:[
  {r:"man"},
  {r:"viv"},
  {d:"h",cuts:[0.12000,0.24000,0.36000],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"vag"}]}
]});

const FOOT={
 E01:{n:"Bancada de envasamento",w:2.40,h:0.90,op:0.90,z:["limpa"],x:2.40,y:0.40,
      s:"A muda do produtor vira planta de vitrine: vaso, substrato e acabamento."},
 E04:{n:"Estantes do depósito",w:4.00,h:0.60,op:0.90,z:["inter"],x:6.50,y:0.20,
      s:"Adubo, fertilizante, vaso e ferramenta. A altura é a da fase 2B."},
 E05:{n:"Bancada de afiação e conserto",w:1.80,h:0.70,op:0.90,z:["inter"],x:12.60,y:0.40,
      s:"Lâmina afiada e fio trocado antes de a equipe sair."},
 M01:{n:"Carrinho de substrato",w:1.20,h:0.70,op:0.70,z:["limpa","inter"],x:2.40,y:2.20,mob:1,
      s:"Substrato e vaso do depósito para a bancada."},
 M02:{n:"Vasos envasados aguardando a loja",w:1.60,h:1.00,op:0.80,z:["limpa"],x:3.80,y:3.55,mob:1,
      s:"Planta pronta, etiquetada com preço e cuidado."},
 M03:{n:"Pallets de substrato e terra",w:2.20,h:1.10,op:0.80,z:["inter"],x:6.40,y:2.00,mob:1,
      s:"Substrato, terra vegetal e adubo orgânico em saco."},
 M04:{n:"Pallets de vasos e pedras",w:2.20,h:1.10,op:0.80,z:["inter"],x:8.70,y:2.00,mob:1,
      s:"Vaso de plástico, cerâmica e cimento; pedra e seixo decorativo."},
 M05:{n:"Armário das roçadeiras e do combustível",w:1.20,h:0.60,op:0.80,z:["inter"],x:13.20,y:3.40,mob:1,
      s:"Roçadeira, soprador e o galão de gasolina. O armário corta-fogo vem da fase 3."},
 M06:{n:"Gôndola de vasos e insumos",w:3.60,h:0.60,op:0.90,z:["publica"],x:0.40,y:6.10,mob:1,
      s:"Vaso, substrato em saco, adubo e ferramenta de jardim."},
 M07:{n:"Mesa de plantas de interior",w:1.80,h:0.90,op:0.80,z:["publica"],x:0.60,y:7.60,mob:1,
      s:"Planta de sombra dentro da loja: o que o cliente de apartamento leva."},
 M08:{n:"Balcão e caixa",w:1.80,h:0.70,op:0.80,z:["publica"],x:4.80,y:8.60,mob:1,
      s:"Venda, nota e a dúvida de cuidado que o cliente traz no celular."},
 M09:{n:"Estação de projeto e agenda",w:1.20,h:0.65,op:0.60,z:["adm"],x:7.50,y:8.80,mob:1,
      s:"O projeto em 3D, a rota das equipes e o contrato que vence."},
 M10:{n:"Armários da equipe",w:1.60,h:0.45,op:0.70,z:["barreira"],x:9.30,y:9.10,mob:1,
      s:"Uniforme, bota e EPI."},
 M11:{n:"Carrinho de ferramentas da equipe",w:1.40,h:0.80,op:0.80,z:["inter"],x:11.40,y:6.10,mob:1,
      s:"O kit da dupla, conferido na saída e na volta."},
 M12:{n:"Armário trancado de defensivos",w:1.40,h:0.60,op:0.80,z:["suja"],x:0.30,y:0.40,mob:1,
      s:"Defensivo só sai com receituário agronômico."}
};
const CAMADAS=[["zonas","Zonas do garden"],["paredes","Paredes e portas"],["equip","Equipamentos"],
 ["cotas","Cotas"],["hidro","Água e esgoto"],["fluxo","Fluxo da planta"],["pilares","Pilares"],["texto","Etiquetas"]];
const HIDRO=[
 {t:"ralo",x:10.10,y:9.35,lab:"Ralo sifonado — sanitário e copa"},
 {t:"agua",x:9.30,y:6.20,lab:"Água do sanitário e da copa"},
 {t:"agua",x:5.60,y:0.30,lab:"Torneira da bancada de envasamento"},
 {t:"ralo",x:4.00,y:1.60,lab:"Ralo com caixa de areia do preparo"}
];
const PILARES=[[0,0],[4.90,0],[9.80,0],[14.70,0],[0,4.85],[4.90,4.85],[9.80,4.85],[14.70,4.85],
 [0,9.70],[4.90,9.70],[9.80,9.70],[14.70,9.70]];
/* ================= ESTADO ================= */
const S={
  alugMerc:7000,custoOp:false,tma:15,dias:24,horas:8,fatorMaq:1,
  alvara:false,pesquisa:false,prolagos:false,temporarios:false,treino:false,rt:false,
  mercado:30,vol1:5.0,cresc:20,shareMax:5,p3:false,
  eq:{E01:"basico",E02:"basico",E03:"basico",E04:"basico",E05:"basico",E06:"basico",E07:"basico",E08:"none",E09:"basico",E11:"basico",E12:"basico"},
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
const PAPEIS=[["des","Agenda e vendas",false],["proj","Projeto de paisagismo",false],["cam","Equipes em campo",true],
  ["bal","Balcão da loja",true],["pre","Preparo, envasamento e rega",true]];
/* media de uma grandeza por atendimento, pela participacao das linhas */
function mediaLinhas(k){
  const tot=CANAIS.reduce((a,c)=>a+S.canais[c.id].share,0)||1;
  return CANAIS.reduce((a,c)=>a+S.canais[c.id].share*(c[k]||0),0)/tot;
}
/* area de viveiro no patio, em m² (a arvore do patio e editavel) */
function areaViveiro(){
  const DP=derivar("pat");
  return DP.leaves.filter(f=>f.r==="viv").reduce((a,f)=>a+f.w*f.h,0);
}
const H={
  flags(R){
    R.cortaFogo=S.eq.E07!=="none";
    R.kits=eqT("E02").kits||2;
    R.areaViv=areaViveiro();
  },
  dep(R){return {veiculo:R.veiculo}},
  capacidade(R){
    const h=S.horas, fm=S.fatorMaq||1, P=R.pessoas;
    const w=k=>Math.max(0.005,mediaLinhas(k));
    R.camEf=Math.min(P.cam,2*R.kits);
    R.capCam=R.camEf*h*EFIC*DESLOC*fm*(eqT("E02").fat||1)/w("hCampo");
    R.capBal=P.bal*h*EFIC*fm/w("hBal");
    R.capPre=P.pre*PRE_H*h*EFIC*fm*(eqT("E01").fat||1)/w("pl");
    R.capViv=R.areaViv*PLANTAS_M2*(eqT("E03").fat||1)/GIRO_DIAS/w("pl");
    R.capProj=P.proj*h*EFIC*fm*(eqT("E09").proj||1)/w("hProj");
    R.capDes=P.des*DES_DIA*fm;
    R.etapas=[
      {n:"Equipes em campo",v:R.capCam,sala:"car",d:`${N2(R.camEf,0)} jardineiro(s) com ${R.kits} kit(s); ${N2(w("hCampo"),2)} h de campo por atendimento, em média`},
      {n:"Balcão da loja",v:R.capBal,sala:"loj"},
      {n:"Preparo e envasamento",v:R.capPre,sala:"pro"},
      {n:"Viveiro no pátio",v:R.capViv,sala:"loj",d:`${NUM(R.areaViv,0)} m² de viveiro × ${PLANTAS_M2} plantas/m², girando em ${GIRO_DIAS} dias`},
      {n:"Projeto de paisagismo",v:R.capProj,sala:"esc"},
      {n:"Agenda e vendas",v:R.capDes,sala:"esc"}
    ];
  },
  fGeral(R){return 1},
  vari(v,R){
    if(v.id==="frete"&&!S.freteTerc){v.preco=6;v.n="Combustível da picape";v.fixoPreco=true;}
    if(v.id==="res"){v.preco=S.vari.res*(eqT("E12").comp||1);if((eqT("E12").comp||1)<1)v.n="Descarte de resíduo verde (metade vira composto)";}
    return v;
  },
  canal(c,R){
    if(c.id==="vb")return eqT("E06").f||1;
    if(c.id==="pi")return (eqT("E09").f||1)*(R.veiculo?1:0.90);
    return 1;
  },
  /* contrato de manutencao pago no mes seguinte e um mes de planta e
     insumo em estoque no viveiro e no deposito                            */
  giro(R){
    const dia=S.vol1*1000/365*R.fatorDemanda;
    return dia*R.precoMedio*15+dia*R.materialMedio*30;
  },
  riscoSan(R,lay){
    let rs=15;
    if(!R.cortaFogo)rs+=12;
    if(!S.rt)rs+=8; if(!S.treino)rs+=8;
    rs+=Math.min(20,lay.viol.length*7);
    if(lay.setoresFaltando.includes("ves"))rs+=8;
    return rs;
  },
  riscoReg(R){
    let rr=15;
    if(!S.alvara)rr+=25; if(!S.prolagos)rr+=12; if(!S.pesquisa)rr+=12;
    if(!S.reservTerreo)rr+=6;
    return rr;
  },
  gates(R,lay){return [
    {id:"alvara",n:"O Alvará",ok:S.alvara,xp:15},
    {id:"pesq",n:"A Pesquisa de Campo",ok:S.pesquisa,xp:15},
    {id:"efl",n:"Os Condomínios e as Pousadas",ok:S.prolagos,xp:12},
    {id:"layout",n:"A Planta Fecha",ok:lay.deficit===0&&lay.viol.length===0&&lay.flowPct>=100,xp:15},
    {id:"pcc",n:"A Planta Viva",ok:R.cortaFogo&&S.rt&&S.treino,xp:12},
    {id:"verao",n:"A Primavera",ok:S.p3&&S.temporarios,xp:10},
    {id:"gargalo",n:"A Carteira em Dia",ok:R.perda3Pct<5,xp:11},
    {id:"bench",n:"Bater a Locação",ok:R.dre[2].ebitda>S.alugMerc*12,xp:10}
  ]}
};

/* ================= EIXO VERTICAL (HIPOTESE DECLARADA) ================= */
const VERT={
 /* bancada de envasamento: substrato e muda abertos sobre o tampo */
 E01:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 E04:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 E05:{hz:0.95,hop:0.95,hman:0.40,hac:"S",banc:1},
 M01:{hz:1.00,hop:1.00,hman:0.30,hac:"O"},
 M02:{hz:1.20,hop:1.00,hman:0.30,hac:"O"},
 M03:{hz:1.60,hop:1.20,hman:0.30,hac:"O"},
 M04:{hz:1.60,hop:1.20,hman:0.30,hac:"O"},
 M05:{hz:1.80,hop:1.20,hman:0.20,hac:"N"},
 M06:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 /* mesa de plantas de interior: a folhagem sobe a 1,30 m */
 M07:{hz:1.30,hop:0.90,hman:0.30,hac:"S",aberto:1},
 M08:{hz:1.05,hop:1.05,hman:0.30,hac:"S"},
 M09:{hz:1.15,hop:0.75,hman:0.30,hac:"N"},
 M10:{hz:1.80,hop:1.20,hman:0.20,hac:"N"},
 M11:{hz:1.10,hop:1.00,hman:0.30,hac:"O"},
 M12:{hz:1.80,hop:1.20,hman:0.20,hac:"N"}
};
const ESTANTES_IDS=["E04"];
const ALT_ESTANTE=2.00;

/* ================= INSTALACOES E FACHADA ================= */
const INST={
  abertos:["E01","M07"],                 /* muda e folha expostas */
  difSalas:["car","dep"], salaLinha:"pro", salaLoja:"loj",
  evap:()=>S.eq.E06==="padrao", evapLinhaEq:"E01", evapPos:{x:3.00,y:9.10}, evapSala:"loj", evapSalaLinha:"pro"
};
const VITRINE=null;
const PORTAS_FACHADA=[
 {r:"car",lado:"B",min:1.6,l:3.00,t:"enrolar",lab:"PORTA B · equipes, carga e pessoal"},
 {r:"loj",lado:"C",min:1.2,l:2.00,t:"vidro",lab:"Porta da loja · viveiro"}
];

/* ================= REGRAS Z DO NEGOCIO ================= */
H.zNegocio=(B,add,{eqs,D,M,dt})=>{
  /* Z04 — instalacao sobre muda e folha expostas */
  zProjecao(B,add,eqs,{bloq:"muda e planta de interior expostas: o condensado frio queima a folha e mancha o vaso de cerâmica",
    aviso:"a bancada de envasamento e a mesa de plantas — exigem luz de boa reprodução de cor: o cliente escolhe a planta pela folha"});
  /* Z08 — giro do carrinho de pallet */
  zGiro(B,add,dt,D,[["car","Carga das equipes"],["dep","Depósito de insumos"]],1.50,"o carrinho com um pallet de substrato");
  /* Z11 — a loja precisa de frente para o viveiro e para a rua */
  const lj=D.leaves.find(l=>l.r==="loj");
  if(!lj||Math.abs(lj.y+lj.h-HI)>EPS)add("Z11","aviso","A loja não encosta na fachada: o cliente não passa do viveiro para o balcão",
    lj?{x:lj.x,z:lj.y,w:lj.w,d:lj.h,y:0,h:0.3}:null,"Manter a loja na fachada, com porta de vidro para o viveiro.");
  /* Z14 — estantes do deposito */
  zEstantes(B,add,D,"dep","Estantes do depósito");
  /* Z20 — combustivel sem armario corta-fogo; defensivo fora do lugar */
  const m05=eqs.find(b=>b.id==="M05");
  if(S.eq.E07==="none")add("Z20","erro",
    "Gasolina e óleo 2T das roçadeiras sem armário corta-fogo, a poucos metros do adubo e da loja",
    m05||null,"Comprar o armário corta-fogo de 90 L (fase 3).");
  if(!D.leaves.some(l=>l.r==="agr"))add("Z20","bloqueio","Não há sala trancada de defensivos: produto com receituário no depósito geral",null,"Manter a sala de defensivos na árvore de divisórias.");
  /* Z21 — vagas da loja */
  zVagas(B,add,n=>`Loja com ${n} vaga(s) de cliente no pátio — mínimo adotado de ${VAGAS_MIN}; quem compra saco de terra e planta grande precisa do carro na porta (−5%)`,
    "Reservar a faixa do pátio junto ao portão para as vagas (fase 2, vista do pátio).");
  /* Z22 — viveiro pequeno demais para o balcao */
  const R=calc();
  if(R.areaViv<ROOM_P.viv.a-0.05){
    const vv=(B.DP&&B.DP.leaves||[]).find(f=>f.r==="viv");
    add("Z22","aviso",`Viveiro com ${NUM(R.areaViv,0)} m² — abaixo dos ${ROOM_P.viv.a} m² adotados: a planta não gira e a loja vende o que não tem`,
      vv?{x:vv.x,z:HI+0.30+vv.y,w:vv.w,d:vv.h,y:0,h:0.3}:null,"Aumentar a faixa do viveiro no pátio (fase 2, vista do pátio).");
  }
};

/* ================= TURNO ================= */
const ESTACOES=[
 {id:"dep",n:"Estantes e pallets do depósito",eq:"M03",sala:"dep"},
 {id:"pre",n:"Bancada de envasamento",eq:"E01",sala:"pro",cap:R=>R.capPre},
 {id:"gon",n:"Gôndola da loja",eq:"M06",sala:"loj"},
 {id:"bal",n:"Balcão e caixa",eq:"M08",sala:"loj",cap:R=>R.capBal}
];
const BATELADA=2;               /* atendimentos por lote */
const TURNO={carrinho:8,        /* atendimentos por viagem do carrinho */
  rolo:20,                      /* atendimentos por pallet recebido */
  carga:{"dep>pre":8}, salaRec:"car",
  cop:30,                       /* rega do viveiro e saida das equipes */
  inicio:7};
H.foraDaLinha=R=>Math.min(R.capCam,R.capViv,R.capProj,R.capDes);

/* ================= PRODUTO NA CENA ================= */
function produtoNaCena(B){
  if(!S.produto||!B.D)return;
  const sala=r=>B.D.leaves.find(l=>l.r===r);
  const car=sala("car");
  if(car)pilha(B,car.x+0.30,car.y+car.h-1.30,"saco",6,"Sacos de substrato e adubo recebidos",12,0,"sacos");
  /* o viveiro no patio: fileiras de bancada com vasos e copas */
  (B.DP&&B.DP.leaves||[]).filter(f=>f.r==="viv").forEach(f=>{
    const z0=HI+0.30+f.y, n=Math.max(1,Math.floor((f.h-0.6)/1.6));
    for(let i=0;i<n;i++){
      const z=z0+0.4+i*1.6;
      B.push(BX({x:f.x+0.5,z,y:0,w:f.w-1.0,d:0.9,h:0.6,c:hex2rgb("#8C979D"),lay:"produto",tag:"det",semAresta:true,lod:1}));
      const m=Math.floor((f.w-1.0)/0.45);
      for(let k=0;k<m;k++){
        B.push(BX({x:f.x+0.55+k*0.45,z:z+0.25,y:0.6,w:0.32,d:0.32,h:0.25,c:hex2rgb("#8A5A3B"),lay:"produto",tag:"det",semAresta:true,lod:2,geo:"cil"}));
        B.push(BX({x:f.x+0.52+k*0.45,z:z+0.22,y:0.82,w:0.38,d:0.38,h:0.30+0.2*((k*7+i)%3)/2,c:hex2rgb(k%2?"#4E8A4A":"#7FB069"),lay:"produto",tag:k?"det":"produto",id:k?null:"viveiro:"+i,nome:k?null:"Viveiro — fileira "+(i+1),semAresta:true,lod:k?2:1,geo:"esf"}));
      }
    }
    /* sombrite a 2,6 m */
    B.push(BX({x:f.x,z:z0,y:2.6,w:f.w,d:f.h,h:0.02,c:hex2rgb("#2F3A33"),a:0.30,lay:"produto",tag:"det",semAresta:true,lod:1}));
  });
}

/* ================= SENSIBILIDADE, CETICO E MONTE CARLO ================= */
const VARS=[
 {id:"preco",n:"Preço médio por atendimento",un:"R$/atendimento",geo:false,
  val:()=>calc().precoMedio,
  set:f=>CANAIS.forEach(c=>S.canais[c.id].preco=+(S.canais[c.id].preco*f).toFixed(3))},
 {id:"vol",n:"Volume do ano 1",un:"mil atendimentos/ano",geo:false,val:()=>S.vol1,set:f=>{S.vol1=S.vol1*f}},
 {id:"cresc",n:"Crescimento anual",un:"%",geo:false,val:()=>S.cresc,set:f=>{S.cresc=S.cresc*f}},
 {id:"cap",n:"Rendimento das equipes e do viveiro",un:"atendimentos/dia",geo:false,
  val:()=>calc().capKgDia,set:f=>{S.fatorMaq=(S.fatorMaq||1)*f}},
 {id:"cv",n:"Planta, insumo e variáveis",un:"R$/atendimento",geo:false,
  val:()=>calc().matMedio,set:f=>{S.fatMat=+((S.fatMat||1)*f).toFixed(4);VARI.forEach(v=>S.vari[v.id]=+(S.vari[v.id]*f).toFixed(4))}},
 {id:"folha",n:"Folha com encargos",un:"R$/mês",geo:false,
  val:()=>calc().folha,set:f=>{S.fator=+(S.fator*f).toFixed(4)}},
 {id:"perda",n:"Rota por bairro e controle de perda no viveiro (−10% do variável)",un:"—",geo:false,
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
const CETICO=[["preço 10% menor",()=>CANAIS.forEach(c=>S.canais[c.id].preco*=0.90)],
              ["volume 15% menor",()=>{S.vol1*=0.85}],
              ["planta, insumo e variáveis 10% mais caros",()=>{S.fatMat=(S.fatMat||1)*1.10;VARI.forEach(v=>S.vari[v.id]*=1.10)}],
              ["CAPEX 10% maior",()=>{S.cont=S.cont+10}],
              ["equipes rendendo 10% menos",()=>{S.fatorMaq=(S.fatorMaq||1)*0.9}]];
const DISTR=[
 {id:"preco",n:"Preço médio",tri:[0.88,1.00,1.08]},
 {id:"vol",n:"Volume do ano 1",tri:[0.70,1.00,1.15]},
 {id:"cv",n:"Custo variável",tri:[0.92,1.00,1.18]},
 {id:"cap",n:"Rendimento",tri:[0.85,1.00,1.05]},
 {id:"obra",n:"Custo de obra",tri:[0.90,1.00,1.25]}
];
const NAO_RESPONDE=[
 "Quantos jardins de casa de veraneio, condomínio e pousada fecham contrato de manutenção mensal, e por quanto: o preço da visita e a carteira são premissas.",
 "Quantos garden centers, floriculturas e jardineiros autônomos já atendem Cabo Frio, e a que preço: o autônomo cobra menos e o supermercado vende planta.",
 "Quanta planta morre no viveiro no verão de Cabo Frio, com sol e vento de sal: a perda é hipótese.",
 "Se o sócio sabe projetar paisagismo: a implantação é a linha de ticket alto, e depende de quem desenha.",
 "Se a equipe de campo fica: jardineiro bom sai para trabalhar por conta própria levando os clientes.",
 "Se o pátio recebe o sol que o viveiro pede e se a água da rede aguenta a rega do verão.",
 "Se o aluguel de R$ 7 mil/mês é real: ele é o adversário.",
 "Se você quer isso: o modelo compara EBITDA com aluguel, não com sossego nem com o que você prefere fazer da vida."
];

/* ================= IDENTIDADE E TEXTOS ================= */
const NEG={titulo:"Jardim Prime",slug:"jardim_prime",negocio:"garden center e paisagismo",
  leiame:"um garden center com viveiro, manutencao de jardins e paisagismo",
  ele:"o garden",pron:"ele",Curto:"Garden",
  un:"atendimento",uns:"atendimentos",unsCurto:"atendimentos",ud:"atend",dec:1,unMil:"mil atendimentos",unPreco:"R$/atendimento"};
const FASES3=[["0","Briefing"],["1","Mercado"],["2","Planta baixa"],["2B","O terceiro eixo"],["3","O viveiro e as equipes"],
  ["4","Obra"],["5","Pessoas"],["6","Custo"],["6B","Turno cheio"],["7","Veredicto"]];
const SAZ_NOMES={primavera:"primavera e verão",jardim:"verão",obra:"antes do verão"};
const SAZ_COLS={primavera:"Balcão",jardim:"Manutenção",obra:"Poda e implantação"};
const ALTO_ID="E04";
const REF_VIOL=["Z04","Z06"];
const PORTOES=[
 ["alvara","Consulta de uso do solo na PMCF","Gratuita antes de qualquer obra. Garden center é comércio de baixo impacto; o que pesa é o registro para vender defensivo e a guarda de combustível das roçadeiras. Confirmar antes custa nada."],
 ["pesquisa","Pesquisa com condomínios, pousadas, imobiliárias de temporada e donos de casa de veraneio","Quanto pagam hoje ao jardineiro, quantas visitas por mês, quem está insatisfeito e quanto a floricultura da cidade cobra pela planta."],
 ["prolagos","Contratos com condomínios, pousadas e imobiliárias de temporada","Três contratos grandes pagam uma equipe no primeiro ano e dão a rota inicial."],
 ["rt","Receituário agronômico e ficha de cuidado por jardim","Defensivo só com receituário; cada jardim com a ficha de poda, adubação e rega."],
 ["treino","Treinamento das equipes em poda, irrigação e segurança com roçadeira",""],
 ["temporarios","Jardineiro temporário para setembro a novembro",""]];
const ITENS_CAMPO=[
 ["peDireito","Pe-direito livre sob laje","medir em tres pontos afastados; anotar o menor",""],
 ["vigas","Altura e largura das vigas e o vao entre elas","medir da face inferior da viga ate o piso",""],
 ["pilares","Posicao e secao dos pilares","trena a partir das duas empenas; anotar secao em cm",""],
 ["portas","Altura livre sob a porta de enrolar","com a porta recolhida: a picape com planta de 2 m entra de ré",""],
 ["peitoril","Sol e vento no pátio do viveiro","horas de sol direto e se o vento do canal bate; anotar a orientação da fachada",""],
 ["forro","Forro existente: material e altura","",""],
 ["degrau","Cota do patio em relacao ao piso interno","o degrau decide o carrinho de pallet e a entrada do cliente pelo viveiro",""],
 ["energia","Entrada de energia e de água","a bomba da irrigação e a vazão da rede no verão",""]];
const CORRIGE_NEG={
  Z20:{lab:"comprar o armário corta-fogo",ok:()=>S.eq.E07==="none",fn:()=>{S.eq.E07="basico"}}};
const PROVAS=[
 ["Pé-direito de 2,30 m bloqueia as estantes","Z01",()=>{S.peLaje=2.30}],
 ["Difusor sobre a bancada vira bloqueio","Z04",()=>{S.dutoRota="linha";S.evapSobre="linha";S.eq.E06="padrao"}],
 ["Evaporador sem dreno vira bloqueio","Z12",()=>{S.eq.E06="padrao";S.evapDreno=false}],
 ["Estante acima do ombro vira aviso","Z14",()=>{S.alturaEmp=2.60}],
 ["Combustível sem armário corta-fogo vira erro","Z20",()=>{S.eq.E07="none"}],
 ["Pátio sem vaga de cliente vira aviso","Z21",()=>{S.treeP={d:"v",cuts:[0.12,0.62],kids:[{r:"man"},{r:"viv"},{d:"h",cuts:[0.12,0.24,0.36],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"man"}]}]}}],
 ["Viveiro encolhido vira aviso","Z22",()=>{S.treeP={d:"v",cuts:[0.30,0.62],kids:[{r:"man"},{r:"viv"},{d:"h",cuts:[0.12,0.24,0.36],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"vag"}]}]}}]];
const VISTAS=[
 {id:"geral",n:"Geral",ap(){CAM.modo="orb";ACOES3.fit();CAM.corte=1.20;S.corteLocal=null}},
 {id:"linha",n:"Loja e viveiro",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["loj"]);CAM.alvo[2]+=4;
   CAM.yaw=1.2;CAM.pitch=0.7;CAM.dist=16;CAM.corte=3.00;S.corteLocal=null;S.layers3.equip=true}},
 {id:"barreira",n:"Depósito e preparo",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["dep","pro"]);
   CAM.yaw=-0.6;CAM.pitch=0.7;CAM.dist=9;CAM.corte=1.40;S.corteLocal=null;S.corMode="zona";S.layers3.zonas=true}},
 {id:"frio",n:"Carga e oficina",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["car","ofi"]);
   CAM.yaw=-2.1;CAM.pitch=0.62;CAM.dist=8;CAM.corte=2.40;S.corteLocal=null}},
 {id:"receb",n:"Projeto",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["esc","loj"]);
   CAM.yaw=1.4;CAM.pitch=0.35;CAM.dist=7.5;CAM.corte=2.40;S.corteLocal=null}},
 {id:"oper",n:"Do vendedor",ap(){const c=centroSala("loj");CAM.modo="fp";CAM.fp=[c[0],1.65,c[2]+1.4];
   CAM.fyaw=-Math.PI/2;CAM.fpit=-0.05}}];
const TXT={
  f0lead:"Esta versão testa um <b>garden center com paisagismo</b>: loja de plantas, vasos e insumos com o viveiro no pátio, duas equipes que fazem a manutenção mensal dos jardins de casas de veraneio, condomínios e pousadas, poda e roçada avulsas e a implantação de paisagismo. Sombrite, bancada e ferramenta de jardim mantêm o CAPEX abaixo de R$ 200 mil; a planta é estoque, não investimento. A régua é a mesma que julgou a marcenaria e o pastel.",
  f0porqueTit:"Por que garden e paisagismo.",
  f0porque:"Cabo Frio tem milhares de casas de veraneio e condomínios com jardim e dono ausente, pousadas que vendem pela foto da área verde e um verão que pede tudo bonito em dezembro. A manutenção mensal é receita recorrente; a loja e o viveiro vendem a planta que a equipe aplica; a implantação de paisagismo é o ticket alto. O imóvel serve: o pátio vira viveiro, a fachada vira vitrine e o galpão guarda insumo e ferramenta. O risco é a perda de planta no sol e no vento de sal, a mão de obra de campo, que pode sair levando cliente, e o preço do jardineiro autônomo.",
  f0decide:"Ele verifica a loja na fachada aberta para o viveiro, a área de sombrite do pátio como limite de venda, a sala trancada de defensivos, o armário corta-fogo das roçadeiras, a altura livre sob viga, o giro do carrinho de pallet, as vagas da loja, a rota de fuga, os metros caminhados por atendimento e a demanda mês a mês com a primavera. Ele <b>não</b> substitui projeto executivo, ART, projeto de incêndio nem a pesquisa com condomínios e pousadas.",
  regiao:"Cabo Frio",faixaMercado:[5,100,1],faixaVol:[1,25,0.5],passoPreco:5,
  p3Nome:"Sábado e hora extra na primavera — setembro a novembro",
  p3Desc:R=>`Eleva as equipes, o balcão e o preparo em ${PCT((HORA_EXTRA-1)*100)} na primavera, a 150% da hora: cerca de ${BRL(R.folhaProd*(HORA_EXTRA-1)*1.5*PICO_PROD.length)}/ano de folha.`,
  matNome:"planta e insumo",
  f1preco:"O preço é por atendimento: o cupom médio do balcão, a visita de manutenção, a poda avulsa e a implantação inteira. A loja climatizada vende mais planta de interior; o projeto em 3D fecha mais implantação; sem veículo, a implantação grande depende de carreto (−10%).",
  f1curva:"A primavera enche a loja e a agenda de implantação; o verão pede o jardim bonito da casa de veraneio; o inverno é poda e manutenção leve. Quem espera mais de um mês procura outro jardineiro — 35% não volta.",
  f2lead:"Ao fundo, a sala trancada de defensivos, o preparo e envasamento, o depósito de insumos e a oficina de ferramentas com o combustível. Na fachada, que dá para o viveiro do pátio, a loja com a porta de vidro, o projeto, o vestiário e a carga das equipes com a porta B. Ligue a vista do pátio para ver o viveiro.",
  producao:"área de preparo",vagasNome:"Vagas de cliente no patio",
  f2blead:"Pe-direito, vigas, forro, a altura das estantes do depósito e o sombrite do viveiro no pátio.",
  estantesNome:"estantes do depósito",forroDesc:"Sem forro, a loja esquenta e a planta de interior sofre.",
  dutoOps:[["circ","a carga e o depósito"],["linha","a bancada de envasamento"]],
  evapOps:[["circ","a parede da fachada da loja"],["linha","a bancada de envasamento"]],
  drenoDesc:"Sem dreno, condensado frio pinga na muda e queima a folha. Bloqueio.",
  altoNome:"as estantes do depósito",altoRisco:"Se caírem sob a viga, a estante baixa — e cabe menos insumo.",
  f3lead:R=>`O viveiro do pátio tem ${NUM(R.areaViv,0)} m²; ${N2(R.camEf,0)} jardineiro(s) em campo com ${R.kits} kit(s) de ferramenta.`,
  f3cap:R=>`Cada linha consome horas diferentes: a visita de manutenção pesa ${N2(CANAIS[1].hCampo,1)} h de campo (a dupla), a poda ${N2(CANAIS[2].hCampo,1)} h, a implantação ${NUM(CANAIS[3].hCampo,0)} h e 80 plantas; o balcão pesa ${N2(CANAIS[0].hBal,2)} h de vendedor e ${N2(CANAIS[0].pl,1)} plantas. O viveiro sustenta ${PLANTAS_M2} plantas por m², girando em ${GIRO_DIAS} dias. O deslocamento come ${PCT((1-DESLOC)*100)} do dia da equipe.`,
  carteiraNome:"A demanda mês a mês",perdaNome:"Atendimento perdido para outro jardineiro ou outra loja",
  f3pico:"De setembro a novembro a loja enche e todo mundo quer o jardim pronto antes do verão. O viveiro precisa de planta girando e as equipes de agenda cheia; sábado, jardineiro temporário e o terceiro kit seguram o pico.",
  trifDesc:"Bomba da irrigação, split da loja e esmeril: conferir a entrada e o quadro.",
  incDesc:"Gasolina, óleo 2T e adubo químico no mesmo galpão: o Corpo de Bombeiros confere o armário corta-fogo, o extintor certo e a rota livre.",
  eficNome:"Rota por bairro e controle de perda no viveiro",eficDesc:"Equipe fechada por bairro e rega por setor com registro de perda: corta 10% dos variáveis, com R$ 3.000 de CAPEX em treinamento.",
  giroDesc:"contrato mensal pago no mês seguinte; um mês de planta e insumo no viveiro e no depósito",
  depFora:{veiculo:"sem veículo próprio"},
  f5hint:"Quem vende é o sócio-paisagista: o projeto de implantação e o contrato com condomínio e pousada. A dupla de jardineiros é o que o cliente conhece; a ficha de cuidado por jardim no sistema é o que prende o cliente à empresa, não à pessoa.",
  garantiaNome:"Replantio de muda que morreu",
  freteNome:"Equipes com carreto e aplicativo",freteDesc:"Não compra a picape; a equipe vai com carreto e aplicativo de frete, cobrados por atendimento, e a implantação grande fica 10% menor.",
  f6blead:"o insumo sai do depósito, a planta é envasada na bancada, vai para a gôndola ou para o viveiro e a venda fecha no balcão. As equipes saem às 7 h pela porta B.",
  copNome:"Janela perdida com a rega do viveiro e a saída das equipes",
  bossFiscalNome:"O Fiscal Sobe na Escada",bossPicoNome:"Primavera: o Jardim Pronto Antes do Réveillon",
  fiscalOk:"Nada acima da linha reprova: difusores e evaporadores estão fora da projeção da bancada e da mesa de plantas.",
  sol:"O viveiro é a única parte do imóvel que precisa de sol — filtrado. Sol direto da tarde queima muda sob sombrite ralo; ligue o estudo de sol com a orientação real da fachada antes de escolher onde fica o viveiro.",
  r07:"o carrinho de substrato",cvNome:"Planta, insumo e variáveis",
  z19quando:"de setembro a novembro (a primavera)",
  z19como:"Sábado e hora extra na primavera (fase 1), jardineiro temporário e terceiro kit (fases 3 e 5), viveiro maior (fase 2)."
};
H.fase5ok=R=>R.pessoas.des>0&&R.pessoas.cam>0&&R.pessoas.bal>0&&R.pessoas.pre>0&&R.pessoas.proj>0;
H.f5extra=R=>`<div class="hint">Em campo: <b>${N2(R.camEf,0)}</b> jardineiro(s) — cada kit de ferramenta atende uma dupla (${R.kits} kits). Uma dupla faz cerca de ${NUM(S.horas*EFIC*DESLOC*2/CANAIS[1].hCampo,1)} visitas de manutenção por dia quando só faz manutenção. <span class="b b-hip">HIPOTESE</span></div>`;
H.bossPico=()=>{
  const R=calc(), T=R.temporada, pico=T.meses.filter(x=>PICO_PROD.includes(x.m));
  const dem=pico.reduce((a,x)=>a+x.dem,0), prod=pico.reduce((a,x)=>a+x.prod,0), des=pico.reduce((a,x)=>a+x.perda,0);
  const txt=[`Setembro a novembro, ano 3: entram ${NUM(dem*1000,0)} atendimentos, e o garden atende até ${NUM(prod*1000,0)}${S.p3?" com o sábado e a hora extra":""}.`];
  txt.push(des*1000<=1?"Ninguém procura outro jardineiro na primavera.":`${NUM(des*1000,0)} atendimentos vão para outro jardineiro ou outra loja (${BRL(des*1000*R.precoMedio)} de venda). O gargalo é ${R.gargalo.n.toLowerCase()}.`);
  txt.push(`O viveiro tem ${NUM(R.areaViv,0)} m² de sombrite.`);
  ZV.filter(v=>["Z08","Z19","Z21","Z22"].includes(v.cod)).forEach(v=>txt.push(`${v.cod} — ${v.msg}`));
  return `<div class="hint ${des*1000>1?"bad":""}"><b>${TXT.bossPicoNome}</b><br>${txt.join("<br>")}</div>`;
};
H.auditoria=p=>{
  p("Saco de substrato na cena","0,60 × 0,40 × 0,15","m","catálogo","produto na cena");
  CANAIS.forEach(c=>p("Horas e plantas por atendimento — "+c.n.split(":")[0].split(" (")[0].split(" —")[0],"campo "+N2(c.hCampo,1)+" · balcão "+N2(c.hBal,2)+" · projeto "+N2(c.hProj,1)+" · plantas "+N2(c.pl,1),"","hipótese","capacidade"));
  p("Plantas por m² de viveiro",String(PLANTAS_M2),"","hipótese","capacidade");
  p("Dias de giro no viveiro",String(GIRO_DIAS),"","hipótese","capacidade");
  p("Envasamento",NUM(PRE_H,0),"plantas/h por pessoa","hipótese","capacidade");
  p("Dia da equipe que sobra depois do deslocamento",PCT(DESLOC*100),"","hipótese","capacidade");
  p("Agenda e vendas",NUM(DES_DIA,0),"atendimentos/dia por pessoa","hipótese","capacidade");
  p("Área mínima de viveiro",String(ROOM_P.viv.a),"m²","hipótese","Z22");
};
//@@HTML
TITULO=Jardim Prime
NEGOCIO=garden center e paisagismo
NAO_AJUDA=preço da visita e carteira de jardins, perda de planta no viveiro, equipe que fica
ARQUIVO=jardim_prime_3d_v1.0.html
//@@TARDIO
function detalhesEquip(e,B){
  const ins={cores:["papelao","terra","verde","plast"]};
  switch(e.id){
    case "E01": forma(e,B,"vasos"); break;
    case "E04": forma(e,B,"estante",Object.assign({niveis:4,n:4},ins)); break;
    case "E05": forma(e,B,"bancada",{n:2,cores:["inox","amarelo"]}); break;
    case "M01": forma(e,B,"carrinho",{n:2,cores:["terra","papelao"]}); break;
    case "M02": forma(e,B,"vasos"); break;
    case "M03": forma(e,B,"pallet",{cores:["terra","papelao"]}); break;
    case "M04": forma(e,B,"pallet",{cores:["plast","terra","inox"]}); break;
    case "M05": forma(e,B,"armario",{portas:2,cor:"amarelo"}); break;
    case "M06": forma(e,B,"estante",Object.assign({niveis:4,n:5},ins)); break;
    case "M07": forma(e,B,"vasos"); break;
    case "M08": forma(e,B,"balcao",{n:2,cores:["verde","terra"]}); break;
    case "M09": forma(e,B,"estacao",{telas:1}); break;
    case "M10": forma(e,B,"armario",{portas:4}); break;
    case "M11": forma(e,B,"carrinho",{n:2,cores:["amarelo","inox"]}); break;
    case "M12": forma(e,B,"armario",{portas:2,cor:"rosa"}); break;
  }
}
