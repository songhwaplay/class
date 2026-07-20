#!/usr/bin/env python3
"""Collect Open English WordNet definitions for vocabulary rows missing Korean glosses."""

from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path


LEMMA_RE = re.compile(r"^([A-Za-z][A-Za-z -]*):\s*$")
SYNSET_REF_RE = re.compile(r"^\s+synset:\s+([0-9]{8}-[nvars])\s*$")
SYNSET_RE = re.compile(r"^([0-9]{8}-[nvars]):\s*$")
PROPERTY_RE = re.compile(r"^  [A-Za-z][A-Za-z_-]*:")


def unquote_yaml_scalar(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        value = value[1:-1]
    return value.replace("''", "'")


def collect_lemma_synsets(yaml_dir: Path, targets: set[str]) -> dict[str, list[str]]:
    result: dict[str, list[str]] = defaultdict(list)
    current: str | None = None
    for path in sorted(yaml_dir.glob("entries-*.yaml")):
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                if not line.startswith(" "):
                    match = LEMMA_RE.match(line.rstrip("\n"))
                    current = match.group(1).casefold() if match else None
                    if current not in targets:
                        current = None
                    continue
                if current:
                    match = SYNSET_REF_RE.match(line.rstrip("\n"))
                    if match and match.group(1) not in result[current]:
                        result[current].append(match.group(1))
    return dict(result)


def collect_definitions(yaml_dir: Path, needed: set[str]) -> dict[str, list[str]]:
    result: dict[str, list[str]] = defaultdict(list)
    current: str | None = None
    in_definitions = False
    current_item: str | None = None

    for path in sorted(yaml_dir.glob("*.yaml")):
        if path.name.startswith("entries-"):
            continue
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                stripped_line = line.rstrip("\n")
                if not line.startswith(" "):
                    if current and current_item:
                        result[current].append(unquote_yaml_scalar(current_item))
                    match = SYNSET_RE.match(stripped_line)
                    current = match.group(1) if match and match.group(1) in needed else None
                    in_definitions = False
                    current_item = None
                    continue
                if not current:
                    continue
                if stripped_line == "  definition:":
                    in_definitions = True
                    current_item = None
                    continue
                if in_definitions and PROPERTY_RE.match(stripped_line):
                    if current_item:
                        result[current].append(unquote_yaml_scalar(current_item))
                    in_definitions = False
                    current_item = None
                    continue
                if not in_definitions:
                    continue
                if stripped_line.startswith("  - "):
                    if current_item:
                        result[current].append(unquote_yaml_scalar(current_item))
                    current_item = stripped_line[4:].strip()
                elif stripped_line.startswith("    ") and current_item:
                    current_item += " " + stripped_line.strip()

            if current and current_item:
                result[current].append(unquote_yaml_scalar(current_item))
    return dict(result)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--vocab", type=Path, required=True)
    parser.add_argument("--oewn-yaml", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    words = json.loads(args.vocab.read_text(encoding="utf-8"))
    missing = [row for row in words if not row["meaning_ko"]]
    targets = {row["word"].casefold() for row in missing}
    lemma_synsets = collect_lemma_synsets(args.oewn_yaml, targets)
    needed_synsets = {synset for values in lemma_synsets.values() for synset in values}
    definitions = collect_definitions(args.oewn_yaml, needed_synsets)

    output = []
    for row in missing:
        key = row["word"].casefold()
        english_definitions: list[str] = []
        for synset in lemma_synsets.get(key, []):
            for definition in definitions.get(synset, []):
                if definition not in english_definitions:
                    english_definitions.append(definition)
        output.append(
            {
                "word": row["word"],
                "pos_code": row["pos_code"],
                "pos_ko": row["pos_ko"],
                "level_label": row["level_label"],
                "english_definitions": english_definitions[:5],
            }
        )

    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        json.dumps(
            {
                "missing_words": len(output),
                "with_english_definitions": sum(bool(row["english_definitions"]) for row in output),
                "without_english_definitions": [row["word"] for row in output if not row["english_definitions"]],
            },
            ensure_ascii=True,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
