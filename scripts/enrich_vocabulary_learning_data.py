#!/usr/bin/env python3
"""Create example sentences and related-word metadata for the 3,000-word list.

The script prefers bilingual examples from Korean Wiktionary. When no Korean
translation is available, it uses a natural Open English WordNet example and a
Korean meaning hint. Words without a sourced usage example are left blank for
later review instead of receiving a synthetic placeholder.
"""

from __future__ import annotations

import argparse
import difflib
import gzip
import html
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


HANGUL_RE = re.compile(r"[가-힣]")
LATIN_RE = re.compile(r"[A-Za-z]")
SPACE_RE = re.compile(r"\s+")
SYNSET_RE = re.compile(r"^([0-9]{8}-[nvars]):\s*$")
TOP_LEVEL_RE = re.compile(r"^([^\s#][^:]*):\s*$")
SYNSET_VALUE_RE = re.compile(r"^\s+synset:\s+([0-9]{8}-[nvars])\s*$")
RELATION_ITEM_RE = re.compile(r"^\s+-\s+['\"]?([^'\"]+?)['\"]?\s*$")

POS_MAP = {
    "noun": "noun",
    "proper-name": "noun",
    "verb": "verb",
    "adj": "adjective",
    "adjective": "adjective",
    "adv": "adverb",
    "adverb": "adverb",
    "pron": "pronoun",
    "pronoun": "pronoun",
}

POS_SYNSET_SUFFIXES = {
    "noun": {"n"},
    "proper-name": {"n"},
    "verb": {"v"},
    "adj": {"a", "s"},
    "adjective": {"a", "s"},
    "adv": {"r"},
    "adverb": {"r"},
}


def clean_text(value: object) -> str:
    return SPACE_RE.sub(" ", html.unescape(str(value or ""))).strip()


def yaml_key(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
        value = value[1:-1]
    return value.replace("''", "'")


def sense_key_word(value: str) -> str:
    value = yaml_key(value)
    return value.split("%", 1)[0].replace("_", " ").strip()


def target_pattern(word: str) -> re.Pattern[str]:
    return re.compile(rf"(?<![A-Za-z]){re.escape(word)}(?![A-Za-z])", re.IGNORECASE)


def regular_word_forms(word: str) -> set[str]:
    forms = {word}
    if not re.fullmatch(r"[A-Za-z]+", word):
        return forms
    lower = word.lower()
    if lower.endswith("y") and len(lower) > 1 and lower[-2] not in "aeiou":
        forms.update({lower[:-1] + "ies", lower[:-1] + "ied", lower + "ing"})
    elif lower.endswith("e") and not lower.endswith("ee"):
        forms.update({lower + "s", lower + "d", lower[:-1] + "ing"})
    else:
        forms.update({lower + "s", lower + "ed", lower + "ing"})
        if re.search(r"[^aeiou][aeiou][^aeiouwxy]$", lower):
            forms.update({lower + lower[-1] + "ed", lower + lower[-1] + "ing"})
    if lower.endswith(("s", "x", "z", "ch", "sh", "o")):
        forms.add(lower + "es")
    return forms


def contains_word_form(english: str, word: str, explicit_forms: list[str]) -> bool:
    forms = regular_word_forms(word)
    forms.update(clean_text(form) for form in explicit_forms)
    return any(target_pattern(form).search(english) for form in forms if form)


def split_bilingual_example(text: object, translation: object = "") -> tuple[str, str] | None:
    english = clean_text(text)
    korean = clean_text(translation)
    if korean:
        if not LATIN_RE.search(english) or not HANGUL_RE.search(korean):
            return None
        return english, korean

    match = HANGUL_RE.search(english)
    if not match:
        return None
    korean = english[match.start():].strip(" -–—/|·")
    english = english[:match.start()].strip(" -–—/|·")
    if not english or not korean or not LATIN_RE.search(english):
        return None
    return english, korean


def example_score(
    word: str,
    english: str,
    level: int,
    explicit_translation: bool,
    meaning_fit: float = 0,
) -> tuple[int, int]:
    word_count = len(re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", english))
    target = 8 if level <= 4 else 12 if level <= 10 else 16
    score = abs(word_count - target)
    if word_count < 3:
        score += 30
    if word_count > 24:
        score += (word_count - 24) * 4
    if len(english) > 180:
        score += 40
    if not target_pattern(word).search(english):
        score += 12
    if explicit_translation:
        score -= 3
    score -= round(meaning_fit * 30)
    if "/" in english:
        score += 6
    return score, len(english)


def normalized_korean(value: str) -> str:
    return re.sub(r"[^가-힣]", "", value)


def meaning_similarity(glosses: list[object], meanings: list[str]) -> float:
    left = normalized_korean(" ".join(clean_text(gloss) for gloss in glosses))
    if not left:
        return 0
    return max(
        (
            difflib.SequenceMatcher(None, left, normalized_korean(meaning)).ratio()
            for meaning in meanings
            if normalized_korean(meaning)
        ),
        default=0,
    )


def compact_meaning(value: str) -> str:
    value = re.sub(r"\s*\(부록:.*$", "", clean_text(value)).strip()
    value = value.rstrip(". ")
    return value if len(value) <= 90 else value[:87].rstrip() + "…"


def normalize_source_example(english: str, word: str) -> str:
    english = clean_text(english).strip(' "')
    first_word_match = re.match(r"([A-Za-z]+)", english)
    sentence_starters = {
        "a", "an", "the", "i", "you", "he", "she", "it", "we", "they",
        "this", "that", "these", "those", "there", "my", "your", "his",
        "her", "our", "their", "people", "students", "children", "someone",
    }
    if first_word_match:
        first_word = first_word_match.group(1)
        if first_word.islower() and (
            first_word.casefold() in sentence_starters
            or first_word.casefold() == word.casefold()
        ):
            english = first_word.capitalize() + english[len(first_word):]
    if english and english[-1] not in ".?!":
        english += "."
    return english


def card_example_limits(level: int) -> tuple[int, int, int, int]:
    if level <= 4:
        return 10, 72, 110, 1
    if level <= 10:
        return 12, 86, 135, 1
    return 14, 100, 165, 1


def is_study_card_example(
    word: str,
    english: str,
    korean: str,
    level: int,
    explicit_forms: list[str],
) -> bool:
    max_words, max_english_chars, max_korean_chars, max_commas = card_example_limits(level)
    word_count = len(re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", english))
    lowered = english.casefold()
    legal_markers = (
        "this agreement",
        "the distributor",
        "contract products",
        "either party",
        "hereinafter",
        "pursuant to",
        "subject to the conditions",
        "unless otherwise agreed",
        "general conditions",
        "certified copy of this convention",
        "board of directors",
        "exclusive distributor",
        "in accordance with",
        "arbitration proceedings",
        "issuing bank",
        "occupation authorities",
        "northern government",
        "alleged loss",
        "substantiating payment",
        "legal language",
        "third parties",
        "technical assistance and materials",
        "hereof",
        "hereto",
        "herein",
        "hereby",
        "thereof",
    )
    legal_pair = "shall" in lowered and any(
        marker in lowered
        for marker in ("agreement", "contract", "convention", "party", "parties", "claim", "charterer")
    )
    unsuitable_topics = (
        "murder",
        "suicide",
        "torture",
        "rifle",
        "weapon",
        "sexual",
        "naked",
        "bleeding",
        "death",
        "killed",
        "firearms",
        "hostages",
        "terrorist",
        "attack",
        "victim",
        "secret police",
        "corruption",
        "graft",
        " war ",
        " vice ",
        "clergy",
    )
    proper_nouns = re.findall(r"\b[A-Z][a-z]{2,}\b", english)
    first_letter = LATIN_RE.search(english)
    return all(
        (
            1 <= word_count <= max_words,
            len(english) <= max_english_chars,
            not korean or len(korean) <= max_korean_chars,
            english.count(",") <= max_commas,
            len(re.findall(r"[.!?]+", english)) <= 1,
            not any(character in english for character in "[]{};…:—"),
            "/" not in english,
            "source:" not in lowered,
            not re.search(r"\.\s*\d{2,4}\s*$", english),
            not legal_pair,
            not any(topic in lowered for topic in unsuitable_topics),
            " beat " not in f" {lowered} ",
            "there was things" not in lowered,
            " shall " not in f" {lowered} ",
            " contract " not in f" {lowered} ",
            len(proper_nouns) <= 2,
            not re.search(r"\b(?:18|19|20)\d{2}\b", english),
            len(re.findall(r"\b[A-Z]{3,}\b", english)) <= 1,
            bool(first_letter and first_letter.group(0).isupper()),
            not lowered.rstrip().endswith(f'"{word.casefold()}"'),
            not any(marker in lowered for marker in legal_markers),
            contains_word_form(english, word, explicit_forms),
        )
    )


def load_kowiktionary(
    source: Path,
    words_by_key: dict[str, dict],
) -> tuple[dict[str, list[dict]], dict[str, list[tuple[str, str]]]]:
    examples: dict[str, list[dict]] = defaultdict(list)
    relations: dict[str, list[tuple[str, str]]] = defaultdict(list)
    relation_fields = {
        "synonyms": "유의어",
        "antonyms": "반의어",
        "derived": "파생어",
        "derived_terms": "파생어",
        "related": "관련어",
        "related_terms": "관련어",
    }

    with gzip.open(source, "rt", encoding="utf-8") as handle:
        for line in handle:
            entry = json.loads(line)
            if entry.get("lang_code") != "en":
                continue
            key = str(entry.get("word", "")).casefold()
            item = words_by_key.get(key)
            if not item:
                continue

            for sense in entry.get("senses", []):
                fit = meaning_similarity(
                    sense.get("glosses", []),
                    item["lexical"]["meanings_ko"],
                )
                for example in sense.get("examples", []):
                    pair = split_bilingual_example(example.get("text"), example.get("translation"))
                    if pair:
                        english, korean = pair
                        translation_type = "translation"
                    else:
                        english = clean_text(example.get("text"))
                        korean = ""
                        translation_type = "meaning_hint"
                        if not LATIN_RE.search(english) or HANGUL_RE.search(english):
                            continue
                    if len(english) > 260 or len(korean) > 260:
                        continue
                    examples[key].append(
                        {
                            "en": english,
                            "ko": korean,
                            "source": "kowiktionary",
                            "translationType": translation_type,
                            "explicit": bool(example.get("translation")),
                            "meaningFit": fit,
                        }
                    )

            for field, relation_type in relation_fields.items():
                for related in entry.get(field, []):
                    related_word = clean_text(related.get("word") if isinstance(related, dict) else related)
                    if related_word:
                        relations[key].append((related_word, relation_type))

    return examples, relations


def parse_wordnet_entries(
    yaml_dir: Path,
    targets: set[str],
) -> tuple[dict[str, list[str]], dict[str, list[tuple[str, str]]], dict[str, list[str]]]:
    synsets: dict[str, list[str]] = defaultdict(list)
    relations: dict[str, list[tuple[str, str]]] = defaultdict(list)
    forms: dict[str, list[str]] = defaultdict(list)

    for path in sorted(yaml_dir.glob("entries-*.yaml")):
        current_word = ""
        current_relation = ""
        with path.open(encoding="utf-8") as handle:
            for raw_line in handle:
                line = raw_line.rstrip("\n")
                if line and not line[0].isspace():
                    match = TOP_LEVEL_RE.match(line)
                    current_word = yaml_key(match.group(1)).casefold() if match else ""
                    current_relation = ""
                    continue
                if current_word not in targets:
                    continue
                synset_match = SYNSET_VALUE_RE.match(line)
                if synset_match:
                    synset = synset_match.group(1)
                    if synset not in synsets[current_word]:
                        synsets[current_word].append(synset)
                    continue
                stripped = line.strip()
                if stripped in {"antonym:", "derivation:", "also:", "form:"}:
                    current_relation = stripped[:-1]
                    continue
                if re.match(r"^[A-Za-z_]+:", stripped):
                    current_relation = ""
                    continue
                if current_relation:
                    relation_match = RELATION_ITEM_RE.match(line)
                    if relation_match:
                        if current_relation == "form":
                            form = clean_text(yaml_key(relation_match.group(1)))
                            if form and form not in forms[current_word]:
                                forms[current_word].append(form)
                            continue
                        related_word = sense_key_word(relation_match.group(1))
                        relation_type = {
                            "antonym": "반의어",
                            "derivation": "파생어",
                            "also": "관련어",
                        }[current_relation]
                        if related_word:
                            relations[current_word].append((related_word, relation_type))

    return synsets, relations, forms


def parse_wordnet_synsets(
    yaml_dir: Path,
    wanted_synsets: set[str],
) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    examples: dict[str, list[str]] = defaultdict(list)
    members: dict[str, list[str]] = defaultdict(list)
    excluded_prefixes = ("entries-", "sense", "frames", "deprecations")

    for path in sorted(yaml_dir.glob("*.yaml")):
        if path.name.startswith(excluded_prefixes):
            continue
        current_synset = ""
        current_section = ""
        last_example_index = -1
        with path.open(encoding="utf-8") as handle:
            for raw_line in handle:
                line = raw_line.rstrip("\n")
                match = SYNSET_RE.match(line)
                if match:
                    current_synset = match.group(1) if match.group(1) in wanted_synsets else ""
                    current_section = ""
                    last_example_index = -1
                    continue
                if not current_synset:
                    continue
                stripped = line.strip()
                if line.startswith("  ") and not line.startswith("    ") and stripped.endswith(":"):
                    current_section = stripped[:-1]
                    last_example_index = -1
                    continue
                if current_section not in {"example", "members"}:
                    continue
                if line.startswith("  - "):
                    value = clean_text(yaml_key(line[4:]))
                    if not value:
                        continue
                    if current_section == "example":
                        examples[current_synset].append(value)
                        last_example_index = len(examples[current_synset]) - 1
                    else:
                        members[current_synset].append(value.replace("_", " "))
                elif current_section == "example" and line.startswith("    ") and last_example_index >= 0:
                    continuation = clean_text(line)
                    if continuation:
                        examples[current_synset][last_example_index] = clean_text(
                            f"{examples[current_synset][last_example_index]} {continuation}"
                        )

    return examples, members


def dedupe_relations(word: str, candidates: list[tuple[str, str]], limit: int = 4) -> list[dict]:
    type_priority = {"반의어": 0, "파생어": 1, "유의어": 2, "관련어": 3, "변화형": 4, "다른 표기": 5}
    best: dict[str, tuple[str, str]] = {}
    for related_word, relation_type in candidates:
        related_word = clean_text(related_word).strip(".,;:()[]{}")
        key = related_word.casefold()
        if (
            not related_word
            or key == word.casefold()
            or len(related_word) > 36
            or not LATIN_RE.search(related_word)
        ):
            continue
        old = best.get(key)
        if old is None or type_priority.get(relation_type, 99) < type_priority.get(old[1], 99):
            best[key] = (related_word, relation_type)
    ordered = sorted(best.values(), key=lambda item: type_priority.get(item[1], 99))
    return [{"word": related_word, "type": relation_type} for related_word, relation_type in ordered[:limit]]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("service_source", type=Path)
    parser.add_argument("kowiktionary_source", type=Path)
    parser.add_argument("wordnet_yaml_dir", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--overrides", type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    service = json.loads(args.service_source.read_text(encoding="utf-8"))
    words = service["words"]
    words_by_key = {item["word"].casefold(): item for item in words}
    targets = set(words_by_key)
    overrides = (
        {
            key.casefold(): value
            for key, value in json.loads(args.overrides.read_text(encoding="utf-8")).items()
        }
        if args.overrides
        else {}
    )

    wiki_examples, wiki_relations = load_kowiktionary(args.kowiktionary_source, words_by_key)
    word_synsets, wordnet_relations, word_forms = parse_wordnet_entries(args.wordnet_yaml_dir, targets)
    wanted_synsets = {synset for values in word_synsets.values() for synset in values}
    synset_examples, synset_members = parse_wordnet_synsets(args.wordnet_yaml_dir, wanted_synsets)

    enrichment: dict[str, dict] = {}
    source_counts: Counter[str] = Counter()
    translation_counts: Counter[str] = Counter()
    relation_counts: Counter[str] = Counter()
    relation_word_count = 0

    for item in words:
        word = item["word"]
        key = word.casefold()
        level = int(item["level"]["global"])
        meaning = compact_meaning(item["lexical"]["meanings_ko"][0])
        pos_codes = [entry["code"] for entry in item["lexical"]["parts_of_speech"]]
        override = overrides.get(key)
        candidates = [
            normalized
            for candidate in wiki_examples.get(key, [])
            for normalized in [{**candidate, "en": normalize_source_example(candidate["en"], word)}]
            if is_study_card_example(
                word,
                normalized["en"],
                normalized["ko"],
                level,
                word_forms.get(key, []),
            )
        ]
        if override:
            selected = {
                "en": clean_text(override["en"]),
                "ko": clean_text(override["ko"]),
                "source": "curated_override",
                "translationType": "translation",
            }
            if not is_study_card_example(
                word,
                selected["en"],
                selected["ko"],
                level,
                word_forms.get(key, []),
            ):
                raise ValueError(f"Curated example does not meet card rules: {word}")
            selected_synset = ""
        elif candidates:
            selected = min(
                candidates,
                key=lambda candidate: example_score(
                    word,
                    candidate["en"],
                    level,
                    bool(candidate.get("explicit")),
                    float(candidate.get("meaningFit", 0)),
                ),
            ).copy()
            selected.pop("explicit", None)
            selected.pop("meaningFit", None)
            if not selected["ko"]:
                selected["ko"] = f"대표 뜻 · {meaning}"
            selected_synset = ""
        else:
            wordnet_candidates = [
                (example, synset, synset_rank)
                for synset_rank, synset in enumerate(word_synsets.get(key, []))
                for raw_example in synset_examples.get(synset, [])
                for example in [normalize_source_example(raw_example, word)]
                if LATIN_RE.search(example)
                and is_study_card_example(word, example, "", level, word_forms.get(key, []))
            ]
            if wordnet_candidates:
                primary_suffixes = POS_SYNSET_SUFFIXES.get(pos_codes[0], set()) if pos_codes else set()
                all_suffixes = {
                    suffix
                    for code in pos_codes
                    for suffix in POS_SYNSET_SUFFIXES.get(code, set())
                }
                primary_matches = [
                    candidate for candidate in wordnet_candidates if candidate[1][-1] in primary_suffixes
                ]
                allowed_matches = [
                    candidate for candidate in wordnet_candidates if candidate[1][-1] in all_suffixes
                ]
                wordnet_candidates = primary_matches if primary_suffixes else (allowed_matches or wordnet_candidates)
            if wordnet_candidates:
                english, selected_synset, _ = min(
                    wordnet_candidates,
                    key=lambda candidate: (
                        candidate[2],
                        example_score(word, candidate[0], level, False),
                    ),
                )
                selected = {
                    "en": english,
                    "ko": f"대표 뜻 · {meaning}",
                    "source": "open_english_wordnet",
                    "translationType": "meaning_hint",
                }
            else:
                selected_synset = ""
                selected = None

        relation_candidates: list[tuple[str, str]] = []
        relation_candidates.extend((value, "다른 표기") for value in item["spellings"]["alternate"])
        relation_candidates.extend((value, "변화형") for value in item["spellings"]["related_forms"])
        relation_candidates.extend(wiki_relations.get(key, []))
        relation_candidates.extend(wordnet_relations.get(key, []))
        related_synsets = [selected_synset] if selected_synset else word_synsets.get(key, [])[:1]
        for synset in related_synsets:
            relation_candidates.extend((member, "유의어") for member in synset_members.get(synset, []))
        related_words = dedupe_relations(word, relation_candidates)
        if override and "relatedWords" in override:
            related_words = dedupe_relations(
                word,
                [
                    (related["word"], related["type"])
                    for related in override["relatedWords"]
                ],
            )

        enrichment[str(item["id"])] = {
            "example": selected,
            "relatedWords": related_words,
        }
        if selected:
            source_counts[selected["source"]] += 1
            translation_counts[selected["translationType"]] += 1
        relation_counts.update(related["type"] for related in related_words)
        if related_words:
            relation_word_count += 1

    checks = {
        "total": len(enrichment) == 3000,
        "no_synthetic_examples": all(
            not value["example"] or value["example"]["source"] != "generated_learning_prompt"
            for value in enrichment.values()
        ),
        "all_sourced_examples_complete": all(
            not value["example"] or (value["example"]["en"] and value["example"]["ko"])
            for value in enrichment.values()
        ),
        "example_length": all(
            not enrichment[str(item["id"])]["example"]
            or is_study_card_example(
                item["word"],
                enrichment[str(item["id"])]["example"]["en"],
                enrichment[str(item["id"])]["example"]["ko"],
                int(item["level"]["global"]),
                word_forms.get(item["word"].casefold(), []),
            )
            for item in words
        ),
        "relation_limit": all(len(value["relatedWords"]) <= 4 for value in enrichment.values()),
    }
    if not all(checks.values()):
        raise ValueError(f"Invalid learning enrichment: {checks}")

    payload = {
        "version": "v1",
        "sources": {
            "kowiktionary": "Korean Wiktionary / Kaikki extract (CC BY-SA)",
            "open_english_wordnet": "Open English WordNet",
            "curated_override": "Manually reviewed learning examples",
        },
        "words": enrichment,
    }
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    args.destination.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    report = {
        "checks": checks,
        "total": len(enrichment),
        "words_with_sourced_examples": sum(1 for value in enrichment.values() if value["example"]),
        "words_needing_example_review": sum(1 for value in enrichment.values() if not value["example"]),
        "example_source_counts": dict(source_counts),
        "translation_type_counts": dict(translation_counts),
        "words_with_related_words": relation_word_count,
        "related_word_type_counts": dict(relation_counts),
    }
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
