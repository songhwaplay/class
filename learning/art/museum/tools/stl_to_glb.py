import argparse
import json
import struct
from pathlib import Path

import numpy as np


def load_binary_stl(path: Path) -> np.ndarray:
    data = path.read_bytes()
    if len(data) < 84:
        raise ValueError(f"Invalid STL: {path}")
    triangle_count = struct.unpack_from("<I", data, 80)[0]
    expected = 84 + triangle_count * 50
    if expected > len(data):
        raise ValueError("Only binary STL files are supported")
    record = np.dtype([
        ("normal", "<f4", (3,)),
        ("vertices", "<f4", (3, 3)),
        ("attribute", "<u2"),
    ])
    triangles = np.frombuffer(data, dtype=record, count=triangle_count, offset=84)
    return triangles["vertices"].reshape(-1, 3).astype(np.float32)


def orient_z_up(vertices: np.ndarray) -> np.ndarray:
    # Printable sculpture scans use Z-up. Convert to glTF/Three.js Y-up.
    oriented = vertices[:, [0, 2, 1]].copy()
    oriented[:, 2] *= -1
    return oriented


def cluster_mesh(vertices: np.ndarray, resolution: int):
    vertices = orient_z_up(vertices)
    low = vertices.min(axis=0)
    high = vertices.max(axis=0)
    height = max(float(high[1] - low[1]), 1e-6)
    vertices[:, 0] -= (low[0] + high[0]) * 0.5
    vertices[:, 2] -= (low[2] + high[2]) * 0.5
    vertices[:, 1] -= low[1]
    vertices /= height

    bounds_low = vertices.min(axis=0)
    bounds_high = vertices.max(axis=0)
    longest = max(float((bounds_high - bounds_low).max()), 1e-6)
    cells = np.rint((vertices - bounds_low) / longest * resolution).astype(np.int16)
    unique_cells, inverse = np.unique(cells, axis=0, return_inverse=True)

    sums = np.zeros((len(unique_cells), 3), dtype=np.float64)
    counts = np.bincount(inverse, minlength=len(unique_cells)).astype(np.float64)
    for axis in range(3):
        sums[:, axis] = np.bincount(inverse, weights=vertices[:, axis], minlength=len(unique_cells))
    reduced_vertices = (sums / counts[:, None]).astype(np.float32)

    faces = inverse.reshape(-1, 3).astype(np.uint32)
    valid = (faces[:, 0] != faces[:, 1]) & (faces[:, 1] != faces[:, 2]) & (faces[:, 0] != faces[:, 2])
    faces = faces[valid]
    canonical = np.sort(faces, axis=1)
    _, keep = np.unique(canonical, axis=0, return_index=True)
    faces = faces[np.sort(keep)]
    return reduced_vertices, faces.reshape(-1)


def pad4(data: bytes, byte: bytes) -> bytes:
    return data + byte * ((4 - len(data) % 4) % 4)


def write_glb(path: Path, positions: np.ndarray, indices: np.ndarray):
    position_bytes = pad4(positions.astype("<f4").tobytes(), b"\x00")
    index_bytes = pad4(indices.astype("<u4").tobytes(), b"\x00")
    binary = position_bytes + index_bytes
    document = {
        "asset": {"version": "2.0", "generator": "museum stl_to_glb vertex clustering"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0}],
        "meshes": [{"primitives": [{"attributes": {"POSITION": 0}, "indices": 1}]}],
        "buffers": [{"byteLength": len(binary)}],
        "bufferViews": [
            {"buffer": 0, "byteOffset": 0, "byteLength": len(position_bytes), "target": 34962},
            {"buffer": 0, "byteOffset": len(position_bytes), "byteLength": len(index_bytes), "target": 34963},
        ],
        "accessors": [
            {
                "bufferView": 0,
                "componentType": 5126,
                "count": len(positions),
                "type": "VEC3",
                "min": positions.min(axis=0).astype(float).tolist(),
                "max": positions.max(axis=0).astype(float).tolist(),
            },
            {"bufferView": 1, "componentType": 5125, "count": len(indices), "type": "SCALAR"},
        ],
    }
    json_bytes = pad4(json.dumps(document, separators=(",", ":")).encode("utf-8"), b" ")
    total_length = 12 + 8 + len(json_bytes) + 8 + len(binary)
    glb = struct.pack("<III", 0x46546C67, 2, total_length)
    glb += struct.pack("<II", len(json_bytes), 0x4E4F534A) + json_bytes
    glb += struct.pack("<II", len(binary), 0x004E4942) + binary
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(glb)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("target", type=Path)
    parser.add_argument("--resolution", type=int, default=105)
    args = parser.parse_args()
    positions, indices = cluster_mesh(load_binary_stl(args.source), args.resolution)
    write_glb(args.target, positions, indices)
    print(f"{args.target}: {len(positions):,} vertices, {len(indices) // 3:,} triangles, {args.target.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
