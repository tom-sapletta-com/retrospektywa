# Architektura publikacji

## Przepływ

1. Eksperyment opisuje intencję, ograniczenia i miary.
2. Rejestr SODL/D1 zapisuje zdarzenia wykonania.
3. Retrospektywa tworzy tezę oraz aktualizuje Process Pack.
4. Rozdział QMD staje się książką, esejem i scenariuszem.
5. Scenariusz trafia do jednego z dwóch providerów audio.
6. Statyczne wydania publikuje GitHub Pages; prywatne laboratorium pozostaje w
   środowisku z bazą i tożsamością użytkownika.

## Granica digital twina

Twin przechowuje metadane procesowe: czas, koszt, rolę, capability, wynik i
jakość. Nie przechowuje sekretów, pełnego kodu ani prywatnych promptów.

## Poziomy autonomii

| Poziom | Prawo systemu | Bramka |
| --- | --- | --- |
| L0 | obserwacja | zgoda na rejestrowanie metadanych |
| L1 | rekomendacja | co najmniej 5 zdarzeń |
| L2 | delegowanie | 20 zdarzeń, akceptacja ≥ 90%, jakość ≥ 4,0 |
| L3 | wykonanie z odbiorem | 50 zdarzeń, akceptacja ≥ 95% |
| L4 | optymalizacja procesu | 100 zdarzeń, akceptacja ≥ 97%, jakość ≥ 4,5 |

Każdy poziom ma limit kosztu, czasu i uprawnień. Incydent krytyczny zatrzymuje
automatyzację i wymusza ponowną retrospektywę.

## Digital Twin Router

Portret Digital Twin jest tylko do odczytu. Router może oceniać specjalizację i
workload dopiero po pokryciu AQL i URI. Portret nie nadaje authority.

```text
Intent -> Composer -> DOQL snapshot -> Router -> executor
                                              -> receipt
                                              -> EQL handoff
                                              -> next ticket
```

False-ready przechodzi do `waiting_input` z dokładnym kodem bramki. Niezmieniona
odmowa nie jest ponawiana. Działanie błędu lub dodatkowego cyklu nie rozszerza
authority i nie omija lifecycle.

## Pętla ewolucyjna DSL

1. Intencja definiuje mierzalną zmianę.
2. Kontrakt formalizuje granice i definicję ukończenia.
3. Walidatory sprawdzają AQL, URI, EQL i gotowość.
4. Prototyp wykonuje najmniejszy bezpieczny przebieg.
5. SODL i receipt zapisują wynik.
6. Retrospektywa wprowadza jedną zmianę w kolejnej wersji.
