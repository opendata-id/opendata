#!/usr/bin/env python3
"""
Monitor JDIH APIs for new UMK (Upah Minimum Kabupaten/Kota) documents.

Uses official JDIH APIs to check for new regulations daily.
Downloads PDFs when UMK documents are detected.

Usage:
    python tools/scripts/monitor_jdih.py                    # Check all provinces
    python tools/scripts/monitor_jdih.py --province jatim   # Check specific province
    python tools/scripts/monitor_jdih.py --status           # Show monitoring status
    python tools/scripts/monitor_jdih.py --download         # Download new PDFs
"""

import argparse
import hashlib
import json
import logging
import re
import sys
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin

import requests

PROJECT_ROOT = Path(__file__).parent.parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw"
UMK_DIR = RAW_DIR / "umk"
STATE_FILE = RAW_DIR / "jdih_monitor_state.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

PROVINCES = {
    "jatim": {
        "name": "Jawa Timur",
        "api_url": "https://api.jdih.jatimprov.go.id/api/v2/topics",
        "section_id": 10,
        "pdf_field": "Lampiran",
        "parser": "jatim",
    },
    "bengkulu": {
        "name": "Bengkulu",
        "api_url": "https://jdih.bengkuluprov.go.id/api/documents",
        "parser": "bengkulu",
    },
    "ntb": {
        "name": "Nusa Tenggara Barat",
        "api_url": "https://jdih.ntbprov.go.id/api/produk-hukum",
        "parser": "ntb",
    },
}

UMK_KEYWORDS = ["upah minimum"]


@dataclass
class UMKDocument:
    id: int | str
    title: str
    province: str
    date: str
    pdf_url: str | None
    kepgub_number: str | None
    year: int | None
    downloaded: bool = False
    local_path: str | None = None


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"seen_ids": {}, "umk_documents": [], "last_check": {}}


def save_state(state: dict) -> None:
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


def is_umk_document(title: str) -> bool:
    title_lower = title.lower()
    return any(kw in title_lower for kw in UMK_KEYWORDS)


def extract_year(title: str) -> int | None:
    match = re.search(r"tahun\s*(\d{4})", title, re.I)
    if match:
        return int(match.group(1))
    match = re.search(r"20\d{2}", title)
    if match:
        return int(match.group())
    return None


def extract_kepgub_number(title: str) -> str | None:
    match = re.search(r"(?:nomor|nomer|no\.?)\s*([\d./\-A-Za-z]+)", title, re.I)
    return match.group(1) if match else None


def fetch_jatim(config: dict, pages: int = 3, per_page: int = 100) -> list[dict]:
    """Fetch documents from Jawa Timur JDIH API (scans first N pages)."""
    url = config["api_url"]
    all_items = []

    for page in range(1, pages + 1):
        params = {
            "per_page": per_page,
            "page": page,
            "webmaster_section_id": config["section_id"],
            "sort_by": "date",
            "sort_order": "desc",
        }

        try:
            resp = requests.get(url, params=params, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            items = data.get("data", {}).get("data", [])
            all_items.extend(items)
            logger.debug(f"  Page {page}: {len(items)} items")
        except Exception as e:
            logger.error(f"Failed to fetch page {page}: {e}")
            break

    return all_items


def fetch_bengkulu(config: dict) -> list[dict]:
    """Fetch documents from Bengkulu JDIH API."""
    url = config["api_url"]
    params = {"search": "upah minimum"}

    try:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Failed to fetch Bengkulu: {e}")
        return []


def fetch_ntb(config: dict, pages: int = 3, per_page: int = 100) -> list[dict]:
    """Fetch documents from NTB JDIH API."""
    url = config["api_url"]
    all_items = []

    for page in range(1, pages + 1):
        params = {"per_page": per_page, "page": page, "search": "upah minimum"}

        try:
            resp = requests.get(url, params=params, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            items = data.get("data", [])
            all_items.extend(items)
            if not items:
                break
        except Exception as e:
            logger.error(f"Failed to fetch NTB page {page}: {e}")
            break

    return all_items


def parse_jatim_document(item: dict) -> UMKDocument | None:
    """Parse a Jatim API document into UMKDocument."""
    title = item.get("title", "")

    if not is_umk_document(title):
        return None

    pdf_url = None
    for field in item.get("fields", []):
        if "lampiran" in field.get("title", "").lower():
            pdf_url = field.get("details")
            break

    return UMKDocument(
        id=item.get("id"),
        title=title,
        province="jatim",
        date=item.get("date", ""),
        pdf_url=pdf_url,
        kepgub_number=extract_kepgub_number(title),
        year=extract_year(title),
    )


def parse_bengkulu_document(item: dict) -> UMKDocument | None:
    """Parse a Bengkulu API document into UMKDocument."""
    title = item.get("judul", "")

    if not is_umk_document(title):
        return None

    return UMKDocument(
        id=item.get("idData"),
        title=title,
        province="bengkulu",
        date=item.get("tanggal_pengundangan", ""),
        pdf_url=item.get("urlDownload"),
        kepgub_number=extract_kepgub_number(title),
        year=item.get("tahun_pengundangan") or extract_year(title),
    )


def parse_ntb_document(item: dict) -> UMKDocument | None:
    """Parse an NTB API document into UMKDocument."""
    title = item.get("judul", "")
    desc = item.get("deskripsi", "")
    combined = f"{title} {desc}"

    if not is_umk_document(combined):
        return None

    return UMKDocument(
        id=item.get("id"),
        title=f"{title} - {desc}" if desc else title,
        province="ntb",
        date=item.get("tgl_penetapan", ""),
        pdf_url=None,
        kepgub_number=extract_kepgub_number(title),
        year=int(item.get("tahun")) if item.get("tahun") else extract_year(title),
    )


FETCHERS = {
    "jatim": fetch_jatim,
    "bengkulu": fetch_bengkulu,
    "ntb": fetch_ntb,
}

PARSERS = {
    "jatim": parse_jatim_document,
    "bengkulu": parse_bengkulu_document,
    "ntb": parse_ntb_document,
}


def check_province(province_code: str, download: bool = False) -> list[UMKDocument]:
    """Check a province for new UMK documents."""
    if province_code not in PROVINCES:
        logger.error(f"Unknown province: {province_code}")
        return []

    config = PROVINCES[province_code]
    parser_name = config.get("parser", province_code)

    if parser_name not in FETCHERS:
        logger.warning(f"API not implemented for {province_code}")
        return []

    state = load_state()
    logger.info(f"Checking {config['name']}...")

    items = FETCHERS[parser_name](config)
    parser = PARSERS[parser_name]

    new_docs = []
    seen_key = f"{province_code}_ids"

    if seen_key not in state["seen_ids"]:
        state["seen_ids"][seen_key] = []

    for item in items:
        doc = parser(item)

        if not doc:
            continue

        doc_id = str(doc.id)
        if doc_id in state["seen_ids"][seen_key]:
            continue

        state["seen_ids"][seen_key].append(doc_id)
        logger.info(f"  NEW: {doc.title[:70]}...")

        if download and doc.pdf_url:
            local_path = download_pdf(doc)
            if local_path:
                doc.downloaded = True
                doc.local_path = str(local_path)

        new_docs.append(doc)
        state["umk_documents"].append(asdict(doc))

    state["last_check"][province_code] = datetime.now().isoformat()
    save_state(state)

    return new_docs


def download_pdf(doc: UMKDocument) -> Path | None:
    """Download PDF for a UMK document."""
    if not doc.pdf_url:
        return None

    year = doc.year or datetime.now().year
    year_dir = UMK_DIR / str(year)
    year_dir.mkdir(parents=True, exist_ok=True)

    doc_type = "umk"
    title_lower = doc.title.lower()
    if "sektoral kabupaten" in title_lower or "sektoral kota" in title_lower:
        doc_type = "umsk"
    elif "sektoral provinsi" in title_lower:
        doc_type = "umsp"
    elif "provinsi" in title_lower and "kabupaten" not in title_lower:
        doc_type = "ump"

    kepgub = doc.kepgub_number.replace("/", "-") if doc.kepgub_number else str(doc.id)
    filename = f"{doc.province}_{doc_type}_{year}_{kepgub}.pdf"
    filepath = year_dir / filename

    try:
        logger.info(f"  Downloading {doc.pdf_url}...")
        resp = requests.get(doc.pdf_url, timeout=60)
        resp.raise_for_status()
        filepath.write_bytes(resp.content)
        logger.info(f"  Saved to {filepath}")
        return filepath
    except Exception as e:
        logger.error(f"  Download failed: {e}")
        return None


def check_all(download: bool = False) -> dict[str, list[UMKDocument]]:
    """Check all provinces."""
    results = {}
    for code in PROVINCES:
        docs = check_province(code, download=download)
        if docs:
            results[code] = docs
    return results


def print_status():
    """Print monitoring status."""
    state = load_state()

    print("\n=== JDIH UMK Monitor Status ===\n")

    for code, config in PROVINCES.items():
        last = state.get("last_check", {}).get(code, "Never")
        seen = len(state.get("seen_ids", {}).get(f"{code}_ids", []))
        print(f"{config['name']} ({code}):")
        print(f"  Last check: {last}")
        print(f"  Documents seen: {seen}")

    umk_docs = state.get("umk_documents", [])
    print(f"\nTotal UMK documents found: {len(umk_docs)}")

    if umk_docs:
        print("\nRecent UMK documents:")
        for doc in umk_docs[-5:]:
            print(f"  [{doc['province']}] {doc['title'][:60]}...")
            if doc.get("pdf_url"):
                print(f"    PDF: {doc['pdf_url']}")
            if doc.get("local_path"):
                print(f"    Local: {doc['local_path']}")


def main():
    parser = argparse.ArgumentParser(description="Monitor JDIH for UMK documents")
    parser.add_argument("--province", "-p", help="Province code (jatim, jabar, etc)")
    parser.add_argument("--status", "-s", action="store_true", help="Show status")
    parser.add_argument("--download", "-d", action="store_true", help="Download PDFs")
    parser.add_argument("--list", "-l", action="store_true", help="List provinces")
    args = parser.parse_args()

    if args.list:
        print("Configured provinces:")
        for code, config in PROVINCES.items():
            api_status = "API ready" if "api_url" in config else "Not implemented"
            print(f"  {code}: {config['name']} ({api_status})")
        return

    if args.status:
        print_status()
        return

    if args.province:
        new_docs = check_province(args.province, download=args.download)
    else:
        results = check_all(download=args.download)
        new_docs = [d for docs in results.values() for d in docs]

    if new_docs:
        print(f"\n=== Found {len(new_docs)} new UMK document(s) ===\n")
        for doc in new_docs:
            print(f"[{doc.province}] {doc.title}")
            if doc.pdf_url:
                print(f"  PDF: {doc.pdf_url}")
            if doc.downloaded:
                print(f"  Downloaded: {doc.local_path}")
    else:
        print("No new UMK documents found.")


if __name__ == "__main__":
    main()
