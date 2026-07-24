#!/usr/bin/env python3
"""Validate the executable examples shipped with the book."""

from __future__ import annotations

import json
from pathlib import Path

import jsonschema
import yaml


ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def validate_schema(document_path: Path, schema_path: Path) -> None:
    schema = load_json(schema_path)
    document = (
        load_json(document_path)
        if document_path.suffix == ".json"
        else yaml.safe_load(document_path.read_text(encoding="utf-8"))
    )
    jsonschema.Draft202012Validator(schema).validate(document)
    print(f"schema ok: {document_path.relative_to(ROOT)}")


def validate_process_graph(path: Path) -> None:
    processes = load_json(path)
    identifiers = [process["id"] for process in processes]
    if len(identifiers) != len(set(identifiers)):
        raise ValueError("URI Process: identyfikatory procesów nie są unikalne")

    known = set(identifiers)
    for process in processes:
        missing = set(process.get("depends_on", [])) - known
        if missing:
            raise ValueError(f"{process['id']}: brak zależności {sorted(missing)}")
        expected = f"/{process.get('effect', '')}/"
        if expected not in process["uri"]:
            raise ValueError(f"{process['id']}: URI nie koduje efektu {expected}")

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
    print(f"graph ok: {path.relative_to(ROOT)} ({len(processes)} procesów)")


def main() -> None:
    validate_schema(
        ROOT / "dsl/examples/two-models/experiment.yaml",
        ROOT / "dsl/schema/experiment.schema.json",
    )
    process_path = ROOT / "dsl/examples/uri-process-publication/processes.json"
    validate_schema(process_path, ROOT / "dsl/schema/uri-process.schema.json")
    validate_process_graph(process_path)


if __name__ == "__main__":
    main()
