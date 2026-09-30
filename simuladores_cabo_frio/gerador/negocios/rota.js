/* ==================================================================
   ROTA PRIME 3D — v1.0 (motor herdado do Pastel Prime 3D v3.2, pelas
   versoes Gelo, Enxoval, Praia, Visual, Uniforme e Planejado Prime 3D)
   Estudo de viabilidade de um hub de entregas de ultima milha — o parceiro
   local que recebe a carreta do centro de distribuicao das plataformas
   (Shopee, Mercado Livre, transportadoras), tria os pacotes por rota e
   entrega com motoristas agregados — em Novo Portinho, Cabo Frio (RJ),
   com CAPEX abaixo de R$ 200 mil, contra a alternativa de alugar o imovel
   por R$ 7 mil/mes. Arquivo unico, offline.
   A unidade do modelo e o pacote entregue; o motor conta em mil pacotes
   onde o pastel contava toneladas.
   O que e deste negocio: tabelas de dados, capacidade por etapa (bipagem,
   triagem, carregamento, despacho e a rua), as vagas do patio como limite
   de ondas de carregamento, as regras Z04, Z08, Z11, Z14, Z20 a Z23, o
   turno de madrugada, as formas dos equipamentos e os textos das fases.
   ================================================================== */

/* ================= EQUIPAMENTOS ================= */
/* preço em R$; w/hh = pegada. Base: faixas de mercado, set/2026, ±40% —
   cotar. A tese é CAPEX baixo: o hub não tem frota (o motorista agregado
   roda com carro e MEI próprios) e começa com mesas de triagem; a esteira
   é o primeiro upgrade quando o volume passa de dois mil pacotes por dia. */
const EQ=[
 {id:"E01",n:"Triagem por rota",req:"Onde o pacote bipado vira rota: cada posição da mesa ou da esteira é um bairro de Cabo Frio, Búzios ou Arraial",kw:1.5,etapa:"triagem",
  t:[{k:"basico",n:"Mesas de triagem em U, com prateleira por rota",p:9000,fat:1.00,w:4.80,hh:1.40},
     {k:"padrao",n:"Esteira de roletes gravitacional de 6 m e mesas de apoio (+30%)",p:32000,fat:1.30,w:6.00,hh:1.00},
     {k:"premium",n:"Esteira motorizada de 6,5 m com leitor fixo e balança dinâmica (+70%)",p:85000,fat:1.70,w:6.50,hh:1.20}]},
 {id:"E02",n:"Coletores de bipagem",req:"Cada troca de mão é uma bipagem: recebimento, triagem, saída para o agregado e insucesso",kw:0.2,etapa:"recebimento",
  t:[{k:"basico",n:"4 smartphones com o app da plataforma, capas e carregadores",p:6000,fat:1.00},
     {k:"padrao",n:"6 coletores Android robustos com leitor 2D e berço (+15%)",p:19000,fat:1.15}]},
 {id:"E03",n:"Gaiolas de rota (roll containers)",req:"Uma gaiola por agregado: a rota sai inteira, lacrada, sem pacote no chão",kw:0,etapa:"carregamento",
  t:[{k:"basico",n:"24 gaiolas aramadas com rodízio",p:14400,gaiolas:24},{k:"padrao",n:"36 gaiolas aramadas com rodízio",p:21600,gaiolas:36}]},
 {id:"E04",n:"Estantes da custódia",req:"Insucesso, devolução e avaria esperam aqui, endereçados, até a rota seguinte ou a volta ao CD",kw:0,etapa:"-",
  t:[{k:"basico",n:"Estante de aço de 2,40 m e cercado com tela e cadeado",p:5000,w:2.40,hh:0.60},
     {k:"padrao",n:"Estantes duplas endereçadas e cercado com porta",p:11000,w:2.40,hh:1.20}]},
 {id:"E05",n:"Câmeras e controle de acesso",req:"A plataforma homologa o hub pela câmera: extravio sem imagem é descontado do repasse",kw:0.3,etapa:"-",crit:true,
  t:[{k:"none",n:"Não — sem câmera",p:0,f:0.85,extr:1.8},{k:"basico",n:"8 câmeras com gravação de 30 dias",p:6500,f:1.00,extr:1.0},
     {k:"padrao",n:"16 câmeras, leitura de etiqueta na porta B e controle de acesso",p:15000,f:1.03,extr:0.7}]},
 {id:"E06",n:"Ventilação do galpão",req:"Triagem de madrugada no verão de Cabo Frio: galpão fechado, papelão e gente em pé",kw:0.8,etapa:"-",
  t:[{k:"basico",n:"Exaustores eólicos e ventiladores",p:3500,fat:1.00},{k:"padrao",n:"Climatizadores evaporativos na triagem (+5%)",p:11000,fat:1.05}]},
 {id:"E07",n:"Descarga da carreta",req:"A carreta do CD chega às 4 h com 1.500 a 2.500 pacotes em pallets ou soltos",kw:0,etapa:"recebimento",
  t:[{k:"basico",n:"2 paleteiras manuais",p:4000,fat:1.00},{k:"padrao",n:"2 paleteiras e rampa móvel de descarga (+20%)",p:16000,fat:1.20}]},
 {id:"E08",n:"Veículo próprio",req:"Resgate de rota quebrada, coleta reversa e a entrega no mesmo dia da loja local",kw:0,etapa:"-",
  t:[{k:"none",n:"Não comprar — só agregados",p:0,veic:0},{k:"basico",n:"Fiorino usada para resgate, coleta reversa e loja local",p:68000,veic:1}]},
 {id:"E09",n:"Roteirização e gestão",req:"Quem monta as rotas decide quantos pacotes cabem num carro: rota mal feita é agregado voltando com pacote",kw:0.3,etapa:"despacho",
  t:[{k:"basico",n:"App das plataformas e planilha de rotas",p:1500,rot:1.00,pac:1.00},
     {k:"padrao",n:"Roteirizador por assinatura, 2 computadores e impressora térmica (+50% no despacho, +8% por rota)",p:9000,rot:1.50,pac:1.08}]},
 {id:"E10",n:"Energia de reserva",req:"A triagem roda de madrugada: queda de energia às 5 h é o dia inteiro atrasado",kw:0,etapa:"-",
  t:[{k:"basico",n:"Nobreak para rede, coletores e câmeras",p:2500,ger:0},{k:"padrao",n:"Gerador de 15 kVA com chave de transferência",p:22000,ger:1}]},
 {id:"E11",n:"Etiquetas e balança",req:"Reetiquetar pacote avariado e pesar a coleta da loja local",kw:0.1,etapa:"-",
  t:[{k:"basico",n:"Impressora térmica e balança de 30 kg",p:2500}]},
 {id:"E12",n:"Mesa de insucesso e avaria",req:"Pacote que voltou é conferido, fotografado e reembalado antes de voltar para a rota",kw:0,etapa:"-",
  t:[{k:"basico",n:"Mesa de conferência com prateleira",p:2000}]},
 {id:"E13",n:"Ar-condicionado do despacho",req:"Despacho e balcão com computador ligado o dia todo",kw:1.2,etapa:"-",
  t:[{k:"basico",n:"Ventilador de parede",p:400},{k:"padrao",n:"Split de 12 mil BTU no despacho",p:3500}]}
];

/* ================= OBRA ================= */
const OBRA=[
 {id:"piso",n:"Piso do galpão regularizado para paleteira e gaiola (~100 m²)",min:5000,max:12000},
 {id:"eletr",n:"Elétrica: iluminação de 500 lx na triagem, tomadas dos coletores e quadro",min:5000,max:10000},
 {id:"vedac",n:"Divisórias: despacho, balcão e cercado da custódia",min:4000,max:9000},
 {id:"vest",n:"Vestiário, copa e sanitário (adequação)",min:3000,max:6000},
 {id:"fach",n:"Fachada, portão do pátio e sinalização de carga e descarga",min:3000,max:7000},
 {id:"patio",n:"Pátio: piso, faixas das vagas de carregamento e iluminação para a madrugada",min:6000,max:14000},
 {id:"inc",n:"Prevenção de incêndio: extintores, sinalização e iluminação de emergência (papelão)",min:3000,max:6000},
 {id:"proj",n:"Projetos, ART e laudo do Corpo de Bombeiros",min:3000,max:6000},
 {id:"lic",n:"Licenças e homologação: alvará, bombeiros, seguro e cadastro na plataforma",min:2000,max:5000},
 {id:"rec",n:"Recrutamento e treinamento dos primeiros agregados",min:2000,max:5000}
];
const OBRA_DEP={};

/* ================= PESSOAS ================= */
/* des = despacho e roteirizacao; rec = recebimento e bipagem da carreta;
   tri = triagem por rota; car = carregamento e conferencia de saida. O
   motorista agregado nao e empregado: recebe por pacote (custo variavel). */
const POSTOS=[
 {id:"p1",n:"Gestor / sócio-operador (pró-labore; negocia com as plataformas e recruta agregados)",sal:6000,fator:1.15,des:0.3,on:true,fixo:true},
 {id:"p2",n:"Supervisor(a) de operação e despacho — monta as rotas, trata insucesso e fecha o dia",sal:3200,des:0.8,rec:0.2,on:true},
 {id:"p3",n:"Triador(a) 1",sal:1850,tri:1,on:true},
 {id:"p4",n:"Triador(a) 2",sal:1850,tri:1,on:true},
 {id:"p5",n:"Triador(a) 3 (opcional)",sal:1850,tri:1,on:false},
 {id:"p6",n:"Conferente — recebe a carreta de madrugada e confere a saída",sal:2100,rec:0.5,car:0.5,on:true},
 {id:"p7",n:"Auxiliar de carregamento (opcional)",sal:1850,car:1,on:false},
 {id:"p8",n:"Atendente de insucesso e SAC (opcional)",sal:2000,des:0.6,on:false},
 {id:"p9",n:"Motorista próprio — resgate e coleta reversa",sal:2200,on:true,dep:"veiculo"}
];

/* ================= FIXO ================= */
const FIXO=[
 {id:"energia",n:"Energia: iluminação da madrugada, esteira, coletores e escritório",v:900},
 {id:"agua",n:"Água e esgoto",v:120},
 {id:"cont",n:"Contabilidade (lucro presumido)",v:1500},
 {id:"seg",n:"Seguros: patrimônio e responsabilidade civil",v:900},
 {id:"ti",n:"Sistemas, internet redundante e dados dos coletores",v:1100},
 {id:"hig",n:"Limpeza, EPIs e uniformes",v:350},
 {id:"vig",n:"Monitoramento de alarme e ronda",v:700},
 {id:"man",n:"Manutenção de gaiolas, paleteiras e esteira",v:250},
 {id:"agr",n:"Recrutamento e treinamento contínuo de agregados",v:600},
 {id:"veic",n:"Veículo próprio: seguro, IPVA e manutenção fixa",v:1200,dep:"veiculo"}
];

/* ================= VARIÁVEL (por pacote) ================= */
const VARI=[
 {id:"etiq",n:"Etiquetas, lacres e sacas de rota",cons:1,un:"—",preco:0.05,pun:"R$/pacote"},
 {id:"seg",n:"Seguro de carga ad valorem",cons:1,un:"—",preco:0.06,pun:"R$/pacote"},
 {id:"extr",n:"Extravio e avaria descontados pela plataforma",cons:1,un:"—",preco:0.08,pun:"R$/pacote"},
 {id:"ins",n:"Segunda tentativa de entrega (insucesso) paga ao agregado",cons:1,un:"—",preco:0.20,pun:"R$/pacote"},
 {id:"dev",n:"Devolução ao CD (logística reversa rateada)",cons:1,un:"—",preco:0.04,pun:"R$/pacote"},
 {id:"energia",n:"Energia por pacote (esteira, coletores, iluminação)",cons:0.004,un:"kWh/pac",preco:0.98,pun:"R$/kWh"}
];

/* ================= LINHAS (CLIENTES) ================= */
/* share = fracao dos pacotes; preco = o que o hub recebe por pacote
   entregue; mat = o repasse ao motorista agregado (MEI, carro ou moto
   proprios); saz = curva da linha                                        */
const CANAIS=[
 {id:"sh",n:"Shopee Xpress — parceiro de última milha",share:45,preco:5.40,mat:3.50,saz:"ecom"},
 {id:"ml",n:"Mercado Livre — rotas de parceiro do Mercado Envios",share:30,preco:5.90,mat:3.80,saz:"ecom"},
 {id:"tr",n:"Transportadoras e integradoras (J&T, Loggi, Jadlog, Total Express)",share:15,preco:4.90,mat:3.30,saz:"ecom"},
 {id:"lo",n:"Lojas, farmácias e e-commerce locais (coleta e entrega no mesmo dia)",share:10,preco:11.00,mat:6.00,saz:"local"}
];
const SAZ=[["Janeiro",115,"Veranista em casa: o pedido vai para a casa de praia"],["Fevereiro",105,"Carnaval, ainda temporada"],["Março",90,"Fim da temporada"],["Abril",90,"Mês fraco"],["Maio",95,"Dia das Mães"],["Junho",90,"Inverno, cidade vazia"],["Julho",95,"Férias de julho"],["Agosto",92,"Dia dos Pais"],["Setembro",95,"9.9 das plataformas"],["Outubro",100,"10.10 e começo do pico"],["Novembro",130,"11.11 e Black Friday: o mês que decide o ano"],["Dezembro",128,"Natal e veranista chegando"]];
const SAZ_LINHA={
 ecom:[115,105,90,90,95,90,95,92,95,100,130,128],
 local:[125,115,90,85,95,80,95,88,92,100,110,130]
};

/* ================= PREMISSAS DO HUB (hipoteses declaradas) ================= */
const REC_H=600;            /* pacotes/h por pessoa na bipagem da carreta */
const TRI_H=300;            /* pacotes/h por triador, bipando e separando por rota */
const CAR_H=900;            /* pacotes/h por pessoa na conferencia de saida */
const DES_DIA=1800;         /* pacotes/dia roteirizados e acompanhados por pessoa no despacho */
const PAC_ROTA=90;          /* pacotes por rota de agregado por dia em Cabo Frio, Buzios e Arraial */
const ONDAS=4;              /* ondas de carregamento no patio entre 5h30 e 9h */
const EFIC=0.85;            /* fracao produtiva do turno */
const GARANTIA=0.015;       /* multas de prazo (SLA) da plataforma, fracao do preco */
const DESISTE=0.80;         /* fracao do volume que nao coube e a plataforma entrega a outro parceiro */
const PICO_PROD=[10,11,0];  /* novembro, dezembro e janeiro */
const HORA_EXTRA=1.25;      /* segunda onda de triagem a tarde e agregados extras no pico */
const FV_KWH=700, FV_COMP=0.85, FV_CAPEX=25000;    /* 5 kWp em Cabo Frio, compensacao liquida */
const VAGA_M2=12.5, VAGAS_MIN=6;                    /* vaga de carregamento de um carro */

/* ================= SETORES / PLANTA ================= */
const CLS={limpa:{n:"Operação — triagem e gaiolas",c:"#2E9C86"},
 circ:{n:"Circulação",c:"#5B7080"},
 frio:{n:"Custódia — insucesso e devolução",c:"#0F6B5F"},
 inter:{n:"Doca — recebimento e carregamento",c:"#D79A2E"},
 suja:{n:"Externa — papelão, plástico e resíduos",c:"#AC5F48"},
 barreira:{n:"Vestiário e copa",c:"#6E5AB0"},
 publica:{n:"Balcão do agregado e da loja",c:"#3B7CA8"},
 adm:{n:"Despacho e roteirização",c:"#7C93A1"},
 tec:{n:"Técnica",c:"#55707E"}};
/* ab:1 = faz parte do salao aberto da operacao */
const ROOM={
 tri:{n:"Triagem por rota: mesas ou esteira",c:"limpa",a:40,ab:1},
 gai:{n:"Gaiolas por rota: uma por agregado",c:"limpa",a:26,ab:1},
 cus:{n:"Custódia: insucesso, devolução e avaria",c:"frio",a:14,t:"cercado trancado, com câmera"},
 rec:{n:"Recebimento e bipagem da carreta",c:"inter",a:13},
 ves:{n:"Vestiário, copa e sanitário",c:"barreira",a:7},
 bal:{n:"Balcão do agregado e da loja",c:"publica",a:7},
 esc:{n:"Despacho e roteirização",c:"adm",a:7},
 car:{n:"Carregamento dos agregados",c:"inter",a:13}
};
const ROOM_P={
 ret:{n:"Reservatório de água",c:"tec",a:3},
 res:{n:"Abrigo de papelão, plástico e resíduos",c:"suja",a:3},
 fos:{n:"Fossa e filtro existentes",c:"tec",a:5},
 vag:{n:"Vagas de carregamento dos agregados",c:"publica",a:75},
 man:{n:"Pátio de manobra da carreta do CD",c:"circ",a:0}
};
/* ligações obrigatórias; b:"*" = qualquer setor do salão aberto */
const LIG=[
 {a:"rec",b:"tri",t:"porta",d:"Recebimento → triagem: o pallet bipado entra na triagem"},
 {a:"rec",b:"ves",t:"porta",d:"Entrada de pessoal → vestiário"},
 {a:"ves",b:"tri",t:"porta",d:"Vestiário → triagem"},
 {a:"gai",b:"car",t:"porta",d:"Gaiolas → carregamento: a gaiola da rota sai inteira"},
 {a:"cus",b:"gai",t:"porta",d:"Custódia → gaiolas: o insucesso volta para a rota do dia seguinte"},
 {a:"esc",b:"*",t:"porta",d:"Despacho → operação"},
 {a:"bal",b:"esc",t:"porta",d:"Balcão → despacho: o agregado recebe a rota e assina o romaneio"}
];
/* passagens toleradas entre a operacao e o resto */
const CRUZA_OK=["rec","ves","esc","car"];
const FLOW=["rec","tri","gai","car"];
const WI=14.70, HI=9.70, TP=0.15, TI=0.10;    /* interno útil e espessuras */
const WP=15.00, HP=13.00;                      /* pátio utilizado */

/* árvore de divisórias. Operação ao fundo, em linha: triagem, gaiolas e a
   custódia trancada; na fachada, da esquerda para a direita: recebimento
   com a porta A, vestiário, balcão, despacho e o carregamento com a porta B.
   x: 0 | triagem / recebimento 4,20 | vestiário 6,20 | balcão 7,40 gaiolas 8,40 | despacho 10,60 | carregamento 12,00 custódia | 14,70 */
const L1=()=>({d:"v",cuts:[0.62887],kids:[
  {d:"h",cuts:[0.50340,0.81633],kids:[{r:"tri"},{r:"gai"},{r:"cus"}]},
  {d:"h",cuts:[0.28571,0.42177,0.57143,0.72109],kids:[{r:"rec"},{r:"ves"},{r:"bal"},{r:"esc"},{r:"car"}]}
]});
const L1P=()=>({d:"v",cuts:[0.45000],kids:[
  {r:"man"},
  {d:"h",cuts:[0.10000,0.20000,0.30000],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"vag"}]}
]});

/* equipamentos com pé real, em metros. z = zonas aceitas, op = faixa de operação.
   E01 e E04 têm a pegada do nível comprado (ver eqList). */
const FOOT={
 E01:{n:"Triagem por rota",w:4.80,h:1.40,op:0.90,z:["limpa"],x:0.80,y:1.60,
      s:"Cada posição da mesa ou da esteira é uma rota. O triador bipa, lê o bairro e põe o pacote na posição."},
 E04:{n:"Estantes da custódia",w:2.40,h:0.60,op:0.90,z:["frio"],x:12.15,y:0.20,
      s:"Insucesso, devolução e avaria, endereçados. A altura é a da fase 2B."},
 E12:{n:"Mesa de insucesso e avaria",w:1.40,h:0.70,op:0.90,z:["frio"],x:12.60,y:3.20,
      s:"O pacote que voltou é conferido, fotografado e reembalado."},
 M01:{n:"Gaiolas de rota — fileira A",w:4.00,h:0.80,op:0.90,z:["limpa"],x:7.80,y:0.25,mob:1,
      s:"Uma gaiola por agregado, com a etiqueta da rota. Cheia, tem 1,80 m."},
 M02:{n:"Gaiolas de rota — fileira B",w:4.00,h:0.80,op:0.90,z:["limpa"],x:7.80,y:2.70,mob:1,
      s:"A segunda fileira: a rota da segunda e da terceira onda."},
 M03:{n:"Mesa de bipagem do recebimento",w:1.60,h:0.80,op:0.90,z:["inter"],x:0.20,y:6.30,mob:1,
      s:"Todo pacote da carreta é bipado aqui antes de entrar na triagem: o que não foi bipado não é do hub."},
 M04:{n:"Pallets da carreta aguardando bipagem",w:2.20,h:1.10,op:0.80,z:["inter"],x:1.95,y:6.30,mob:1,
      s:"A carreta chega às 4 h; o pallet espera aqui, nunca no pátio."},
 M05:{n:"Estação de despacho",w:1.60,h:0.70,op:0.60,z:["adm"],x:8.60,y:8.70,mob:1,
      s:"Rotas do dia, acompanhamento do agregado no mapa e tratamento de insucesso."},
 M06:{n:"Balcão do agregado e da loja",w:1.80,h:0.60,op:0.80,z:["publica"],x:6.30,y:7.20,mob:1,
      s:"O agregado assina o romaneio; a loja local deixa a coleta do dia."},
 M07:{n:"Armários da equipe",w:1.60,h:0.45,op:0.70,z:["barreira"],x:4.40,y:9.10,mob:1,
      s:"Bolsa e celular pessoal ficam aqui: na operação só entra o coletor."},
 M08:{n:"Gaiolas prontas para o carregamento",w:2.40,h:0.80,op:0.90,z:["inter"],x:11.90,y:6.40,mob:1,
      s:"A gaiola da onda seguinte espera junto à porta B."},
 M09:{n:"Carrinho de transferência",w:1.20,h:0.70,op:0.70,z:["limpa","inter"],x:0.50,y:4.20,mob:1,
      s:"Leva a saca da bipagem para a triagem e o insucesso para a custódia."}
};
const CAMADAS=[["zonas","Zonas do hub"],["paredes","Paredes e portas"],["equip","Equipamentos"],
 ["cotas","Cotas"],["hidro","Água e esgoto"],["fluxo","Fluxo do pacote"],["pilares","Pilares"],["texto","Etiquetas"]];
const HIDRO=[
 {t:"ralo",x:5.20,y:9.35,lab:"Ralo sifonado — sanitário e copa"},
 {t:"agua",x:4.40,y:6.30,lab:"Água do sanitário e da copa"},
 {t:"caimento",x:5.20,y:8.50,lab:"Caimento do piso de 1% na copa"}
];
const PILARES=[[0,0],[4.90,0],[9.80,0],[14.70,0],[0,4.85],[4.90,4.85],[9.80,4.85],[14.70,4.85],
 [0,9.70],[4.90,9.70],[9.80,9.70],[14.70,9.70]];
/* ================= ESTADO ================= */
const S={
  alugMerc:7000,custoOp:false,tma:15,dias:26,horas:7,fatorMaq:1,
  alvara:false,pesquisa:false,prolagos:false,temporarios:false,treino:false,rt:false,
  mercado:200,vol1:360,cresc:22,shareMax:25,p3:false,
  agregados:22,prazoReceb:20,
  eq:{E01:"basico",E02:"basico",E03:"basico",E04:"basico",E05:"basico",E06:"basico",E07:"basico",E08:"none",E09:"basico",E10:"basico",E11:"basico",E12:"basico",E13:"basico"},
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
  forro:false,dutoRota:"circ",lumDens:1.0,evapDreno:true,evapSobre:"circ",
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
const TAXA_RECEB=0.0;          /* a plataforma paga por transferencia; o custo e o prazo (capital de giro) */
const EFIC_GANHO=0.15, EFIC_CAPEX=4000;
const PAPEIS=[["des","Despacho e roteirização",false],["rec","Recebimento e bipagem",true],
  ["tri","Triagem por rota",true],["car","Carregamento e conferência de saída",true]];
const H={
  flags(R){
    R.cftv=S.eq.E05!=="none";
    R.gerador=!!eqT("E10").ger;
    R.gaiolas=eqT("E03").gaiolas||24;
  },
  dep(R){return {veiculo:R.veiculo}},
  capacidade(R){
    const h=S.horas, fm=S.fatorMaq||1, conf=eqT("E06").fat||1, P=R.pessoas;
    R.capRec=P.rec*REC_H*h*EFIC*fm*(eqT("E02").fat||1)*(eqT("E07").fat||1)*conf;
    R.capTri=P.tri*TRI_H*h*EFIC*fm*(eqT("E01").fat||1)*conf;
    R.capCar=P.car*CAR_H*h*EFIC*fm*(eqT("E02").fat||1)*conf;
    R.capDes=P.des*DES_DIA*(eqT("E09").rot||1)*fm;
    R.ondas=R.vagas*ONDAS;
    R.rotas=Math.min(S.agregados,R.ondas,R.gaiolas);
    R.limRotas=S.agregados<=Math.min(R.ondas,R.gaiolas)?"agregados cadastrados":(R.ondas<=R.gaiolas?"vagas × ondas no pátio":"gaiolas");
    R.capEnt=R.rotas*PAC_ROTA*(eqT("E09").pac||1)*fm;
    R.etapas=[
      {n:"Recebimento e bipagem",v:R.capRec,sala:"rec"},
      {n:"Triagem por rota",v:R.capTri,sala:"tri"},
      {n:"Carregamento e conferência de saída",v:R.capCar,sala:"car"},
      {n:"Despacho e roteirização",v:R.capDes,sala:"esc"},
      {n:"Entrega na rua (agregados)",v:R.capEnt,sala:"car",d:`${R.rotas} rotas de ${NUM(PAC_ROTA*(eqT("E09").pac||1),0)} pacotes — limite: ${R.limRotas}`}
    ];
  },
  fGeral(R){return eqT("E05").f||1},
  vari(v,R){
    if(v.id==="extr")v.preco=S.vari.extr*(eqT("E05").extr||1),v.n="Extravio e avaria descontados pela plataforma"+(R.cftv?"":" (sem câmera: ×1,8)");
    return v;
  },
  canal(c,R){return (c.id==="lo"&&!R.veiculo)?0.60:1},
  /* a plataforma paga o hub em ciclo quinzenal: o dinheiro de um pacote
     entregue hoje entra em media S.prazoReceb dias depois; o agregado recebe
     por semana. O giro e a diferenca, no volume do ano 1                    */
  giro(R){
    const dia=S.vol1*1000/365*R.fatorDemanda;
    return dia*R.precoMedio*S.prazoReceb-dia*R.materialMedio*7;
  },
  riscoSan(R,lay){
    let rs=15;
    if(!R.cftv)rs+=15; if(!R.gerador)rs+=6;
    if(!S.rt)rs+=8; if(!S.treino)rs+=8;
    if(S.agregados>R.rotas)rs+=4;
    rs+=Math.min(20,lay.viol.length*7);
    if(lay.setoresFaltando.includes("ves"))rs+=8;
    return rs;
  },
  riscoReg(R){
    let rr=15;
    if(!S.alvara)rr+=30; if(!S.prolagos)rr+=15; if(!S.pesquisa)rr+=12;
    if(!S.reservTerreo)rr+=6;
    return rr;
  },
  gates(R,lay){return [
    {id:"alvara",n:"O Alvará",ok:S.alvara,xp:15},
    {id:"pesq",n:"A Conversa com as Plataformas",ok:S.pesquisa,xp:15},
    {id:"efl",n:"O Contrato Assinado",ok:S.prolagos,xp:12},
    {id:"layout",n:"A Planta Fecha",ok:lay.deficit===0&&lay.viol.length===0&&lay.flowPct>=100,xp:15},
    {id:"pcc",n:"A Custódia Lacrada",ok:R.cftv&&S.rt&&S.treino,xp:12},
    {id:"verao",n:"A Black Friday",ok:S.p3&&S.temporarios,xp:10},
    {id:"gargalo",n:"Pacote no Prazo",ok:R.perda3Pct<5,xp:11},
    {id:"bench",n:"Bater a Locação",ok:R.dre[2].ebitda>S.alugMerc*12,xp:10}
  ]}
};

/* ================= EIXO VERTICAL (HIPOTESE DECLARADA) ================= */
const VERT={
 /* mesa ou esteira: o pacote fica aberto, com a etiqueta para cima */
 E01:{hz:0.90,hop:0.90,hman:0.60,hac:"S",aberto:1,banc:1},
 E04:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 E12:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 /* gaiola cheia: 1,80 m */
 M01:{hz:1.80,hop:1.20,hman:0.30,hac:"O"},
 M02:{hz:1.80,hop:1.20,hman:0.30,hac:"O"},
 M03:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 M04:{hz:1.60,hop:1.20,hman:0.30,hac:"O"},
 M05:{hz:1.15,hop:0.75,hman:0.30,hac:"N"},
 M06:{hz:1.05,hop:1.05,hman:0.30,hac:"S"},
 M07:{hz:1.80,hop:1.20,hman:0.20,hac:"N"},
 M08:{hz:1.80,hop:1.20,hman:0.30,hac:"O"},
 M09:{hz:1.10,hop:1.00,hman:0.30,hac:"O"}
};
const ESTANTES_IDS=["E04"];     /* seguem a altura de empilhamento da fase 2B */
const ALT_ESTANTE=2.00;         /* acima disto a caixa sai acima do ombro (hipotese de ergonomia) */

/* ================= INSTALACOES E FACHADA ================= */
const INST={
  abertos:["E01","M03","E12"],           /* onde a etiqueta fica exposta */
  difSalas:["car","rec"], salaLinha:"tri", salaLoja:"bal",
  evap:()=>S.eq.E13==="padrao", evapLinhaEq:"E01", evapPos:{x:9.00,y:9.10}, evapSala:"esc", evapSalaLinha:"tri"
};
const VITRINE=null;
const PORTAS_FACHADA=[
 {r:"rec",lado:"A",min:1.6,l:3.00,t:"enrolar",lab:"PORTA A · carreta do CD e pessoal"},
 {r:"car",lado:"B",min:1.6,l:3.20,t:"enrolar",lab:"PORTA B · agregados"},
 {r:"bal",lado:"C",min:1.2,l:1.20,t:"vidro",lab:"Porta da loja · balcão"}
];

/* ================= REGRAS Z DO NEGOCIO ================= */
H.zNegocio=(B,add,{eqs,D,M,dt})=>{
  const R=calc();
  /* Z04 — instalacao sobre a etiqueta exposta */
  zProjecao(B,add,eqs,{bloq:"pacote de papelão exposto: condensado molha a caixa e apaga a etiqueta térmica — pacote sem leitura vira insucesso",
    aviso:"a triagem e a bipagem — exigem luminária sem ofuscamento: o leitor e o olho leem etiqueta térmica a 500 lx"});
  /* Z08 — giro da paleteira e da gaiola cheia */
  zGiro(B,add,dt,D,[["rec","Recebimento e bipagem"],["gai","Gaiolas por rota"],["car","Carregamento"]],1.50,
    "a paleteira com um pallet (ou a gaiola cheia)");
  /* Z11 — o balcao precisa de porta para a rua */
  const b=D.leaves.find(l=>l.r==="bal");
  if(!b||Math.abs(b.y+b.h-HI)>EPS)add("Z11","aviso","O balcão não encosta na fachada: agregado e cliente de loja teriam de entrar pelo galpão",
    b?{x:b.x,z:b.y,w:b.w,d:b.h,y:0,h:0.3}:null,"Manter o balcão na fachada, com porta própria para a rua.");
  /* Z14 — estantes da custodia */
  zEstantes(B,add,D,"cus","Estantes da custódia");
  /* Z20 — galpao sem camera */
  const cus=D.leaves.find(l=>l.r==="cus");
  if(S.eq.E05==="none")add("Z20","erro",
    "Galpão sem câmera: a plataforma não homologa o hub e a seguradora não cobre extravio sem imagem da triagem e da custódia",
    cus?{x:cus.x,z:cus.y,w:cus.w,d:cus.h,y:0,h:2}:null,"Instalar ao menos 8 câmeras com gravação (fase 3).");
  /* Z21 — vagas de carregamento no patio */
  zVagas(B,add,n=>`Pátio com ${n} vaga(s) de carregamento — mínimo adotado de ${VAGAS_MIN}; com menos, a fila de agregados vai para a avenida e a onda da manhã atrasa`,
    "Reservar a faixa do pátio para as vagas (fase 2, vista do pátio).");
  /* Z22 — mais agregados do que gaiolas */
  const gai=D.leaves.find(l=>l.r==="gai");
  if(S.agregados>R.gaiolas)add("Z22","aviso",`${S.agregados} agregados e ${R.gaiolas} gaiolas: rota sem gaiola é pacote no chão e na mão`,
    gai?{x:gai.x,z:gai.y,w:gai.w,d:gai.h,y:0,h:1.8}:null,"Comprar gaiolas (fase 3) ou limitar o cadastro de agregados.");
  /* Z23 — as ondas do patio nao comportam os agregados */
  const vg=(B.DP&&B.DP.leaves||[]).find(f=>f.r==="vag");
  if(S.agregados>R.ondas)add("Z23","erro",`${S.agregados} agregados para ${R.vagas} vagas × ${ONDAS} ondas = ${R.ondas} carregamentos: o último carro sai depois das 9 h e perde a janela de entrega`,
    vg?{x:vg.x,z:HI+0.30+vg.y,w:vg.w,d:vg.h,y:0,h:0.3}:null,"Aumentar a faixa de vagas no pátio ou reduzir os agregados por onda.");
};

/* ================= TURNO ================= */
/* estacoes da linha, na ordem do fluxo. cap = pacotes por dia de trabalho;
   sem cap, a estacao e passagem                                            */
const ESTACOES=[
 {id:"rec",n:"Bipagem do recebimento",eq:"M03",sala:"rec",cap:R=>R.capRec},
 {id:"tri",n:"Triagem por rota",eq:"E01",sala:"tri",cap:R=>R.capTri},
 {id:"gai",n:"Gaiolas por rota",eq:"M01",sala:"gai"},
 {id:"car",n:"Carregamento",eq:"M08",sala:"car",cap:R=>R.capCar}
];
const BATELADA=30;              /* pacotes por lote: uma saca */
const TURNO={carrinho:60,       /* pacotes por viagem do carrinho */
  rolo:300,                     /* pacotes por pallet da carreta */
  carga:{"rec>tri":120}, salaRec:"rec",
  cop:20,                       /* abertura, conferencia da carreta e fechamento, em minutos */
  inicio:4};
/* despacho e rua acontecem fora da linha: o turno nao fecha mais pacotes
   do que o gargalo estatico dessas etapas deixa */
H.foraDaLinha=R=>Math.min(R.capDes,R.capEnt);

/* ================= PRODUTO NA CENA ================= */
function produtoNaCena(B){
  if(!S.produto||!B.D)return;
  const sim=(typeof SIM!=="undefined")&&SIM;
  const sala=r=>B.D.leaves.find(l=>l.r===r);
  const car=sala("car");
  if(car){const q=sim?Math.max(1,sim.kgTurno):1500;
    pilha(B,car.x+0.30,car.y+car.h-1.30,"caixa",Math.min(8,Math.max(2,Math.round(q/250))),"Pacotes da onda seguinte",q,0,"pacotes");}
  const rec=sala("rec");
  if(rec)pilha(B,rec.x+0.30,rec.y+rec.h-1.25,"caixa",8,"Pallet da carreta do CD",300,0,"pacotes");
}

/* ================= SENSIBILIDADE, CETICO E MONTE CARLO ================= */
const VARS=[
 {id:"preco",n:"Preço médio por pacote",un:"R$/pacote",geo:false,
  val:()=>calc().precoMedio,
  set:f=>CANAIS.forEach(c=>S.canais[c.id].preco=+(S.canais[c.id].preco*f).toFixed(4))},
 {id:"vol",n:"Volume do ano 1",un:"mil pacotes/ano",geo:false,val:()=>S.vol1,set:f=>{S.vol1=S.vol1*f}},
 {id:"cresc",n:"Crescimento anual",un:"%",geo:false,val:()=>S.cresc,set:f=>{S.cresc=S.cresc*f}},
 {id:"cap",n:"Pacotes por rota e rendimento da triagem",un:"pacotes/dia",geo:false,
  val:()=>calc().capKgDia,set:f=>{S.fatorMaq=(S.fatorMaq||1)*f}},
 {id:"cv",n:"Repasse ao agregado e variáveis",un:"R$/pacote",geo:false,
  val:()=>calc().matMedio,set:f=>{S.fatMat=+((S.fatMat||1)*f).toFixed(4);VARI.forEach(v=>S.vari[v.id]=+(S.vari[v.id]*f).toFixed(4))}},
 {id:"folha",n:"Folha com encargos",un:"R$/mês",geo:false,
  val:()=>calc().folha,set:f=>{S.fator=+(S.fator*f).toFixed(4)}},
 {id:"prazo",n:"Prazo de recebimento da plataforma",un:"dias",geo:false,
  val:()=>S.prazoReceb,set:f=>{S.prazoReceb=S.prazoReceb*f}},
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
const CETICO=[["preço por pacote 10% menor",()=>CANAIS.forEach(c=>S.canais[c.id].preco*=0.90)],
              ["volume 15% menor",()=>{S.vol1*=0.85}],
              ["repasse ao agregado e variáveis 10% mais caros",()=>{S.fatMat=(S.fatMat||1)*1.10;VARI.forEach(v=>S.vari[v.id]*=1.10)}],
              ["CAPEX 10% maior",()=>{S.cont=S.cont+10}],
              ["rota rendendo 10% menos",()=>{S.fatorMaq=(S.fatorMaq||1)*0.9}]];
const DISTR=[
 {id:"preco",n:"Preço por pacote",tri:[0.88,1.00,1.05]},
 {id:"vol",n:"Volume do ano 1",tri:[0.70,1.00,1.15]},
 {id:"cv",n:"Repasse e variáveis",tri:[0.95,1.00,1.15]},
 {id:"cap",n:"Pacotes por rota",tri:[0.85,1.00,1.05]},
 {id:"obra",n:"Custo de obra",tri:[0.90,1.00,1.25]}
];
const NAO_RESPONDE=[
 "Se a Shopee, o Mercado Livre ou uma transportadora fecham contrato com um hub novo em Cabo Frio: sem contrato não há volume, e quem escolhe o parceiro é a plataforma.",
 "Quanto a plataforma paga de verdade por pacote na região e em quantos dias: o preço e o prazo de recebimento são premissas, e são as variáveis de que tudo depende.",
 "Se a plataforma corta o preço ou tira a região do hub no meio do contrato — o risco de cliente concentrado que o modelo não precifica.",
 "Se há motoristas agregados suficientes, com carro e MEI, dispostos a rodar pelo repasse adotado — e se a relação com eles se sustenta na Justiça do Trabalho.",
 "Quanto custa de verdade o extravio e a avaria na região: a taxa é hipótese.",
 "Se a vizinhança e a prefeitura aceitam carreta de madrugada e vinte carros saindo às 7 h numa avenida mista.",
 "Se o aluguel de R$ 7 mil/mês é real: ele é o adversário, e se for maior o hub ganha com menos folga.",
 "Se você quer isso: o modelo compara EBITDA com aluguel, não com sossego nem com acordar às 4 h."
];

/* ================= IDENTIDADE E TEXTOS ================= */
const NEG={titulo:"Rota Prime",slug:"rota_prime",negocio:"hub de entregas de última milha",
  leiame:"um hub de entregas de ultima milha para as plataformas de e-commerce",
  ele:"o hub",pron:"ele",Curto:"Hub",
  un:"pacote",uns:"pacotes",unsCurto:"pacotes",ud:"pac",dec:0,unMil:"mil pacotes",unPreco:"R$/pacote"};
const FASES3=[["0","Briefing"],["1","Mercado"],["2","Planta baixa"],["2B","O terceiro eixo"],["3","A doca e a rua"],
  ["4","Obra"],["5","Pessoas"],["6","Custo"],["6B","Madrugada cheia"],["7","Veredicto"]];
const SAZ_NOMES={ecom:"Black Friday e verão",local:"temporada"};
const SAZ_COLS={ecom:"Plataformas e transportadoras",local:"Loja local"};
const ALTO_ID="M01";
const REF_VIOL=["Z04","Z06"];
const PORTOES=[
 ["alvara","Consulta de uso do solo na PMCF","Gratuita antes de qualquer obra. Hub de entregas opera de madrugada, com carreta descarregando e vinte carros saindo às 7 h: numa avenida mista, o horário de carga e descarga e o barulho decidem. Confirmar antes custa nada."],
 ["pesquisa","Conversa com as plataformas e com os hubs da região","Quanto a Shopee, o Mercado Livre e as transportadoras pagam por pacote em Cabo Frio, Búzios e Arraial, em quantos dias, qual o volume por CEP e quem está insatisfeito com o parceiro atual."],
 ["prolagos","Contrato de parceiro de última milha assinado","Sem contrato não há volume: a plataforma homologa o hub (CNPJ, seguro, câmera e área), define a região e o preço por pacote."],
 ["rt","Procedimento de custódia: bipagem em cada troca de mão, lacre e cercado trancado","Pacote extraviado é descontado do repasse; o procedimento é o que a seguradora e a plataforma auditam."],
 ["treino","Treinamento de triadores e agregados no app, na rota e na prova de entrega",""],
 ["temporarios","Triadores temporários e agregados extras para novembro a janeiro",""]];
const ITENS_CAMPO=[
 ["peDireito","Pe-direito livre sob laje","medir em tres pontos afastados; anotar o menor",""],
 ["vigas","Altura e largura das vigas e o vao entre elas","medir da face inferior da viga ate o piso",""],
 ["pilares","Posicao e secao dos pilares","trena a partir das duas empenas; anotar secao em cm",""],
 ["portas","Altura livre sob as portas de enrolar","com a porta recolhida: o baú do VUC do CD pede 3,20 m",""],
 ["peitoril","Piso: nivelamento e resistência para paleteira e gaiola cheia","rodar uma paleteira carregada; anotar trincas e degraus",""],
 ["forro","Forro existente: material e altura","",""],
 ["degrau","Cota do patio em relacao ao piso interno","o degrau na porta A decide se a paleteira entra direto ou precisa de rampa",""],
 ["energia","Entrada de energia e historico de queda","a triagem roda de madrugada: perguntar aos vizinhos quantas vezes a luz caiu no ultimo verao",""]];
const CORRIGE_NEG={
  Z20:{lab:"instalar 8 câmeras com gravação",ok:()=>S.eq.E05==="none",fn:()=>{S.eq.E05="basico"}}};
const PROVAS=[
 ["Pé-direito de 2,30 m bloqueia a gaiola cheia","Z01",()=>{S.peLaje=2.30}],
 ["Difusor sobre a triagem vira bloqueio","Z04",()=>{S.dutoRota="linha";S.evapSobre="linha";S.eq.E13="padrao"}],
 ["Evaporador sem dreno vira bloqueio","Z12",()=>{S.eq.E13="padrao";S.evapDreno=false}],
 ["Estante da custódia acima do ombro vira aviso","Z14",()=>{S.alturaEmp=2.60}],
 ["Galpão sem câmera vira erro","Z20",()=>{S.eq.E05="none"}],
 ["Pátio sem vaga de carregamento vira aviso","Z21",()=>{S.treeP={d:"v",cuts:[0.45],kids:[{r:"man"},{d:"h",cuts:[0.10,0.20,0.30],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"man"}]}]}}],
 ["Agregados demais para o pátio viram erro","Z23",()=>{S.agregados=40}]];
const VISTAS=[
 {id:"geral",n:"Geral",ap(){CAM.modo="orb";ACOES3.fit();CAM.corte=1.20;S.corteLocal=null}},
 {id:"linha",n:"Triagem",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["tri","gai"]);
   CAM.yaw=-1.15;CAM.pitch=0.92;CAM.dist=11;CAM.corte=2.40;S.corteLocal=null;S.layers3.equip=true}},
 {id:"barreira",n:"Doca e recebimento",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["rec","ves"]);
   CAM.yaw=-0.6;CAM.pitch=0.7;CAM.dist=8;CAM.corte=1.40;S.corteLocal=null;S.corMode="zona";S.layers3.zonas=true}},
 {id:"frio",n:"Gaiolas e carregamento",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["gai","car"]);
   CAM.yaw=-2.1;CAM.pitch=0.62;CAM.dist=9.5;CAM.corte=3.00;S.corteLocal=null}},
 {id:"receb",n:"Balcão e despacho",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["bal","esc"]);
   CAM.yaw=1.4;CAM.pitch=0.35;CAM.dist=7.5;CAM.corte=2.40;S.corteLocal=null}},
 {id:"oper",n:"Do triador",ap(){const c=centroSala("tri");CAM.modo="fp";CAM.fp=[c[0],1.65,c[2]+1.4];
   CAM.fyaw=-Math.PI/2;CAM.fpit=-0.05}}];
const TXT={
  f0lead:"Esta versão testa um <b>hub de entregas de última milha</b>: o parceiro local que recebe de madrugada a carreta do centro de distribuição das plataformas, tria os pacotes por rota e entrega com motoristas agregados, que rodam com carro e MEI próprios e recebem por pacote. Sem frota e sem máquina cara, o CAPEX fica abaixo de R$ 200 mil. A régua é a mesma que julgou a marcenaria e o pastel.",
  f0porqueTit:"Por que um hub de última milha.",
  f0porque:"A Região dos Lagos compra pela internet como o resto do país e triplica de população no verão, mas fica longe dos centros de distribuição do Rio. As plataformas terceirizam a última milha a parceiros locais e pagam por pacote entregue. O imóvel tem o que o negócio pede: galpão para triar, pátio para a carreta e para os carros carregarem, e acesso por uma avenida. A margem é fina — pouco mais de um real por pacote — e vem de volume e de rota bem montada; o risco é de cliente concentrado (a plataforma dita o preço e pode tirar a região) e de capital de giro, porque a plataforma paga semanas depois e o agregado quer receber toda semana.",
  f0decide:"Ele verifica a planta da triagem, a altura livre sob viga para a gaiola cheia, o giro da paleteira, a custódia trancada, a câmera, a iluminância de leitura de etiqueta, as vagas de carregamento do pátio como limite das ondas da manhã, a rota de fuga, os metros caminhados por pacote e a demanda mês a mês com o pico da Black Friday. Ele <b>não</b> substitui o contrato com a plataforma, projeto executivo, ART nem projeto de incêndio.",
  regiao:"Cabo Frio, Búzios e Arraial",faixaMercado:[20,600,5],faixaVol:[50,1200,10],passoPreco:0.05,
  p3Nome:"Operação estendida no pico — novembro a janeiro",
  p3Desc:R=>`Segunda onda de triagem à tarde e agregados extras: +${PCT((HORA_EXTRA-1)*100)} de capacidade no pico, a 150% da hora de quem é CLT — cerca de ${BRL(R.folhaProd*(HORA_EXTRA-1)*1.5*PICO_PROD.length)}/ano de folha.`,
  matNome:"repasse ao agregado",
  f1preco:"O preço é o que o hub recebe por pacote entregue; o repasse é o que o hub paga ao motorista agregado. A diferença, menos imposto, variáveis e multas de prazo, é a margem — pouco mais de um real. Sem câmera, a plataforma homologa menos volume (−15%); sem veículo próprio, a loja local, que quer coleta, fica pela metade.",
  f1curva:"O pacote não espera: o que não cabe no mês a plataforma entrega com outro parceiro, e só uma parte volta. Novembro (11.11 e Black Friday) e dezembro decidem o ano; em janeiro o pedido vai para a casa de praia do veranista.",
  f2lead:"A operação fica ao fundo, em linha: triagem, gaiolas por rota e a custódia trancada. Na fachada, o recebimento com a porta A (a carreta do CD), o vestiário, o balcão do agregado, o despacho e o carregamento com a porta B, que dá para as vagas do pátio.",
  producao:"operação",vagasNome:"Vagas de carregamento no patio",
  f2blead:"Pe-direito, vigas, forro e a altura da gaiola cheia e das estantes da custódia.",
  estantesNome:"estantes da custódia",forroDesc:"Galpão de papelão não pede forro; sem ele a luminária fica mais alta e a iluminância cai.",
  dutoOps:[["circ","o carregamento e o recebimento"],["linha","a triagem e as mesas"]],
  evapOps:[["circ","a parede da fachada do despacho"],["linha","a triagem"]],
  drenoDesc:"Sem dreno, condensado pinga no pacote e apaga a etiqueta. Bloqueio.",
  altoNome:"a gaiola de rota cheia",altoRisco:"Se a gaiola cair sob a viga, a fileira muda de lugar — ou a rota sai em duas gaiolas pela metade.",
  f3lead:R=>`O limite das rotas hoje é <b>${R.limRotas}</b>: ${R.rotas} rotas de ${NUM(PAC_ROTA*(eqT("E09").pac||1),0)} pacotes.`,
  f3cap:R=>`Um triador separa ${TRI_H} pacotes por hora; a bipagem da carreta rende ${REC_H} por pessoa; a conferência de saída, ${CAR_H}. O despacho acompanha ${NUM(DES_DIA,0)} pacotes por pessoa por dia (×${N2(eqT("E09").rot||1)} com o roteirizador). Cada agregado leva ${PAC_ROTA} pacotes por dia, e o pátio carrega ${R.vagas} carros por onda, em ${ONDAS} ondas.`,
  carteiraNome:"A demanda mês a mês",perdaNome:"Volume que foi para outro parceiro",
  f3pico:"De novembro a janeiro o volume sobe um terço. O que o hub não entrega no dia a plataforma redistribui, e o parceiro que falha no pico perde região no ano seguinte. Operação estendida, triador temporário e agregado extra seguram o pico; o pátio decide quantos carros carregam por onda.",
  trifDesc:"Esteira, coletores, câmeras, iluminação da madrugada e o ar do despacho: conferir a entrada e o quadro antes de ligar tudo junto.",
  incDesc:"Papelão, plástico e pacote de conteúdo desconhecido: carga de incêndio alta. Extintor certo e rota livre são o que o Corpo de Bombeiros confere.",
  eficNome:"Programa de redução de insucesso",eficDesc:"Prova de entrega com foto, contato prévio com o cliente e rota por janela de horário: corta 15% dos variáveis (insucesso, extravio, devolução), com R$ 4.000 de CAPEX em treinamento e app.",
  giroDesc:`a plataforma paga em média ${"${S.prazoReceb}"} dias depois; o agregado recebe toda semana`,
  depFora:{veiculo:"sem veículo próprio"},
  f5hint:"Quem vende é o sócio: o contrato com a plataforma e o cadastro de agregados. A equipe CLT é pequena e trabalha de madrugada; o grosso do custo é o repasse ao agregado, pago por pacote entregue.",
  garantiaNome:"Multas de prazo (SLA) da plataforma",
  freteNome:"Sem veículo próprio",freteDesc:"Não compra a Fiorino; resgate de rota e coleta reversa ficam com os agregados, e a loja local fica pela metade.",
  f6blead:"a saca bipada no recebimento vai para a triagem, o pacote triado para a gaiola da rota e a gaiola cheia para o carregamento.",
  copNome:"Janela perdida com a conferência da carreta e o fechamento do dia",
  bossFiscalNome:"O Auditor da Plataforma Sobe na Escada",bossPicoNome:"Black Friday: 11.11 e a Semana do Frete Grátis",
  fiscalOk:"Nada acima da linha reprova: difusores e evaporadores estão fora da projeção da triagem e da bipagem.",
  sol:"Sol direto sobre a triagem esquenta o galpão de madrugada nenhuma — mas às 9 h, com a porta B aberta, o pacote que espera a última onda cozinha: chocolate, cosmético e remédio chegam estragados.",
  r07:"a mesa de bipagem",cvNome:"Repasse ao agregado e variáveis",
  z19quando:"de novembro a janeiro (Black Friday e verão)",
  z19como:"Operação estendida no pico (fase 1), triador temporário e agregados extras (fase 5), roteirizador (fase 3)."
};
H.fase5ok=R=>R.pessoas.des>0&&R.pessoas.rec>0&&R.pessoas.tri>0&&R.pessoas.car>0;
H.f5extra=R=>cRng("agregados","Motoristas agregados cadastrados (MEI, carro ou moto próprios)",6,60,1,"")+
  cRng("prazoReceb","Prazo médio de recebimento da plataforma (dias)",5,45,1," d")+
  `<div class="hint">O agregado não entra na folha: recebe ${BRL2(R.materialMedio)} por pacote entregue, em média. Hoje rodam <b>${R.rotas} rotas</b> — o limite é ${R.limRotas} (${S.agregados} agregados, ${R.ondas} carregamentos no pátio, ${R.gaiolas} gaiolas). <span class="b b-hip">HIPOTESE</span></div>`;
H.bossPico=()=>{
  const R=calc(), T=R.temporada, pico=T.meses.filter(x=>PICO_PROD.includes(x.m));
  const dem=pico.reduce((a,x)=>a+x.dem,0), prod=pico.reduce((a,x)=>a+x.prod,0), des=pico.reduce((a,x)=>a+x.perda,0);
  const txt=[`Novembro a janeiro, ano 3: entram ${NUM(dem*1000,0)} pacotes e o hub entrega até ${NUM(prod*1000,0)}${S.p3?" com a operação estendida":""}.`];
  txt.push(des*1000<=1?"Nenhum pacote vai para outro parceiro: o hub segura o pico.":`${NUM(des*1000,0)} pacotes vão para outro parceiro no pico (${BRL(des*1000*R.precoMedio)} de receita). O gargalo é ${R.gargalo.n.toLowerCase()}.`);
  txt.push(`O pátio carrega ${R.vagas} carros por onda: ${R.ondas} carregamentos até as 9 h para ${S.agregados} agregados.`);
  ZV.filter(v=>["Z08","Z19","Z21","Z22","Z23"].includes(v.cod)).forEach(v=>txt.push(`${v.cod} — ${v.msg}`));
  return `<div class="hint ${des*1000>1?"bad":""}"><b>${TXT.bossPicoNome}</b><br>${txt.join("<br>")}</div>`;
};
H.auditoria=p=>{
  p("Pacote na cena","0,50 × 0,35 × 0,30","m","catálogo","produto na cena");
  p("Bipagem da carreta",NUM(REC_H,0),"pacotes/h por pessoa","hipótese","capacidade");
  p("Triagem",NUM(TRI_H,0),"pacotes/h por triador","hipótese","capacidade");
  p("Conferência de saída",NUM(CAR_H,0),"pacotes/h por pessoa","hipótese","capacidade");
  p("Despacho",NUM(DES_DIA,0),"pacotes/dia por pessoa","hipótese","capacidade");
  p("Pacotes por rota",String(PAC_ROTA),"por agregado por dia","hipótese","capacidade");
  p("Ondas de carregamento",String(ONDAS),"entre 5h30 e 9h","hipótese","capacidade, Z23");
  p("Agregados cadastrados",String(S.agregados),"","hipótese","capacidade");
  p("Prazo de recebimento da plataforma",String(S.prazoReceb),"dias","hipótese","capital de giro");
  p("Extravio sem câmera","1,8","× a taxa","hipótese","custo variável, Z20");
  p("Volume homologado sem câmera","−15","%","hipótese","receita");
  p("Loja local sem veículo próprio","−40","%","hipótese","receita");
  p("Agregado MEI, sem INSS patronal sobre o repasse","sim","","hipótese","custo variável");
};
//@@HTML
TITULO=Rota Prime
NEGOCIO=hub de entregas de última milha
NAO_AJUDA=preço por pacote e prazo que a plataforma pratica, contrato de parceiro, disponibilidade de agregados
ARQUIVO=rota_prime_3d_v1.0.html
//@@TARDIO
/* formas dos equipamentos do hub: o kit generico do motor */
function detalhesEquip(e,B){
  const nivel=S.eq[e.id];
  switch(e.id){
    case "E01": forma(e,B,nivel==="basico"?"mesa":"esteira",{n:5}); break;
    case "E04": forma(e,B,"estante",{niveis:4,n:4}); break;
    case "E12": forma(e,B,"bancada",{n:2}); break;
    case "M01": case "M02": forma(e,B,"gaiola",{cheio:e.id==="M01"?0.8:0.5}); break;
    case "M03": forma(e,B,"bancada",{n:3}); break;
    case "M04": forma(e,B,"pallet"); break;
    case "M05": forma(e,B,"estacao",{telas:2}); break;
    case "M06": forma(e,B,"balcao",{n:2}); break;
    case "M07": forma(e,B,"armario",{portas:4}); break;
    case "M08": forma(e,B,"gaiola",{cheio:0.9}); break;
    case "M09": forma(e,B,"carrinho",{n:2}); break;
  }
}
