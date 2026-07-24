# Stan publikacji Retrospektywy

Stan sprawdzony: 24 lipca 2026 r.

## Opublikowane

| Element | Adres | Stan |
|---|---|---|
| landing page | <https://retrospektywa.softreck.chatgpt.site> | publiczny |
| książka HTML | <https://tom-sapletta-com.github.io/retrospektywa/> | publiczna |
| PDF, EPUB i DOCX | `releases/` oraz `downloads/` | opublikowane, SHA-256 w manifeście |
| próbka audiobooka | `retrospektywa-audiobook-preview-0.2.mp3` | opublikowana, poprawny MP3 |
| Process Pack | `retrospektywa-process-pack-0.2.zip` | opublikowany |
| źródła | <https://github.com/tom-sapletta-com/retrospektywa> | repozytorium publiczne |

Sites i GitHub Pages publikują tę samą zatwierdzoną paczkę z
`public/releases`. Polecenie `npm run publication:check` pobiera oba manifesty,
sprawdza wszystkie rozmiary i sumy SHA-256 oraz obecność najważniejszych treści
na landing page i stronie książki.

## Bramka jakości

Publikacja na GitHub Pages wymaga powodzenia trzech niezależnych zadań:

1. `quality` — lint, DSL, build aplikacji i testy Node;
2. `docker-e2e` — produkcyjny serwis oraz Playwright w osobnych kontenerach;
3. `book` — render HTML Quarto, przygotowanie i walidacja zatwierdzonej paczki.

E2E obejmuje Chromium w profilu desktopowym i mobilnym, wszystkie publiczne
trasy, linki, prywatność API, manifest oraz SHA-256 pobranych artefaktów.
Po wdrożeniu osobny audyt ponownie pobiera landing page, książkę i pliki z obu
publicznych kanałów.

## Pozostałe prace

Nie blokują one publicznego wydania 0.2:

1. **Pełny audiobook.** Obecnie opublikowana jest oznaczona próbka. Całość
   wymaga wyboru głosu, providera, budżetu oraz redakcji wszystkich scenariuszy.
2. **Test produkcyjny Google Cloud TTS.** Test kontraktu API działa bez sekretu;
   wywołanie usługi Google wymaga `GOOGLE_TTS_API_KEY` albo krótkotrwałego
   tokenu dostępu.
3. **Własne domeny.** Aktywne są adresy Sites i GitHub Pages. Domeny
   `retrospektywa.pl`, `ksiazka.retrospektywa.pl` i pozostałe wymagają zmian
   DNS oraz decyzji o docelowym routingu.
4. **Dystrybucja podcastu.** RSS, Spotify, Apple Podcasts i YouTube nie są
   jeszcze kanałami wydania 0.2.
5. **Sprzedaż i licencje.** Publiczne wydanie jest dostępne bez modułu płatności;
   operator, cennik i licencja zespołowa pozostają decyzją biznesową.
6. **Walidacja dostępności PDF.** Można rozszerzyć pipeline o veraPDF dla
   wybranego profilu PDF/A lub PDF/UA.
