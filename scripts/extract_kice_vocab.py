from __future__ import annotations

import argparse
import bisect
import csv
import json
import re
from pathlib import Path

from pypdf import PdfReader


SOURCE_URL = (
    "https://www.goe.go.kr/resource/old/BBSMSTR_000000030136/"
    "BBS_202307111028067791.pdf"
)

GROUP_RE = re.compile(
    r"(?P<head>[A-Za-z][A-Za-z.'’-]*\*{0,2}"
    r"(?:\s*/\s*[A-Za-z][A-Za-z.'’-]*\*{0,2})*)"
    r"(?:\s*(?P<related>\([^)]*\)))?"
)


def marker_of(token: str) -> str:
    if token.endswith("**"):
        return "**"
    if token.endswith("*"):
        return "*"
    return ""


def clean_token(token: str) -> str:
    return token.removesuffix("**").removesuffix("*")


def classify(marker: str) -> tuple[str, str, str]:
    if marker == "*":
        return "초급", "elementary", "초등학교 사용 권장"
    if marker == "**":
        return "중급", "middle_common", "중학교·고등학교 공통과목 사용 권장"
    return "고급", "advanced", "그 외 과목 사용 권장"


def extract_entries(pdf_path: Path) -> list[dict[str, object]]:
    reader = PdfReader(str(pdf_path))
    # PDF 인덱스 6~35는 인쇄 면수 5~34쪽의 '기본 어휘 목록' 본문이다.
    page_indexes = list(range(6, 36))
    page_texts = [reader.pages[index].extract_text() or "" for index in page_indexes]
    page_starts: list[int] = []
    cursor = 0
    for page_text in page_texts:
        page_starts.append(cursor)
        cursor += len(page_text) + 1
    text = "\n".join(page_texts)

    entries: list[dict[str, object]] = []
    for match in GROUP_RE.finditer(text):
        raw_head = match.group("head").strip()
        raw_related = (match.group("related") or "").strip()
        variants_raw = [part.strip() for part in re.split(r"\s*/\s*", raw_head)]

        # 페이지의 알파벳 구분자(A, B, C...)는 어휘 항목이 아니다.
        if (
            len(variants_raw) == 1
            and len(variants_raw[0]) == 1
            and variants_raw[0].isupper()
            and marker_of(variants_raw[0]) == ""
        ):
            continue

        markers = {marker_of(token) for token in variants_raw}
        if len(markers) != 1:
            raise ValueError(f"표시가 서로 다른 대체 철자 발견: {raw_head}")
        marker = markers.pop()
        stage_ko, stage_code, official_band = classify(marker)
        variants = [clean_token(token) for token in variants_raw]
        related_forms = raw_related[1:-1].strip() if raw_related else ""

        page_offset = bisect.bisect_right(page_starts, match.start()) - 1
        pdf_page = page_indexes[max(page_offset, 0)] + 1

        entries.append(
            {
                "id": len(entries) + 1,
                "word": variants[0],
                "alternate_spellings": " | ".join(variants[1:]),
                "related_forms": related_forms,
                "curriculum_marker": marker,
                "stage": stage_ko,
                "stage_code": stage_code,
                "official_band": official_band,
                "source_page": pdf_page,
                "source_url": SOURCE_URL,
            }
        )

    return entries


def validate(entries: list[dict[str, object]]) -> dict[str, object]:
    counts: dict[str, int] = {"elementary": 0, "middle_common": 0, "advanced": 0}
    words: list[str] = []
    for entry in entries:
        counts[str(entry["stage_code"])] += 1
        words.append(str(entry["word"]).casefold())

    duplicates = sorted({word for word in words if words.count(word) > 1})
    expected = {"elementary": 800, "middle_common": 1200, "advanced": 1000}
    return {
        "total": len(entries),
        "counts": counts,
        "expected": expected,
        "matches_expected": len(entries) == 3000 and counts == expected,
        "duplicate_primary_words": duplicates,
    }


def write_csv(path: Path, rows: list[dict[str, object]]) -> None:
    fields = [
        "id",
        "word",
        "alternate_spellings",
        "related_forms",
        "curriculum_marker",
        "stage",
        "stage_code",
        "official_band",
        "source_url",
    ]
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)
    entries = extract_entries(args.pdf)
    report = validate(entries)

    write_csv(args.output_dir / "english_vocabulary_3000_all.csv", entries)
    for code in ("elementary", "middle_common", "advanced"):
        subset = [entry for entry in entries if entry["stage_code"] == code]
        write_csv(args.output_dir / f"english_vocabulary_3000_{code}.csv", subset)

    (args.output_dir / "english_vocabulary_3000.json").write_text(
        json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (args.output_dir / "validation_report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
