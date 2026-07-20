#!/usr/bin/env python3
"""Build the compact browser payload used by the vocabulary study page."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--enrichment", type=Path)
    parser.add_argument("--meaning-overrides", type=Path)
    args = parser.parse_args()

    source = json.loads(args.source.read_text(encoding="utf-8"))
    enrichment_payload = (
        json.loads(args.enrichment.read_text(encoding="utf-8"))
        if args.enrichment
        else None
    )
    enrichment = enrichment_payload["words"] if enrichment_payload else {}
    meaning_overrides = (
        {
            key.casefold(): value
            for key, value in json.loads(args.meaning_overrides.read_text(encoding="utf-8")).items()
        }
        if args.meaning_overrides
        else {}
    )
    words = []
    for item in source["words"]:
        meaning_override = meaning_overrides.get(item["word"].casefold(), {})
        word = {
            "id": item["id"],
            "word": item["word"],
            "alternate": item["spellings"]["alternate"],
            "relatedForms": item["spellings"]["related_forms"],
            "stage": item["curriculum"]["stage"],
            "stageCode": item["curriculum"]["stage_code"],
            "globalLevel": item["level"]["global"],
            "stageLevel": item["level"]["stage_level"],
            "levelLabel": item["level"]["label"],
            "order": item["level"]["order"],
            "pos": meaning_override.get(
                "pos",
                [entry["ko"] for entry in item["lexical"]["parts_of_speech"]],
            ),
            "meanings": meaning_override.get("meanings", item["lexical"]["meanings_ko"]),
        }
        learning = enrichment.get(str(item["id"]))
        if learning:
            word["example"] = learning["example"]
            word["relatedWords"] = learning["relatedWords"]
        words.append(word)

    level_counts = Counter(word["globalLevel"] for word in words)
    stage_counts = Counter(word["stageCode"] for word in words)
    checks = {
        "total": len(words) == 3000,
        "levels": len(level_counts) == 15 and all(count == 200 for count in level_counts.values()),
        "stages": stage_counts == {"elementary": 800, "middle_common": 1200, "advanced": 1000},
        "complete": all(word["word"] and word["pos"] and word["meanings"] for word in words),
        "unique": len({word["word"].casefold() for word in words}) == len(words),
        "learning": not enrichment_payload or all(
            (
                word.get("example") is None
                or (
                    word["example"].get("en")
                    and word["example"].get("ko")
                    and word["example"].get("source") != "generated_learning_prompt"
                )
            )
            and isinstance(word.get("relatedWords"), list)
            for word in words
        ),
        "meaning_overrides": not meaning_overrides or (
            len(meaning_overrides) == sum(
                1 for word in words if word["word"].casefold() in meaning_overrides
            )
            and all(
                override.get("pos") and override.get("meanings")
                for override in meaning_overrides.values()
            )
        ),
    }
    if not all(checks.values()):
        raise ValueError(f"Invalid vocabulary browser payload: {checks}")

    payload = {
        "version": "v2" if enrichment_payload else "v1",
        "totalWords": 3000,
        "levels": 15,
        "wordsPerLevel": 200,
        "words": words,
    }
    if enrichment_payload:
        payload["learningSources"] = enrichment_payload.get("sources", {})
    if meaning_overrides:
        payload["meaningOverrides"] = {
            "count": len(meaning_overrides),
            "source": "Manually reviewed elementary vocabulary meanings",
        }
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    args.destination.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(json.dumps({"checks": checks, "bytes": args.destination.stat().st_size}, ensure_ascii=False))


if __name__ == "__main__":
    main()
