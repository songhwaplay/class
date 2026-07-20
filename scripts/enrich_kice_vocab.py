#!/usr/bin/env python3
"""Enrich the extracted KICE 3,000-word list with open lexical data.

The script intentionally treats every dictionary match as a draft.  Korean
Wiktionary supplies Korean glosses and the preferred part of speech.  Open
English WordNet is only a POS fallback.  FrequencyWords is used to order words
inside each official curriculum band before assigning 15 blocks of 200 words.
"""

from __future__ import annotations

import argparse
import csv
import gzip
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable


POS_ORDER = [
    "article",
    "det",
    "pron",
    "noun",
    "verb",
    "adj",
    "adv",
    "prep",
    "conj",
    "interj",
    "num",
    "phrase",
    "name",
    "character",
    "symbol",
    "prefix",
    "suffix",
    "particle",
    "other",
]

POS_KO = {
    "article": "관사",
    "det": "한정사",
    "pron": "대명사",
    "noun": "명사",
    "verb": "동사",
    "adj": "형용사",
    "adv": "부사",
    "prep": "전치사",
    "conj": "접속사",
    "interj": "감탄사",
    "num": "수사",
    "phrase": "구",
    "name": "고유명사",
    "character": "문자",
    "symbol": "기호",
    "prefix": "접두사",
    "suffix": "접미사",
    "particle": "불변화사",
    "other": "기타",
}

CATEGORY_POS_KO = {
    "관사": "article",
    "한정사": "det",
    "대명사": "pron",
    "명사": "noun",
    "동사": "verb",
    "형용사": "adj",
    "부사": "adv",
    "전치사": "prep",
    "접속사": "conj",
    "감탄사": "interj",
    "수사": "num",
}

# Used only when Wiktionary labels a closed-class entry ``unknown`` and gives
# no usable English POS category.  A small explicit table is safer than a
# spelling-based guess.
FUNCTION_WORD_POS = {
    "and": ["conj"],
    "or": ["conj"],
    "but": ["conj", "prep", "adv"],
    "from": ["prep"],
    "if": ["conj"],
    "because": ["conj"],
    "although": ["conj"],
    "though": ["conj", "adv"],
    "whether": ["conj"],
    "whereas": ["conj"],
    "while": ["conj", "noun", "verb"],
    "yes": ["interj", "adv"],
    "no": ["det", "adv", "interj"],
    "not": ["adv"],
    "than": ["conj", "prep"],
    "as": ["conj", "prep", "adv"],
    "per": ["prep"],
    "via": ["prep"],
    "versus": ["prep"],
    "ought": ["verb"],
    "livingroom": ["noun"],
    "illude": ["verb"],
}

OEWN_POS = {"n": "noun", "v": "verb", "a": "adj", "s": "adj", "r": "adv"}
RAW_POS_ALIASES = {"intj": "interj", "proper_noun": "name", "proper-noun": "name"}

STAGE_SETTINGS = {
    "elementary": {"stage_ko": "초급", "levels": 4, "global_start": 1},
    "middle_common": {"stage_ko": "중급", "levels": 6, "global_start": 5},
    "advanced": {"stage_ko": "고급", "levels": 5, "global_start": 11},
}

FIELDNAMES = [
    "curriculum_id",
    "word",
    "alternate_spellings",
    "related_forms",
    "curriculum_marker",
    "stage",
    "stage_code",
    "official_band",
    "stage_level",
    "global_level",
    "level_label",
    "order_in_level",
    "rank_in_stage",
    "frequency_rank",
    "frequency_count",
    "pos_code",
    "pos_ko",
    "meaning_ko",
    "meaning_source",
    "pos_source",
    "match_status",
    "review_priority",
    "review_status",
    "source_page",
    "source_url",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--wiktionary", type=Path, required=True)
    parser.add_argument("--frequency", type=Path, required=True)
    parser.add_argument("--oewn-yaml", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    return parser.parse_args()


def clean_text(value: str) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value.replace("｜", "|")


def usable_gloss(value: str) -> bool:
    value = clean_text(value)
    if not value or value.startswith(","):
        return False
    lowered = value.casefold()
    return not (
        lowered.startswith("learning english")
        or lowered.startswith("위키백과")
        or lowered in {"no gloss", "no-gloss"}
    )


def ordered_unique(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        value = clean_text(value)
        key = value.casefold()
        if value and key not in seen:
            seen.add(key)
            result.append(value)
    return result


def pos_sort_key(pos: str) -> tuple[int, str]:
    try:
        return (POS_ORDER.index(pos), pos)
    except ValueError:
        return (len(POS_ORDER), pos)


def load_wiktionary(path: Path, targets: set[str]) -> dict[str, dict[str, Any]]:
    records: dict[str, dict[str, Any]] = defaultdict(lambda: {"pos": [], "glosses": []})
    with gzip.open(path, "rt", encoding="utf-8") as handle:
        for line in handle:
            entry = json.loads(line)
            if entry.get("lang_code") != "en":
                continue
            exact_word = clean_text(str(entry.get("word", "")))
            if exact_word.casefold() not in targets:
                continue
            raw_pos = clean_text(str(entry.get("pos", ""))) or "other"
            raw_pos = RAW_POS_ALIASES.get(raw_pos, raw_pos)
            if raw_pos not in {"unknown", "other"}:
                records[exact_word]["pos"].append(raw_pos)
            for category in entry.get("categories", []) or []:
                category = clean_text(str(category))
                if not category.startswith("영어 "):
                    continue
                for label_ko, normalized_pos in CATEGORY_POS_KO.items():
                    if category == f"영어 {label_ko}":
                        records[exact_word]["pos"].append(normalized_pos)
            for sense in entry.get("senses", []):
                for gloss in sense.get("glosses", []):
                    gloss = clean_text(str(gloss))
                    if usable_gloss(gloss):
                        records[exact_word]["glosses"].append(gloss)

    for record in records.values():
        record["pos"] = sorted(ordered_unique(record["pos"]), key=pos_sort_key)
        record["glosses"] = ordered_unique(record["glosses"])
    return dict(records)


def wiki_record_for(word: str, records: dict[str, dict[str, Any]]) -> dict[str, Any]:
    if word in records:
        return records[word]
    casefold_matches = [record for key, record in records.items() if key.casefold() == word.casefold()]
    if not casefold_matches:
        return {"pos": [], "glosses": []}
    return {
        "pos": sorted(
            ordered_unique(pos for record in casefold_matches for pos in record.get("pos", [])),
            key=pos_sort_key,
        ),
        "glosses": ordered_unique(
            gloss for record in casefold_matches for gloss in record.get("glosses", [])
        ),
    }


def load_oewn_pos(yaml_dir: Path, targets: set[str]) -> dict[str, list[str]]:
    """Read just the top-level lemma and second-level POS keys from OEWN YAML.

    The curriculum words contain only letters, spaces, and hyphens, so the
    restricted line parser avoids adding a YAML dependency while still reading
    the official source representation faithfully.
    """

    result: dict[str, set[str]] = defaultdict(set)
    current: str | None = None
    lemma_pattern = re.compile(r"^([A-Za-z][A-Za-z -]*):\s*$")
    pos_pattern = re.compile(r"^  ([nvasr]):\s*$")

    for path in sorted(yaml_dir.glob("entries-*.yaml")):
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                if not line.startswith(" "):
                    match = lemma_pattern.match(line.rstrip("\n"))
                    current = match.group(1).casefold() if match else None
                    if current not in targets:
                        current = None
                    continue
                if current:
                    match = pos_pattern.match(line.rstrip("\n"))
                    if match:
                        result[current].add(OEWN_POS[match.group(1)])

    return {key: sorted(values, key=pos_sort_key) for key, values in result.items()}


def load_frequency(path: Path) -> dict[str, tuple[int, int]]:
    result: dict[str, tuple[int, int]] = {}
    with path.open("r", encoding="utf-8") as handle:
        for rank, line in enumerate(handle, start=1):
            parts = line.rstrip("\n").rsplit(" ", 1)
            if len(parts) != 2:
                continue
            word, count_text = parts
            key = word.casefold()
            if key not in result:
                try:
                    result[key] = (rank, int(count_text))
                except ValueError:
                    continue
    return result


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str] = FIELDNAMES) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def build_enriched_rows(
    words: list[dict[str, Any]],
    wiki: dict[str, dict[str, Any]],
    oewn: dict[str, list[str]],
    frequency: dict[str, tuple[int, int]],
) -> list[dict[str, Any]]:
    enriched: list[dict[str, Any]] = []
    for source in words:
        key = source["word"].casefold()
        wiki_record = wiki_record_for(source["word"], wiki)
        wiki_pos = list(wiki_record.get("pos", []))
        oewn_pos = list(oewn.get(key, []))
        glosses = list(wiki_record.get("glosses", []))
        manual_pos = FUNCTION_WORD_POS.get(key, []) if not wiki_pos else []
        if glosses:
            pos_codes = wiki_pos or manual_pos or oewn_pos
        else:
            # An entry without a Korean gloss often has only one partial POS in
            # Korean Wiktionary.  Merge the open WordNet fallback in this case.
            pos_codes = sorted(ordered_unique([*wiki_pos, *manual_pos, *oewn_pos]), key=pos_sort_key)
        representative_glosses = glosses[:3]
        frequency_rank, frequency_count = frequency.get(key, (0, 0))

        if glosses and pos_codes:
            match_status = "뜻·품사 자동 매칭"
        elif pos_codes:
            match_status = "품사만 자동 매칭"
        elif glosses:
            match_status = "뜻만 자동 매칭"
        else:
            match_status = "미매칭"

        if not glosses or not pos_codes:
            review_priority = "높음"
        elif len(pos_codes) >= 4 or len(" | ".join(representative_glosses)) > 220:
            review_priority = "중간"
        else:
            review_priority = "보통"

        if wiki_pos and oewn_pos and not glosses:
            pos_source = "한국어 위키낱말사전 + Open English WordNet"
        elif wiki_pos:
            pos_source = "한국어 위키낱말사전(Kaikki 추출)"
        elif manual_pos:
            pos_source = "폐쇄형 기능어 품사 보완표"
        elif oewn_pos:
            pos_source = "Open English WordNet(품사 보완)"
        else:
            pos_source = ""

        enriched.append(
            {
                "curriculum_id": source["id"],
                "word": source["word"],
                "alternate_spellings": source.get("alternate_spellings", ""),
                "related_forms": source.get("related_forms", ""),
                "curriculum_marker": source.get("curriculum_marker", ""),
                "stage": source["stage"],
                "stage_code": source["stage_code"],
                "official_band": source["official_band"],
                "frequency_rank": frequency_rank,
                "frequency_count": frequency_count,
                "pos_code": " | ".join(pos_codes),
                "pos_ko": " | ".join(POS_KO.get(pos, pos) for pos in pos_codes),
                "meaning_ko": " | ".join(representative_glosses),
                "meaning_source": "한국어 위키낱말사전(Kaikki 추출)" if glosses else "",
                "pos_source": pos_source,
                "match_status": match_status,
                "review_priority": review_priority,
                "review_status": "자동 초안·검수 필요",
                "source_page": source["source_page"],
                "source_url": source["source_url"],
            }
        )
    return enriched


def assign_levels(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    for stage_code, settings in STAGE_SETTINGS.items():
        stage_rows = [row for row in rows if row["stage_code"] == stage_code]
        expected = settings["levels"] * 200
        if len(stage_rows) != expected:
            raise ValueError(f"{stage_code}: expected {expected}, got {len(stage_rows)}")

        stage_rows.sort(
            key=lambda row: (
                row["frequency_rank"] == 0,
                row["frequency_rank"] or 999_999,
                row["word"].casefold(),
            )
        )
        for rank_in_stage, row in enumerate(stage_rows, start=1):
            stage_level = (rank_in_stage - 1) // 200 + 1
            global_level = settings["global_start"] + stage_level - 1
            row["stage_level"] = stage_level
            row["global_level"] = global_level
            row["level_label"] = f"{settings['stage_ko']} {stage_level}"
            row["order_in_level"] = (rank_in_stage - 1) % 200 + 1
            row["rank_in_stage"] = rank_in_stage
            output.append(row)

    output.sort(key=lambda row: (row["global_level"], row["order_in_level"]))
    return output


def validate(rows: list[dict[str, Any]]) -> dict[str, Any]:
    level_counts = Counter(row["global_level"] for row in rows)
    stage_counts = Counter(row["stage_code"] for row in rows)
    match_counts = Counter(row["match_status"] for row in rows)
    priority_counts = Counter(row["review_priority"] for row in rows)
    frequency_matched = sum(bool(row["frequency_rank"]) for row in rows)
    duplicates = [word for word, count in Counter(row["word"] for row in rows).items() if count > 1]

    checks = {
        "total_is_3000": len(rows) == 3000,
        "every_level_is_200": len(level_counts) == 15 and all(count == 200 for count in level_counts.values()),
        "stage_counts_correct": stage_counts == {"elementary": 800, "middle_common": 1200, "advanced": 1000},
        "no_duplicate_words": not duplicates,
    }
    if not all(checks.values()):
        raise ValueError(f"Validation failed: {checks}")

    return {
        "checks": checks,
        "total": len(rows),
        "stage_counts": dict(stage_counts),
        "level_counts": {str(key): level_counts[key] for key in sorted(level_counts)},
        "match_counts": dict(match_counts),
        "review_priority_counts": dict(priority_counts),
        "meaning_matched": sum(bool(row["meaning_ko"]) for row in rows),
        "pos_matched": sum(bool(row["pos_code"]) for row in rows),
        "frequency_matched": frequency_matched,
        "frequency_unmatched": len(rows) - frequency_matched,
        "duplicate_words": duplicates,
    }


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)

    with args.input.open("r", encoding="utf-8") as handle:
        words = json.load(handle)
    targets = {row["word"].casefold() for row in words}

    wiki = load_wiktionary(args.wiktionary, targets)
    oewn = load_oewn_pos(args.oewn_yaml, targets)
    frequency = load_frequency(args.frequency)
    rows = assign_levels(build_enriched_rows(words, wiki, oewn, frequency))
    report = validate(rows)

    write_csv(args.output_dir / "english_vocabulary_3000_enriched.csv", rows)
    write_csv(
        args.output_dir / "english_vocabulary_3000_review_priority.csv",
        [row for row in rows if row["review_priority"] != "보통"],
    )
    for global_level in range(1, 16):
        write_csv(
            args.output_dir / f"english_vocabulary_level_{global_level:02d}.csv",
            [row for row in rows if row["global_level"] == global_level],
        )

    with (args.output_dir / "english_vocabulary_3000_enriched.json").open("w", encoding="utf-8") as handle:
        json.dump(rows, handle, ensure_ascii=False, indent=2)
    with (args.output_dir / "enrichment_validation_report.json").open("w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)

    print(json.dumps(report, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
