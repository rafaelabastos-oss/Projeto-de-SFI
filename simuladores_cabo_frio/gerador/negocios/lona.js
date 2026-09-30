/* ==================================================================
   LONA PRIME 3D — v1.0 (motor herdado do Pastel Prime 3D v3.2, pelas
   versoes Gelo, Enxoval, Praia, Visual, Uniforme e Planejado Prime 3D)
   Estudo de viabilidade de uma oficina de toldos, capotaria nautica e
   capas de barco — corta, costura, solda e instala toldo retratil, capota,
   bimini, capa de lancha e de jet ski e cobertura de quiosque — em Novo
   Portinho, Cabo Frio (RJ), perto das marinas do canal, com CAPEX abaixo
   de R$ 200 mil, contra a alternativa de alugar o imovel por R$ 7 mil/mes.
   Arquivo unico, offline. A unidade do modelo e o metro quadrado de lona
   confeccionada e entregue; o motor conta em mil m².
   O que e deste negocio: tabelas de dados, capacidade por etapa (medicao,
   corte, costura e solda, estrutura, instalacao) ponderada pelo que cada
   linha pede, as regras Z04, Z08, Z11, Z14, Z20 e Z21, o turno da oficina,
   as formas dos equipamentos e os textos das fases.
   ================================================================== */

/* ================= EQUIPAMENTOS ================= */
/* preço em R$; w/hh = pegada. Base: faixas de mercado, set/2026, ±40% —
   cotar. A tese é CAPEX baixo: máquina de costura industrial usada, solda
   de ar quente manual e serralheria leve; a soldadora de alta frequência e
   a picape são os upgrades.                                               */
const EQ=[
 {id:"E01",n:"Mesa de corte",req:"Onde a lona vira painel: o toldo e a capa são riscados e cortados em peças de até 6 m",kw:0.4,etapa:"corte",
  t:[{k:"basico",n:"Mesa de 6 × 2 m com régua e cortador de lâmina quente",p:6500,fat:1.00,w:6.00,hh:2.00},
     {k:"padrao",n:"Mesa de 7 × 2,2 m com trilho de corte e marcação a laser (+20%)",p:16000,fat:1.20,w:7.00,hh:2.20}]},
 {id:"E02",n:"Máquinas de costura industrial",req:"Pesponto duplo em lona grossa: uma máquina por costureira",kw:1.2,etapa:"costura",
  t:[{k:"basico",n:"2 máquinas de pesponto duplo usadas e 1 overloque",p:14000,maq:2,w:3.00,hh:1.10},
     {k:"padrao",n:"3 máquinas, uma de braço longo para capota e bimini (+8%)",p:26000,maq:3,fat:1.08,w:3.80,hh:1.10}]},
 {id:"E03",n:"Solda de lona",req:"Toldo de PVC e cobertura de quiosque são soldados, não costurados: a emenda não vaza",kw:3.5,etapa:"costura",
  t:[{k:"none",n:"Não — só costura (cobertura e toldo de PVC ficam pela metade)",p:0,fat:1.00,solda:0},
     {k:"basico",n:"Soldador de ar quente manual e mesa de solda (+10% na costura)",p:9000,fat:1.10,solda:1,w:1.60,hh:1.00},
     {k:"padrao",n:"Soldadora de alta frequência usada (+30% na costura)",p:45000,fat:1.30,solda:1,w:2.00,hh:1.40}]},
 {id:"E04",n:"Serralheria leve",req:"Braço, perfil e tubo do toldo: alumínio cortado, furado e soldado na medida",kw:3.0,etapa:"estrutura",
  t:[{k:"basico",n:"Serra de esquadria para alumínio, furadeira de bancada e solda MIG compacta",p:9000,fat:1.00},
     {k:"padrao",n:"Mais dobradeira de tubo e policorte (+12%)",p:17000,fat:1.12}]},
 {id:"E05",n:"Exaustão da solda",req:"Solda de PVC solta fumo com ácido clorídrico: coifa sobre a soldadora e duto para fora",kw:0.8,etapa:"-",crit:true,
  t:[{k:"none",n:"Não — janela aberta",p:0},{k:"basico",n:"Exaustor com coifa sobre a soldadora",p:4000},{k:"padrao",n:"Coifa, duto pela laje e filtro",p:9000}]},
 {id:"E06",n:"Climatização do atendimento",req:"O cliente escolhe a cor da lona e aprova o desenho sentado — no calor de Cabo Frio",kw:1.5,etapa:"-",
  t:[{k:"basico",n:"Ventiladores (−4% de fechamento)",p:1500,f:0.96},{k:"padrao",n:"Split de 18 mil BTU no atendimento",p:6500,f:1.00}]},
 {id:"E07",n:"Mostruário",req:"Toldo se vende pelo que o cliente vê abrir e fechar; capa, pela costura de perto",kw:0.3,etapa:"-",
  t:[{k:"basico",n:"Catálogo de lonas, amostras e fotos de obras (−7%)",p:3000,f:0.93},
     {k:"padrao",n:"Toldo retrátil montado no atendimento e bimini de mostruário",p:12000,f:1.00},
     {k:"premium",n:"Toldo motorizado, cortina rolô e capa de jet ski no atendimento (+4%)",p:22000,f:1.04}]},
 {id:"E08",n:"Veículo de instalação",req:"Escada, andaime e perfil de 6 m até a casa, o quiosque e a marina",kw:0,etapa:"-",
  t:[{k:"none",n:"Não comprar — frete contratado por instalação",p:0,veic:0},{k:"basico",n:"Picape usada com rack para escada e perfis",p:70000,veic:1}]},
 {id:"E09",n:"Orçamento e padronagem",req:"Medir, desenhar e orçar rápido: toldo se fecha na visita",kw:0.3,etapa:"-",
  t:[{k:"basico",n:"Planilha de orçamento, trena a laser e fotos",p:1500,f:1.00,proj:1.00},
     {k:"padrao",n:"CAD de padronagem e tablet de medição (+4%; +25% na medição)",p:9000,f:1.04,proj:1.25}]},
 {id:"E10",n:"Conforto térmico da oficina",req:"Galpão fechado no verão: costureira com lona no colo rende menos",kw:0.8,etapa:"-",
  t:[{k:"basico",n:"Exaustores e ventiladores",p:3000,fat:1.00},{k:"padrao",n:"Climatização evaporativa (+4%)",p:9000,fat:1.04}]},
 {id:"E11",n:"Kit de instalação",req:"Escada, andaime tubular, furadeira de impacto e chumbador: o toldo mal fixado é o que volta",kw:0,etapa:"instalação",
  t:[{k:"basico",n:"1 kit (uma equipe de instalação)",p:7000,equipes:1},{k:"padrao",n:"2 kits (duas equipes)",p:14000,equipes:2}]},
 {id:"E12",n:"Porta-rolos de lona",req:"Rolo de lona guardado deitado, no suporte, longe do sol: dobrada, a lona acrílica marca",kw:0,etapa:"-",
  t:[{k:"basico",n:"Porta-rolos de parede para 12 rolos",p:4000,fat:1.00},{k:"padrao",n:"Porta-rolos com desenrolador e carrinho (+4%)",p:8000,fat:1.04}]},
 {id:"E13",n:"Prensa de ilhós e botão",req:"Ilhós, botão de pressão e fixador de capa: centenas por serviço",kw:0.2,etapa:"estrutura",
  t:[{k:"basico",n:"Prensa manual de ilhós",p:1500,fat:1.00},{k:"padrao",n:"Prensa pneumática (+6%)",p:6000,fat:1.06}]},
 {id:"E14",n:"Compressor",req:"Prensa pneumática, pistola de ar e limpeza",kw:1.1,etapa:"-",
  t:[{k:"basico",n:"Compressor silencioso 50 L",p:2500}]}
];

/* ================= OBRA ================= */
const OBRA=[
 {id:"piso",n:"Piso da oficina regularizado e pintado (~90 m²)",min:4000,max:8000},
 {id:"eletr",n:"Elétrica: tomada por máquina, circuito da solda e iluminação de costura",min:5000,max:10000},
 {id:"vedac",n:"Divisórias: serralheria fechada, atendimento e orçamento; forro",min:5000,max:10000},
 {id:"vest",n:"Vestiário, copa e sanitário (adequação)",min:3000,max:6000},
 {id:"fach",n:"Fachada, vitrine e toldo da própria loja",min:3000,max:8000},
 {id:"inc",n:"Prevenção de incêndio: extintores, sinalização e iluminação de emergência (lona e PVC)",min:3000,max:6000},
 {id:"proj",n:"Projetos, ART e laudo do Corpo de Bombeiros",min:3000,max:6000},
 {id:"lic",n:"Licenças: alvará, bombeiros e dispensa ambiental municipal",min:2000,max:5000},
 {id:"marca",n:"Marca, catálogo, Google e visitas a marinas, arquitetos e pousadas",min:3000,max:8000}
];
const OBRA_DEP={};

/* ================= PESSOAS ================= */
/* proj = medicao e orcamento; cor = corte; cos = costura e solda; est =
   estrutura e acabamento (serralheria, ilhos, ziper); ins = instalacao.
   Valores fracionados = parte do dia.                                     */
const POSTOS=[
 {id:"p1",n:"Gestor / sócio-operador (pró-labore; mede, desenha, vende e fecha com marina e arquiteto)",sal:6000,fator:1.15,proj:0.6,on:true,fixo:true},
 {id:"p2",n:"Costureira(o) de lona 1",sal:2600,cos:1,on:true},
 {id:"p3",n:"Costureira(o) de lona 2",sal:2600,cos:1,on:true},
 {id:"p4",n:"Serralheiro(a)-instalador(a) — estrutura de manhã, instalação à tarde",sal:2900,est:0.5,ins:0.5,on:true},
 {id:"p5",n:"Ajudante — corta a lona de manhã e instala à tarde",sal:1900,cor:0.5,ins:0.5,on:true,dep:"instalacao"},
 {id:"p6",n:"Vendedor(a)-medidor(a) (opcional)",sal:2600,proj:1,on:false},
 {id:"p7",n:"3ª costureira (opcional; pede 3 máquinas)",sal:2600,cos:1,on:false},
 {id:"p8",n:"Instalador(a) (opcional)",sal:2400,ins:1,on:false,dep:"instalacao"},
 {id:"p9",n:"Cortador(a) e acabamento (opcional)",sal:2000,cor:0.5,est:0.5,on:false}
];

/* ================= FIXO ================= */
const FIXO=[
 {id:"energia",n:"Energia: iluminação de costura, atendimento e escritório",v:600},
 {id:"agua",n:"Água e esgoto",v:100},
 {id:"cont",n:"Contabilidade",v:1100},
 {id:"seg",n:"Seguros: patrimônio, estoque de lona e responsabilidade na instalação",v:400},
 {id:"mkt",n:"Marketing: Instagram, Google e relacionamento com marinas, arquitetos e pousadas",v:2200},
 {id:"ti",n:"Software, internet e telefone",v:500},
 {id:"hig",n:"Limpeza, EPIs e uniformes",v:250},
 {id:"manref",n:"Agulhas, lâminas, bicos de solda e manutenção das máquinas",v:350},
 {id:"veic",n:"Veículo próprio: seguro, IPVA e manutenção fixa",v:1200,dep:"veiculo"}
];

/* ================= VARIÁVEL (por m² de lona) ================= */
const VARI=[
 {id:"aviam",n:"Linha, fio de solda, zíper, velcro e fita",cons:1,un:"—",preco:14,pun:"R$/m²"},
 {id:"fix",n:"Ilhoses, botões, fixadores e chumbadores",cons:1,un:"—",preco:8,pun:"R$/m²"},
 {id:"frete",n:"Frete de lona, perfis e ferragens até a oficina",cons:1,un:"—",preco:6,pun:"R$/m²"},
 {id:"entrega",n:"Frete contratado para a instalação",cons:1,un:"—",preco:18,pun:"R$/m²"},
 {id:"emb",n:"Embalagem e proteção para o transporte",cons:1,un:"—",preco:3,pun:"R$/m²"},
 {id:"energia",n:"Energia da solda, das máquinas e do compressor",cons:1.5,un:"kWh/m²",preco:0.98,pun:"R$/kWh"}
];

/* ================= LINHAS DE PRODUTO ================= */
/* share = fracao dos m² vendidos; preco e mat (lona, estrutura e ferragem
   de inox) em R$ por m²; est = a linha passa pela serralheria; ins = peso
   da instalacao (1 = toldo instalado na parede; 0,3 = capa ajustada na
   marina); solda = a linha pede solda de lona; saz = curva da linha       */
const CANAIS=[
 {id:"tr",n:"Toldos residenciais e comerciais (retrátil, fixo e cortina rolô externa)",share:40,preco:480,mat:190,saz:"verao",est:1,ins:1.0,solda:0},
 {id:"cn",n:"Capotaria náutica: capota, bimini e capa de lancha e de jet ski",share:30,preco:560,mat:150,saz:"nautica",est:0,ins:0.3,solda:0},
 {id:"ca",n:"Coberturas e tendas para quiosques, pousadas e eventos",share:15,preco:320,mat:120,saz:"evento",est:1,ins:1.0,solda:1},
 {id:"rf",n:"Troca de lona, reforma e conserto",share:15,preco:260,mat:70,saz:"reforma",est:0,ins:0.5,solda:0}
];
const SAZ=[["Janeiro",90,"Temporada: quiosque e pousada consertam na correria"],["Fevereiro",80,"Carnaval"],["Março",85,"Barco volta da temporada: capa e reforma"],["Abril",80,"Baixa temporada"],["Maio",75,"Baixa temporada"],["Junho",70,"Inverno"],["Julho",78,"Férias de julho"],["Agosto",100,"O dono prepara a casa e o barco para o verão"],["Setembro",125,"Pedido para instalar antes do verão"],["Outubro",140,"Pico: toldo e capa antes de dezembro"],["Novembro",138,"Última janela antes do réveillon"],["Dezembro",108,"Entregas finais e a pousada que esqueceu"]];
/* curvas proprias de cada linha (indice, media ~100) */
const SAZ_LINHA={
 verao:[90,80,80,75,70,65,75,100,125,140,140,110],
 nautica:[110,100,110,90,70,60,70,90,120,135,130,115],
 evento:[130,120,80,80,90,100,90,80,90,100,110,130],
 reforma:[90,90,110,110,100,95,95,100,110,110,105,85]
};

/* ================= PREMISSAS DA CAPOTARIA (hipoteses declaradas) ================= */
const COS_H=1.30;           /* m² de lona costurada ou soldada por hora, por costureira */
const CORTE_H=14;           /* m² riscados e cortados por hora na mesa */
const EST_H=2.50;           /* m² de toldo com estrutura por hora, na serralheria e no acabamento */
const INST_H=1.80;          /* m² instalados por hora por pessoa (toldo na parede) */
const DESLOC=0.75;          /* fracao do dia de instalacao que sobra depois da estrada ate Buzios e Arraial */
const PROJ_M2_MES=450;      /* m² fechados por mes por pessoa em tempo integral (medir, desenhar, orcar) */
const EFIC=0.85;            /* fracao produtiva do turno */
const GARANTIA=0.02;        /* garantia e retorno de instalacao, fracao do preco */
const INST_TERC=45;         /* R$/m² pagos ao instalador autonomo */
const DESISTE=0.30;         /* fracao da carteira que desiste quando o prazo passa de um mes */
const PICO_PROD=[8,9,10];   /* setembro a novembro */
const HORA_EXTRA=1.20;      /* producao no pico com hora extra */
const FV_KWH=700, FV_COMP=0.85, FV_CAPEX=25000;    /* 5 kWp em Cabo Frio, compensacao liquida */
const VAGA_M2=12.5, VAGAS_MIN=2;                    /* vaga de cliente e o minimo que a avenida pede */

/* ================= SETORES / PLANTA ================= */
const CLS={limpa:{n:"Oficina — corte, costura e solda",c:"#2E9C86"},
 circ:{n:"Circulação",c:"#5B7080"},
 frio:{n:"Peça pronta",c:"#0F6B5F"},
 inter:{n:"Intermediária — serralheria, recebimento e expedição",c:"#D79A2E"},
 suja:{n:"Externa — retalho de lona e cavaco de alumínio",c:"#AC5F48"},
 barreira:{n:"Vestiário e copa",c:"#6E5AB0"},
 publica:{n:"Pública — atendimento e mostruário",c:"#3B7CA8"},
 adm:{n:"Administrativa — orçamento e desenho",c:"#7C93A1"},
 tec:{n:"Técnica",c:"#55707E"}};
const ROOM={
 ser:{n:"Serralheria leve: braço, perfil e tubo",c:"inter",a:16,t:"fechada: solda MIG e cavaco"},
 cor:{n:"Corte: mesa de lona",c:"limpa",a:34,ab:1},
 cos:{n:"Costura, solda e acabamento",c:"limpa",a:22,ab:1},
 ves:{n:"Vestiário, copa e sanitário",c:"barreira",a:7},
 est:{n:"Recebimento de lona e perfis / entrada de pessoal",c:"inter",a:12},
 esc:{n:"Orçamento e desenho",c:"adm",a:6},
 loj:{n:"Atendimento e mostruário",c:"publica",a:14},
 exp:{n:"Expedição e carga",c:"inter",a:9}
};
const ROOM_P={
 ret:{n:"Reservatório de água",c:"tec",a:3},
 res:{n:"Abrigo de retalho de lona e cavaco de alumínio",c:"suja",a:3},
 fos:{n:"Fossa e filtro existentes",c:"tec",a:5},
 vag:{n:"Vagas de clientes, junto ao portão",c:"publica",a:25},
 man:{n:"Pátio de carga e de montagem de toldo grande",c:"circ",a:0}
};
const LIG=[
 {a:"est",b:"cor",t:"porta",d:"Recebimento → corte: o rolo de lona vai direto para a mesa"},
 {a:"est",b:"ves",t:"porta",d:"Entrada de pessoal → vestiário"},
 {a:"ves",b:"ser",t:"porta",d:"Vestiário → serralheria"},
 {a:"ser",b:"cor",t:"porta",d:"Serralheria → oficina: a estrutura passa sem levar o cavaco"},
 {a:"esc",b:"*",t:"porta",d:"Orçamento → oficina"},
 {a:"cos",b:"exp",t:"porta",d:"Costura → expedição"},
 {a:"loj",b:"esc",t:"porta",d:"Atendimento → orçamento"},
 {a:"loj",b:"exp",t:"porta",d:"Atendimento → expedição (o cliente confere a capa sem entrar na oficina)"}
];
const CRUZA_OK=["est","ves","esc","ser","exp"];
const FLOW=["est","cor","cos","exp"];
const WI=14.70, HI=9.70, TP=0.15, TI=0.10;
const WP=15.00, HP=13.00;

/* árvore de divisórias. Oficina ao fundo: serralheria fechada, a mesa de
   corte e a costura com a solda; na fachada: vestiário, recebimento com a
   porta A, orçamento, atendimento com o toldo de mostruário e a expedição
   com a porta B.
   x: 0 | serralheria / vestiário 2,10 recebimento | 3,60 corte | 5,90 orçamento | 7,90 atendimento | 10,40 costura | 11,90 expedição | 14,70 */
const L1=()=>({d:"v",cuts:[0.59794],kids:[
  {d:"h",cuts:[0.24490,0.70748],kids:[{r:"ser"},{r:"cor"},{r:"cos"}]},
  {d:"h",cuts:[0.14286,0.40136,0.53741,0.80952],kids:[{r:"ves"},{r:"est"},{r:"esc"},{r:"loj"},{r:"exp"}]}
]});
const L1P=()=>({d:"v",cuts:[0.62000],kids:[
  {r:"man"},
  {d:"h",cuts:[0.12000,0.24000,0.36000],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"vag"}]}
]});

const FOOT={
 E01:{n:"Mesa de corte de lona",w:6.00,h:2.00,op:0.90,z:["limpa"],x:3.90,y:0.60,
      s:"A lona é desenrolada, riscada pelo desenho e cortada em painéis de até 6 m."},
 E02:{n:"Linha de costura industrial",w:3.00,h:1.10,op:0.90,z:["limpa"],x:10.65,y:0.35,
      s:"Uma máquina por costureira; a de braço longo fecha a capota e o bimini."},
 E03:{n:"Soldadora de lona",w:1.60,h:1.00,op:0.90,z:["limpa"],x:10.70,y:2.95,
      s:"Emenda de PVC soldada não vaza: cobertura de quiosque e toldo de PVC."},
 E04:{n:"Bancada de serralheria",w:2.40,h:0.90,op:0.90,z:["inter"],x:0.30,y:0.40,
      s:"Serra de esquadria, furadeira e solda MIG: o braço e o perfil do toldo na medida."},
 E12:{n:"Porta-rolos de lona",w:2.60,h:0.70,op:0.90,z:["inter"],x:2.35,y:6.00,
      s:"Rolo deitado no suporte, longe do sol: dobrada, a lona acrílica marca."},
 M01:{n:"Mesa de acabamento e ilhós",w:2.00,h:0.90,op:0.90,z:["limpa"],x:10.60,y:4.75,mob:1,
      s:"Ilhós, botão de pressão, zíper e bainha: a capa sai daqui pronta para conferir."},
 M02:{n:"Estante de ferragens de inox e aviamentos",w:1.60,h:0.50,op:0.80,z:["inter"],x:0.25,y:5.10,mob:1,
      s:"Braço, terminal de inox, zíper e linha por pedido. A altura é a da fase 2B."},
 M03:{n:"Cavalete de perfis cortados",w:3.00,h:0.60,op:0.80,z:["inter"],x:0.30,y:2.40,mob:1,
      s:"Perfil de alumínio cortado na medida, separado por pedido."},
 M04:{n:"Capas e toldos prontos para instalar",w:1.00,h:2.00,op:0.80,z:["inter"],x:13.55,y:6.10,mob:1,
      s:"Pedido pronto por cliente, dobrado sem vinco e etiquetado."},
 M05:{n:"Mesa de atendimento e mostruário de lonas",w:1.80,h:0.90,op:0.80,z:["publica"],x:8.30,y:7.20,mob:1,
      s:"O cliente escolhe a cor da lona com a amostra na mão e aprova o desenho na tela."},
 M06:{n:"Toldo retrátil de mostruário",w:3.00,h:0.60,op:0.90,z:["publica"],x:8.40,y:5.95,mob:1,
      s:"O toldo que o cliente vê abrir e fechar: o argumento de venda."},
 M07:{n:"Estação de orçamento e desenho",w:1.20,h:0.65,op:0.60,z:["adm"],x:6.30,y:8.80,mob:1,
      s:"Medida da visita, desenho do toldo ou da capa e orçamento."},
 M08:{n:"Armários da equipe",w:1.60,h:0.45,op:0.70,z:["barreira"],x:0.15,y:9.10,mob:1,
      s:"Roupa de rua e comida ficam aqui."},
 M09:{n:"Carrinho de rolo",w:1.40,h:0.70,op:0.70,z:["limpa","inter"],x:5.40,y:3.70,mob:1,
      s:"Leva o rolo do porta-rolos à mesa sem arrastar a lona no piso."}
};
const CAMADAS=[["zonas","Zonas da oficina"],["paredes","Paredes e portas"],["equip","Equipamentos"],
 ["cotas","Cotas"],["hidro","Água e esgoto"],["fluxo","Fluxo do processo"],["pilares","Pilares"],["texto","Etiquetas"]];
const HIDRO=[
 {t:"ralo",x:1.20,y:9.35,lab:"Ralo sifonado — sanitário e copa"},
 {t:"agua",x:0.30,y:6.20,lab:"Água do sanitário e da copa"},
 {t:"caimento",x:1.20,y:8.50,lab:"Caimento do piso de 1% na copa"}
];
const PILARES=[[0,0],[4.90,0],[9.80,0],[14.70,0],[0,4.85],[4.90,4.85],[9.80,4.85],[14.70,4.85],
 [0,9.70],[4.90,9.70],[9.80,9.70],[14.70,9.70]];
/* ================= ESTADO ================= */
const S={
  alugMerc:7000,custoOp:false,tma:15,dias:24,horas:8,fatorMaq:1,
  alvara:false,pesquisa:false,prolagos:false,temporarios:false,treino:false,rt:false,
  mercado:6,vol1:2.2,cresc:18,shareMax:6,p3:false,instTerc:false,
  eq:{E01:"basico",E02:"basico",E03:"basico",E04:"basico",E05:"basico",E06:"padrao",E07:"padrao",E08:"none",E09:"basico",E10:"basico",E11:"basico",E12:"basico",E13:"basico",E14:"basico"},
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
const TAXA_RECEB=0.030;        /* cartao parcelado antecipado e boleto */
const EFIC_GANHO=0.03, EFIC_CAPEX=3000;
const PAPEIS=[["proj","Medição e orçamento",false],["cor","Corte",true],["cos","Costura e solda",true],
  ["est","Estrutura e acabamento",true],["ins","Instalação",true]];
/* fracao dos m² que passa por cada etapa, pela participacao de cada linha */
function pesoLinhas(k){
  const tot=CANAIS.reduce((a,c)=>a+S.canais[c.id].share,0)||1;
  return CANAIS.reduce((a,c)=>a+S.canais[c.id].share*(c[k]||0),0)/tot;
}
const H={
  flags(R){
    R.solda=!!eqT("E03").solda;
    R.exaustao=S.eq.E05!=="none";
    R.instTerc=!!S.instTerc;
  },
  dep(R){return {instalacao:!R.instTerc,veiculo:R.veiculo}},
  capacidade(R){
    const h=S.horas, fm=S.fatorMaq||1, conf=eqT("E10").fat||1, P=R.pessoas;
    R.pesoEst=Math.max(0.05,pesoLinhas("est")); R.pesoIns=Math.max(0.05,pesoLinhas("ins"));
    R.maq=eqT("E02").maq||2;
    R.equipes=eqT("E11").equipes||1;
    R.capProj=P.proj*PROJ_M2_MES/S.dias*(eqT("E09").proj||1);
    R.capCor=P.cor*CORTE_H*h*EFIC*fm*(eqT("E01").fat||1)*(eqT("E12").fat||1)*conf;
    R.capCos=Math.min(R.maq,P.cos)*COS_H*h*EFIC*fm*(eqT("E02").fat||1)*(eqT("E03").fat||1)*conf;
    R.capEst=P.est*EST_H*h*EFIC*fm*(eqT("E04").fat||1)*(eqT("E13").fat||1)*conf/R.pesoEst;
    R.capIns=R.instTerc?Infinity:Math.min(P.ins,2*R.equipes)*INST_H*h*EFIC*DESLOC*fm/R.pesoIns;
    R.etapas=[{n:"Medição e orçamento",v:R.capProj,sala:"esc"},
      {n:"Corte",v:R.capCor,sala:"cor"},
      {n:"Costura e solda",v:R.capCos,sala:"cos",d:`${Math.min(R.maq,P.cos)} costureira(s) em ${R.maq} máquina(s)`},
      {n:"Estrutura e acabamento",v:R.capEst,sala:"ser",d:`só ${PCT(R.pesoEst*100)} dos m² têm estrutura`}];
    if(!R.instTerc)R.etapas.push({n:"Instalação",v:R.capIns,sala:"exp",d:`peso médio da instalação ${N2(R.pesoIns)} por m²`});
  },
  fGeral(R){return (eqT("E06").f||1)*(eqT("E07").f||1)*(eqT("E09").f||1)},
  vari(v,R){
    if(v.id==="entrega"&&!S.freteTerc){v.preco=6;v.n="Combustível da picape até a instalação";v.fixoPreco=true;}
    return v;
  },
  variExtra(R){return R.instTerc?[{id:"instTerc",n:"Instalação por instalador autônomo (ponderada pelo peso da instalação)",cons:R.pesoIns,un:"—",preco:INST_TERC,pun:"R$/m²"}]:[]},
  canal(c,R){return (c.solda&&!R.solda)?0.50:1},
  /* entrada de 50% no pedido paga a lona; o saldo vem na instalacao ou no
     cartao; fica 15% da venda do mes a receber e duas semanas de lona e
     ferragem compradas antes da entrada                                    */
  giro(R){return S.vol1*1000/12*R.precoMedio*R.fatorDemanda*0.15+S.vol1*1000/12*R.fatorDemanda*R.materialMedio*0.50},
  riscoSan(R,lay){
    let rs=15;
    if(R.solda&&!R.exaustao)rs+=12; if(R.instTerc)rs+=6; if(S.eq.E07==="basico")rs+=4;
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
    {id:"efl",n:"As Marinas Parceiras",ok:S.prolagos,xp:12},
    {id:"layout",n:"A Planta Fecha",ok:lay.deficit===0&&lay.viol.length===0&&lay.flowPct>=100,xp:15},
    {id:"pcc",n:"A Medida Conferida",ok:S.rt&&S.treino&&(!R.solda||R.exaustao),xp:12},
    {id:"verao",n:"A Corrida do Verão",ok:S.p3&&S.temporarios,xp:10},
    {id:"gargalo",n:"A Carteira em Dia",ok:R.perda3Pct<5,xp:11},
    {id:"bench",n:"Bater a Locação",ok:R.dre[2].ebitda>S.alugMerc*12,xp:10}
  ]}
};

/* ================= EIXO VERTICAL (HIPOTESE DECLARADA) ================= */
const VERT={
 /* mesa de corte e costura: a lona fica aberta sobre o tampo */
 E01:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 E02:{hz:1.20,hop:1.00,hman:0.40,hac:"S",aberto:1},
 E03:{hz:1.10,hop:1.00,hman:0.60,hac:"S",aberto:1},
 E04:{hz:0.95,hop:0.95,hman:0.60,hac:"S",banc:1},
 E12:{hz:1.80,hop:1.50,hman:0.20,hac:"O"},
 M01:{hz:0.90,hop:0.90,hman:0.40,hac:"S",aberto:1,banc:1},
 M02:{hz:1.80,hop:1.50,hman:0.20,hac:"S"},
 M03:{hz:0.90,hop:0.90,hman:0.30,hac:"L"},
 M04:{hz:1.40,hop:1.20,hman:0.20,hac:"O"},
 M05:{hz:0.75,hop:0.75,hman:0.30,hac:"S"},
 /* toldo de mostruario armado: a testeira fica a 2,40 m */
 M06:{hz:2.40,hop:1.50,hman:0.30,hac:"S"},
 M07:{hz:1.15,hop:0.75,hman:0.30,hac:"N"},
 M08:{hz:1.80,hop:1.20,hman:0.20,hac:"N"},
 M09:{hz:1.10,hop:1.00,hman:0.30,hac:"O"}
};
const ESTANTES_IDS=["M02"];
const ALT_ESTANTE=2.00;

/* ================= INSTALACOES, VITRINE E FACHADA ================= */
const INST={
  abertos:["E01","E02","E03","M01"],     /* onde a lona fica exposta */
  difSalas:["exp","est"], salaLinha:"cor", salaLoja:"loj",
  evap:()=>S.eq.E06==="padrao", evapLinhaEq:"E01", evapPos:{x:10.20,y:9.10}, evapSala:"loj", evapSalaLinha:"cor"
};
const VITRINE={a:"loj",b:["exp"],nome:"Vitrine do atendimento para a expedição"};
/* exaustao da solda: coifa sobre a soldadora e duto pela laje (Z20) */
H.exaustao3D=(B,eqs,pe)=>{
  if(S.eq.E05==="none"||S.eq.E03==="none")return;
  dutoSobre(B,eqs,pe,"E03",true,"Coifa sobre a soldadora de lona","Duto da exaustão da solda");
};
const PORTAS_FACHADA=[
 {r:"est",lado:"A",min:1.6,l:3.00,t:"enrolar",lab:"PORTA A · lona, perfis e pessoal"},
 {r:"exp",lado:"B",min:1.6,l:2.40,t:"enrolar",lab:"PORTA B · expedição"},
 {r:"loj",lado:"C",min:1.2,l:1.60,t:"vidro",lab:"Acesso da loja"}
];

/* ================= REGRAS Z DO NEGOCIO ================= */
H.zNegocio=(B,add,{eqs,D,M,dt})=>{
  /* Z04 — instalacao sobre lona aberta */
  zProjecao(B,add,eqs,{bloq:"lona aberta: condensado mancha a lona acrílica e a gota vira bolha na solda do PVC",
    aviso:"a mesa de corte e a costura — exigem luminária sem ofuscamento e com boa reprodução de cor: o cliente escolhe a lona pela cor"});
  /* Z08 — giro do carrinho de rolo */
  zGiro(B,add,dt,D,[["est","Recebimento de lona e perfis"],["exp","Expedição"]],1.60,
    "o carrinho com um rolo de lona de 1,50 m");
  /* Z11 — vitrine do atendimento */
  zVitrine(B,add,["O atendimento não encosta na expedição: quem vem buscar a capa teria de atravessar a oficina",
    "Manter o atendimento junto à expedição, com vitrine ou porta entre os dois."]);
  /* Z14 — estante de ferragens e aviamentos */
  zEstantes(B,add,D,"ser","Estante de ferragens de inox e aviamentos");
  /* Z20 — solda de PVC sem exaustao */
  const e03=eqs.find(b=>b.id==="E03");
  if(S.eq.E05==="none"&&e03)add("Z20","erro",
    "Solda de lona sem exaustão: o fumo do PVC tem ácido clorídrico — irrita olho e pulmão da costureira e corrói o que está em volta",
    e03,"Instalar exaustor com coifa sobre a soldadora (fase 3).");
  /* Z21 — atendimento sem vaga de cliente */
  zVagas(B,add,n=>`Atendimento com ${n} vaga(s) de cliente no pátio — mínimo adotado de ${VAGAS_MIN}; sem vaga, quem vem escolher a lona vai embora (−5%)`,
    "Reservar a faixa do pátio junto ao portão para as vagas (fase 2, vista do pátio).");
};

/* ================= TURNO ================= */
const ESTACOES=[
 {id:"est",n:"Porta-rolos de lona",eq:"E12",sala:"est"},
 {id:"cor",n:"Mesa de corte",eq:"E01",sala:"cor",cap:R=>R.capCor},
 {id:"cos",n:"Costura e solda",eq:"E02",sala:"cos",cap:R=>R.capCos},
 {id:"aca",n:"Acabamento e ilhós",eq:"M01",sala:"cos"},
 {id:"exp",n:"Expedição",eq:"M04",sala:"exp"}
];
const BATELADA=2;               /* m² por lote: um painel de lona */
const TURNO={carrinho:8,        /* m² de painel cortado por viagem */
  rolo:60,                      /* m² por rolo de lona */
  carga:{"est>cor":BATELADA}, salaRec:"est",
  cop:25,                       /* troca de linha, limpeza da mesa e separacao do pedido do dia */
  inicio:7};
H.foraDaLinha=R=>Math.min(R.capProj,R.capEst,R.capIns);

/* ================= PRODUTO NA CENA ================= */
function produtoNaCena(B){
  if(!S.produto||!B.D)return;
  const sim=(typeof SIM!=="undefined")&&SIM;
  const sala=r=>B.D.leaves.find(l=>l.r===r);
  const exp=sala("exp");
  if(exp){const q=sim?Math.max(1,sim.kgTurno):10;
    pilha(B,exp.x+0.25,exp.y+exp.h-1.40,"saco",Math.min(8,Math.max(2,Math.round(q/2))),"Capas e toldos embalados para a instalação",q,0,"m²");}
  const est=sala("est");
  if(est)pilha(B,est.x+0.40,est.y+est.h-1.30,"caixa",4,"Ferragens de inox e perfis recebidos",0,0,"caixas");
}

/* ================= SENSIBILIDADE, CETICO E MONTE CARLO ================= */
const VARS=[
 {id:"preco",n:"Preço médio ponderado",un:"R$/m²",geo:false,
  val:()=>calc().precoMedio,
  set:f=>CANAIS.forEach(c=>S.canais[c.id].preco=+(S.canais[c.id].preco*f).toFixed(3))},
 {id:"vol",n:"Volume do ano 1",un:"mil m²/ano",geo:false,val:()=>S.vol1,set:f=>{S.vol1=S.vol1*f}},
 {id:"cresc",n:"Crescimento anual",un:"%",geo:false,val:()=>S.cresc,set:f=>{S.cresc=S.cresc*f}},
 {id:"cap",n:"Rendimento da costura, da medição e da instalação",un:"m²/dia",geo:false,
  val:()=>calc().capKgDia,set:f=>{S.fatorMaq=(S.fatorMaq||1)*f}},
 {id:"cv",n:"Custo de lona, estrutura e variáveis",un:"R$/m²",geo:false,
  val:()=>calc().matMedio,set:f=>{S.fatMat=+((S.fatMat||1)*f).toFixed(4);VARI.forEach(v=>S.vari[v.id]=+(S.vari[v.id]*f).toFixed(4))}},
 {id:"folha",n:"Folha com encargos",un:"R$/mês",geo:false,
  val:()=>calc().folha,set:f=>{S.fator=+(S.fator*f).toFixed(4)}},
 {id:"perda",n:"Plano de corte e controle de retalho (−3% do variável)",un:"—",geo:false,
  val:()=>S.eficiencia?2:3,set:f=>{if(f<1)S.eficiencia=true;else S.eficiencia=false}},
 {id:"obra",n:"Custo de obra",un:"R$",geo:false,
  val:()=>calc().obraTotal,set:f=>OBRA.forEach(o=>{S.obra[o.id]=Math.min(1.6,S.obra[o.id]*f)})},
 {id:"cont",n:"Contingência",un:"%",geo:false,val:()=>S.cont,set:f=>{S.cont=S.cont*f}},
 {id:"aliq",n:"Alíquota efetiva",un:"%",geo:false,val:()=>S.aliq,set:f=>{S.aliq=S.aliq*f}},
 {id:"tma",n:"TMA",un:"% a.a.",geo:false,val:()=>S.tma,set:f=>{S.tma=S.tma*f}},
 {id:"peLaje",n:"Pé-direito sob laje",un:"m",geo:true,faixa:[2.60,4.50],
  val:()=>S.peLaje,set:f=>{S.peLaje=S.peLaje*f},setAbs:v=>{S.peLaje=v}},
 {id:"vigaH",n:"Altura da viga",un:"m",geo:true,faixa:[0.20,1.40],
  val:()=>S.vigaH,set:f=>{S.vigaH=S.vigaH*f},setAbs:v=>{S.vigaH=v}},
 {id:"hPorta",n:"Vão livre da porta de carga",un:"m",geo:true,faixa:[2.20,4.00],
  val:()=>S.hPortaEnrolar,set:f=>{S.hPortaEnrolar=S.hPortaEnrolar*f},setAbs:v=>{S.hPortaEnrolar=v}}
];
const CETICO=[["preço 10% menor",()=>CANAIS.forEach(c=>S.canais[c.id].preco*=0.90)],
              ["volume 15% menor",()=>{S.vol1*=0.85}],
              ["lona, inox e variáveis 10% mais caros (câmbio)",()=>{S.fatMat=(S.fatMat||1)*1.10;VARI.forEach(v=>S.vari[v.id]*=1.10)}],
              ["CAPEX 10% maior",()=>{S.cont=S.cont+10}],
              ["costura e instalação rendendo 10% menos",()=>{S.fatorMaq=(S.fatorMaq||1)*0.9}]];
const DISTR=[
 {id:"preco",n:"Preço médio",tri:[0.85,1.00,1.10]},
 {id:"vol",n:"Volume do ano 1",tri:[0.70,1.00,1.15]},
 {id:"cv",n:"Custo variável",tri:[0.92,1.00,1.18]},
 {id:"cap",n:"Rendimento",tri:[0.85,1.00,1.05]},
 {id:"obra",n:"Custo de obra",tri:[0.90,1.00,1.25]}
];
const NAO_RESPONDE=[
 "Quanto o cliente de Cabo Frio, Búzios e Arraial paga por metro quadrado de toldo e de capa náutica, e se indica a capotaria depois — o preço médio é premissa, e é a variável de que tudo depende.",
 "Quantos toldeiros e capotarias já atendem a região, a que preço e com que prazo: o simulador não conhece o concorrente.",
 "Se as marinas e garagens náuticas indicam uma capotaria nova: no náutico, a indicação do marinheiro vale mais que o anúncio.",
 "Quanto custa de verdade a lona acrílica importada e o inox naval no mês da compra: o câmbio mexe no custo.",
 "Se o dono sabe medir e desenhar toldo e capa: numa capotaria pequena, quem fecha o serviço é o sócio.",
 "Se o prédio tem o pé-direito para o toldo de mostruário e se a laje aceita o duto da exaustão da solda.",
 "Se o aluguel de R$ 7 mil/mês é real: ele é o adversário, e se for maior a capotaria ganha com menos folga.",
 "Se você quer isso: o modelo compara EBITDA com aluguel, não com sossego nem com o que você prefere fazer da vida."
];

/* ================= IDENTIDADE E TEXTOS ================= */
const NEG={titulo:"Lona Prime",slug:"lona_prime",negocio:"toldos, capotaria náutica e capas de barco",
  leiame:"uma oficina de toldos, capotaria nautica e capas de barco",
  ele:"a capotaria",pron:"ela",Curto:"Capotaria",
  un:"m² de lona",uns:"m²",unsCurto:"m²",ud:"m²",dec:1,unMil:"mil m²",unPreco:"R$/m²"};
const FASES3=[["0","Briefing"],["1","Mercado"],["2","Planta baixa"],["2B","O terceiro eixo"],["3","A oficina e a carteira"],
  ["4","Obra"],["5","Pessoas"],["6","Custo"],["6B","Turno cheio"],["7","Veredicto"]];
const SAZ_NOMES={verao:"antes do verão",nautica:"temporada de barco",evento:"temporada e eventos",reforma:"ano inteiro"};
const SAZ_COLS={verao:"Toldo",nautica:"Náutica",evento:"Cobertura",reforma:"Reforma"};
const ALTO_ID="M06";
const REF_VIOL=["Z04","Z06"];
const PORTOES=[
 ["alvara","Consulta de uso do solo na PMCF","Gratuita antes do projeto. Oficina de costura com serralheria leve costuma caber numa avenida mista; a solda e a serra de alumínio fazem barulho, e confirmar antes custa nada."],
 ["pesquisa","Pesquisa com marinas, garagens náuticas, arquitetos, pousadas e toldeiros da cidade","Quanto se cobra por metro quadrado de toldo retrátil e de capa de lancha em Cabo Frio, Búzios e Arraial, qual o prazo dos toldeiros e das capotarias estabelecidos e quem está insatisfeito. Três orçamentos pedidos como cliente valem mais do que qualquer premissa."],
 ["prolagos","Parcerias com marinas e garagens náuticas","Duas marinas do canal e uma garagem náutica indicando a capotaria: a base de capa e bimini que paga o fixo no primeiro ano."],
 ["rt","Medição conferida e desenho aprovado antes do corte","Medida tirada no local, desenho e cor assinados pelo cliente: lona cortada errada vira retalho de R$ 150 o metro quadrado."],
 ["treino","Treinamento em padronagem, solda de lona e instalação de toldo retrátil",""],
 ["temporarios","Costureira e instalador temporários para setembro a dezembro",""]];
const ITENS_CAMPO=[
 ["peDireito","Pe-direito livre sob laje","medir em tres pontos afastados; anotar o menor",""],
 ["vigas","Altura e largura das vigas e o vao entre elas","medir da face inferior da viga ate o piso",""],
 ["pilares","Posicao e secao dos pilares","trena a partir das duas empenas; anotar secao em cm",""],
 ["portas","Altura e largura livres da porta A","o perfil de 6 m e o rolo de 3,20 m de lona vinílica precisam entrar",""],
 ["peitoril","Passagem do duto da exaustão da solda pela laje","um duto de 150 mm sobre a soldadora; conferir armadura e impermeabilizacao",""],
 ["forro","Forro existente: material e altura","",""],
 ["degrau","Cota do patio em relacao ao piso interno","o degrau na porta de carga decide o carrinho de rolo e a acessibilidade do atendimento",""],
 ["energia","Entrada de energia, quadro e demanda disponivel","a soldadora de alta frequencia pede trifasico; anotar disjuntor geral",""]];
const CORRIGE_NEG={
  Z20:{lab:"ligar o exaustor com coifa sobre a solda",ok:()=>S.eq.E05==="none",fn:()=>{S.eq.E05="basico"}}};
const PROVAS=[
 ["Pé-direito de 2,50 m bloqueia o toldo de mostruário","Z01",()=>{S.peLaje=2.50}],
 ["Difusor sobre a mesa de corte vira bloqueio","Z04",()=>{S.dutoRota="linha";S.evapSobre="linha"}],
 ["Evaporador sem dreno vira bloqueio","Z12",()=>{S.evapDreno=false}],
 ["Estante acima do ombro vira aviso","Z14",()=>{S.alturaEmp=2.60}],
 ["Solda sem exaustão vira erro","Z20",()=>{S.eq.E05="none"}],
 ["Pátio sem vaga de cliente vira aviso","Z21",()=>{S.treeP={d:"v",cuts:[0.62],kids:[{r:"man"},{d:"h",cuts:[0.12,0.24,0.36],kids:[{r:"res"},{r:"ret"},{r:"fos"},{r:"man"}]}]}}]];
const VISTAS=[
 {id:"geral",n:"Geral",ap(){CAM.modo="orb";ACOES3.fit();CAM.corte=1.20;S.corteLocal=null}},
 {id:"linha",n:"Oficina",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["cor","cos"]);
   CAM.yaw=-1.15;CAM.pitch=0.92;CAM.dist=11;CAM.corte=2.40;S.corteLocal=null;S.layers3.equip=true}},
 {id:"barreira",n:"Serralheria e recebimento",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["ser","est","ves"]);
   CAM.yaw=-0.6;CAM.pitch=0.7;CAM.dist=8;CAM.corte=1.40;S.corteLocal=null;S.corMode="zona";S.layers3.zonas=true}},
 {id:"frio",n:"Costura e expedição",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["cos","exp"]);
   CAM.yaw=-2.1;CAM.pitch=0.62;CAM.dist=9.5;CAM.corte=3.00;S.corteLocal=null}},
 {id:"receb",n:"Atendimento",ap(){CAM.modo="orb";CAM.alvo=centroSalas(["loj","exp"]);
   CAM.yaw=1.4;CAM.pitch=0.35;CAM.dist=7.5;CAM.corte=2.60;S.corteLocal=null}},
 {id:"oper",n:"Da costureira",ap(){const c=centroSala("cos");CAM.modo="fp";CAM.fp=[c[0],1.65,c[2]+1.4];
   CAM.fyaw=-Math.PI/2;CAM.fpit=-0.05}}];
const TXT={
  f0lead:"Esta versão testa uma <b>oficina de toldos, capotaria náutica e capas de barco</b>: corta, costura, solda e instala toldo retrátil, capota, bimini, capa de lancha e de jet ski e cobertura de quiosque, a poucos minutos das marinas do canal. Máquina de costura industrial usada e serralheria leve mantêm o CAPEX abaixo de R$ 200 mil. A régua é a mesma que julgou a marcenaria e o pastel.",
  f0porqueTit:"Por que toldos e capotaria.",
  f0porque:"Cabo Frio tem sol forte o ano inteiro, casa de praia com varanda, quiosque, pousada e um canal cheio de lancha e jet ski. Toldo desbota e rasga, capa de barco apodrece com sal e sol, e tudo precisa estar pronto antes de dezembro. O serviço é de mão de obra qualificada e pouca máquina: a margem vem da costura e da instalação bem feitas, e a indicação da marina é o canal de venda. O risco é preço (já há toldeiros estabelecidos), o custo da lona importada, que segue o câmbio, e a instalação, que é onde o cliente julga o serviço.",
  f0decide:"Ele verifica a oficina de corte e costura separada da serralheria, a exaustão da solda de PVC, a altura livre sob viga para o toldo de mostruário, o giro do carrinho de rolo, a iluminância de costura, as vagas de cliente, a rota de fuga, os metros caminhados por metro quadrado e a carteira de pedidos mês a mês. Ele <b>não</b> substitui projeto executivo, ART, projeto de incêndio nem a conversa com as marinas.",
  regiao:"Região dos Lagos",faixaMercado:[1,30,0.5],faixaVol:[0.5,8,0.1],passoPreco:10,
  p3Nome:"Hora extra no pico — setembro a novembro",
  p3Desc:R=>`Eleva a costura e a instalação em ${PCT((HORA_EXTRA-1)*100)} na corrida antes do verão, a 150% da hora: cerca de ${BRL(R.folhaProd*(HORA_EXTRA-1)*1.5*PICO_PROD.length)}/ano de folha.`,
  matNome:"lona, estrutura e inox",
  f1preco:"O preço é por metro quadrado de lona confeccionada e entregue — no toldo, com braço, perfil e instalação; na capa, ajustada no barco. Mostruário, climatização e o software de desenho mexem em todas as linhas; sem solda de lona, a cobertura de quiosque fica pela metade.",
  f1curva:"Toldo e capa são feitos sob medida, mas o cliente espera: o que não cabe no mês vai para a carteira do mês seguinte, e 30% de quem passa de um mês de prazo desiste. O toldo e o barco querem estar prontos antes de dezembro; o quiosque e o evento pedem cobertura na temporada.",
  f2lead:"A oficina fica ao fundo: a serralheria leve fechada, a mesa de corte de lona e a costura com a solda e o acabamento. Na fachada, o vestiário, o recebimento de lona e perfis com a porta A, o orçamento, o atendimento com o toldo de mostruário e a expedição com a porta B.",
  producao:"oficina",vagasNome:"Vagas de cliente no patio",
  f2blead:"Pe-direito, vigas, forro, o duto da exaustão da solda e a altura do toldo de mostruário armado.",
  estantesNome:"estantes de ferragens e aviamentos",forroDesc:"Sem forro, poeira da laje cai na lona acrílica aberta na mesa.",
  dutoOps:[["circ","a expedição e o recebimento"],["linha","a mesa de corte e a costura"]],
  evapOps:[["circ","a parede da fachada do atendimento"],["linha","a mesa de corte"]],
  drenoDesc:"Sem dreno, condensado pinga na lona aberta e mancha. Bloqueio.",
  altoNome:"o toldo retrátil de mostruário armado",altoRisco:"Se ele cair sob a viga, o mostruário muda de lugar — ou o cliente não vê o toldo abrir.",
  f3lead:R=>R.solda?"Com solda de lona: cobertura e toldo de PVC entram inteiros.":"<b>Sem solda de lona</b>: a cobertura de quiosque e o toldo de PVC ficam pela metade.",
  f3cap:R=>`Cada costureira fecha ${N2(COS_H)} m² de lona por hora; a mesa corta ${NUM(CORTE_H,0)} m²/h. Só ${PCT(R.pesoEst*100)} dos m² passam pela serralheria (toldo e cobertura), e a instalação pesa ${N2(R.pesoIns)} por m²: toldo na parede pesa 1, capa ajustada na marina pesa 0,3. A estrada até Búzios e Arraial come ${PCT((1-DESLOC)*100)} do dia de instalação.${R.instTerc?" <b>Instalação terceirizada: o instalador autônomo cobra "+BRL(INST_TERC)+" por m² ponderado e não entra no gargalo.</b>":""}`,
  carteiraNome:"A carteira",perdaNome:"Pedido que desistiu",
  f3pico:"De setembro a novembro todo mundo quer o toldo e a capa prontos antes do verão. A carteira cresce, o prazo passa de um mês e parte do cliente fecha com outro toldeiro. Hora extra, costureira temporária ou instalação terceirizada seguram a carteira; em maio e junho a oficina folga.",
  trifDesc:"Soldadora, compressor, serra de alumínio, solda MIG e o ar do atendimento: conferir a entrada antes de ligar tudo junto.",
  incDesc:"Lona, PVC, espuma de estofado náutico e cola: carga de incêndio alta. Extintor certo e rota livre são o que o Corpo de Bombeiros confere.",
  eficNome:"Plano de corte e controle de retalho",eficDesc:"Corta 3% do custo variável, com R$ 3.000 de CAPEX em treinamento e biblioteca de moldes.",
  giroDesc:"a entrada de 50% paga a lona; 15% da venda do mês a receber e duas semanas de lona e inox",
  depFora:{instalacao:"instalação terceirizada",veiculo:"sem veículo próprio"},
  f5hint:"Quem vende é o sócio: toldo e capa se fecham na visita, com a medida e o desenho, e a marina indica quem costura bem. A costureira de lona é a mão de obra escassa; o serralheiro faz a estrutura de manhã e instala à tarde.",
  garantiaNome:"Garantia e retorno de instalação",
  freteNome:"Instalação com frete contratado",freteDesc:"Não compra a picape; cada instalação leva escada e perfis por frete avulso, cobrado por m².",
  f6blead:"o rolo sai do porta-rolos para a mesa de corte, o painel cortado para a costura e a solda, e a peça acabada para a expedição.",
  copNome:"Janela perdida com troca de linha, limpeza da mesa e separação do pedido",
  bossFiscalNome:"O Fiscal Sobe na Escada",bossPicoNome:"Novembro: Toldo e Capa Antes do Réveillon",
  fiscalOk:"Nada acima da linha reprova: forro, dutos e evaporadores estão fora da projeção da lona aberta.",
  sol:"Sol direto sobre o atendimento desbota o mostruário de lonas e engana a escolha de cor: o cliente quer luz difusa e constante — e o rolo de lona acrílica no sol amarela.",
  r07:"a mesa de acabamento",cvNome:"Lona, estrutura e variáveis",
  z19quando:"de setembro a novembro (a corrida antes do verão)",
  z19como:"Hora extra no pico (fase 1), costureira temporária ou instalação terceirizada (fase 5)."
};
H.fase5ok=R=>R.pessoas.proj>0&&R.pessoas.cos>0&&R.pessoas.est>0&&R.pessoas.cor>0&&(R.instTerc||R.pessoas.ins>0);
H.f5extra=R=>cChk("instTerc","Instalação por instalador autônomo",`O instalador de fora cobra ${BRL(INST_TERC)} por m² (ponderado pelo peso da instalação) e some da folha; a instalação deixa de ser gargalo, mas o cliente julga a capotaria por quem instala.`);
H.bossPico=()=>{
  const R=calc(), T=R.temporada, pico=T.meses.filter(x=>PICO_PROD.includes(x.m));
  const dem=pico.reduce((a,x)=>a+x.dem,0), prod=pico.reduce((a,x)=>a+x.prod,0), des=pico.reduce((a,x)=>a+x.perda,0);
  const nov=T.meses[10];
  const txt=[`Setembro a novembro, ano 3: entram ${NUM(dem*1000,0)} m² de pedido novo, e a oficina entrega até ${NUM(prod*1000,0)} m² nesses três meses${S.p3?" com a hora extra":""}.`];
  txt.push(des*1000<=1?"A carteira fica dentro de um mês de prazo: dá para entregar tudo antes do réveillon.":`A carteira passa de um mês e ${NUM(des*1000,0)} m² desistem no pico (${BRL(des*1000*R.precoMedio)} de venda). No fim de novembro ainda esperam ${NUM(nov.carteira*1000,0)} m². O gargalo é ${R.gargalo.n.toLowerCase()}.`);
  ZV.filter(v=>["Z03","Z08","Z19"].includes(v.cod)).forEach(v=>txt.push(`${v.cod} — ${v.msg}`));
  return `<div class="hint ${des*1000>1?"bad":""}"><b>${TXT.bossPicoNome}</b><br>${txt.join("<br>")}</div>`;
};
H.auditoria=p=>{
  p("Capa embalada na cena","0,60 × 0,40 × 0,15","m","catálogo","produto na cena");
  p("Costura e solda por costureira",N2(COS_H),"m²/h","hipótese","capacidade");
  p("Corte na mesa",NUM(CORTE_H,0),"m²/h","hipótese","capacidade");
  p("Estrutura e acabamento",N2(EST_H),"m²/h por pessoa","hipótese","capacidade");
  p("Instalação por pessoa",N2(INST_H),"m²/h","hipótese","capacidade");
  p("Dia de instalação que sobra depois da estrada",PCT(DESLOC*100),"","hipótese","capacidade");
  p("Medição e orçamento",String(PROJ_M2_MES),"m²/mês por pessoa","hipótese","capacidade");
  p("Instalador autônomo",BRL(INST_TERC),"/m²","hipótese","custo variável");
  CANAIS.forEach(c=>p("Peso da instalação — "+c.n.split(" (")[0],N2(c.ins),"","hipótese","capacidade"));
  p("Cobertura sem solda de lona","−50","%","hipótese","receita");
};
//@@HTML
TITULO=Lona Prime
NEGOCIO=toldos, capotaria náutica e capas de barco
NAO_AJUDA=preço por m² que o mercado aceita, indicação das marinas, custo da lona importada
ARQUIVO=lona_prime_3d_v1.0.html
//@@TARDIO
function detalhesEquip(e,B){
  const lonas={cores:["lona","lona2","lona3","amarelo"]};
  switch(e.id){
    case "E01": forma(e,B,"mesa",{carga:false});
      {const K=ctxEquip(e,B);K.add(K.mat(K.M(0.05,0.10,0.80,0.75,K.hz,0.01,{lod:1,org:"visual"}),"lona2"));}
      break;
    case "E02": forma(e,B,"costura",{tecido:"lona"}); break;
    case "E03": forma(e,B,"maquina",{fr:0.80,cor:"pint"}); break;
    case "E04": forma(e,B,"bancada",{n:2,cores:["inox","pint"]}); break;
    case "E12": forma(e,B,"rolos",Object.assign({niveis:3,n:3},lonas)); break;
    case "M01": forma(e,B,"bancada",Object.assign({n:2},lonas)); break;
    case "M02": forma(e,B,"estante",{niveis:4,n:4,cores:["inox","amarelo","azul","papelao"]}); break;
    case "M03": forma(e,B,"rolos",{niveis:2,n:2,cores:["inox"]}); break;
    case "M04": forma(e,B,"caixas",Object.assign({n:3},lonas)); break;
    case "M05": forma(e,B,"mesa",Object.assign({n:4},lonas)); break;
    case "M06": {                                   /* toldo de mostruario: bracos e lona inclinada */
      const K=ctxEquip(e,B), {M,add,mat,hz}=K;
      add(mat(M(0.00,0.00,1.00,0.12,hz-0.30,0.25,{geo:"chanf",ch:0.02,lod:1,org:"catalogo"}),"pint"));
      add(mat(M(0.00,0.10,1.00,0.85,hz-0.60,0.04,{inc:0.35,piv:[0.5,0,1],lod:1,org:"visual"}),"lona3"));
      [0.05,0.93].forEach(u=>add(mat(M(u,0.10,0.02,0.85,hz-0.62,0.04,{inc:0.35,piv:[0.5,0,1],lod:2,org:"catalogo"}),"inox")));
      [0.05,0.93].forEach(u=>add(mat(M(u,0.02,0.03,0.05,0,hz-0.30,{lod:2,org:"catalogo"}),"inox")));
      break; }
    case "M07": forma(e,B,"estacao",{telas:1}); break;
    case "M08": forma(e,B,"armario",{portas:4}); break;
    case "M09": forma(e,B,"carrinho",{carga:false});
      {const K=ctxEquip(e,B);K.add(K.mat(K.M(0.05,0.15,0.90,0.70,0.20,0.40,{geo:"cil",eixo:K.eixoU,lod:1,org:"visual"}),"lona2"));}
      break;
  }
}
