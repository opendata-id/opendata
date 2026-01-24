#!/usr/bin/env python3
"""
Download BIG (Badan Informasi Geospasial) kabupaten/kota boundaries.
Source: https://rkurniawan.blog/2025/05/01/unduh-file-geojson-batas-administrasi-pemekaran-38-provinsi-indonesia/

Dependencies: pip install requests beautifulsoup4 gdown
"""

import json
import re
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from threading import Lock

import requests
from bs4 import BeautifulSoup

PROJECT_ROOT = Path(__file__).parent.parent.parent
OUTPUT_DIR = PROJECT_ROOT / "data/raw/big_kabkota"
EXTRACTED_DIR = OUTPUT_DIR / "extracted"
STATE_FILE = OUTPUT_DIR / "download_state.json"

BLOG_URL = "https://rkurniawan.blog/2025/05/01/unduh-file-geojson-batas-administrasi-pemekaran-38-provinsi-indonesia/"


def scrape_links() -> list[dict]:
    """Scrape download links from blog page."""
    print(f"Fetching {BLOG_URL}")
    resp = requests.get(BLOG_URL, timeout=30)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    table = soup.find("table")
    if not table:
        raise ValueError("No table found on page")

    links = []
    rows = table.find_all("tr")[1:]  # skip header

    for row in rows:
        cells = row.find_all("td")
        if len(cells) < 4:
            continue

        no = cells[0].get_text(strip=True)
        province = cells[1].get_text(strip=True)
        kabkota = cells[2].get_text(strip=True)
        link_elem = cells[3].find("a")

        if not link_elem:
            continue

        href = link_elem.get("href", "")
        file_id_match = re.search(r"id=([a-zA-Z0-9_-]+)", href)
        if not file_id_match:
            file_id_match = re.search(r"/d/([a-zA-Z0-9_-]+)", href)
        if not file_id_match:
            print(f"  Warning: no file ID in {href}")
            continue

        file_id = file_id_match.group(1)
        links.append({
            "no": no,
            "province": province,
            "kabkota": kabkota,
            "file_id": file_id,
            "url": f"https://drive.google.com/uc?id={file_id}",
        })

    print(f"Found {len(links)} download links")
    return links


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"downloaded": [], "extracted": []}


def save_state(state: dict):
    STATE_FILE.write_text(json.dumps(state, indent=2))


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


def download_gdrive_file(file_id: str, output_path: Path, session: requests.Session) -> bool:
    """Download a file from Google Drive handling confirmation prompts."""
    url = f"https://drive.google.com/uc?export=download&id={file_id}"

    resp = session.get(url, headers=HEADERS, stream=True, timeout=60)

    # Check for virus scan warning / confirmation page
    if "text/html" in resp.headers.get("Content-Type", ""):
        # Look for confirmation token
        for key, value in resp.cookies.items():
            if key.startswith("download_warning"):
                url = f"https://drive.google.com/uc?export=download&confirm={value}&id={file_id}"
                resp = session.get(url, headers=HEADERS, stream=True, timeout=60)
                break
        else:
            # Try confirm=t approach
            url = f"https://drive.google.com/uc?export=download&confirm=t&id={file_id}"
            resp = session.get(url, headers=HEADERS, stream=True, timeout=60)

    if resp.status_code != 200:
        raise Exception(f"HTTP {resp.status_code}")

    # Check if we got actual file content
    content_type = resp.headers.get("Content-Type", "")
    if "text/html" in content_type:
        raise Exception("Got HTML instead of file - access denied or rate limited")

    with open(output_path, 'wb') as f:
        for chunk in resp.iter_content(chunk_size=32768):
            if chunk:
                f.write(chunk)

    return True


state_lock = Lock()


def download_one(item: dict, state: dict, idx: int, total: int) -> tuple[bool, dict]:
    """Download a single file. Returns (success, item)."""
    file_id = item["file_id"]

    with state_lock:
        if file_id in state["downloaded"]:
            return True, item

    safe_name = re.sub(r'[^\w\-_.]', '_', item["kabkota"])
    output_path = OUTPUT_DIR / f"{safe_name}.zip"

    try:
        session = requests.Session()
        download_gdrive_file(file_id, output_path, session)

        with state_lock:
            state["downloaded"].append(file_id)
            save_state(state)

        print(f"[{idx}/{total}] ✓ {item['kabkota']} ({item['province']})")
        return True, item
    except Exception as e:
        print(f"[{idx}/{total}] ✗ {item['kabkota']}: {e}")
        return False, item


def download_all(links: list[dict], delay: float = 1.5, workers: int = 5):
    """Download all ZIP files from Google Drive with parallel workers."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    state = load_state()

    pending = [(i+1, item) for i, item in enumerate(links)
               if item["file_id"] not in state["downloaded"]]

    print(f"\nDownloading {len(pending)} files ({len(state['downloaded'])} already done)")
    print(f"Using {workers} parallel workers\n")

    failed = []

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(download_one, item, state, idx, len(links)): item
            for idx, item in pending
        }

        for future in as_completed(futures):
            success, item = future.result()
            if not success:
                failed.append(item)
            time.sleep(delay / workers)

    print(f"\nDownloaded {len(state['downloaded'])} files total")
    if failed:
        print(f"Failed: {len(failed)} files")
        failed_file = OUTPUT_DIR / "failed_downloads.json"
        failed_file.write_text(json.dumps(failed, indent=2, ensure_ascii=False))
        print(f"Failed list saved to {failed_file}")


def extract_all():
    """Extract kabupaten-level GeoJSON from ZIP files."""
    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
    state = load_state()

    zip_files = list(OUTPUT_DIR.glob("*.zip"))
    print(f"\nExtracting {len(zip_files)} ZIP files to {EXTRACTED_DIR}")

    for i, zip_path in enumerate(zip_files):
        if zip_path.name in state["extracted"]:
            continue

        print(f"[{i+1}/{len(zip_files)}] {zip_path.name}")
        try:
            with zipfile.ZipFile(zip_path, 'r') as zf:
                for name in zf.namelist():
                    if not name.endswith('.geojson'):
                        continue
                    if '_kecamatan' in name.lower() or '_kelurahan' in name.lower():
                        continue
                    zf.extract(name, EXTRACTED_DIR)
                    print(f"  Extracted: {name}")

            state["extracted"].append(zip_path.name)
            save_state(state)
        except Exception as e:
            print(f"  Error: {e}")

    print(f"\nExtracted {len(state['extracted'])} files")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Download BIG region boundaries")
    parser.add_argument("--scrape-only", action="store_true", help="Only scrape links, don't download")
    parser.add_argument("--extract-only", action="store_true", help="Only extract already downloaded ZIPs")
    parser.add_argument("--delay", type=float, default=0.5, help="Delay between downloads (seconds)")
    parser.add_argument("--workers", type=int, default=5, help="Number of parallel download workers")
    args = parser.parse_args()

    if args.extract_only:
        extract_all()
        return

    links = scrape_links()

    links_file = OUTPUT_DIR / "links.json"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    links_file.write_text(json.dumps(links, indent=2, ensure_ascii=False))
    print(f"Saved links to {links_file}")

    if args.scrape_only:
        return

    download_all(links, delay=args.delay, workers=args.workers)
    extract_all()
    print("\nDone!")


if __name__ == "__main__":
    main()
