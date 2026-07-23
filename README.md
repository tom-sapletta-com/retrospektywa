# Retrospektywa

Repozytorium dla `retrospektywa.pl`: serwis redakcyjny, książka jako kod,
podcast, audiobook oraz laboratorium zdarzeń budujące digital twin programisty.

## Czytaj i uruchamiaj

- książka HTML: <https://tom-sapletta-com.github.io/retrospektywa/>
- aplikacja: <https://retrospektywa.softreck.chatgpt.site>
- źródła: <https://github.com/tom-sapletta-com/retrospektywa>

## Zasada projektu

Jedno źródło wiedzy zasila wiele kanałów:

```text
eksperyment → rozdział → esej → scenariusz → audio → retrospektywa
```

Markdown opowiada historię. DSL opisuje cel, uprawnienia, proces, oczekiwania,
sytuację i dowody. Interaktywne laboratorium zapisuje wyłącznie metadane pracy
w D1 — bez kodu, promptów i sekretów.

## Struktura

- `app/` — serwis i prywatne laboratorium digital twina;
- `book/` — źródła książki Quarto;
- `content/podcast/` — scenariusze odcinków;
- `dsl/` — schemat eksperymentu i przykładowy Process Pack;
- `db/` — rejestr zdarzeń;
- `scripts/generate-audio.mjs` — TTS przez OpenAI albo ElevenLabs;
- `.github/workflows/` — statyczna publikacja książki w GitHub Pages.

## Uruchomienie serwisu

```bash
npm install
npm run dev
```

Po zmianie `db/schema.ts`:

```bash
npm run db:generate
```

## Książka

Źródłem są pliki `.qmd`. Manuskrypt wydania 0.1 ma trzy części i jedenaście
rozdziałów. Quarto generuje stronę, EPUB, DOCX i PDF przez Typst:

```bash
npm run content:render
```

## Audio

Skrypt dzieli dłuższy tekst na segmenty i tworzy manifest. Sekrety pozostają
wyłącznie w zmiennych środowiskowych.

```bash
AUDIO_PROVIDER=openai \
OPENAI_API_KEY=... \
npm run audio:generate -- content/podcast/001.qmd outputs/episode-001
```

albo:

```bash
AUDIO_PROVIDER=elevenlabs \
ELEVENLABS_API_KEY=... \
ELEVENLABS_VOICE_ID=... \
npm run audio:generate -- content/podcast/001.qmd outputs/episode-001
```

Domyślne modele można zmienić przez `OPENAI_AUDIO_MODEL` i
`ELEVENLABS_AUDIO_MODEL`.

## Publikacja

GitHub Pages publikuje statyczną książkę/blog. Interaktywne laboratorium działa
oddzielnie, ponieważ wymaga uwierzytelnienia i bazy danych.

Docelowa mapa:

| Adres | Rola |
| --- | --- |
| `retrospektywa.pl` | manifest i blog |
| `ksiazka.retrospektywa.pl` | książka i sprzedaż |
| `podcast.retrospektywa.pl` | podcast, RSS i transkrypcje |
| `lab.retrospektywa.pl` | prywatny rejestr i digital twin |
| `audio.retrospektywa.pl` | pliki audio |
| `api.retrospektywa.pl` | automatyzacje i integracje |

Podłączenie domen, operatora płatności i kanałów dystrybucji jest osobnym
etapem operacyjnym; repo nie zawiera danych dostępowych.
