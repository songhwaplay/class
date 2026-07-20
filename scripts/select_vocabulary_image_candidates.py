"""Select concrete elementary vocabulary suitable for picture cards."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path

from enrich_vocabulary_learning_data import parse_wordnet_entries


SYNSET_RE = re.compile(r"^([0-9]{8}-n):\s*$")
WORD_RE = re.compile(r"^[A-Za-z][A-Za-z'-]+$")

CATEGORY_LABELS = {
    "animal": "동물",
    "artifact": "사물·탈것",
    "body": "신체",
    "food": "음식",
    "location": "장소",
    "object": "자연물·사물",
    "person": "사람",
    "phenomenon": "자연현상",
    "plant": "식물",
    "shape": "모양",
    "substance": "물질",
}

CATEGORY_PRIORITY = {
    "animal": 110,
    "food": 108,
    "body": 106,
    "plant": 104,
    "artifact": 102,
    "object": 100,
    "location": 94,
    "person": 90,
    "phenomenon": 86,
    "substance": 82,
    "shape": 78,
}

CATEGORY_CAPS = {
    "animal": 40,
    "food": 45,
    "body": 35,
    "plant": 30,
    "artifact": 100,
    "object": 35,
    "location": 35,
    "person": 25,
    "phenomenon": 15,
    "substance": 15,
    "shape": 10,
}

UNSUITABLE_PRIMARY_MEANING = (
    "성적",
    "성교",
    "외설",
    "마약",
    "총기",
    "무기",
    "살인",
    "자살",
    "고문",
    "시체",
    "속어",
    "비속어",
    "조동사",
    "대명사",
    "숫자",
)

AMBIGUOUS_OR_ABSTRACT_WORDS = {
    "air", "area", "art", "baseball", "basketball", "beauty", "black", "blood",
    "bottom", "center", "chance", "chocolate", "club", "corner", "course", "court",
    "customer", "dark", "date", "death", "double", "drive", "end", "energy",
    "favorite", "football", "future", "gas", "gentleman", "glad", "goal", "god",
    "gold", "gray", "great", "green", "habit", "heart", "help", "hero", "hobby", "image",
    "inside", "internet", "job", "kid", "laser", "letter", "light", "low", "luck",
    "member", "middle", "model", "nature", "need", "nurse", "page", "pants", "partner",
    "picture", "pink", "plastic", "point", "power", "red", "side", "size", "ski",
    "south", "space", "sport", "spring", "staff", "store", "story", "tree", "type",
    "video", "want", "watch", "way", "weather", "weight", "white", "wind", "wine",
    "work", "world", "young",
}

WORD_CATEGORY_OVERRIDES = {
    "animal": "animal",
    "apartment": "location",
    "bank": "location",
    "banana": "food",
    "beef": "food",
    "board": "artifact",
    "bridge": "location",
    "cake": "food",
    "carrot": "food",
    "chicken": "animal",
    "church": "location",
    "city": "location",
    "college": "location",
    "doughnut": "food",
    "egg": "food",
    "fish": "animal",
    "fox": "animal",
    "fruit": "food",
    "garden": "location",
    "home": "location",
    "hospital": "location",
    "kitchen": "location",
    "library": "location",
    "lion": "animal",
    "paper": "artifact",
    "place": "location",
    "queen": "person",
    "restaurant": "location",
    "restroom": "location",
    "ribbon": "artifact",
    "ring": "artifact",
    "road": "location",
    "room": "location",
    "salt": "food",
    "school": "location",
    "shop": "location",
    "street": "location",
    "tiger": "animal",
    "town": "location",
    "watermelon": "food",
    "zoo": "location",
}

MEANING_REVIEW_SUGGESTIONS = {
    "bag": ("가방; 자루.", "artifact"),
    "bear": ("곰.", "animal"),
    "bed": ("침대.", "artifact"),
    "bottle": ("병.", "artifact"),
    "box": ("상자.", "artifact"),
    "cap": ("모자.", "artifact"),
    "chocolate": ("초콜릿.", "food"),
    "dress": ("드레스; 원피스.", "artifact"),
    "farm": ("농장.", "location"),
    "fork": ("포크.", "artifact"),
    "glass": ("유리.", "artifact"),
    "milk": ("우유.", "food"),
    "nurse": ("간호사.", "person"),
    "orange": ("오렌지.", "food"),
    "pants": ("바지.", "artifact"),
    "park": ("공원.", "location"),
    "pen": ("펜.", "artifact"),
    "pig": ("돼지.", "animal"),
    "radio": ("라디오.", "artifact"),
    "sock": ("양말.", "artifact"),
    "spoon": ("숟가락.", "artifact"),
    "telephone": ("전화기.", "artifact"),
    "tree": ("나무.", "plant"),
    "wall": ("벽.", "artifact"),
}

NON_NOUN_ENDINGS = (
    "게", "기에", "까지", "는", "다", "에서", "에게", "에", "으로", "의",
    "적인", "로운", "한", "하는", "되는", "있는", "없는", "맞는", "푸른", "젊은",
)


def load_synset_categories(yaml_dir: Path) -> dict[str, str]:
    categories: dict[str, str] = {}
    for category in CATEGORY_LABELS:
        path = yaml_dir / f"noun.{category}.yaml"
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                match = SYNSET_RE.match(line)
                if match:
                    categories[match.group(1)] = category
    return categories


def first_picture_category(synsets: list[str], categories: dict[str, str]) -> tuple[str, int] | None:
    noun_synsets = [synset for synset in synsets if synset.endswith("-n")]
    for sense_rank, synset in enumerate(noun_synsets[:3]):
        category = categories.get(synset)
        if category:
            return category, sense_rank
    return None


def primary_meaning_looks_nominal(word: dict) -> bool:
    word_key = word["word"].casefold()
    review_suggestion = MEANING_REVIEW_SUGGESTIONS.get(word_key)
    if review_suggestion:
        return "명사" in word["pos"] and word["meanings"][0].strip() == review_suggestion[0]
    if word_key in AMBIGUOUS_OR_ABSTRACT_WORDS:
        return False
    primary = re.sub(r"[.?!]+$", "", word["meanings"][0].strip())
    if any(marker in primary for marker in UNSUITABLE_PRIMARY_MEANING):
        return False
    other_parts = {pos for pos in word["pos"] if pos != "명사"}
    if other_parts and primary.endswith(NON_NOUN_ENDINGS):
        return False
    return True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("vocabulary_json", type=Path)
    parser.add_argument("wordnet_yaml_dir", type=Path)
    parser.add_argument("image_manifest", type=Path)
    parser.add_argument("output_json", type=Path)
    parser.add_argument("--limit", type=int, default=280)
    args = parser.parse_args()

    vocabulary = json.loads(args.vocabulary_json.read_text(encoding="utf-8"))
    manifest = json.loads(args.image_manifest.read_text(encoding="utf-8"))
    existing_ids = set(manifest.get("images", {}))
    elementary = [word for word in vocabulary["words"] if word["stageCode"] == "elementary"]
    noun_words = [word for word in elementary if "명사" in word["pos"]]
    targets = {word["word"].casefold() for word in noun_words}

    word_synsets, _, _ = parse_wordnet_entries(args.wordnet_yaml_dir, targets)
    synset_categories = load_synset_categories(args.wordnet_yaml_dir)
    candidates: list[dict] = []

    for word in noun_words:
        word_id = str(word["id"])
        primary_meaning = word["meanings"][0].strip()
        if word_id not in existing_ids:
            if not WORD_RE.fullmatch(word["word"]):
                continue
            if not primary_meaning_looks_nominal(word):
                continue

        category_result = first_picture_category(
            word_synsets.get(word["word"].casefold(), []),
            synset_categories,
        )
        review_suggestion = MEANING_REVIEW_SUGGESTIONS.get(word["word"].casefold())
        manual_category = WORD_CATEGORY_OVERRIDES.get(word["word"].casefold())
        if review_suggestion:
            manual_category = review_suggestion[1]
        if category_result:
            category, sense_rank = category_result
        elif manual_category:
            category, sense_rank = manual_category, 3
        elif word_id in existing_ids:
            category, sense_rank = "artifact", 3
        else:
            continue
        category = manual_category or category

        score = CATEGORY_PRIORITY[category]
        score += (5 - word["globalLevel"]) * 5
        score += max(0, 10 - len(word["word"]))
        score += max(0, 12 - sense_rank * 6)
        if len(word["pos"]) == 1:
            score += 4
        if word_id in existing_ids:
            score += 1000

        candidates.append({
            "id": word["id"],
            "word": word["word"],
            "level": word["globalLevel"],
            "category": category,
            "categoryLabel": CATEGORY_LABELS[category],
            "meaning": primary_meaning,
            "existingImage": word_id in existing_ids,
            "score": score,
        })

    candidates.sort(key=lambda item: (-item["score"], item["level"], item["word"].casefold()))
    selected: list[dict] = []
    selected_ids: set[int] = set()
    category_counts: Counter[str] = Counter()

    for candidate in candidates:
        if len(selected) >= args.limit:
            break
        category = candidate["category"]
        if candidate["existingImage"] or category_counts[category] < CATEGORY_CAPS[category]:
            selected.append(candidate)
            selected_ids.add(candidate["id"])
            category_counts[category] += 1

    if len(selected) < args.limit:
        for candidate in candidates:
            if len(selected) >= args.limit:
                break
            if candidate["id"] in selected_ids:
                continue
            selected.append(candidate)
            selected_ids.add(candidate["id"])
            category_counts[candidate["category"]] += 1

    selected.sort(key=lambda item: (item["level"], item["category"], item["word"].casefold()))
    elementary_by_word = {word["word"].casefold(): word for word in elementary}
    meaning_review = []
    for review_word, (suggested_meaning, category) in MEANING_REVIEW_SUGGESTIONS.items():
        word = elementary_by_word.get(review_word)
        if not word:
            continue
        if "명사" in word["pos"] and word["meanings"][0].strip() == suggested_meaning:
            continue
        meaning_review.append({
            "id": word["id"],
            "word": word["word"],
            "level": word["globalLevel"],
            "category": category,
            "categoryLabel": CATEGORY_LABELS[category],
            "currentMeaning": word["meanings"][0].strip(),
            "suggestedMeaning": suggested_meaning,
        })
    meaning_review.sort(key=lambda item: (item["level"], item["word"].casefold()))

    output = {
        "version": 1,
        "source": "english-vocabulary-3000-v2.json + Open English WordNet",
        "elementaryWords": len(elementary),
        "targetImages": len(selected),
        "existingImages": sum(1 for item in selected if item["existingImage"]),
        "pendingImages": sum(1 for item in selected if not item["existingImage"]),
        "meaningReviewCount": len(meaning_review),
        "potentialImagesAfterMeaningReview": len(selected) + len(meaning_review),
        "categoryCounts": {
            CATEGORY_LABELS[category]: category_counts[category]
            for category in CATEGORY_LABELS
            if category_counts[category]
        },
        "candidates": selected,
        "meaningReview": meaning_review,
    }
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
