# DSL Retrospektywy

Minimalny Process Pack:

```text
case-study/
├── experiment.yaml
├── authority.contract.aql
├── workflow.oql
├── pressure.eql
├── readiness.testql
├── situation.doql.json
├── events.sodl.jsonl
└── retrospective.md
```

`experiment.yaml` jest przenośnym kontraktem dla książki. Może być wiązany z
DSL-ami Subactora bez wpisywania nazw providerów do strategii.

## Po co używać DSL w książce

DSL nie zastępuje narracji. Wyodrębnia z niej część wykonawczą:

- pola wymagane przez walidator,
- uprawnienia i zakazy,
- wejścia oraz wyjścia procesu,
- oczekiwany receipt,
- mierzalny warunek kolejnej wersji.

Dzięki temu idea jest krótsza, ale jednocześnie łatwiejsza do zmiany,
wersjonowania, wdrożenia, testowania i prototypowania.

## Przykłady

- `examples/two-models/` — podział implementacji i niezależnego review;
- `examples/digital-twin-router/` — edukacyjna formalizacja portretu, routera,
  false-ready i łańcucha handoffów wdrożonych w Subactorze;
- `examples/uri-process-publication/` — SOA, POA i URI Process na przykładzie
  wieloformatowego wydania książki.
- `examples/workcell-cybernetics/` — cybernetyczne stanowisko pracy z celem,
  authority, protokołem, walidacją, budżetami i eskalacją.

Listy URI Process można walidować względem
`schema/uri-process.schema.json`. Schemat opisuje przenośną warstwę edukacyjną;
runtime produkcyjny musi dodatkowo sprawdzić registry, kontrakt capability,
authority i aktualną politykę.

Kontrakty WorkCell można walidować względem
`schema/workcell.schema.json`. Schemat nie przyznaje authority: potwierdza
jedynie kompletność deklaracji, którą runtime musi przeciąć z aktywną polityką.
