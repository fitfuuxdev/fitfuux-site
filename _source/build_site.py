import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(__file__).resolve().parent
VER = "20261122ca"

ARROW = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
UP = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'

NAV = [
    ("services", "services.html", "Услуги"),
    ("portfolio", "portfolio.html", "Кейсы"),
    ("about", "about.html", "Обо мне"),
    ("pricing", "pricing.html", "Цены"),
    ("contacts", "contacts.html", "Контакты"),
]

BRAND = """<span class="brand-mark" aria-hidden="true"><span class="brand-stack">
<span class="brand-layer" style="--z:6">FITFUUX</span>
<span class="brand-layer" style="--z:5">FITFUUX</span>
<span class="brand-layer" style="--z:4">FITFUUX</span>
<span class="brand-layer" style="--z:3">FITFUUX</span>
<span class="brand-layer" style="--z:2">FITFUUX</span>
<span class="brand-layer" style="--z:1">FITFUUX</span>
<span class="brand-face">FITFUUX</span>
</span></span>"""

PRELOAD_JS = """<script>
(function () {
  var root = document.documentElement;
  try {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var internal = false;
    try {
      internal = !!document.referrer && new URL(document.referrer).origin === location.origin;
    } catch (e) {}
    var nav = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
    var reload = nav && nav.type === 'reload';
    if (!reduced && (!internal || reload)) {
      window.__preStart = performance.now();
      root.classList.add('preloader-active', 'preloader-play');
    }
    setTimeout(function () {
      if (root.classList.contains('preloader-active') && !root.classList.contains('preloader-reveal')) {
        root.classList.remove('preloader-active');
      }
    }, 4000);
  } catch (e) {}
})();
</script>"""

PRELOADER = """<div class="preloader" data-preloader aria-hidden="true">
  <div class="preloader__panel preloader__panel--left"></div>
  <div class="preloader__panel preloader__panel--right"></div>
  <div class="preloader__inner">
    <div class="preloader__word" aria-label="FITFUUX">
      <span class="preloader__letter" style="--d:.05s;--lx:-5px">F</span><span class="preloader__letter" style="--d:.13s;--lx:4px">I</span><span class="preloader__letter" style="--d:.21s;--lx:-3px">T</span><span class="preloader__letter" style="--d:.29s;--lx:5px">F</span><span class="preloader__letter" style="--d:.37s;--lx:-4px">U</span><span class="preloader__letter" style="--d:.45s;--lx:3px">U</span><span class="preloader__letter" style="--d:.53s;--lx:-2px">X</span>
    </div>
    <div class="preloader__rule"><span></span></div>
  </div>
</div>"""


def header(page, base):
    links = []
    for key, href, label in NAV:
        active = ' is-active" aria-current="page' if key == page else ''
        links.append(f'<a class="nav-link{active}" href="{base}{href}">{label}</a>')
    nav = "\n        ".join(links)
    return f"""<header class="site-header" data-header>
  <div class="header-inner">
    <a class="brand" href="{base}index.html" aria-label="FITFUUX — на главную">
      {BRAND}
    </a>
    <nav class="nav" id="site-nav" aria-label="Основное меню">
        {nav}
      <div class="nav-contact">
        <span class="small">Связаться</span>
        <a href="tel:+79952585787">+7 995 258-57-87</a>
        <a href="https://t.me/Fitfuux" target="_blank" rel="noopener">Telegram @Fitfuux</a>
        <a class="btn btn--light" href="https://t.me/Fitfuux" target="_blank" rel="noopener">Написать</a>
      </div>
    </nav>
    <a class="btn btn--ghost header-cta" href="https://t.me/Fitfuux" target="_blank" rel="noopener">Написать</a>
    <button class="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="site-nav"><span></span><span></span></button>
  </div>
</header>"""


def footer(base):
    return f"""<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="brand" href="{base}index.html" aria-label="FITFUUX — на главную">
          {BRAND}
        </a>
        <p class="footer-note">Лендинги и сайты для малого бизнеса под ключ. Дизайн, тексты, вёрстка, заявки и оплата. Работаю по России, удалённо.</p>
      </div>
      <div class="footer-col">
        <h4>Разделы</h4>
        <nav class="footer-links" aria-label="Разделы сайта">
          <a href="{base}index.html">Главная</a>
          <a href="{base}services.html">Услуги</a>
          <a href="{base}portfolio.html">Кейсы</a>
          <a href="{base}about.html">Обо мне</a>
          <a href="{base}pricing.html">Цены</a>
          <a href="{base}contacts.html">Контакты</a>
        </nav>
      </div>
      <div class="footer-col">
        <h4>Связаться</h4>
        <div class="footer-contact">
          <a class="tg" href="https://t.me/Fitfuux" target="_blank" rel="noopener">Telegram @Fitfuux</a>
          <a class="tel" href="tel:+79952585787">+7 995 258-57-87</a>
          <span class="sbp">СБП · получатель Алексей</span>
          <a class="btn btn--light footer-cta" href="https://t.me/Fitfuux" target="_blank" rel="noopener">Написать в Telegram</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-bottom__left">
        <span>© FITFUUX · собрано вручную, без шаблонов</span>
        <span class="footer-credits">Фото: Unsplash, Pexels · кейсы — концепты</span>
      </div>
      <button class="to-top" type="button" data-to-top>Наверх {UP}</button>
    </div>
  </div>
</footer>"""


def head(meta, base):
    css = "\n".join(f'  <link rel="stylesheet" href="{base}assets/css/{c}?v={VER}">' for c in meta["css"])
    module = ""
    if meta.get("module"):
        three_url = (base or "./") + "assets/js/vendor/three.module.min.js"
        module = f"""
  <script type="importmap">{{"imports": {{"three": "{three_url}"}}}}</script>
  <script type="module" src="{base}assets/js/{meta['module']}?v={VER}"></script>"""
    jsonld = ""
    if meta.get("jsonld"):
        jsonld = f"""
  <script type="application/ld+json">{meta['jsonld']}</script>"""
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{meta['title']}</title>
  <meta name="description" content="{meta['desc']}">
  <meta name="robots" content="index,follow">
  <meta name="theme-color" content="{meta.get('theme', '#0b0a09')}">
  {PRELOAD_JS}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="FITFUUX">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:title" content="{meta['title']}">
  <meta property="og:description" content="{meta['desc']}">
  <meta property="og:image" content="{base}assets/img/{meta['og']}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{meta['title']}">
  <meta name="twitter:description" content="{meta['desc']}">
  <meta name="twitter:image" content="{base}assets/img/{meta['og']}">
  <link rel="icon" href="{base}assets/brand/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="{base}assets/brand/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="icon" href="{base}assets/brand/favicon-16.png" sizes="16x16" type="image/png">
  <link rel="apple-touch-icon" href="{base}assets/brand/favicon-180.png">
  <link rel="stylesheet" href="{base}assets/fonts/fonts.css?v={VER}">
  <link rel="stylesheet" href="{base}assets/css/base.css?v={VER}">
{css}{module}{jsonld}
</head>"""


def build(only=None):
    meta_all = json.loads((SRC / "pages.json").read_text(encoding="utf-8"))
    for meta in meta_all:
        if only and meta["out"] != only:
            continue
        base = meta.get("base", "")
        body = (SRC / "pages" / meta["body"]).read_text(encoding="utf-8")
        body = body.replace("{{BASE}}", base)
        html = (
            head(meta, base)
            + f'\n<body class="{meta.get("body_class", "")}">\n'
            + PRELOADER
            + '\n<a class="skip-link" href="#main">Перейти к содержанию</a>\n'
            + header(meta.get("page", ""), base)
            + '\n<main id="main">\n'
            + body
            + '\n</main>\n'
            + footer(base)
            + f'\n<script src="{base}assets/js/app.js?v={VER}" defer></script>\n</body>\n</html>\n'
        )
        out = ROOT / meta["out"]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding="utf-8")
        print("built", meta["out"], len(html))


if __name__ == "__main__":
    import sys
    build(sys.argv[1] if len(sys.argv) > 1 else None)








