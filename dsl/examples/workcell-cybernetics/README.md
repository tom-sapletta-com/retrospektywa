# Cybernetic WorkCell

Przykład przekłada rozdział o cybernetyce pracy na dwa równoważne artefakty:

- `work-model.wmql` — zwięzły zapis redakcyjny;
- `workcell.yaml` — walidowalna projekcja dla narzędzi.

Schemat sprawdza kompletność celu, actora, authority, środowiska, protokołu,
walidatora, metryk, budżetów, akceptacji i eskalacji. Nie nadaje uprawnień.
Runtime musi przeciąć `authority` z aktywną polityką i zapisać dowód decyzji.

```bash
npm run dsl:validate
```
