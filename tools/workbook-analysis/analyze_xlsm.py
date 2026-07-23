from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import struct
import zipfile
from collections import Counter, defaultdict
from pathlib import Path, PurePosixPath
from xml.etree import ElementTree as ET


REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
DOC_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"


def qn(ns: str, name: str) -> str:
    return f"{{{ns}}}{name}"


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def xml_text(el: ET.Element | None) -> str:
    if el is None:
        return ""
    return "".join(el.itertext())


def resolve_zip_target(base_part: str, target: str) -> str:
    if target.startswith("/"):
        return target.lstrip("/")
    parent = PurePosixPath(base_part).parent
    parts: list[str] = []
    for part in (parent / target).parts:
        if part == ".":
            continue
        if part == "..":
            if parts:
                parts.pop()
        else:
            parts.append(part)
    return "/".join(parts)


def rels_path(part: str) -> str:
    p = PurePosixPath(part)
    return str(p.parent / "_rels" / (p.name + ".rels"))


def read_relationships(zf: zipfile.ZipFile, part: str) -> dict[str, dict[str, str]]:
    rp = rels_path(part)
    if rp not in zf.namelist():
        return {}
    root = ET.fromstring(zf.read(rp))
    out: dict[str, dict[str, str]] = {}
    for rel in root:
        rid = rel.attrib.get("Id", "")
        target = rel.attrib.get("Target", "")
        out[rid] = {
            "id": rid,
            "type": rel.attrib.get("Type", ""),
            "target_raw": target,
            "target": resolve_zip_target(part, target),
            "target_mode": rel.attrib.get("TargetMode", ""),
        }
    return out


def parse_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    return ["".join(t.text or "" for t in si.iter() if local_name(t.tag) == "t") for si in root]


def cell_value(cell: ET.Element, shared_strings: list[str]):
    ctype = cell.attrib.get("t", "n")
    v_el = next((x for x in cell if local_name(x.tag) == "v"), None)
    if ctype == "inlineStr":
        return "".join(x.text or "" for x in cell.iter() if local_name(x.tag) == "t")
    raw = v_el.text if v_el is not None else None
    if raw is None:
        return None
    if ctype == "s":
        try:
            return shared_strings[int(raw)]
        except Exception:
            return raw
    if ctype == "b":
        return raw == "1"
    if ctype in {"str", "e", "d"}:
        return raw
    try:
        n = float(raw)
        return int(n) if n.is_integer() else n
    except Exception:
        return raw


def decode_vba_bytes(data: bytes, codepage: int = 949) -> str:
    codecs = []
    if codepage:
        codecs.append(f"cp{codepage}")
    codecs += ["cp949", "utf-8", "cp1252", "latin1"]
    best = ""
    best_score = -10**9
    for codec in dict.fromkeys(codecs):
        try:
            text = data.decode(codec, errors="replace")
        except LookupError:
            continue
        score = sum(text.lower().count(k) * 50 for k in ["attribute vb_name", "sub ", "function ", "option ", "private "])
        score -= text.count("\ufffd") * 20
        score -= sum(1 for ch in text if ord(ch) < 9 or 13 < ord(ch) < 32)
        if score > best_score:
            best_score = score
            best = text
    return best


def binary_strings(data: bytes, codepage: int = 949, min_len: int = 4) -> list[str]:
    values = set()
    for m in re.finditer(rb"[\x20-\x7e]{4,}", data):
        values.add(m.group().decode("latin1", errors="ignore").strip())
    for m in re.finditer(rb"(?:[\x20-\x7e]\x00){4,}", data):
        values.add(m.group().decode("utf-16le", errors="ignore").strip())
    for codec in [f"cp{codepage}", "cp949", "utf-8"]:
        try:
            text = data.decode(codec, errors="ignore")
        except LookupError:
            continue
        for m in re.finditer(rf"[A-Za-z0-9_가-힣①-⑳ .,():/\\-]{{{min_len},}}", text):
            value = m.group().strip(" \x00")
            if value and sum(ch.isalnum() or "가" <= ch <= "힣" for ch in value) >= 2:
                values.add(value)
    return sorted(x for x in values if x)


class CompoundFile:
    FREESECT = 0xFFFFFFFF
    ENDOFCHAIN = 0xFFFFFFFE
    FATSECT = 0xFFFFFFFD
    DIFSECT = 0xFFFFFFFC

    def __init__(self, data: bytes):
        if data[:8] != bytes.fromhex("D0CF11E0A1B11AE1"):
            raise ValueError("not a CFB file")
        self.data = data
        self.major = struct.unpack_from("<H", data, 26)[0]
        self.sector_size = 1 << struct.unpack_from("<H", data, 30)[0]
        self.mini_sector_size = 1 << struct.unpack_from("<H", data, 32)[0]
        self.num_fat = struct.unpack_from("<I", data, 44)[0]
        self.first_dir = struct.unpack_from("<I", data, 48)[0]
        self.mini_cutoff = struct.unpack_from("<I", data, 56)[0]
        self.first_minifat = struct.unpack_from("<I", data, 60)[0]
        self.num_minifat = struct.unpack_from("<I", data, 64)[0]
        first_difat = struct.unpack_from("<I", data, 68)[0]
        num_difat = struct.unpack_from("<I", data, 72)[0]
        difat = list(struct.unpack_from("<109I", data, 76))
        difat = [x for x in difat if x not in (self.FREESECT, self.ENDOFCHAIN)]
        sid = first_difat
        per_difat = self.sector_size // 4 - 1
        for _ in range(num_difat):
            if sid in (self.FREESECT, self.ENDOFCHAIN):
                break
            sec = self._sector(sid)
            vals = struct.unpack_from(f"<{per_difat + 1}I", sec)
            difat.extend(x for x in vals[:per_difat] if x not in (self.FREESECT, self.ENDOFCHAIN))
            sid = vals[-1]
        fat_entries: list[int] = []
        for fat_sid in difat[: self.num_fat]:
            fat_entries.extend(struct.unpack_from(f"<{self.sector_size // 4}I", self._sector(fat_sid)))
        self.fat = fat_entries
        dir_data = self._read_chain(self.first_dir)
        self.entries: list[dict] = []
        for i in range(0, len(dir_data), 128):
            ent = dir_data[i : i + 128]
            if len(ent) < 128:
                break
            name_len = struct.unpack_from("<H", ent, 64)[0]
            name = ent[: max(0, name_len - 2)].decode("utf-16le", errors="replace") if name_len >= 2 else ""
            self.entries.append(
                {
                    "id": i // 128,
                    "name": name,
                    "type": ent[66],
                    "left": struct.unpack_from("<I", ent, 68)[0],
                    "right": struct.unpack_from("<I", ent, 72)[0],
                    "child": struct.unpack_from("<I", ent, 76)[0],
                    "start": struct.unpack_from("<I", ent, 116)[0],
                    "size": struct.unpack_from("<Q", ent, 120)[0],
                }
            )
        if self.major == 3:
            for entry in self.entries:
                entry["size"] &= 0xFFFFFFFF
        root = self.entries[0]
        self.root_stream = self._read_chain(root["start"], root["size"])
        self.minifat: list[int] = []
        if self.num_minifat and self.first_minifat not in (self.FREESECT, self.ENDOFCHAIN):
            mf = self._read_chain(self.first_minifat, self.num_minifat * self.sector_size)
            self.minifat = list(struct.unpack_from(f"<{len(mf) // 4}I", mf[: len(mf) // 4 * 4]))
        self.paths: dict[str, int] = {}
        self._walk_storage(0, "")

    def _sector(self, sid: int) -> bytes:
        start = (sid + 1) * self.sector_size
        return self.data[start : start + self.sector_size]

    def _read_chain(self, start_sid: int, size: int | None = None) -> bytes:
        out = bytearray()
        sid = start_sid
        seen = set()
        while sid not in (self.FREESECT, self.ENDOFCHAIN) and sid < len(self.fat) and sid not in seen:
            seen.add(sid)
            out.extend(self._sector(sid))
            sid = self.fat[sid]
        return bytes(out if size is None else out[:size])

    def _read_mini_chain(self, start_sid: int, size: int) -> bytes:
        out = bytearray()
        sid = start_sid
        seen = set()
        while sid not in (self.FREESECT, self.ENDOFCHAIN) and sid < len(self.minifat) and sid not in seen:
            seen.add(sid)
            start = sid * self.mini_sector_size
            out.extend(self.root_stream[start : start + self.mini_sector_size])
            sid = self.minifat[sid]
        return bytes(out[:size])

    def _siblings(self, node_id: int):
        if node_id in (self.FREESECT, self.ENDOFCHAIN) or node_id >= len(self.entries):
            return
        e = self.entries[node_id]
        yield from self._siblings(e["left"])
        yield node_id
        yield from self._siblings(e["right"])

    def _walk_storage(self, storage_id: int, prefix: str):
        child = self.entries[storage_id]["child"]
        for node_id in self._siblings(child) or []:
            e = self.entries[node_id]
            path = f"{prefix}/{e['name']}" if prefix else e["name"]
            self.paths[path] = node_id
            if e["type"] == 1:
                self._walk_storage(node_id, path)

    def list_streams(self) -> list[str]:
        return sorted(path for path, i in self.paths.items() if self.entries[i]["type"] == 2)

    def read_stream(self, path: str) -> bytes:
        path_lower = path.lower()
        match = next((p for p in self.paths if p.lower() == path_lower), None)
        if match is None:
            raise KeyError(path)
        e = self.entries[self.paths[match]]
        if e["size"] < self.mini_cutoff:
            return self._read_mini_chain(e["start"], e["size"])
        return self._read_chain(e["start"], e["size"])


def vba_decompress(data: bytes) -> bytes:
    if not data or data[0] != 0x01:
        raise ValueError("missing compressed-container signature")
    pos = 1
    out = bytearray()
    while pos < len(data):
        if pos + 2 > len(data):
            break
        chunk_start_in = pos
        header = struct.unpack_from("<H", data, pos)[0]
        pos += 2
        if ((header >> 12) & 0x7) != 0x3:
            raise ValueError("bad compressed chunk signature")
        chunk_size = (header & 0x0FFF) + 3
        chunk_end = min(chunk_start_in + chunk_size, len(data))
        compressed = bool(header & 0x8000)
        chunk_out_start = len(out)
        if not compressed:
            out.extend(data[pos:chunk_end])
            pos = chunk_end
            continue
        while pos < chunk_end and len(out) - chunk_out_start < 4096:
            flags = data[pos]
            pos += 1
            for bit in range(8):
                if pos >= chunk_end or len(out) - chunk_out_start >= 4096:
                    break
                if flags & (1 << bit):
                    if pos + 2 > chunk_end:
                        pos = chunk_end
                        break
                    token = struct.unpack_from("<H", data, pos)[0]
                    pos += 2
                    decompressed_pos = len(out) - chunk_out_start
                    bit_count = max(4, int(math.ceil(math.log2(max(1, decompressed_pos)))))
                    bit_count = min(bit_count, 12)
                    length_mask = 0xFFFF >> bit_count
                    offset_mask = (~length_mask) & 0xFFFF
                    length = (token & length_mask) + 3
                    offset = ((token & offset_mask) >> (16 - bit_count)) + 1
                    if offset > decompressed_pos:
                        raise ValueError("invalid copy-token offset")
                    for _ in range(length):
                        out.append(out[-offset])
                        if len(out) - chunk_out_start >= 4096:
                            break
                else:
                    out.append(data[pos])
                    pos += 1
        pos = chunk_end
    return bytes(out)


def project_modules(project_text: str) -> list[dict]:
    modules: list[dict] = []
    for line in project_text.splitlines():
        if line.startswith("Document="):
            raw = line.split("=", 1)[1]
            modules.append({"name": raw.split("/", 1)[0], "type": "document", "project_line": line})
        elif line.startswith("Module="):
            modules.append({"name": line.split("=", 1)[1], "type": "standard", "project_line": line})
        elif line.startswith("Class="):
            modules.append({"name": line.split("=", 1)[1], "type": "class", "project_line": line})
        elif line.startswith("BaseClass="):
            modules.append({"name": line.split("=", 1)[1], "type": "userform", "project_line": line})
    return modules


def extract_procedures(code: str) -> list[dict]:
    lines = code.splitlines()
    start_re = re.compile(
        r"^\s*(?:(Public|Private|Friend|Static)\s+)?(Sub|Function|Property\s+(?:Get|Let|Set))\s+([A-Za-z_\u0080-\uffff][\w\u0080-\uffff]*)\s*(?:\((.*?)\))?",
        re.IGNORECASE,
    )
    end_re = re.compile(r"^\s*End\s+(Sub|Function|Property)\b", re.IGNORECASE)
    out = []
    i = 0
    while i < len(lines):
        m = start_re.match(lines[i])
        if not m:
            i += 1
            continue
        start = i
        j = i + 1
        while j < len(lines) and not end_re.match(lines[j]):
            j += 1
        end = min(j, len(lines) - 1)
        body = "\n".join(lines[start : end + 1])
        out.append(
            {
                "name": m.group(3),
                "kind": m.group(2),
                "visibility": m.group(1) or "Public(default)",
                "params": m.group(4) or "",
                "start_line": start + 1,
                "end_line": end + 1,
                "body": body,
            }
        )
        i = end + 1
    return out


def code_dependencies(code: str) -> dict:
    patterns = {
        "range_refs": r"(?i)(?:Worksheets?\s*\(\s*([^)]+?)\s*\)\s*\.)?Range\s*\(\s*\"([^\"]+)\"\s*\)",
        "bracket_refs": r"\[([^\]]+)\]",
        "cells_refs": r"(?i)Cells\s*\(\s*([^,\)]+)\s*,\s*([^\)]+)\)",
        "paths": r"(?i)(?:[A-Z]:\\[^\"\r\n]+|\\\\[^\"\r\n]+|[^\"\r\n]+\.(?:xlsx|xlsm|xls|csv|txt|pdf|exe|dll|ocx|bat|cmd))",
        "urls": r"(?i)https?://[^\s\"']+",
        "shells": r"(?im)^\s*.*\b(?:Shell|CreateObject|GetObject|FollowHyperlink|Workbooks\.Open|Open\s+.+\s+For|FileCopy|Kill|MkDir|ChDir|ChDrive|PrintOut|ActivePrinter|SendKeys|Declare\s+(?:PtrSafe\s+)?(?:Function|Sub))\b.*$",
    }
    result = {}
    for key, pattern in patterns.items():
        vals = re.findall(pattern, code)
        result[key] = [list(x) if isinstance(x, tuple) else x for x in vals]
    return result


def extract_vba(zf: zipfile.ZipFile) -> dict:
    if "xl/vbaProject.bin" not in zf.namelist():
        return {"present": False}
    cfb = CompoundFile(zf.read("xl/vbaProject.bin"))
    streams = cfb.list_streams()
    project_path = next((p for p in streams if p.lower() == "project"), None)
    project_bytes = cfb.read_stream(project_path) if project_path else b""
    project_text = decode_vba_bytes(project_bytes, 949)
    cp_match = re.search(r"(?im)^CodePage=(\d+)", project_text)
    codepage = int(cp_match.group(1)) if cp_match else 949
    modules = project_modules(project_text)
    stream_lookup = {p.lower(): p for p in streams}
    for module in modules:
        candidates = [f"VBA/{module['name']}", module["name"]]
        stream_path = next((stream_lookup[c.lower()] for c in candidates if c.lower() in stream_lookup), None)
        module["stream"] = stream_path
        module["code"] = ""
        module["decompression_offset"] = None
        module["procedures"] = []
        if not stream_path:
            continue
        raw = cfb.read_stream(stream_path)
        best = None
        for offset, b in enumerate(raw):
            if b != 1 or offset + 3 > len(raw):
                continue
            try:
                dec = vba_decompress(raw[offset:])
            except Exception:
                continue
            text = decode_vba_bytes(dec, codepage)
            score = text.lower().count("attribute vb_name") * 10000
            score += sum(text.lower().count(k) * 100 for k in ["sub ", "function ", "property ", "option explicit"])
            score += min(len(text), 100000) / 100
            score -= text.count("\ufffd") * 10
            if best is None or score > best[0]:
                best = (score, offset, text)
        if best:
            module["decompression_offset"] = best[1]
            module["code"] = best[2]
            module["procedures"] = extract_procedures(best[2])
            module["dependencies"] = code_dependencies(best[2])
        if module["type"] == "userform":
            prefix = module["name"].lower() + "/"
            form_paths = [p for p in streams if p.lower().startswith(prefix)]
            module["form_streams"] = [
                {"path": p, "size": len(cfb.read_stream(p)), "strings": binary_strings(cfb.read_stream(p), codepage)}
                for p in form_paths
            ]
    env_binary_strings = []
    vbabin = zf.read("xl/vbaProject.bin")
    for match in re.finditer(rb"[\x20-\x7e]{6,}", vbabin):
        s = match.group().decode("latin1", errors="ignore")
        if re.search(r"(?i)(dll|ocx|exe|https?://|[a-z]:\\|\\\\|printer|office|excel|vba|guid|stdole)", s):
            env_binary_strings.append(s)
    return {
        "present": True,
        "cfb_major": cfb.major,
        "streams": streams,
        "project_text": project_text,
        "codepage": codepage,
        "modules": modules,
        "binary_environment_strings": sorted(set(env_binary_strings)),
    }


def parse_drawing_text(root: ET.Element) -> str:
    texts = []
    for el in root.iter():
        if local_name(el.tag) in {"t", "textpath", "div"}:
            text = el.text or el.attrib.get("string", "")
            if text:
                texts.append(text)
    return " ".join(texts)


def parse_sheet_controls(zf: zipfile.ZipFile, sheet_part: str, root: ET.Element, rels: dict[str, dict[str, str]]) -> list[dict]:
    controls = []
    for control in (el for el in root.iter() if local_name(el.tag) == "control"):
        rid = control.attrib.get(qn(DOC_REL_NS, "id"), "")
        rel = rels.get(rid, {})
        info = {"shapeId": control.attrib.get("shapeId"), "name": control.attrib.get("name"), "rel": rel}
        target = rel.get("target")
        if target and target in zf.namelist() and target.endswith(".xml"):
            cp_root = ET.fromstring(zf.read(target))
            info["control_property"] = {local_name(k): v for k, v in cp_root.attrib.items()}
            for child in cp_root:
                info.setdefault("control_children", []).append({"tag": local_name(child.tag), "attrib": dict(child.attrib), "text": xml_text(child)})
        controls.append(info)
    return controls


def parse_vml(zf: zipfile.ZipFile, part: str) -> list[dict]:
    if part not in zf.namelist():
        return []
    root = ET.fromstring(zf.read(part))
    shapes = []
    for shape in (x for x in root.iter() if local_name(x.tag) == "shape"):
        info = {"id": shape.attrib.get("id"), "type": shape.attrib.get("type"), "style": shape.attrib.get("style"), "text": parse_drawing_text(shape)}
        for child in shape.iter():
            ln = local_name(child.tag)
            if ln == "ClientData":
                info["objectType"] = child.attrib.get("ObjectType")
                for ce in child:
                    key = local_name(ce.tag)
                    val = xml_text(ce)
                    if key in info:
                        if not isinstance(info[key], list):
                            info[key] = [info[key]]
                        info[key].append(val)
                    else:
                        info[key] = val
        shapes.append(info)
    return shapes


def parse_drawing(zf: zipfile.ZipFile, part: str) -> list[dict]:
    if part not in zf.namelist():
        return []
    root = ET.fromstring(zf.read(part))
    drawings = []
    for anchor in root:
        anchor_name = local_name(anchor.tag)
        if anchor_name not in {"oneCellAnchor", "twoCellAnchor", "absoluteAnchor"}:
            continue
        pos = {}
        for child in anchor:
            ln = local_name(child.tag)
            if ln in {"from", "to"}:
                pos[ln] = {local_name(x.tag): xml_text(x) for x in child}
        for obj in anchor:
            ln = local_name(obj.tag)
            if ln not in {"sp", "pic", "graphicFrame", "cxnSp", "grpSp"}:
                continue
            macro = obj.attrib.get("macro") or anchor.attrib.get("macro")
            name = None
            obj_id = None
            for el in obj.iter():
                if local_name(el.tag) == "cNvPr":
                    name = el.attrib.get("name")
                    obj_id = el.attrib.get("id")
                    break
            drawings.append({"anchor_type": anchor_name, "position": pos, "kind": ln, "name": name, "id": obj_id, "macro": macro, "text": parse_drawing_text(obj)})
    return drawings


def workbook_analysis(path: Path) -> dict:
    data = path.read_bytes()
    with zipfile.ZipFile(path) as zf:
        names = set(zf.namelist())
        shared = parse_shared_strings(zf)
        style_xfs = []
        if "xl/styles.xml" in names:
            styles_root = ET.fromstring(zf.read("xl/styles.xml"))
            cell_xfs = next((x for x in styles_root if local_name(x.tag) == "cellXfs"), None)
            if cell_xfs is not None:
                for xf in cell_xfs:
                    prot = next((x for x in xf if local_name(x.tag) == "protection"), None)
                    style_xfs.append(
                        {
                            "numFmtId": xf.attrib.get("numFmtId"),
                            "fontId": xf.attrib.get("fontId"),
                            "fillId": xf.attrib.get("fillId"),
                            "borderId": xf.attrib.get("borderId"),
                            "applyProtection": xf.attrib.get("applyProtection"),
                            "locked": False if prot is not None and prot.attrib.get("locked") == "0" else True,
                            "hidden": True if prot is not None and prot.attrib.get("hidden") == "1" else False,
                        }
                    )
        wb_root = ET.fromstring(zf.read("xl/workbook.xml"))
        wb_rels = read_relationships(zf, "xl/workbook.xml")
        defined_names = []
        for dn in (x for x in wb_root.iter() if local_name(x.tag) == "definedName"):
            defined_names.append({"name": dn.attrib.get("name"), "formula": xml_text(dn), **{local_name(k): v for k, v in dn.attrib.items() if local_name(k) != "name"}})
        workbook_props = {}
        for el in wb_root:
            if local_name(el.tag) in {"workbookPr", "calcPr", "fileVersion", "workbookProtection"}:
                workbook_props[local_name(el.tag)] = {local_name(k): v for k, v in el.attrib.items()}

        sheets = []
        sheet_nodes = [x for x in wb_root.iter() if local_name(x.tag) == "sheet"]
        for idx, sn in enumerate(sheet_nodes):
            rid = sn.attrib.get(qn(DOC_REL_NS, "id"), "")
            rel = wb_rels.get(rid, {})
            part = rel.get("target")
            if not part or part not in names:
                continue
            root = ET.fromstring(zf.read(part))
            rels = read_relationships(zf, part)
            code_name = None
            sheet_pr = next((x for x in root if local_name(x.tag) == "sheetPr"), None)
            if sheet_pr is not None:
                code_name = sheet_pr.attrib.get("codeName")
            dimension = next((x for x in root if local_name(x.tag) == "dimension"), None)
            shared_bases: dict[str, tuple[str, str]] = {}
            cells = []
            all_cells = []
            for c in (x for x in root.iter() if local_name(x.tag) == "c"):
                ref = c.attrib.get("r", "")
                f_el = next((x for x in c if local_name(x.tag) == "f"), None)
                formula = None
                formula_attrs = {}
                if f_el is not None:
                    formula_attrs = {local_name(k): v for k, v in f_el.attrib.items()}
                    formula = f_el.text or ""
                    si = formula_attrs.get("si")
                    if formula and formula_attrs.get("t") == "shared" and si is not None:
                        shared_bases[si] = (ref, formula)
                    elif not formula and formula_attrs.get("t") == "shared" and si in shared_bases:
                        try:
                            from openpyxl.formula.translate import Translator

                            origin, base = shared_bases[si]
                            formula = Translator("=" + base, origin=origin).translate_formula(ref)[1:]
                        except Exception:
                            formula = f"<shared:{si}>"
                value = cell_value(c, shared)
                style_id = int(c.attrib.get("s", "0"))
                style_info = style_xfs[style_id] if 0 <= style_id < len(style_xfs) else {"locked": True, "hidden": False}
                cell_record = {
                    "ref": ref,
                    "value": value,
                    "formula": formula,
                    "formula_attrs": formula_attrs,
                    "style": str(style_id),
                    "locked": style_info.get("locked", True),
                    "formula_hidden": style_info.get("hidden", False),
                    "type": c.attrib.get("t"),
                }
                all_cells.append(cell_record)
                if value is not None or formula is not None:
                    cells.append(cell_record)
            validations = []
            for dv in (x for x in root.iter() if local_name(x.tag) == "dataValidation"):
                formulas = {local_name(x.tag): xml_text(x) for x in dv if local_name(x.tag) in {"formula1", "formula2"}}
                validations.append({**{local_name(k): v for k, v in dv.attrib.items()}, **formulas})
            conditional_formats = []
            for cf in (x for x in root.iter() if local_name(x.tag) == "conditionalFormatting"):
                conditional_formats.append(
                    {
                        "sqref": cf.attrib.get("sqref"),
                        "rules": [
                            {
                                **{local_name(k): v for k, v in rule.attrib.items()},
                                "formulas": [xml_text(x) for x in rule if local_name(x.tag) == "formula"],
                            }
                            for rule in cf
                            if local_name(rule.tag) == "cfRule"
                        ],
                    }
                )
            tables = []
            for relinfo in rels.values():
                if relinfo["type"].endswith("/table") and relinfo["target"] in names:
                    tr = ET.fromstring(zf.read(relinfo["target"]))
                    tables.append({"part": relinfo["target"], **{local_name(k): v for k, v in tr.attrib.items()}, "columns": [{local_name(k): v for k, v in x.attrib.items()} for x in tr.iter() if local_name(x.tag) == "tableColumn"]})
            vml_shapes = []
            drawings = []
            for relinfo in rels.values():
                target = relinfo["target"]
                if relinfo["type"].endswith("/vmlDrawing"):
                    vml_shapes.extend(parse_vml(zf, target))
                elif relinfo["type"].endswith("/drawing"):
                    drawings.extend(parse_drawing(zf, target))
            controls = parse_sheet_controls(zf, part, root, rels)
            hyperlinks = []
            for hl in (x for x in root.iter() if local_name(x.tag) == "hyperlink"):
                h = {local_name(k): v for k, v in hl.attrib.items()}
                hrid = hl.attrib.get(qn(DOC_REL_NS, "id"))
                if hrid and hrid in rels:
                    h["target"] = rels[hrid]["target_raw"]
                    h["targetMode"] = rels[hrid]["target_mode"]
                hyperlinks.append(h)
            print_info = {}
            for el in root:
                if local_name(el.tag) in {"pageMargins", "pageSetup", "printOptions", "sheetProtection", "autoFilter"}:
                    print_info[local_name(el.tag)] = {local_name(k): v for k, v in el.attrib.items()}
            sheets.append(
                {
                    "index": idx,
                    "name": sn.attrib.get("name"),
                    "sheetId": sn.attrib.get("sheetId"),
                    "state": sn.attrib.get("state", "visible"),
                    "codeName": code_name,
                    "part": part,
                    "dimension": dimension.attrib.get("ref") if dimension is not None else None,
                    "cells": cells,
                    "all_cells": all_cells,
                    "formulas": [c for c in cells if c["formula"] is not None],
                    "validations": validations,
                    "conditional_formats": conditional_formats,
                    "tables": tables,
                    "controls": controls,
                    "vml_shapes": vml_shapes,
                    "drawings": drawings,
                    "hyperlinks": hyperlinks,
                    "print": print_info,
                    "relationships": list(rels.values()),
                }
            )

        external = []
        for part in sorted(names):
            if part.startswith("xl/externalLinks/") or part.startswith("xl/connections") or part.startswith("xl/queryTables/"):
                external.append(part)
        custom_xml = {}
        for part in sorted(n for n in names if n.startswith("customXml/item") and n.endswith(".xml") and "Props" not in n):
            raw = zf.read(part)
            custom_xml[part] = raw.decode("utf-8", errors="replace")[:20000]

        vba = extract_vba(zf)
        printer_parts = sorted(n for n in names if n.startswith("xl/printerSettings/"))
        printer_strings = {part: binary_strings(zf.read(part), 949) for part in printer_parts}
        return {
            "source": str(path),
            "size": len(data),
            "sha256": hashlib.sha256(data).hexdigest().upper(),
            "zip_entry_count": len(names),
            "workbook_properties": workbook_props,
            "style_xfs": style_xfs,
            "defined_names": defined_names,
            "sheets": sheets,
            "external_parts": external,
            "all_table_parts": sorted(n for n in names if n.startswith("xl/tables/")),
            "printer_parts": printer_parts,
            "printer_strings": printer_strings,
            "control_property_parts": sorted(n for n in names if n.startswith("xl/ctrlProps/")),
            "active_x_parts": sorted(n for n in names if n.startswith("xl/activeX/")),
            "custom_xml": custom_xml,
            "vba": vba,
        }


def compact_summary(analysis: dict) -> dict:
    modules = analysis["vba"].get("modules", [])
    return {
        "source": analysis["source"],
        "size": analysis["size"],
        "sha256": analysis["sha256"],
        "sheet_count": len(analysis["sheets"]),
        "sheet_states": dict(Counter(s["state"] for s in analysis["sheets"])),
        "cell_count": sum(len(s["cells"]) for s in analysis["sheets"]),
        "formula_count": sum(len(s["formulas"]) for s in analysis["sheets"]),
        "defined_name_count": len(analysis["defined_names"]),
        "table_count": sum(len(s["tables"]) for s in analysis["sheets"]),
        "validation_count": sum(len(s["validations"]) for s in analysis["sheets"]),
        "control_count": sum(len(s["controls"]) for s in analysis["sheets"]),
        "vml_shape_count": sum(len(s["vml_shapes"]) for s in analysis["sheets"]),
        "drawing_object_count": sum(len(s["drawings"]) for s in analysis["sheets"]),
        "printer_part_count": len(analysis["printer_parts"]),
        "external_parts": analysis["external_parts"],
        "vba_stream_count": len(analysis["vba"].get("streams", [])),
        "vba_module_count": len(modules),
        "vba_module_types": dict(Counter(m["type"] for m in modules)),
        "vba_procedure_count": sum(len(m.get("procedures", [])) for m in modules),
        "modules_without_code": [m["name"] for m in modules if not m.get("code")],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    analysis = workbook_analysis(args.source)
    (args.output_dir / "analysis.json").write_text(json.dumps(analysis, ensure_ascii=False, indent=2), encoding="utf-8")
    summary = compact_summary(analysis)
    (args.output_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    modules_dir = args.output_dir / "vba_modules"
    modules_dir.mkdir(exist_ok=True)
    for module in analysis["vba"].get("modules", []):
        safe = re.sub(r"[<>:\"/\\|?*]", "_", module["name"])
        (modules_dir / f"{module['type']}_{safe}.bas").write_text(module.get("code", ""), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
