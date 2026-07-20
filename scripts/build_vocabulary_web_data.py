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
    args = parser.parse_args()

    source = json.loads(args.source.read_text(encoding="utf-8"))
    words = []
    for item in source["words"]:
        words.append(
            {
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
                "pos": [entry["ko"] for entry in item["lexical"]["parts_of_speech"]],
                "meanings": item["lexical"]["meanings_ko"],
            }
        )

    level_counts = Counter(word["globalLevel"] for word in words)
    stage_counts = Counter(word["stageCode"] for word in words)
    checks = {
        "total": len(words) == 3000,
        "levels": len(level_counts) == 15 and all(count == 200 for count in level_counts.values()),
        "stages": stage_counts == {"elementary": 800, "middle_common": 1200, "advanced": 1000},
        "complete": all(word["word"] and word["pos"] and word["meanings"] for word in words),
        "unique": len({word["word"].casefold() for word in words}) == len(words),
    }
    if not all(checks.values()):
        raise ValueError(f"Invalid vocabulary browser payload: {checks}")

    payload = {
        "version": "v1",
        "totalWords": 3000,
        "levels": 15,
        "wordsPerLevel": 200,
        "words": words,
    }
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    args.destination.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(json.dumps({"checks": checks, "bytes": args.destination.stat().st_size}, ensure_ascii=False))


if __name__ == "__main__":
    main()
