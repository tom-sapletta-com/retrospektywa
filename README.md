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
- `dsl/` — schematy i trzy przykładowe Process Packi, w tym URI Process;
- `db/` — rejestr zdarzeń;
- `scripts/generate-audio.mjs` — TTS przez Google Cloud, OpenAI, ElevenLabs albo lokalny eSpeak NG;
- `scripts/generate-release.mjs` — generator wydania i manifestu SHA-256;
- `scripts/check-publication.mjs` — kontrola publicznego landing page, książki i sum artefaktów;
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

Źródłem są pliki `.qmd`. Manuskrypt wydania 0.2 ma cztery części, czternaście
rozdziałów i dwa aneksy. Obejmuje SOA, POA, URI Process, publikowanie
wieloformatowe oraz prawne granice `authority` w UoP, zleceniu, dziele i B2B.
Quarto generuje stronę, EPUB, DOCX i PDF przez Typst:

```bash
npm run content:render
```

Pełne, lokalne wydanie z DSL, próbką audio, paczką ZIP i manifestem:

```bash
npm run release:generate
npm run release:validate
```

## Audio

Skrypt dzieli dłuższy tekst bez utraty treści, łączy segmenty MP3 i tworzy
manifest. Sekrety pozostają wyłącznie w zmiennych środowiskowych. Kontrakt
Google Cloud TTS można przetestować bez sekretu:

```bash
npm run audio:test
```

Lokalna, audytowalna próbka używana w otwartym wydaniu:

```bash
npm run audio:preview
```

Google Cloud TTS (REST `text:synthesize`, głos `pl-PL-Standard-F`):

```bash
AUDIO_PROVIDER=google \
GOOGLE_TTS_API_KEY=... \
npm run audio:generate -- content/podcast/001.qmd outputs/episode-001-google

GOOGLE_TTS_API_KEY=... npm run audio:google:test
```

Alternatywni providerzy:

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

Domyślne modele i głosy można zmienić przez `GOOGLE_TTS_VOICE`,
`OPENAI_AUDIO_MODEL`, `OPENAI_AUDIO_VOICE` i `ELEVENLABS_AUDIO_MODEL`.

## Publikacja

GitHub Pages publikuje książkę i pliki do pobrania. Landing page w Sites
prowadzi do książki HTML, PDF/EPUB/DOCX, audiobooka i Process Packa.
Interaktywne laboratorium działa w tej samej aplikacji, ale jego dane wymagają
uwierzytelnienia.

Pliki w `public/releases` są kanoniczną, zatwierdzoną paczką. GitHub Pages nie
generuje ich ponownie: kopiuje dokładnie te same bajty, które publikuje Sites.
Po wdrożeniu można sprawdzić oba kanały wraz z sumami SHA-256:

```bash
npm run publication:check
```

Aktualny stan publikacji i jawna lista dalszych prac znajdują się w
[`PUBLICATION.md`](PUBLICATION.md).

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
