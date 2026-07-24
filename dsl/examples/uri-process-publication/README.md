# URI Process: publikacja książki

Edukacyjny Process Pack pokazuje różnicę między usługami a procesem:

- SOA dostarcza GitHub, renderer książki, TTS i hosting;
- POA składa zdolności w kontrolowane wydanie;
- URI Process wiąże każdy krok ze stabilnym adresem, efektem i weryfikacją.

Warstwy nie duplikują odpowiedzialności:

- Intent określa cel, deliverables, non-goals i bramki;
- Strategy wskazuje capabilities niezależne od providera;
- URI Process tworzy DAG kroków, wyników i kryteriów;
- AQL ogranicza komendy oraz publikację;
- EQL i TestQL definiują stan gotowy i stan po wykonaniu;
- SODL pokazuje format zdarzeń, jawnie oznaczony jako przykład;
- Editorial Contract i receipt obejmują każdy akapit książki.

Uruchomienie produkcyjne wymaga rzeczywistych bindings, registry, AQL oraz
grantów. Pliki nie zawierają sekretów ani automatycznej zgody na publikację.

`processes.json` można sprawdzić:

```bash
npm run content:validate
npm run dsl:validate
```
