from __future__ import annotations

import argparse
import html
import json
import re
import time
import urllib.request
from dataclasses import dataclass
from pathlib import Path

import pdfplumber
from PIL import Image

try:
    import numpy as np
except ImportError:  # The slower PIL fallback still supports a plain Python setup.
    np = None


ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "tmp" / "pdfs"
QUESTION_DIR = ROOT / "public" / "questions"
DATA_FILE = ROOT / "app" / "data" / "questions.json"
OFFICIAL_ORIGIN = "https://www.historyexam.go.kr"
RENDER_RESOLUTION = 220
DETECTION_RESOLUTION = 140
MAX_QUESTION_WIDTH = 1_040
WEBP_QUALITY = 92


@dataclass(frozen=True)
class ExamSource:
    exam: int
    question_file_id: str
    answer_file_id: str


# Verified fallback for the newest basic test available when this importer was built.
# Normal imports discover every basic test currently listed by the official archive.
VERIFIED_SOURCES = {
    77: ExamSource(77, "B_202602071226588770", "B_202602071226590111"),
}

ANSWER_SYMBOLS = {"①": 1, "②": 2, "③": 3, "④": 4}

UNITS = [
    ("prehistoric", "선사 시대와 고조선", range(1, 2)),
    ("early-states", "여러 나라의 성장", range(2, 3)),
    ("three-kingdoms", "삼국과 가야", range(3, 6)),
    ("north-south", "남북국 시대", range(6, 11)),
    ("goryeo", "고려", range(11, 19)),
    ("joseon-early", "조선 전기", range(19, 25)),
    ("joseon-late", "조선 후기", range(25, 28)),
    ("opening", "개항기와 대한제국", range(28, 36)),
    ("occupation", "일제강점기", range(36, 44)),
    ("contemporary", "대한민국 현대사", range(44, 51)),
    ("integrated", "시대 통합", range(0)),
]

VERIFIED_UNIT_OVERRIDES = {
    57: {
        25: "joseon-early",
        48: "contemporary",
        49: "contemporary",
        50: "integrated",
    },
    58: {
        25: "joseon-early",
        48: "opening",
        49: "integrated",
        50: "integrated",
    },
    60: {
        48: "integrated",
        49: "integrated",
        50: "contemporary",
    },
    61: {
        48: "contemporary",
        49: "integrated",
        50: "integrated",
    },
    63: {
        25: "joseon-early",
        48: "integrated",
        49: "integrated",
        50: "integrated",
    },
    64: {
        48: "integrated",
        49: "integrated",
        50: "integrated",
    },
    66: {
        25: "joseon-early",
        48: "contemporary",
        49: "contemporary",
        50: "integrated",
    },
    67: {
        25: "integrated",
        48: "integrated",
        49: "integrated",
        50: "integrated",
    },
    69: {
        48: "integrated",
        49: "joseon-early",
        50: "integrated",
    },
    71: {
        48: "contemporary",
        49: "contemporary",
        50: "integrated",
    },
    73: {
        48: "contemporary",
        49: "contemporary",
        50: "contemporary",
    },
    75: {
        48: "contemporary",
        49: "contemporary",
        50: "integrated",
    },
    77: {
        7: "three-kingdoms",
        48: "integrated",
        49: "contemporary",
        50: "contemporary",
    }
}

KEYWORDS = {
    "prehistoric": (
        "구석기", "신석기", "청동기", "고조선", "단군", "위만", "왕검성",
        "고인돌", "주먹도끼", "빗살무늬", "가락바퀴", "8조법",
    ),
    "early-states": (
        "부여", "옥저", "동예", "삼한", "소도", "천군", "읍차", "신지",
        "영고", "무천", "책화", "민며느리제",
    ),
    "three-kingdoms": (
        "광개토", "장수왕", "성왕", "무령왕", "진흥왕", "근초고왕", "고국원왕",
        "삼국", "가야", "백제", "신라", "고구려", "칠지도", "화랑",
    ),
    "north-south": (
        "발해", "통일 신라", "남북국", "대조영", "신문왕", "원효", "의상",
        "혜초", "장보고", "독서삼품과", "9주 5소경", "9주5소경",
    ),
    "goryeo": (
        "고려", "왕건", "광종", "무신 정변", "무신정변", "팔만대장경", "몽골",
        "공민왕", "최우", "전시과", "개경", "강감찬", "서희",
    ),
    "joseon-early": (
        "조선 전기", "이성계", "세종", "훈민정음", "4군 6진", "사림", "경국대전",
        "임진왜란", "이순신", "사화", "삼사", "성균관",
    ),
    "joseon-late": (
        "영조", "정조", "실학", "세도 정치", "세도정치", "대동법", "균역법",
        "홍경래", "정약용", "김정희", "수원 화성", "탕평",
    ),
    "opening": (
        "흥선 대원군", "강화도 조약", "개항", "갑신정변", "동학 농민", "갑오개혁",
        "독립 협회", "대한 제국", "을사늑약", "국채 보상", "신민회", "개화",
    ),
    "occupation": (
        "일제 강점", "3·1", "3.1", "대한민국 임시 정부", "의열단", "한인 애국단",
        "광주 학생", "물산 장려", "신간회", "봉오동", "청산리", "조선어 학회",
        "민족 말살", "토지 조사",
    ),
    "contemporary": (
        "광복", "대한민국 정부", "6·25", "6.25", "한국 전쟁", "4·19", "5·18",
        "6월 민주", "남북", "새마을", "경제 개발", "유신", "제헌 국회",
    ),
}

UNIT_ORDER = [unit_id for unit_id, _, _ in UNITS if unit_id != "integrated"]


def fetch(url: str, *, delay: float = 0.8) -> bytes:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; HanguksaBasicImporter/1.0)",
            "Referer": OFFICIAL_ORIGIN + "/pst/list.do?bbs=dat",
        },
    )
    with urllib.request.urlopen(request, timeout=40) as response:
        payload = response.read()
    time.sleep(delay)
    return payload


def clean_html(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def discover_all_basic(target_exam: int | None = None) -> list[ExamSource]:
    candidates: dict[int, str] = {}
    for page_index in range(1, 21):
        markup = fetch(
            f"{OFFICIAL_ORIGIN}/pst/list.do?bbs=dat&pageIndex={page_index}"
        ).decode("utf-8", "ignore")
        page_candidates = 0
        for row in re.findall(r"<tr\b[^>]*>(.*?)</tr>", markup, re.S | re.I):
            title = clean_html(row)
            detail_id = re.search(r"fn_goDetail\('(?P<id>\d+)'", row)
            number = re.search(r"제(\d+)회", title)
            if detail_id and number and "기본" in title:
                candidates[int(number.group(1))] = detail_id.group("id")
                page_candidates += 1

        if page_index > 1 and page_candidates == 0:
            break
        if target_exam is not None and target_exam in candidates:
            break

    sources: list[ExamSource] = []
    selected_candidates = (
        {target_exam: candidates[target_exam]}
        if target_exam is not None and target_exam in candidates
        else candidates
    )
    for exam, post_id in sorted(selected_candidates.items(), reverse=True):
        detail_url = f"{OFFICIAL_ORIGIN}/pst/view.do?bbs=dat&pst_sno={post_id}"
        detail = fetch(detail_url).decode("utf-8", "ignore")
        attachments = re.findall(
            r"fnFileDownload\('([^']+)'\)[^>]*>\s*([^<]+\.pdf)", detail, re.I
        )
        question_id = next(
            (
                file_id
                for file_id, name in attachments
                if ("문제" in name or "시험지" in name) and "기본" in name
            ),
            None,
        )
        answer_id = next(
            (file_id for file_id, name in attachments if "답" in name and "기본" in name),
            None,
        )
        if question_id and answer_id:
            sources.append(ExamSource(exam, question_id, answer_id))

    return sources


def resolve_sources(exam: int | None, offline: bool) -> list[ExamSource]:
    if not offline:
        discovered = discover_all_basic(exam)
        if exam is None and discovered:
            return discovered
        selected = [source for source in discovered if source.exam == exam]
        if selected:
            return selected
    if exam is not None and exam in VERIFIED_SOURCES:
        return [VERIFIED_SOURCES[exam]]
    if exam is not None and offline:
        question_path = PDF_DIR / f"{exam}-basic-questions.pdf"
        answer_path = PDF_DIR / f"{exam}-basic-answers.pdf"
        if question_path.exists() and answer_path.exists():
            return [ExamSource(exam, "", "")]
    if exam is None and offline:
        cached_exams = sorted(
            {
                int(match.group(1))
                for path in PDF_DIR.glob("*-basic-questions.pdf")
                if (match := re.fullmatch(r"(\d+)-basic-questions\.pdf", path.name))
                and (PDF_DIR / f"{match.group(1)}-basic-answers.pdf").exists()
            },
            reverse=True,
        )
        if cached_exams:
            return [ExamSource(cached_exam, "", "") for cached_exam in cached_exams]
    raise SystemExit(f"제{exam}회 기본 기출의 공식 파일 주소를 찾지 못했습니다.")


def ensure_pdf(source: ExamSource) -> tuple[Path, Path]:
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    question_path = PDF_DIR / f"{source.exam}-basic-questions.pdf"
    answer_path = PDF_DIR / f"{source.exam}-basic-answers.pdf"
    for path, file_id in (
        (question_path, source.question_file_id),
        (answer_path, source.answer_file_id),
    ):
        if not path.exists() or path.stat().st_size < 1_000:
            if not file_id:
                raise RuntimeError(f"캐시된 PDF가 없습니다: {path.name}")
            url = f"{OFFICIAL_ORIGIN}/atchFile/FileDown.do?atch_file_id={file_id}"
            path.write_bytes(fetch(url))
    return question_path, answer_path


def parse_answers(answer_path: Path) -> dict[int, tuple[int, int]]:
    with pdfplumber.open(answer_path) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    answers: dict[int, tuple[int, int]] = {}
    for number, symbol, points in re.findall(r"\b(\d{1,2})\s+([①②③④])\s+([123])\b", text):
        answers[int(number)] = (ANSWER_SYMBOLS[symbol], int(points))
    if len(answers) != 50:
        raise RuntimeError(f"정답을 50개 읽어야 하지만 {len(answers)}개를 찾았습니다.")
    return answers


def unit_for(exam: int, number: int, text: str) -> tuple[str, str]:
    verified_id = VERIFIED_UNIT_OVERRIDES.get(exam, {}).get(number)
    if verified_id:
        verified_name = next(name for unit_id, name, _ in UNITS if unit_id == verified_id)
        return verified_id, verified_name

    normalized = re.sub(r"\s+", " ", text)
    scores = {
        unit_id: sum(1 for word in words if word in normalized)
        for unit_id, words in KEYWORDS.items()
    }
    best_id, best_score = max(scores.items(), key=lambda item: item[1])
    matched_units = [unit_id for unit_id, score in scores.items() if score > 0]

    # The last questions often mix people, places, or cultural assets from
    # several periods. Keep those questions out of the modern-history pool.
    if number >= 48:
        if len(matched_units) >= 2:
            return "integrated", "시대 통합"
        if best_score > 0:
            best_name = next(name for unit_id, name, _ in UNITS if unit_id == best_id)
            return best_id, best_name
        return "integrated", "시대 통합"

    baseline_id, baseline_name = next(
        (unit_id, name)
        for unit_id, name, number_range in UNITS
        if number in number_range
    )
    if best_score >= 2 and abs(UNIT_ORDER.index(best_id) - UNIT_ORDER.index(baseline_id)) <= 1:
        best_name = next(name for unit_id, name, _ in UNITS if unit_id == best_id)
        return best_id, best_name
    return baseline_id, baseline_name


def topic_for(text: str) -> str:
    if re.search(r"불교|탑|불상|문화|유물|건축|그림|도자기|훈민정음|서원", text):
        return "문화"
    if re.search(r"왕|인물|업적|누구", text):
        return "인물"
    if re.search(r"토지|상업|무역|경제|농업|수취|세금", text):
        return "경제"
    if re.search(r"생활|신분|사회|풍습|교육", text):
        return "사회"
    return "정치와 사건"


def trim_trailing_whitespace(image: Image.Image, resolution: int) -> Image.Image:
    """Remove blank space below a question without clipping its final choice."""
    grayscale = image.convert("L")
    minimum_dark_pixels = max(5, image.width // 300)
    if np is not None:
        pixels = np.asarray(grayscale)
        row_counts = (pixels < 248).sum(axis=1)
        content_rows = np.flatnonzero(row_counts >= minimum_dark_pixels)
        if content_rows.size == 0:
            return image
        last_content_row = int(content_rows[-1])
    else:
        pixels = grayscale.load()
        content_rows = [
            y
            for y in range(grayscale.height)
            if sum(1 for x in range(grayscale.width) if pixels[x, y] < 248)
            >= minimum_dark_pixels
        ]
        if not content_rows:
            return image
        last_content_row = content_rows[-1]

    padding = round(10 * resolution / 72)
    bottom = min(image.height, last_content_row + 1 + padding)
    if bottom >= image.height:
        return image
    return image.crop((0, 0, image.width, bottom))


def question_starts(page: pdfplumber.page.Page) -> list[dict]:
    starts = []
    midpoint = page.width / 2
    for word in page.extract_words():
        x0 = float(word["x0"])
        in_marker_band = (
            x0 <= page.width * 0.10
            or midpoint <= x0 <= midpoint + page.width * 0.04
        )
        if in_marker_band and re.fullmatch(r"(?:[1-9]|[1-4][0-9]|50)\.", word["text"]):
            starts.append({
                "number": int(word["text"][:-1]),
                "x0": x0,
                "top": float(word["top"]),
            })
    return starts


def visual_question_tops(
    rendered: Image.Image,
    page: pdfplumber.page.Page,
    resolution: int,
) -> dict[str, list[float]]:
    """Find bold question numbers when the PDF stores Korean text as outlines."""
    scale = resolution / 72
    grayscale = rendered.convert("L")
    pixels = grayscale.load()
    pixel_array = np.asarray(grayscale) if np is not None else None
    width, height = grayscale.size
    first_page = page.page_number == 1
    later_page_minimum = 80 if page.height > 1060 else 70
    y_min = round((145 if first_page else later_page_minimum) * scale)
    y_max = min(height, round((page.height - 45) * scale))
    strip_options = {
        "left": [(36, 52), (42, 58), (48, 64), (52, 68)],
        "right": [(page.width / 2 + 4, page.width / 2 + 21)],
    }

    def detect_in_strip(x0_points: float, x1_points: float) -> tuple[list[float], int]:
        x0 = round(x0_points * scale)
        x1 = round(x1_points * scale)
        x0 = max(0, x0)
        x1 = min(width, x1)
        if pixel_array is not None:
            dark_mask = pixel_array[y_min:y_max, x0:x1] < 110
            dark_rows = (np.flatnonzero(dark_mask.sum(axis=1) >= 2) + y_min).tolist()
        else:
            dark_rows = []
            for y in range(y_min, y_max):
                if sum(1 for x in range(x0, x1) if pixels[x, y] < 110) >= 2:
                    dark_rows.append(y)

        groups: list[list[int]] = []
        max_gap = max(3, round(3.5 * scale))
        for y in dark_rows:
            if not groups or y - groups[-1][-1] > max_gap:
                groups.append([y])
            else:
                groups[-1].append(y)

        candidates: list[tuple[float, int]] = []
        for group in groups:
            group_height = (group[-1] - group[0] + 1) / scale
            if 8 <= group_height <= 20:
                if pixel_array is not None:
                    area = int(
                        (pixel_array[group[0]:group[-1] + 1, x0:x1] < 110).sum()
                    )
                else:
                    area = sum(
                        1
                        for y in range(group[0], group[-1] + 1)
                        for x in range(x0, x1)
                        if pixels[x, y] < 110
                    )
                candidates.append((group[0] / scale, area))

        if not candidates:
            return [], 0
        minimum_area = max(80, round(max(area for _, area in candidates) * 0.55))
        selected = [(top, area) for top, area in candidates if area >= minimum_area]
        collapsed: list[tuple[float, int]] = []
        for top, area in selected:
            if collapsed and top - collapsed[-1][0] < 60:
                if area > collapsed[-1][1]:
                    collapsed[-1] = (top, area)
            else:
                collapsed.append((top, area))
        selected = collapsed
        return [top for top, _ in selected], sum(area for _, area in selected)

    result: dict[str, list[float]] = {"left": [], "right": []}
    for side, options in strip_options.items():
        detected = [detect_in_strip(x0, x1) for x0, x1 in options]
        plausible = [item for item in detected if 2 <= len(item[0]) <= 3]
        result[side] = (
            plausible[0][0]
            if plausible
            else max(detected, key=lambda item: item[1])[0]
        )

    return result


def split_questions(question_path: Path, source: ExamSource, answers: dict[int, tuple[int, int]]) -> list[dict]:
    destination = QUESTION_DIR / str(source.exam)
    destination.mkdir(parents=True, exist_ok=True)
    records: list[dict] = []
    resolution = RENDER_RESOLUTION
    scale = resolution / 72
    next_visual_number = 1

    with pdfplumber.open(question_path) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            rendered = page.to_image(resolution=resolution).original.convert("RGB")
            starts = question_starts(page)
            if starts:
                next_visual_number = max(
                    next_visual_number,
                    max(item["number"] for item in starts) + 1,
                )
            else:
                detector_rendered = page.to_image(
                    resolution=DETECTION_RESOLUTION
                ).original.convert("RGB")
                visual_tops = visual_question_tops(
                    detector_rendered,
                    page,
                    DETECTION_RESOLUTION,
                )
                starts = []
                for side in ("left", "right"):
                    for top in visual_tops[side]:
                        starts.append({
                            "number": next_visual_number,
                            "x0": 40.0 if side == "left" else page.width / 2 + 10,
                            "top": top,
                        })
                        next_visual_number += 1
            midpoint = page.width / 2

            for side in ("left", "right"):
                side_starts = sorted(
                    (
                        item for item in starts
                        if (item["x0"] < midpoint) == (side == "left")
                    ),
                    key=lambda item: item["top"],
                )
                for index, item in enumerate(side_starts):
                    number = item["number"]
                    top = max(0.0, item["top"] - 8)
                    bottom = (
                        side_starts[index + 1]["top"] - 8
                        if index + 1 < len(side_starts)
                        else page.height - 80
                    )
                    x0 = 34.0 if side == "left" else midpoint + 4
                    x1 = midpoint - 4 if side == "left" else page.width - 30
                    bbox = (x0, top, x1, bottom)
                    crop = rendered.crop(tuple(round(value * scale) for value in bbox))
                    crop = trim_trailing_whitespace(crop, resolution)
                    if crop.width > MAX_QUESTION_WIDTH:
                        ratio = MAX_QUESTION_WIDTH / crop.width
                        crop = crop.resize(
                            (MAX_QUESTION_WIDTH, round(crop.height * ratio)),
                            Image.Resampling.LANCZOS,
                        )
                    image_name = f"q{number:02d}.webp"
                    crop.save(
                        destination / image_name,
                        "WEBP",
                        quality=WEBP_QUALITY,
                        method=6,
                    )

                    text = page.within_bbox(bbox).extract_text(x_tolerance=2, y_tolerance=3) or ""
                    unit_id, unit_name = unit_for(source.exam, number, text)
                    answer, points = answers[number]
                    records.append({
                        "id": f"{source.exam}-{number}",
                        "exam": source.exam,
                        "number": number,
                        "answer": answer,
                        "points": points,
                        "unitId": unit_id,
                        "unit": unit_name,
                        "topic": topic_for(text),
                        "image": f"/questions/{source.exam}/{image_name}",
                        "source": f"국사편찬위원회 제{source.exam}회 기본 {number}번",
                        "text": re.sub(r"\s+", " ", text).strip(),
                    })

    records.sort(key=lambda record: record["number"])
    found = [record["number"] for record in records]
    if found != list(range(1, 51)):
        raise RuntimeError(f"문항 분리 결과가 올바르지 않습니다: {found}")
    return records


def main() -> None:
    parser = argparse.ArgumentParser(description="공식 한능검 기본 기출 전체 자동 가져오기")
    parser.add_argument("--exam", type=int, help="한 회차만 가져올 때 지정")
    parser.add_argument("--offline", action="store_true", help="이미 받은 PDF만 다시 처리")
    args = parser.parse_args()

    sources = resolve_sources(args.exam, args.offline)
    records: list[dict] = []
    for source in sources:
        print(f"제{source.exam}회 기본 처리 중...")
        question_path, answer_path = ensure_pdf(source)
        answers = parse_answers(answer_path)
        records.extend(split_questions(question_path, source, answers))

    records.sort(key=lambda record: (-record["exam"], record["number"]))
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    exam_numbers = sorted({record["exam"] for record in records}, reverse=True)
    print(
        f"기본 {len(exam_numbers)}개 회차, {len(records)}문항을 "
        f"{DATA_FILE.relative_to(ROOT)}에 저장했습니다: {exam_numbers}"
    )


if __name__ == "__main__":
    main()
