// Conteúdo do site LUXX STORE (o mesmo que está no "LUXX STORE SITE.html").
// Tudo aqui pode ser alterado pelo painel (toque 5x no LUXX do rodapé ou abra o site com #admin).
// Quando o dono baixar um site atualizado pelo painel, este arquivo é sincronizado com ele,
// para que um novo "npm run build" não apague as edições.
// Nos textos você pode usar: {cupom} {desconto} {loja} {ano} {frete} {parcelas}
// admin.pin guarda só um código do PIN (nunca o PIN em si).

export default {
  "v": 1,
  "brand": {
    "name": "LUXX STORE",
    "logoText": "LUXX",
    "logoSub": "STORE",
    "logoBolt": true,
    "logoImg": "",
    "logoHeight": 38,
    "tagline": "Luxo de rua. Atitude de elite."
  },
  "seo": {
    "title": "LUXX STORE ⚡ Streetwear masculino de luxo",
    "description": "Camisetas, moletons, tênis, slides e acessórios exclusivos. Streetwear masculino com atitude de luxo. Use o cupom LUXX10 e ganhe 10% OFF em qualquer compra."
  },
  "store": {
    "whatsapp": "",
    "whatsappMsg": "Olá, LUXX STORE! ⚡ Vim pelo site e quero ajuda para escolher minhas peças.",
    "coupon": "LUXX10",
    "couponPct": 10,
    "installments": 6,
    "minInstallment": 30,
    "showCouponPrice": true,
    "cart": true,
    "search": true,
    "freeShipping": 299,
    "shopUrl": "",
    "floatWhats": true
  },
  "social": {
    "instagram": "https://www.instagram.com/",
    "tiktok": "https://www.tiktok.com/",
    "youtube": "https://www.youtube.com/",
    "facebook": "",
    "x": "",
    "email": ""
  },
  "theme": {
    "preset": "neon",
    "colors": {
      "bg": "#07070a",
      "bg2": "#0d0d13",
      "surface": "#111118",
      "productBg": "#16161f",
      "text": "#eef0f5",
      "muted": "#8d90a0",
      "title": "#ffffff",
      "accent": "#e6ff00",
      "accentText": "#07070a",
      "border": "#23232f",
      "btnBg": "#e6ff00",
      "btnText": "#07070a",
      "price": "#ffffff",
      "badgeBg": "#e6ff00",
      "badgeText": "#07070a",
      "headerBg": "#07070a",
      "headerText": "#eef0f5",
      "topbarBg": "#e6ff00",
      "topbarText": "#07070a",
      "promoBg": "#e6ff00",
      "promoText": "#07070a",
      "footerBg": "#040406",
      "footerText": "#8d90a0",
      "whatsapp": "#25d366"
    },
    "fonts": {
      "title": "Bebas Neue",
      "body": "Space Grotesk",
      "logo": "Rubik Mono One",
      "titleWeight": 400,
      "titleScale": 1,
      "base": 16,
      "titleSpacing": 0.01,
      "upper": true,
      "italic": false
    },
    "style": {
      "radius": 24,
      "btnRadius": 999,
      "border": 1,
      "maxWidth": 1280,
      "space": 1,
      "colsDesk": 4,
      "colsMob": 2,
      "btnStyle": "outline",
      "glow": true,
      "grain": true,
      "anim": true,
      "imgFit": "cover"
    },
    "css": ""
  },
  "order": [
    "hero",
    "marquee",
    "novidades",
    "categorias",
    "promo",
    "maisvendidos",
    "catalogo",
    "manifesto",
    "beneficios",
    "whats"
  ],
  "sections": {
    "topbar": {
      "on": true,
      "items": [
        "⚡ {desconto}% OFF em qualquer compra com o cupom {cupom}",
        "Frete grátis acima de {frete}",
        "Parcele em até {parcelas}x sem juros",
        "Envio para todo o Brasil"
      ]
    },
    "hero": {
      "on": true,
      "nav": "Início",
      "layout": "split",
      "kicker": "Coleção VOLT • Drop 01",
      "title": "Luxo de rua.",
      "titleAccent": "Atitude de elite.",
      "text": "Peças exclusivas em tiragem limitada para quem nasceu pra ser notado. Chegou, foi visto. Saiu, deixou saudade.",
      "btn1": "Comprar a coleção",
      "btn1Link": "#novidades",
      "btn2": "Pedir no WhatsApp",
      "stats": [
        {
          "big": "Drop 01",
          "small": "Tiragem limitada"
        },
        {
          "big": "24h",
          "small": "Envio expresso"
        },
        {
          "big": "30 dias",
          "small": "Troca fácil"
        }
      ],
      "img": "",
      "overlay": 0.55,
      "sticker1": "Novo drop",
      "sticker2": "-{desconto}% com {cupom}"
    },
    "marquee": {
      "on": true,
      "words": [
        "Streetwear",
        "Exclusividade",
        "Luxo de rua",
        "Edição limitada",
        "Atitude",
        "LUXX Store"
      ]
    },
    "novidades": {
      "on": true,
      "nav": "Novidades",
      "kicker": "Acabou de chegar",
      "title": "Novidades",
      "text": "O drop mais quente da temporada. Quando acaba, não volta.",
      "layout": "carousel",
      "limit": 8
    },
    "categorias": {
      "on": true,
      "nav": "Categorias",
      "kicker": "Monte seu kit",
      "title": "Categorias",
      "text": "Do pé à cabeça: tudo pra você sair pronto e chegar chamando atenção."
    },
    "promo": {
      "on": true,
      "nav": "Promoção",
      "kicker": "Oferta relâmpago",
      "title": "{desconto}% OFF em qualquer compra",
      "text": "Use o cupom na sacola ou mande no WhatsApp. Vale para a loja inteira, sem valor mínimo.",
      "btn": "Copiar cupom",
      "btn2": "Comprar com desconto",
      "note": "*Desconto aplicado sobre o valor dos produtos. Não cumulativo com outras promoções.",
      "endsAt": ""
    },
    "maisvendidos": {
      "on": true,
      "nav": "Mais vendidos",
      "kicker": "Os queridinhos",
      "title": "Mais vendidos",
      "text": "Aprovados por quem entende de estilo. Esgotam rápido — não vacila.",
      "limit": 8,
      "rank": true
    },
    "catalogo": {
      "on": true,
      "nav": "Loja",
      "kicker": "Loja completa",
      "title": "Todas as peças",
      "text": "Filtre por categoria e encontre a peça que fecha o seu visual."
    },
    "manifesto": {
      "on": true,
      "kicker": "Manifesto LUXX",
      "title": "Feito para poucos.",
      "text": "A LUXX nasceu na rua com gosto de champanhe. Cada peça é pensada para o homem que entra no rolê e muda o clima do lugar: tecido pesado, caimento impecável e acabamento de grife.\n\nTiragens limitadas, zero repetição. Porque exclusividade não se explica — se veste.",
      "sign": "— Equipe LUXX ⚡"
    },
    "beneficios": {
      "on": true,
      "items": [
        {
          "icon": "truck",
          "title": "Frete grátis",
          "text": "Em compras acima de {frete} para todo o Brasil."
        },
        {
          "icon": "refresh",
          "title": "Troca fácil",
          "text": "Primeira troca grátis em até 30 dias."
        },
        {
          "icon": "card",
          "title": "Até {parcelas}x sem juros",
          "text": "No cartão, ou à vista no Pix."
        },
        {
          "icon": "shield",
          "title": "Compra segura",
          "text": "Atendimento humano do pedido à entrega."
        }
      ]
    },
    "whats": {
      "on": true,
      "nav": "Contato",
      "kicker": "Atendimento VIP",
      "title": "Seu estilo, no seu tempo.",
      "text": "Tire dúvidas de tamanho, peça fotos reais e feche seu pedido direto com a gente no WhatsApp. Resposta rápida, sem enrolação.",
      "btn": "Chamar no WhatsApp",
      "btn2": "Ver catálogo",
      "chat": [
        {
          "from": "c",
          "text": "Fala, LUXX! O Hoodie Raio ainda tem no G? 🔥"
        },
        {
          "from": "l",
          "text": "Tem sim! Separei o último G pra você ⚡"
        },
        {
          "from": "l",
          "text": "Com o cupom {cupom} sai {desconto}% mais barato. Bora fechar?"
        },
        {
          "from": "c",
          "text": "Fechado! Manda o Pix 🤝"
        }
      ]
    },
    "footer": {
      "on": true,
      "text": "Streetwear masculino com atitude de luxo. Peças exclusivas, tiragem limitada e atendimento VIP do pedido à entrega.",
      "help": [
        "Guia de tamanhos",
        "Trocas e devoluções",
        "Prazos de entrega",
        "Formas de pagamento"
      ],
      "copyright": "© {ano} {loja}. Todos os direitos reservados.",
      "legal": "",
      "payments": true
    }
  },
  "categories": [
    {
      "id": "camisetas",
      "name": "Camisetas",
      "img": ""
    },
    {
      "id": "moletons",
      "name": "Moletons",
      "img": ""
    },
    {
      "id": "tenis",
      "name": "Tênis",
      "img": ""
    },
    {
      "id": "slides",
      "name": "Slides",
      "img": ""
    },
    {
      "id": "jaquetas",
      "name": "Jaquetas",
      "img": ""
    },
    {
      "id": "calcas",
      "name": "Calças",
      "img": ""
    },
    {
      "id": "bermudas",
      "name": "Bermudas",
      "img": ""
    },
    {
      "id": "bones",
      "name": "Bonés",
      "img": ""
    },
    {
      "id": "acessorios",
      "name": "Acessórios",
      "img": ""
    }
  ],
  "products": [
    {
      "id": "p1",
      "name": "Boné Lacoste 🐊",
      "cat": "bones",
      "price": 70,
      "old": 89.99,
      "desc": "Boné Lacoste rp em diversas cores.",
      "sizes": "P, M, G,",
      "img": "",
      "isNew": true,
      "best": true,
      "badge": "Últimas peças "
    },
    {
      "id": "p2",
      "name": "Camiseta Heavy Logo",
      "cat": "camisetas",
      "price": 129.9,
      "old": 0,
      "desc": "Malha encorpada, gola canelada reforçada e logo LUXX frontal. Branco gelo que não perde a pose.",
      "sizes": "P, M, G, GG, XG",
      "img": "",
      "best": true
    },
    {
      "id": "p3",
      "name": "Camiseta Boxy Thunder",
      "cat": "camisetas",
      "price": 139.9,
      "old": 0,
      "desc": "Corte boxy, ombro caído e o amarelo raio pra quem não tem medo de ser visto.",
      "sizes": "P, M, G, GG",
      "img": "",
      "isNew": true
    },
    {
      "id": "p4",
      "name": "Moletom NikeClub ",
      "cat": "moletons",
      "price": 165,
      "old": 179,
      "desc": "Moletom idêntico ao original.",
      "sizes": "P, M, G, GG,",
      "img": "",
      "best": true,
      "badge": "Últimas peças",
      "isNew": true
    },
    {
      "id": "p5",
      "name": "Moletom Hoodie Raio",
      "cat": "moletons",
      "price": 299.9,
      "old": 0,
      "desc": "O amarelo mais desejado da coleção. Bolso canguru, punhos canelados e logo LUXX no peito.",
      "sizes": "P, M, G, GG",
      "img": "",
      "isNew": true,
      "best": true
    },
    {
      "id": "p6",
      "name": "Moletom Careca Signature",
      "cat": "moletons",
      "price": 249.9,
      "old": 0,
      "desc": "Gola careca, cinza mescla e assinatura LUXX repetida. Minimalista na medida certa.",
      "sizes": "P, M, G, GG",
      "img": ""
    },
    {
      "id": "p7",
      "name": "Jaqueta Corta-Vento Storm",
      "cat": "jaquetas",
      "price": 389.9,
      "old": 0,
      "desc": "Tecido leve que corta o vento, faixa amarela em destaque e zíper frontal. Feita pra chuva, vento e olhares.",
      "sizes": "P, M, G, GG",
      "img": "",
      "isNew": true
    },
    {
      "id": "p8",
      "name": "Calça Cargo Tactical",
      "cat": "calcas",
      "price": 259.9,
      "old": 0,
      "desc": "Sarja com elastano, bolsos cargo com lapela e barra jogger. Conforto de pista, presença de passarela.",
      "sizes": "38, 40, 42, 44, 46",
      "img": "",
      "best": true
    },
    {
      "id": "p9",
      "name": "Bermuda Moletom Volt",
      "cat": "bermudas",
      "price": 159.9,
      "old": 0,
      "desc": "Moletom leve, cordão amarelo e caimento acima do joelho. O uniforme oficial do verão.",
      "sizes": "P, M, G, GG",
      "img": ""
    },
    {
      "id": "p10",
      "name": "Tênis Street Runner LX",
      "cat": "tenis",
      "price": 499.9,
      "old": 599.9,
      "desc": "Cabedal premium, entressola de alto amortecimento e o raio LUXX na lateral. Branco que brilha de longe.",
      "sizes": "38, 39, 40, 41, 42, 43, 44",
      "img": "",
      "best": true
    },
    {
      "id": "p11",
      "name": "Tênis Chunky Blackout",
      "cat": "tenis",
      "price": 549.9,
      "old": 0,
      "desc": "Solado robusto, all black com detalhes em amarelo raio. Pisada pesada de quem chega chegando.",
      "sizes": "38, 39, 40, 41, 42, 43, 44",
      "img": "",
      "isNew": true
    },
    {
      "id": "p12",
      "name": "Slide LUXX Comfort",
      "cat": "slides",
      "price": 149.9,
      "old": 0,
      "desc": "Palmilha anatômica super macia e tira com logo LUXX. Do rolê à piscina com o mesmo estilo.",
      "sizes": "37/38, 39/40, 41/42, 43/44",
      "img": "",
      "best": true
    },
    {
      "id": "p13",
      "name": "Slide Volt Amarelo",
      "cat": "slides",
      "price": 159.9,
      "old": 0,
      "desc": "Tira amarela raio com logo em preto. Impossível passar despercebido — até de chinelo.",
      "sizes": "37/38, 39/40, 41/42, 43/44",
      "img": "",
      "isNew": true
    },
    {
      "id": "p14",
      "name": "Boné Trucker LUXX",
      "cat": "bones",
      "price": 119.9,
      "old": 0,
      "desc": "Aba reta, regulagem snapback e raio bordado na frente. O toque final do visual.",
      "sizes": "Único",
      "img": "",
      "isNew": true
    },
    {
      "id": "p15",
      "name": "Corrente Cubana Gold",
      "cat": "acessorios",
      "price": 189.9,
      "old": 0,
      "desc": "Elos cubanos com banho dourado e pingente de raio. O detalhe que fecha o visual de playboy.",
      "sizes": "Único",
      "img": "",
      "best": true
    },
    {
      "id": "p16",
      "name": "Shoulder Bag Night",
      "cat": "acessorios",
      "price": 139.9,
      "old": 0,
      "desc": "Compacta, resistente à água e com bolso frontal. Celular, chave e carteira no lugar certo.",
      "sizes": "Único",
      "img": "",
      "isNew": true
    },
    {
      "id": "p17",
      "name": "Óculos Shield Black",
      "cat": "acessorios",
      "price": 169.9,
      "old": 0,
      "desc": "Lente espelhada com proteção UV e armação leve. Visão de cria, pose de milionário.",
      "sizes": "Único",
      "img": "",
      "soldout": true
    }
  ],
  "bubble": {
    "on": true,
    "video": "media:default-video",
    "size": 112,
    "sizeMobile": 92,
    "shape": "circle",
    "border": "#e6ff00",
    "borderWidth": 3,
    "ring": true,
    "pulse": true,
    "label": "Drop ⚡",
    "pos": "bl",
    "drag": true,
    "tap": "expand",
    "title": "Coleção VOLT em movimento",
    "text": "Veja as peças do novo drop e garanta a sua antes que acabe.",
    "cta": "Ver novidades",
    "ctaLink": "#novidades",
    "cta2": "Comprar no WhatsApp",
    "mobile": true,
    "desktop": true,
    "closable": true
  },
  "admin": {
    "pin": "h1ujpqze"
  }
};
