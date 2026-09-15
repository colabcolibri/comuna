# Stitch — referência visual

Exportação do canvas [Alumni Platform](https://stitch.withgoogle.com/projects/9675775750351043893). **Não é código de produto.** O contrato de UI continua em [`docs/09_design_system.md`](../09_design_system.md).

Baixado em 2026-09-14 (segunda exportação). Só telas **visíveis** no canvas.

| Tela | Captura | Template HTML | Stitch screen id |
| ---- | ------- | ------------- | ---------------- |
| Diretório / vitrine, otimizado (desktop, legado) | [screenshots/diretorio-talentos.png](screenshots/diretorio-talentos.png) | [html/diretorio-talentos.html](html/diretorio-talentos.html) | `200f3a5bce694900961b531cc02d9b55` |
| Autenticação OTP (desktop, legado) | [screenshots/autenticacao-otp.png](screenshots/autenticacao-otp.png) | [html/autenticacao-otp.html](html/autenticacao-otp.html) | `7bd9d07b9e69446f9f2efafbe3d52454` |
| Pedidos de entrada (desktop, legado) | [screenshots/pedidos-entrada-coordenacao.png](screenshots/pedidos-entrada-coordenacao.png) | [html/pedidos-entrada-coordenacao.html](html/pedidos-entrada-coordenacao.html) | `12a934852ffe47a592b556572de83dff` |
| Índice institucional (vitrine em linhas, 2026-09-15) | no canvas | — | `e4c4e53ced81455aa07a0690822be1c0` |
| OTP + sheet aberto + dock de perfil | no canvas | — | `2651c07001c441c7b1035e9510103bae` |
| Pedidos + header unificado | no canvas | — | `2fa0c40aa12f46eba93f55bcb9f551b0` |

Telas antigas no canvas estão **hidden**. Gerações novas: IBM Plex Sans, chrome slim. Design system: `assets/8466252695291598814`.

O HTML é o markup gerado pelo Stitch (Tailwind + CDN). Serve para copiar estrutura, copy e hierarquia — não para colar no app Next.js.

As PNGs são as miniaturas da API do Stitch (não o PNG 2560px). Para pixel-perfect, abra o projeto no Stitch.

Brief de design usado na geração: [DESIGN.md](DESIGN.md).
