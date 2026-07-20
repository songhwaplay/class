"""Resize generated vocabulary illustrations and build a review sheet."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


def parse_item(value: str) -> tuple[str, Path]:
    name, separator, source = value.partition("=")
    if not separator or not name or not source:
        raise argparse.ArgumentTypeError("items must use word=source-path")
    return name, Path(source)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--contact-sheet", type=Path)
    parser.add_argument("items", nargs="+", type=parse_item)
    args = parser.parse_args()

    args.out_dir.mkdir(parents=True, exist_ok=True)
    previews: list[tuple[str, Image.Image]] = []

    for name, source in args.items:
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image = ImageOps.fit(image, (420, 420), method=Image.Resampling.LANCZOS)
            image.save(args.out_dir / f"{name}.webp", "WEBP", quality=82, method=6)
            previews.append((name, image.copy()))

    if not args.contact_sheet:
        return

    columns = 5
    cell_width = 220
    cell_height = 246
    rows = (len(previews) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * cell_width, rows * cell_height), "#eee5d3")
    draw = ImageDraw.Draw(sheet)
    for index, (name, image) in enumerate(previews):
        x = (index % columns) * cell_width
        y = (index // columns) * cell_height
        preview = image.resize((200, 200), Image.Resampling.LANCZOS)
        sheet.paste(preview, (x + 10, y + 10))
        draw.text((x + 12, y + 218), name, fill="#24302d")

    args.contact_sheet.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.contact_sheet, "PNG", optimize=True)


if __name__ == "__main__":
    main()
