#!/usr/bin/env python3
"""Create a complete, site-oriented v1 dataset from the enriched vocabulary draft."""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from pathlib import Path
from typing import Any


CSV_FIELDS = [
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
    "meaning_provenance",
    "match_status",
    "review_priority",
    "review_status",
    "service_ready",
    "service_version",
    "source_page",
    "source_url",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--supplement", type=Path, required=True)
    parser.add_argument("--overrides", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    return parser.parse_args()


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def nested_word(row: dict[str, Any]) -> dict[str, Any]:
    pos_codes = row["pos_code"].split(" | ") if row["pos_code"] else []
    pos_labels = row["pos_ko"].split(" | ") if row["pos_ko"] else []
    return {
        "id": row["curriculum_id"],
        "word": row["word"],
        "spellings": {
            "alternate": [value.strip() for value in row["alternate_spellings"].split("|") if value.strip()],
            "related_forms": [value.strip() for value in row["related_forms"].split("|") if value.strip()],
        },
        "curriculum": {
            "marker": row["curriculum_marker"],
            "stage": row["stage"],
            "stage_code": row["stage_code"],
            "official_band": row["official_band"],
            "source_page": row["source_page"],
            "source_url": row["source_url"],
        },
        "level": {
            "global": row["global_level"],
            "stage_level": row["stage_level"],
            "label": row["level_label"],
            "order": row["order_in_level"],
            "rank_in_stage": row["rank_in_stage"],
        },
        "lexical": {
            "parts_of_speech": [
                {"code": code, "ko": pos_labels[index] if index < len(pos_labels) else code}
                for index, code in enumerate(pos_codes)
            ],
            "meanings_ko": [value.strip() for value in row["meaning_ko"].split("|") if value.strip()],
            "meaning_source": row["meaning_source"],
            "meaning_provenance": row["meaning_provenance"],
        },
        "frequency": {
            "rank": row["frequency_rank"] or None,
            "count": row["frequency_count"] or None,
        },
        "quality": {
            "match_status": row["match_status"],
            "review_priority": row["review_priority"],
            "review_status": row["review_status"],
            "service_ready": row["service_ready"],
            "service_version": row["service_version"],
        },
    }


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    rows = json.loads(args.input.read_text(encoding="utf-8"))
    supplement = json.loads(args.supplement.read_text(encoding="utf-8"))
    overrides = json.loads(args.overrides.read_text(encoding="utf-8"))

    original_missing = {row["word"] for row in rows if not row["meaning_ko"]}
    if original_missing != set(supplement):
        raise ValueError("Supplement keys do not exactly match the missing vocabulary set")

    finalized: list[dict[str, Any]] = []
    for source in rows:
        row = dict(source)
        word = row["word"]
        if word in supplement:
            row["meaning_ko"] = supplement[word]
            row["meaning_source"] = "AI 보완 초안(Open English WordNet 정의 참조)"
            row["meaning_provenance"] = "ai_wordnet_supplement"
            row["match_status"] = "뜻 보완·품사 자동 매칭"
            row["review_priority"] = "중간"
            row["review_status"] = "AI 보완 완료·사람 검수 권장"
        elif word in overrides:
            row["meaning_ko"] = overrides[word]
            row["meaning_source"] = "AI 대표 뜻 정리(한국어 위키낱말사전 풀이 기반)"
            row["meaning_provenance"] = "ai_compact_review"
            row["match_status"] = "대표 뜻 정리 완료"
            row["review_priority"] = "중간"
            row["review_status"] = "AI 정리 완료·사람 검수 권장"
        else:
            row["meaning_provenance"] = "kowiktionary_auto_match"
            row["review_status"] = "공개 사전 자동 매칭·사람 검수 권장"

        row["service_ready"] = bool(row["meaning_ko"] and row["pos_code"])
        row["service_version"] = "v1"
        finalized.append(row)

    finalized.sort(key=lambda row: (row["global_level"], row["order_in_level"]))
    level_counts = Counter(row["global_level"] for row in finalized)
    provenance_counts = Counter(row["meaning_provenance"] for row in finalized)
    review_counts = Counter(row["review_priority"] for row in finalized)
    report = {
        "checks": {
            "total_is_3000": len(finalized) == 3000,
            "every_level_is_200": len(level_counts) == 15 and all(value == 200 for value in level_counts.values()),
            "all_meanings_present": all(bool(row["meaning_ko"]) for row in finalized),
            "all_pos_present": all(bool(row["pos_code"]) for row in finalized),
            "all_service_ready": all(row["service_ready"] for row in finalized),
            "no_duplicate_words": len({row["word"] for row in finalized}) == len(finalized),
        },
        "total": len(finalized),
        "level_counts": {str(key): level_counts[key] for key in sorted(level_counts)},
        "meaning_provenance_counts": dict(provenance_counts),
        "review_priority_counts": dict(review_counts),
        "frequency_matched": sum(bool(row["frequency_rank"]) for row in finalized),
        "frequency_unmatched": sum(not bool(row["frequency_rank"]) for row in finalized),
    }
    if not all(report["checks"].values()):
        raise ValueError(f"Final validation failed: {report}")

    write_csv(args.output_dir / "english_vocabulary_3000_service_v1.csv", finalized)
    for level in range(1, 16):
        write_csv(
            args.output_dir / f"english_vocabulary_service_v1_level_{level:02d}.csv",
            [row for row in finalized if row["global_level"] == level],
        )

    (args.output_dir / "english_vocabulary_3000_service_v1_rows.json").write_text(
        json.dumps(finalized, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    service_payload = {
        "metadata": {
            "version": "v1",
            "total_words": 3000,
            "levels": 15,
            "words_per_level": 200,
            "curriculum_basis": "2022 개정 교육과정 영어 기본 어휘 3,000",
            "notice": "한국어 뜻과 품사는 공개 사전 자동 매칭 및 AI 보완 초안이며 사람 검수를 권장함",
        },
        "words": [nested_word(row) for row in finalized],
    }
    (args.output_dir / "english_vocabulary_3000_service_v1.json").write_text(
        json.dumps(service_payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (args.output_dir / "service_v1_validation_report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
