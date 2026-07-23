from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "app" / "data" / "questions.json"
VALID_UNITS = {
    "prehistoric",
    "early-states",
    "three-kingdoms",
    "north-south",
    "goryeo",
    "joseon-early",
    "joseon-late",
    "opening",
    "occupation",
    "contemporary",
    "integrated",
}


def main() -> None:
    records = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    exams = sorted({int(record["exam"]) for record in records}, reverse=True)
    errors: list[str] = []

    for exam in exams:
        exam_records = [record for record in records if int(record["exam"]) == exam]
        numbers = sorted(int(record["number"]) for record in exam_records)
        if numbers != list(range(1, 51)):
            errors.append(f"제{exam}회 문항 번호 오류: {numbers}")

    ids = [record["id"] for record in records]
    if len(ids) != len(set(ids)):
        errors.append("중복 문항 ID가 있습니다.")

    for record in records:
        if int(record["answer"]) not in {1, 2, 3, 4}:
            errors.append(f"정답 범위 오류: {record['id']}")
        if record["unitId"] not in VALID_UNITS:
            errors.append(f"단원 ID 오류: {record['id']} / {record['unitId']}")

        image_path = ROOT / "public" / str(record["image"]).lstrip("/")
        if not image_path.exists():
            errors.append(f"이미지 누락: {record['id']} / {image_path}")
            continue
        with Image.open(image_path) as image:
            if image.width < 500 or image.height < 120:
                errors.append(f"이미지 크기 오류: {record['id']} / {image.size}")

    if errors:
        raise SystemExit("\n".join(errors))

    unit_counts = Counter(record["unit"] for record in records)
    print(f"검사 통과: 기본 {len(exams)}개 회차, {len(records)}문항")
    print(f"회차: {exams}")
    for unit, count in unit_counts.most_common():
        print(f"{unit}: {count}문항")


if __name__ == "__main__":
    main()
