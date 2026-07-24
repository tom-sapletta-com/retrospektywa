#!/usr/bin/env python3
"""Validate every prose paragraph and the controlled concept registry."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import jsonschema
import yaml


ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "dsl/examples/uri-process-publication/editorial.contract.yaml"
SCHEMA_PATH = ROOT / "dsl/schema/editorial-contract.schema.json"
RECEIPT_PATH = ROOT / "book/editorial-receipt.json"

CONTROLLED_TERM = re.compile(
    r"\b(?:Intent Contract|URI Process|Digital Twin(?: Portrait)?|WorkCell|"
    r"SOA|POA|AQL|OQL|EQL|TestQL|DOQL|DQL|SODL)\b"
)
CITATION = re.compile(r"\[@([A-Za-z0-9_:.-]+)")
IMPERATIVE = re.compile(
    r"^(?:wybierz|zapisz|ustaw|porównaj|sprawdź|dodaj|usuń|zmierz|uruchom|"
    r"utrzymuj|nie |preferuj|oddziel|używaj|zamykaj|odbieraj|zbuduj)\b",
    re.IGNORECASE,
)
LIMITATION = re.compile(
    r"\b(?:nie jest|nie oznacza|nie gwarantuje|ograniczen|granica|zakłada|"
    r"przybliżeni|hipotez|materiał edukacyjny|nie uniwersal|zależy od|"
    r"tylko wtedy|wymaga .* założeń)\w*",
    re.IGNORECASE,
)
MECHANISM = re.compile(
    r"\b(?:dlatego|ponieważ|jeżeli|gdy|dzięki temu|oznacza|wynika|prowadzi|"
    r"pozwala|wtedy|zamiast|dopiero)\b",
    re.IGNORECASE,
)
DEFINITION = re.compile(
    r"\b(?:jest|oznacza|nazywamy|definiuje|opisuje|stanowi|rozumiemy jako)\b",
    re.IGNORECASE,
)
EXAMPLE = re.compile(
    r"\b(?:przykład|przykładow|na przykład|może|proponowany|szablon|snapshot)\w*",
    re.IGNORECASE,
)
STRONG_CLAIM = re.compile(
    r"\b(?:badani[ae]|wykazał|wykazały|prawo |twierdzenie |kodeks |ustawa |"
    r"rfc |nist |nasa-tlx|zabrania)\b",
    re.IGNORECASE,
)


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def load_contract() -> dict:
    contract_document = yaml.safe_load(CONTRACT_PATH.read_text(encoding="utf-8"))
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    jsonschema.Draft202012Validator(schema).validate(contract_document)
    return contract_document["editorial_contract"]


def bibliography_keys() -> set[str]:
    return set(
        re.findall(
            r"^@\w+\{([^,]+),",
            (ROOT / "book/references.bib").read_text(encoding="utf-8"),
            re.MULTILINE,
        )
    )


def prose_paragraphs(path: Path) -> list[dict]:
    lines = path.read_text(encoding="utf-8").splitlines()
    paragraphs: list[dict] = []
    block: list[tuple[int, str]] = []
    in_frontmatter = bool(lines and lines[0].strip() == "---")
    in_fence = False
    in_math = False
    section = ""

    def flush() -> None:
        nonlocal block
        if not block:
            return
        first = block[0][1].strip()
        ignored = (
            re.match(r"^(?:[-*+] |\d+[.)] )", first)
            or first.startswith("|")
            or first.startswith("![")
            or first.startswith(":::")
            or first.startswith("<")
        )
        if not ignored:
            text = " ".join(line.strip().lstrip("> ").strip() for _, line in block)
            text = re.sub(r"\s+", " ", text).strip()
            if text:
                paragraphs.append(
                    {"line": block[0][0], "section": section, "text": text}
                )
        block = []

    for number, line in enumerate(lines, start=1):
        stripped = line.strip()
        if in_frontmatter:
            if number > 1 and stripped == "---":
                in_frontmatter = False
            continue
        if stripped.startswith("```"):
            flush()
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if stripped == "$$":
            flush()
            in_math = not in_math
            continue
        if in_math:
            continue
        if stripped.startswith("#"):
            flush()
            section = re.sub(r"^#+\s*", "", stripped)
            continue
        if not stripped:
            flush()
            continue
        block.append((number, line))
    flush()
    return paragraphs


def role_and_basis(paragraph: dict, index: int) -> tuple[str, str]:
    text = paragraph["text"]
    section = paragraph["section"].lower()
    if index == 0:
        role = "thesis"
    elif CITATION.search(text):
        role = "evidence"
    elif "eksperyment" in section or "jak pracować" in section or IMPERATIVE.search(text):
        role = "procedure"
    elif LIMITATION.search(text):
        role = "limitation"
    elif EXAMPLE.search(text):
        role = "example"
    elif MECHANISM.search(text):
        role = "mechanism"
    elif DEFINITION.search(text):
        role = "definition"
    elif re.search(r"(?:https?://|downloads/|dsl/|scripts/|npm run|`[^`]+`)", text):
        role = "navigation"
    else:
        role = "mechanism"

    if CITATION.search(text):
        basis = "citation"
    elif re.search(r"(?:dsl/|scripts/|book/|npm run|JSON Schema|Process Pack|`[^`]+`)", text):
        basis = "local_artifact"
    elif LIMITATION.search(text):
        basis = "scope_boundary"
    elif "eksperyment" in section or IMPERATIVE.search(text):
        basis = "operational_test"
    elif re.search(r"\b(?:wzór|równanie|wynika|warunek|suma|iloraz|wektor)\b", text, re.IGNORECASE):
        basis = "derivation"
    else:
        basis = "bounded_hypothesis"
    return role, basis


def validate() -> dict:
    contract = load_contract()
    allowed_roles = set(contract["paragraph_roles"])
    allowed_basis = set(contract["evidence_modes"])
    known_citations = bibliography_keys()
    errors: list[str] = []
    seen_paragraphs: dict[str, tuple[str, int]] = {}
    files_receipt = []
    all_text = []

    for relative in contract["scope"]:
        path = ROOT / relative
        if not path.is_file():
            errors.append(f"brak pliku w scope: {relative}")
            continue
        raw_source = path.read_text(encoding="utf-8")
        paragraphs = prose_paragraphs(path)
        if not paragraphs:
            errors.append(f"brak prozy: {relative}")
            continue
        paragraph_receipts = []
        has_validation = bool(
            CITATION.search(raw_source)
            or re.search(r"(?:```|`[^`]+`|^## (?:Eksperyment|Jak ))", raw_source, re.MULTILINE)
        )
        for index, paragraph in enumerate(paragraphs):
            text = paragraph["text"]
            digest = sha256(text)
            role, basis = role_and_basis(paragraph, index)
            if role not in allowed_roles or basis not in allowed_basis:
                errors.append(f"{relative}:{paragraph['line']}: nieznana klasyfikacja {role}/{basis}")
            if digest in seen_paragraphs:
                other_path, other_line = seen_paragraphs[digest]
                errors.append(
                    f"{relative}:{paragraph['line']}: duplikat akapitu z {other_path}:{other_line}"
                )
            seen_paragraphs[digest] = (relative, paragraph["line"])
            for key in CITATION.findall(text):
                if key not in known_citations:
                    errors.append(f"{relative}:{paragraph['line']}: brak źródła @{key}")
            if STRONG_CLAIM.search(text) and basis not in {"citation", "local_artifact", "scope_boundary"}:
                errors.append(
                    f"{relative}:{paragraph['line']}: mocne twierdzenie bez źródła lub granicy"
                )
            lowered = text.casefold()
            for phrase in contract["prohibited_phrases"]:
                if phrase.casefold() in lowered:
                    errors.append(f"{relative}:{paragraph['line']}: zakazana fraza „{phrase}”")
            has_validation = has_validation or basis in {
                "citation",
                "local_artifact",
                "operational_test",
                "derivation",
            }
            paragraph_receipts.append(
                {
                    "id": f"{Path(relative).stem}-p{index + 1:03d}",
                    "line": paragraph["line"],
                    "sha256": digest,
                    "role": role,
                    "basis": basis,
                }
            )
            all_text.append(text)
        if not has_validation:
            errors.append(f"{relative}: brak akapitu z walidowalną podstawą")
        files_receipt.append(
            {
                "path": relative,
                "source_sha256": sha256(path.read_text(encoding="utf-8")),
                "paragraphs": paragraph_receipts,
            }
        )

    combined = "\n".join(all_text)
    declared_terms = {
        term
        for concept in contract["concepts"]
        for term in concept["terms"]
    }
    used_controlled_terms = set(CONTROLLED_TERM.findall(combined))
    undeclared = used_controlled_terms - declared_terms
    if undeclared:
        errors.append(f"niezadeklarowane pojęcia kontrolowane: {sorted(undeclared)}")

    concept_receipts = []
    for concept in contract["concepts"]:
        occurrences = sum(
            len(re.findall(rf"(?<!\\w){re.escape(term)}(?!\\w)", combined))
            for term in concept["terms"]
        )
        if occurrences == 0:
            errors.append(f"nieużywane pojęcie w rejestrze: {concept['id']}")
        for evidence in concept["validated_by"]:
            if evidence.startswith("@"):
                if evidence[1:] not in known_citations:
                    errors.append(f"{concept['id']}: brak źródła {evidence}")
            elif not (ROOT / evidence).exists() and not evidence.startswith("npm run "):
                errors.append(f"{concept['id']}: brak artefaktu {evidence}")
        concept_receipts.append(
            {
                "id": concept["id"],
                "status": concept["status"],
                "occurrences": occurrences,
                "validated_by": concept["validated_by"],
            }
        )

    if errors:
        raise ValueError("Content contract failed:\n- " + "\n- ".join(errors))

    return {
        "schema": "retrospektywa.editorial-receipt/v1",
        "contract": {
            "id": contract["id"],
            "version": contract["version"],
            "sha256": sha256(CONTRACT_PATH.read_text(encoding="utf-8")),
        },
        "summary": {
            "files": len(files_receipt),
            "paragraphs": sum(len(item["paragraphs"]) for item in files_receipt),
            "controlled_concepts": len(concept_receipts),
            "unvalidated_concepts": 0,
        },
        "files": files_receipt,
        "concepts": concept_receipts,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-receipt", action="store_true")
    args = parser.parse_args()
    receipt = validate()
    serialized = json.dumps(receipt, ensure_ascii=False, indent=2) + "\n"
    if args.write_receipt:
        RECEIPT_PATH.write_text(serialized, encoding="utf-8")
        print(f"receipt written: {RECEIPT_PATH.relative_to(ROOT)}")
    else:
        if not RECEIPT_PATH.is_file():
            raise ValueError("Brak book/editorial-receipt.json; użyj --write-receipt po review")
        if RECEIPT_PATH.read_text(encoding="utf-8") != serialized:
            raise ValueError(
                "Receipt akapitów jest nieaktualny; przejrzyj zmiany i uruchom "
                "python3 scripts/validate-content.py --write-receipt"
            )
    summary = receipt["summary"]
    print(
        "content ok: "
        f"{summary['paragraphs']} akapitów, "
        f"{summary['controlled_concepts']} pojęć, "
        f"{summary['unvalidated_concepts']} niezwalidowanych"
    )


if __name__ == "__main__":
    main()
