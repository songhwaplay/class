from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path


PATH = Path(__file__).resolve().parent / "_analysis" / "연산" / "analysis.json"
A = json.loads(PATH.read_text(encoding="utf-8"))


def p(obj):
    print(json.dumps(obj, ensure_ascii=False, indent=2))


def sheets():
    for s in A["sheets"]:
        print(
            f"{s['index']+1:02d} | {s['state']:7} | {s['name']} | code={s['codeName']} | "
            f"dim={s['dimension']} | cells={len(s['cells'])} | formulas={len(s['formulas'])} | "
            f"controls={len(s['controls'])} | vml={len(s['vml_shapes'])} | drawings={len(s['drawings'])}"
        )
    print("DEFINED NAMES")
    p(A["defined_names"])


def modules():
    for m in A["vba"]["modules"]:
        procs = ", ".join(f"{x['name']}[{x['start_line']}-{x['end_line']}]" for x in m["procedures"])
        print(f"{m['type']:9} | {m['name']} | stream={m['stream']} | chars={len(m['code'])} | {procs}")


def controls():
    for s in A["sheets"]:
        if not (s["controls"] or s["vml_shapes"] or s["drawings"]):
            continue
        print(f"\n## {s['name']} ({s['codeName']})")
        for i, c in enumerate(s["controls"], 1):
            print(f"CONTROL {i}: {json.dumps(c, ensure_ascii=False)}")
        for i, v in enumerate(s["vml_shapes"], 1):
            print(f"VML {i}: {json.dumps(v, ensure_ascii=False)}")
        for i, d in enumerate(s["drawings"], 1):
            print(f"DRAWING {i}: {json.dumps(d, ensure_ascii=False)}")


def controls_brief():
    for s in A["sheets"]:
        if not (s["vml_shapes"] or any(d.get("macro") for d in s["drawings"])):
            continue
        print(f"\n## {s['name']} ({s['codeName']})")
        for v in s["vml_shapes"]:
            print(
                " | ".join(
                    [
                        f"shape={v.get('id')}",
                        f"type={v.get('objectType')}",
                        f"caption={v.get('text')!r}",
                        f"macro={v.get('FmlaMacro') or v.get('Macro')!r}",
                        f"anchor={v.get('Anchor')!r}",
                    ]
                )
            )
        for d in s["drawings"]:
            if d.get("macro"):
                print(f"DRAWING macro={d['macro']!r} name={d.get('name')!r} text={d.get('text')!r} position={d.get('position')}")


def formula_stats():
    funcs = Counter()
    cached_errors = []
    cross_edges = Counter()
    volatile = Counter()
    volatile_names = {"RAND", "RANDBETWEEN", "RANDARRAY", "NOW", "TODAY", "OFFSET", "INDIRECT"}
    sheet_names = {s["name"] for s in A["sheets"]}
    sheet_ref_re = re.compile(r"(?:'((?:[^']|'')+)'|([A-Za-z0-9_가-힣①②③④⑤⑥⑦⑧⑨⑩,]+))!")
    for s in A["sheets"]:
        sf = Counter()
        examples = []
        cross = []
        for c in s["formulas"]:
            f = c["formula"] or ""
            found = [x.upper() for x in re.findall(r"(?<![A-Za-z0-9_.])([A-Za-z_][A-Za-z0-9_.]*)\s*\(", f)]
            funcs.update(found)
            sf.update(found)
            volatile.update(x for x in found if x in volatile_names)
            refs = []
            for m in sheet_ref_re.finditer(f):
                name = (m.group(1) or m.group(2)).replace("''", "'")
                refs.append(name)
                cross_edges[(s["name"], name)] += 1
            if refs:
                cross.append(f"{c['ref']}={f}")
            if isinstance(c["value"], str) and c["value"].startswith("#"):
                cached_errors.append({"sheet": s["name"], "cell": c["ref"], "formula": f, "cached": c["value"]})
            if len(examples) < 8:
                examples.append(f"{c['ref']}={f} -> {c['value']}")
        print(
            f"{s['name']} | formulas={len(s['formulas'])} | functions={dict(sf)} | "
            f"cross_sheet={len(cross)} | examples: {' ; '.join(examples)}"
        )
        if cross:
            print("  CROSS: " + " ; ".join(cross[:8]))
    print("\nFUNCTION TOTALS")
    p(funcs.most_common())
    print("\nVOLATILE")
    p(volatile)
    print("\nCROSS-SHEET EDGES")
    p([{"from": a, "to": b, "formula_cells": n, "target_exists": b in sheet_names} for (a, b), n in cross_edges.most_common()])
    print("\nCACHED FORMULA ERRORS")
    p(cached_errors)


def formula_global():
    funcs = Counter()
    cross_edges = Counter()
    cached_errors = []
    formulas_without_functions = 0
    sheet_ref_re = re.compile(r"(?:'((?:[^']|'')+)'|([A-Za-z0-9_가-힣①②③④⑤⑥⑦⑧⑨⑩,]+))!")
    for s in A["sheets"]:
        for c in s["formulas"]:
            f = c["formula"] or ""
            found = [x.upper() for x in re.findall(r"(?<![A-Za-z0-9_.])([A-Za-z_][A-Za-z0-9_.]*)\s*\(", f)]
            funcs.update(found)
            if not found:
                formulas_without_functions += 1
            for m in sheet_ref_re.finditer(f):
                cross_edges[(s["name"], (m.group(1) or m.group(2)).replace("''", "'"))] += 1
            if isinstance(c["value"], str) and c["value"].startswith("#"):
                cached_errors.append({"sheet": s["name"], "cell": c["ref"], "formula": f, "cached": c["value"]})
    p(
        {
            "function_counts": funcs.most_common(),
            "formulas_without_functions": formulas_without_functions,
            "cross_sheet_edges": [{"from": x[0], "to": x[1], "count": n} for x, n in cross_edges.most_common()],
            "cached_errors": cached_errors,
            "protected_sheets": [s["name"] for s in A["sheets"] if "sheetProtection" in s["print"]],
            "conditional_format_ranges": sum(len(s.get("conditional_formats", [])) for s in A["sheets"]),
            "conditional_format_rules": sum(sum(len(cf["rules"]) for cf in s.get("conditional_formats", [])) for s in A["sheets"]),
        }
    )


def formula_sheet_summary():
    for s in A["sheets"]:
        funcs = Counter()
        for c in s["formulas"]:
            funcs.update(x.upper() for x in re.findall(r"(?<![A-Za-z0-9_.])([A-Za-z_][A-Za-z0-9_.]*)\s*\(", c["formula"] or ""))
        examples = [f"{c['ref']}={c['formula']}" for c in s["formulas"][:5]]
        print(f"{s['index']+1:02d} {s['name']} | {len(s['formulas'])} | {dict(funcs)} | {' ; '.join(examples)}")


def macro_integrity():
    proc_names = defaultdict(list)
    for m in A["vba"]["modules"]:
        for proc in m["procedures"]:
            proc_names[proc["name"].lower()].append(f"{m['name']}.{proc['name']}")
    rows = []
    for s in A["sheets"]:
        for kind, items in [("FormButton", s["vml_shapes"]), ("Drawing", s["drawings"])]:
            for item in items:
                raw = item.get("FmlaMacro") or item.get("Macro") or item.get("macro")
                if not raw:
                    continue
                macro = raw.split("!", 1)[-1].strip("'\"")
                rows.append(
                    {
                        "sheet": s["name"],
                        "sheet_code": s["codeName"],
                        "kind": kind,
                        "shape": item.get("id") or item.get("name"),
                        "anchor": item.get("Anchor") or item.get("position"),
                        "macro_raw": raw,
                        "macro": macro,
                        "resolved": proc_names.get(macro.lower(), []),
                    }
                )
    p(
        {
            "assignment_count": len(rows),
            "unique_macros": sorted(set(x["macro"] for x in rows)),
            "missing": [x for x in rows if not x["resolved"]],
            "resolved": [x for x in rows if x["resolved"]],
            "counts_by_macro": Counter(x["macro"] for x in rows),
        }
    )


def macro_integrity_brief():
    proc_names = defaultdict(list)
    for m in A["vba"]["modules"]:
        for proc in m["procedures"]:
            proc_names[proc["name"].lower()].append(f"{m['name']}.{proc['name']}")
    rows = []
    for s in A["sheets"]:
        for kind, items in [("FormButton", s["vml_shapes"]), ("Drawing", s["drawings"])]:
            for item in items:
                raw = item.get("FmlaMacro") or item.get("Macro") or item.get("macro")
                if not raw:
                    continue
                macro = raw.split("!", 1)[-1].strip("'\"")
                rows.append({"sheet": s["name"], "code": s["codeName"], "kind": kind, "macro": macro, "resolved": proc_names.get(macro.lower(), [])})
    unique = Counter(x["macro"] for x in rows)
    p(
        {
            "assignment_count": len(rows),
            "unique_macro_count": len(unique),
            "counts_by_macro": unique.most_common(),
            "missing_assignments": [x for x in rows if not x["resolved"]],
            "missing_unique": sorted(set(x["macro"] for x in rows if not x["resolved"])),
        }
    )


def userform_targets():
    sheet_names = {s["name"] for s in A["sheets"]}
    rows = []
    for m in A["vba"]["modules"]:
        if m["type"] != "userform":
            continue
        for proc in m["procedures"]:
            targets = re.findall(r"(?i)(?:ThisWorkbook\.)?Sheets\s*\(\s*\"([^\"]+)\"\s*\)", proc["body"])
            rows.append({"form": m["name"], "event": proc["name"], "targets": targets, "all_targets_exist": all(x in sheet_names for x in targets), "lines": [proc["start_line"], proc["end_line"]]})
    p(rows)


def binary_assets():
    printer_unique = Counter()
    by_printer = []
    for part, strings in A.get("printer_strings", {}).items():
        for value in strings:
            printer_unique[value] += 1
        by_printer.append({"part": part, "strings": strings})
    forms = []
    for m in A["vba"]["modules"]:
        if m["type"] == "userform":
            forms.append({"name": m["name"], "streams": m.get("form_streams", [])})
    p({"printer_unique": printer_unique.most_common(), "printer_parts": by_printer, "forms": forms})


def verification():
    proc_names = {p["name"].casefold() for m in A["vba"]["modules"] for p in m["procedures"]}
    assigned = []
    for s in A["sheets"]:
        for item in s["vml_shapes"] + s["drawings"]:
            raw = item.get("FmlaMacro") or item.get("Macro") or item.get("macro")
            if raw:
                assigned.append((s["name"], raw.split("!", 1)[-1].strip("'\"")))
    sheet_names = {s["name"] for s in A["sheets"]}
    invalid_form_targets = []
    for m in A["vba"]["modules"]:
        if m["type"] != "userform":
            continue
        for proc in m["procedures"]:
            for target in re.findall(r"(?i)(?:ThisWorkbook\.)?Sheets\s*\(\s*\"([^\"]+)\"\s*\)", proc["body"]):
                if target not in sheet_names:
                    invalid_form_targets.append((proc["name"], target))
    external_formulas = []
    cached_errors = []
    for s in A["sheets"]:
        for c in s["formulas"]:
            f = c["formula"] or ""
            if re.search(r"\[[^\]]+\].*!", f):
                external_formulas.append((s["name"], c["ref"], f))
            if isinstance(c["value"], str) and c["value"].startswith("#"):
                cached_errors.append((s["name"], c["ref"], c["value"]))
    p(
        {
            "sheet_count": len(A["sheets"]),
            "visible": sum(s["state"] == "visible" for s in A["sheets"]),
            "hidden": sum(s["state"] == "hidden" for s in A["sheets"]),
            "formula_count": sum(len(s["formulas"]) for s in A["sheets"]),
            "protected_sheets": sum("sheetProtection" in s["print"] for s in A["sheets"]),
            "macro_assignments": len(assigned),
            "missing_macro_assignments": [(s, m) for s, m in assigned if m.casefold() not in proc_names],
            "invalid_userform_targets": invalid_form_targets,
            "external_formulas": external_formulas,
            "hyperlinks": sum(len(s["hyperlinks"]) for s in A["sheets"]),
            "cached_formula_errors": cached_errors,
            "printer_pdf_parts": sum("Microsoft Print to PDF" in vals for vals in A.get("printer_strings", {}).values()),
        }
    )


def inputs():
    for s in A["sheets"]:
        unlocked = [c for c in s.get("all_cells", []) if not c.get("locked", True)]
        unlocked_blank = [c["ref"] for c in unlocked if c.get("value") is None and c.get("formula") is None]
        unlocked_values = [f"{c['ref']}={c.get('value')!r}" for c in unlocked if c.get("value") is not None and c.get("formula") is None]
        unlocked_formulas = [f"{c['ref']}={c.get('formula')}" for c in unlocked if c.get("formula") is not None]
        if unlocked:
            print(
                f"{s['name']} | unlocked={len(unlocked)} | blank={','.join(unlocked_blank)} | "
                f"values={' ; '.join(unlocked_values)} | formulas={' ; '.join(unlocked_formulas)}"
            )


def conditional_formats():
    for s in A["sheets"]:
        cfs = s.get("conditional_formats", [])
        if cfs:
            print(f"{s['name']} | ranges={len(cfs)} | rules={sum(len(x['rules']) for x in cfs)}")
            for cf in cfs:
                print(f"  {cf['sqref']} -> {json.dumps(cf['rules'], ensure_ascii=False)}")


def vba_actions():
    op_words = [
        "Calculate", "Randomize", "Font", "Color", "ThemeColor", "Borders", "FormatConditions",
        "Hidden", "Clear", "Copy", "Paste", "Value", "Formula", "Select", "Activate", "PrintOut",
        "xlDialogPrint", "Sheets.Add", "Protect", "Unprotect", "Show", "Unload", "ScreenUpdating", "Calculation",
    ]
    for m in A["vba"]["modules"]:
        for proc in m["procedures"]:
            body = proc["body"]
            ranges = re.findall(r"(?is)Range\s*\(\s*(?:_\s*)?\"([^\"]+)\"(?:\s*_\s*\r?\n\s*\"([^\"]+)\")?\s*\)", body)
            ranges = ["".join(x) for x in ranges]
            sheets = re.findall(r"(?i)(?:Sheets|Worksheets)\s*\(\s*\"([^\"]+)\"\s*\)", body)
            ops = [x for x in op_words if re.search(rf"(?i)\b{re.escape(x)}\b", body)]
            calls = re.findall(r"(?im)^\s*(?:Call\s+)?([A-Za-z_가-힣][\w가-힣]*)\s*(?:\(|$)", body)
            print(
                f"{m['name']}.{proc['name']} [{proc['start_line']}-{proc['end_line']}] | "
                f"sheets={sheets} | ranges={ranges} | ops={ops} | calls={calls}"
            )


def cell_samples():
    for s in A["sheets"]:
        vals = []
        for c in s["cells"]:
            if c["formula"] is None and c["value"] not in (None, ""):
                text = str(c["value"]).replace("\n", " ")
                if not re.fullmatch(r"[-+]?\d+(?:\.\d+)?", text):
                    vals.append(f"{c['ref']}={text[:80]}")
        print(f"\n## {s['name']} [{s['state']}] {s['dimension']}")
        print(" | ".join(vals[:80]))


def formulas():
    funcs = Counter()
    exact = Counter()
    for s in A["sheets"]:
        print(f"\n## {s['name']} ({len(s['formulas'])})")
        for c in s["formulas"]:
            f = c["formula"] or ""
            exact[f] += 1
            funcs.update(x.upper() for x in re.findall(r"(?<![A-Za-z0-9_.])([A-Za-z_][A-Za-z0-9_.]*)\s*\(", f))
            print(f"{c['ref']} = {f} => {c['value']}")
    print("\nFUNCTIONS")
    p(funcs.most_common())
    print("\nEXACT FORMULAS")
    p(exact.most_common(100))


def environment():
    rows = []
    for m in A["vba"]["modules"]:
        deps = m.get("dependencies", {})
        if any(deps.get(k) for k in ["paths", "urls", "shells"]):
            rows.append({"module": m["name"], "type": m["type"], "paths": deps.get("paths"), "urls": deps.get("urls"), "shells": deps.get("shells")})
    p(
        {
            "external_parts": A["external_parts"],
            "hyperlinks": [{"sheet": s["name"], "items": s["hyperlinks"]} for s in A["sheets"] if s["hyperlinks"]],
            "printer_parts": A["printer_parts"],
            "print_settings": [{"sheet": s["name"], "print": s["print"]} for s in A["sheets"] if s["print"]],
            "vba": rows,
            "binary_strings": A["vba"].get("binary_environment_strings"),
            "custom_xml": A["custom_xml"],
        }
    )


def events():
    rows = []
    event_re = re.compile(r"(?i)(?:^|_)(?:open|beforeclose|beforesave|activate|deactivate|change|selectionchange|calculate|followhyperlink|beforedoubleclick|beforerightclick|click|initialize|terminate|queryclose|key(?:down|press|up)|mouse(?:down|move|up)|error)$")
    for m in A["vba"]["modules"]:
        for proc in m["procedures"]:
            if event_re.search(proc["name"]) or m["type"] in {"document", "userform"}:
                rows.append({"module": m["name"], "module_type": m["type"], "procedure": proc["name"], "lines": [proc["start_line"], proc["end_line"]], "body": proc["body"]})
    p(rows)


def procedure_bodies():
    rows = []
    for m in A["vba"]["modules"]:
        for proc in m["procedures"]:
            rows.append({"module": m["name"], "module_type": m["type"], **proc})
    p(rows)


def sheet_detail():
    import sys
    name = sys.argv[2]
    s = next(x for x in A["sheets"] if x["name"] == name)
    p({"name": name, "unlocked": [x for x in s.get("all_cells", []) if not x.get("locked", True)], "formulas": s["formulas"]})


if __name__ == "__main__":
    import sys

    command = sys.argv[1] if len(sys.argv) > 1 else "sheets"
    globals()[command]()
