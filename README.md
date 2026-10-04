# LUXX STORE ⚡

Landing page de streetwear masculino de luxo, com **painel para editar tudo** e **bolinha de vídeo arrastável**, tudo em **um único arquivo**: [`LUXX STORE SITE.html`](LUXX%20STORE%20SITE.html).

Preto + amarelo raio, textos de impacto em português e funciona no celular e no computador.

## O que tem no site

- **Banner principal** com a Coleção VOLT (texto + ilustração, ou foto de fundo em tela cheia)
- **Novidades** (carrossel) e **Mais vendidos** (com ranking 01, 02, 03…)
- **Categorias**: camisetas, moletons, tênis, slides, jaquetas, calças, bermudas, bonés e acessórios
- **Promoção com o cupom LUXX10**: 10% OFF em qualquer compra, botão de copiar o cupom
- **Catálogo completo** com filtro por categoria e ordenação
- **Lupa de pesquisa** no topo: o cliente digita o nome da peça e vê os resultados na hora (sem se preocupar com acento, plural ou maiúscula; entende sinônimos como "chinelo" → slides). Se não achar nada, aparece um botão para perguntar no WhatsApp. No computador, a tecla `/` abre a pesquisa
- **Compra pelo WhatsApp**: cada produto tem "Comprar" (escolhe o tamanho) e um botão de WhatsApp. A **sacola** junta as peças, aplica o cupom e manda o pedido pronto no WhatsApp
- **Bolinha de vídeo**: o vídeo das roupas fica rodando numa bolinha que o cliente **arrasta para onde quiser** (a posição fica salva). Ao tocar, abre o vídeo grande com som e botões de compra
- **Rodapé** com redes sociais (Instagram, TikTok, YouTube, Facebook, X, WhatsApp), links de ajuda e formas de pagamento
- Botão flutuante do WhatsApp, link direto para cada produto (ex.: `…/LUXX%20STORE%20SITE.html#produto-p5`)

## Painel do dono

**Como abrir:** coloque `#admin` no fim do link do site, ou toque **5 vezes** no "LUXX" gigante do rodapé.
**PIN inicial:** `luxx`. Troque em *Painel → Publicar*.

O painel controla:

| Aba | O que muda |
| --- | --- |
| Cores | Fundo, texto, títulos, bordas, botões, selos, preço, barra do topo, cabeçalho, promoção, rodapé, WhatsApp. Tem 5 temas prontos |
| Fontes | Mais de 40 fontes do Google (ou qualquer outra pelo nome), peso, tamanho, espaçamento, caixa alta e itálico |
| Estilo | Arredondamento, bordas, botões, largura, espaçamento, colunas, brilho neon, textura e animações |
| Seções e textos | Liga/desliga e reordena as seções, edita todos os textos |
| Catálogo | Adiciona, edita, duplica, reordena e exclui produtos: preço, preço "de", tamanhos, foto (enviada do celular ou por link), novidade, mais vendido, esgotado |
| Categorias | Cria, renomeia, reordena, troca foto ou ilustração |
| Vídeo | Troca o vídeo da bolinha (enviar do celular, link MP4 ou YouTube), tamanho, formato, borda, etiqueta, posição inicial e o que acontece ao tocar |
| Marca e contato | Nome e logo (texto ou imagem), **número do WhatsApp**, cupom e %, parcelas, frete grátis, sacola e lupa de pesquisa (liga/desliga), redes sociais, título do Google |
| Publicar | Baixar o site atualizado, restaurar de um arquivo, trocar o PIN, CSS personalizado |

Também dá para **editar os textos tocando direto no site** (*Início → Editar textos tocando no site*), e tem **Desfazer/Refazer**.

Nos textos, `{cupom}`, `{desconto}`, `{frete}`, `{parcelas}`, `{loja}` e `{ano}` são preenchidos automaticamente.

> **Antes de divulgar:** coloque o número do WhatsApp da loja (*Marca e contato*), os links das suas redes sociais e troque o PIN. Até o número ser configurado, o WhatsApp abre e o cliente escolhe o contato.

### Como as alterações chegam aos clientes

O site não tem servidor: tudo que você muda no painel fica **salvo no seu aparelho** e aparece na hora para você. Para os clientes verem:

1. *Painel → Publicar → **Baixar site atualizado***. Baixa um novo `LUXX STORE SITE.html`, com fotos e vídeos dentro dele.
2. Substitua o arquivo antigo pelo novo onde o site está publicado.

Para continuar editando outro dia ou em outro aparelho, use *Publicar → Carregar arquivo do site*.

## Publicar grátis (GitHub Pages)

1. No GitHub: *Settings → Pages → Branch: `main` / pasta `/ (root)` → Save*.
2. O site fica em `https://22kofking.github.io/luxx-store/`. O `index.html` só redireciona para o `LUXX STORE SITE.html`.
3. Para atualizar: *Add file → Upload files* e envie o `LUXX STORE SITE.html` baixado do painel (mesmo nome, substitui o antigo).

Também funciona em Netlify, Vercel, Hostinger etc.: envie os dois arquivos (`index.html` e `LUXX STORE SITE.html`).

**Celular:** no Android/computador, o arquivo abre direto no navegador. No **iPhone**, a pré-visualização do app Arquivos não roda sites, então abra pelo link publicado.

## Para desenvolvedores

O arquivo final é gerado a partir de `src/`:

```
src/template.html     estrutura do HTML
src/defaults.mjs      conteúdo padrão (textos, catálogo, tema, vídeo)
src/css/site.css      visual do site (tudo via variáveis CSS)
src/css/panel.css     visual do painel
src/js/*.js           módulos (render, sacola, bolinha, painel, exportação…)
assets/luxx-bubble.mp4  vídeo padrão (H.264), gerado das ilustrações
tools/build.mjs       junta tudo em "LUXX STORE SITE.html" + index.html
tools/make-video.mjs  recria o vídeo padrão (Playwright + ffmpeg)
```

```bash
npm run build   # gera o LUXX STORE SITE.html (só Node, sem dependências)
npm run video   # recria assets/luxx-bubble.mp4 e gera o site (precisa de npm install + ffmpeg)
node tools/build.mjs --artifact saida.html   # versão para publicar como Artifact no claude.ai
```

Dentro do claude.ai o botão "Baixar site atualizado" usa o recurso `downloads` da plataforma; no arquivo comum, um download normal do navegador.

As ilustrações das peças são SVG desenhadas em código (`src/js/02-art.js`) e trocadas por fotos reais pelo painel.
