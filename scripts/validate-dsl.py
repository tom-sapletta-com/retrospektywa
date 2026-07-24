#!/usr/bin/env python3
"""Validate the executable examples shipped with the book."""

from __future__ import annotations

import json
import fnmatch
import re
from pathlib import Path

import jsonschema
import yaml


ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def load_yaml(path: Path):
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def validate_schema(document_path: Path, schema_path: Path):
    schema = load_json(schema_path)
    document = (
        load_json(document_path)
        if document_path.suffix == ".json"
        else load_yaml(document_path)
    )
    jsonschema.Draft202012Validator(schema).validate(document)
    print(f"schema ok: {document_path.relative_to(ROOT)}")
    return document


def validate_process_graph(path: Path) -> None:
    processes = load_json(path)
    identifiers = [process["id"] for process in processes]
    if len(identifiers) != len(set(identifiers)):
        raise ValueError("URI Process: identyfikatory procesów nie są unikalne")

    known = set(identifiers)
    outputs: set[str] = set()
    for process in processes:
        missing = set(process.get("depends_on", [])) - known
        if missing:
            raise ValueError(f"{process['id']}: brak zależności {sorted(missing)}")
        expected = f"/{process.get('effect', '')}/"
        if expected not in process["uri"]:
            raise ValueError(f"{process['id']}: URI nie koduje efektu {expected}")
        if process["effect"] == "command" and "verify_uri" not in process:
            raise ValueError(f"{process['id']}: command nie ma verify_uri")
        if process["uri"].startswith(("github://", "sites://")) and not process["human_approval"]:
            raise ValueError(f"{process['id']}: zewnętrzna publikacja wymaga approval")
        duplicate_outputs = outputs & set(process["outputs"])
        if duplicate_outputs:
            raise ValueError(f"{process['id']}: powtórzone outputs {sorted(duplicate_outputs)}")
        outputs.update(process["outputs"])

    visiting: set[str] = set()
    visited: set[str] = set()
    by_id = {process["id"]: process for process in processes}

    def visit(identifier: str) -> None:
        if identifier in visiting:
            raise ValueError(f"URI Process: cykl zależności przy {identifier}")
        if identifier in visited:
            return
        visiting.add(identifier)
        for dependency in by_id[identifier].get("depends_on", []):
            visit(dependency)
        visiting.remove(identifier)
        visited.add(identifier)

    for identifier in identifiers:
        visit(identifier)
    leaves = known - {
        dependency
        for process in processes
        for dependency in process.get("depends_on", [])
    }
    if leaves != {"public-read-back"}:
        raise ValueError(f"URI Process: oczekiwano jednego finalnego read-backu, znaleziono {sorted(leaves)}")
    print(f"graph ok: {path.relative_to(ROOT)} ({len(processes)} procesów)")


def significant_lines(path: Path) -> list[str]:
    return [
        line.strip()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def validate_line_dsl(path: Path, patterns: list[re.Pattern[str]]) -> list[str]:
    lines = significant_lines(path)
    if lines[0] != "VERSION: 1":
        raise ValueError(f"{path.name}: brak VERSION: 1")
    for number, line in enumerate(lines[1:], start=2):
        if not any(pattern.fullmatch(line) for pattern in patterns):
            raise ValueError(f"{path.name}:{number}: nieznana składnia: {line}")
    print(f"syntax ok: {path.relative_to(ROOT)}")
    return lines


def validate_publication_contract() -> None:
    example = ROOT / "dsl/examples/uri-process-publication"
    intent_document = validate_schema(
        example / "intent.yaml",
        ROOT / "dsl/schema/publication-intent.schema.json",
    )
    strategy_document = validate_schema(
        example / "publication.strategy.yaml",
        ROOT / "dsl/schema/publication-strategy.schema.json",
    )
    validate_schema(
        example / "editorial.contract.yaml",
        ROOT / "dsl/schema/editorial-contract.schema.json",
    )

    processes = load_json(example / "processes.json")
    process_capabilities = {process["capability"] for process in processes}
    strategy_capabilities = set(strategy_document["strategy"]["capabilities"])
    if process_capabilities != strategy_capabilities:
        raise ValueError(
            "Publication DSL: capabilities strategii i procesów różnią się: "
            f"{sorted(strategy_capabilities ^ process_capabilities)}"
        )

    test_lines = validate_line_dsl(
        example / "release.testql",
        [
            re.compile(r"SUITE [a-z][a-z0-9_]*:"),
            re.compile(r'TEST [a-z][a-z0-9_]* ".+":'),
            re.compile(r"EXPECT [a-z][a-z0-9_.]* (?:==|>|>=) (?:\"[^\"]+\"|[0-9]+|true|false)"),
        ],
    )
    test_ids = {
        match.group(1)
        for line in test_lines
        if (match := re.fullmatch(r'TEST ([a-z][a-z0-9_]*) ".+":', line))
    }
    intent_gates = {
        item["gate"] for item in intent_document["intent"]["definition_of_done"]
    }
    if intent_gates != test_ids:
        raise ValueError(
            "Publication DSL: Definition of Done i TestQL różnią się: "
            f"{sorted(intent_gates ^ test_ids)}"
        )

    done_ids = {
        item["id"] for item in intent_document["intent"]["definition_of_done"]
    }
    acceptance_ids = {
        acceptance
        for process in processes
        for acceptance in process["acceptance"]
    }
    missing_acceptance = done_ids - acceptance_ids
    if missing_acceptance:
        raise ValueError(
            f"Publication DSL: bramki bez procesu realizującego: {sorted(missing_acceptance)}"
        )

    aql_lines = validate_line_dsl(
        example / "authority.contract.aql",
        [
            re.compile(r"AUTHORITY [a-z][a-z0-9_]*:"),
            re.compile(r'ALLOW [a-z]+ "[^"]+"'),
            re.compile(r'DENY [a-z]+ "[^"]+"'),
            re.compile(r'DENY [a-z]+ "[^"]+" WITHOUT approval'),
        ],
    )
    allow_rules = [
        (match.group(1), match.group(2))
        for line in aql_lines
        if (match := re.fullmatch(r'ALLOW ([a-z]+) "([^"]+)"', line))
    ]
    approval_rules = [
        (match.group(1), match.group(2))
        for line in aql_lines
        if (match := re.fullmatch(r'DENY ([a-z]+) "([^"]+)" WITHOUT approval', line))
    ]
    for process in processes:
        rules = approval_rules if process["human_approval"] else allow_rules
        if not any(fnmatch.fnmatchcase(process["uri"], pattern) for _, pattern in rules):
            mode = "approval" if process["human_approval"] else "allow"
            raise ValueError(f"{process['id']}: proces nie ma pokrycia AQL {mode}")
        if process["human_approval"] and not any(
            action == "publish" and fnmatch.fnmatchcase(process["uri"], pattern)
            for action, pattern in rules
        ):
            raise ValueError(f"{process['id']}: approval nie jest związane z DENY publish")

    validate_line_dsl(
        example / "release.eql",
        [
            re.compile(r"EXPECTATION [a-z][a-z0-9_]*:"),
            re.compile(r"PRECONDITION .+"),
            re.compile(r"POSTCONDITION .+"),
            re.compile(r"PRESSURE [a-z][a-z0-9_]*:"),
            re.compile(r"WHEN .+"),
            re.compile(r"SET [a-z][a-z0-9_.]* = .+"),
            re.compile(r"REQUIRE [a-z][a-z0-9_]*"),
            re.compile(r"FORBID [a-z][a-z0-9_]*"),
        ],
    )

    process_ids = {process["id"] for process in processes}
    registered: list[str] = []
    for number, raw in enumerate(
        (example / "events.sodl.jsonl").read_text(encoding="utf-8").splitlines(),
        start=1,
    ):
        event = json.loads(raw)
        required = {"at", "mode", "event", "process_id", "status"}
        if set(event) != required:
            raise ValueError(f"events.sodl.jsonl:{number}: pola muszą być równe {sorted(required)}")
        if event["mode"] != "example" or event["status"] != "declared":
            raise ValueError(f"events.sodl.jsonl:{number}: przykład nie może udawać runtime receipt")
        if event["process_id"] not in process_ids:
            raise ValueError(f"events.sodl.jsonl:{number}: nieznany proces {event['process_id']}")
        registered.append(event["process_id"])
    if len(registered) != len(set(registered)) or set(registered) != process_ids:
        raise ValueError("SODL: każdy proces musi mieć dokładnie jedno zdarzenie deklaracji")
    print(f"traceability ok: {example.relative_to(ROOT)}")


def validate_workcell(path: Path) -> None:
    document = yaml.safe_load(path.read_text(encoding="utf-8"))
    authority = document["authority"]
    sets = {
        name: set(authority[name])
        for name in ("allow", "require_approval", "deny")
    }
    for left, right in (
        ("allow", "require_approval"),
        ("allow", "deny"),
        ("require_approval", "deny"),
    ):
        overlap = sets[left] & sets[right]
        if overlap:
            raise ValueError(f"WorkCell: działania w {left} i {right}: {sorted(overlap)}")

    required_evidence = set(document["validator"]["evidence_required"])
    for checkpoint in document["protocol"]["checkpoints"]:
        if not checkpoint["requires"]:
            raise ValueError(f"WorkCell: pusty checkpoint {checkpoint['when']}")
    if document["budgets"]["validation_minutes"] > document["budgets"]["time_minutes"]:
        raise ValueError("WorkCell: budżet walidacji przekracza cały horyzont")
    if not required_evidence:
        raise ValueError("WorkCell: validator wymaga co najmniej jednego dowodu")
    print(f"semantics ok: {path.relative_to(ROOT)}")


def main() -> None:
    validate_schema(
        ROOT / "dsl/examples/two-models/experiment.yaml",
        ROOT / "dsl/schema/experiment.schema.json",
    )
    process_path = ROOT / "dsl/examples/uri-process-publication/processes.json"
    validate_schema(process_path, ROOT / "dsl/schema/uri-process.schema.json")
    validate_process_graph(process_path)
    validate_publication_contract()
    workcell_path = ROOT / "dsl/examples/workcell-cybernetics/workcell.yaml"
    validate_schema(workcell_path, ROOT / "dsl/schema/workcell.schema.json")
    validate_workcell(workcell_path)


if __name__ == "__main__":
    main()
