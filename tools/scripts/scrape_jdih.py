#!/usr/bin/env python3
"""
Scrape JDIH sites that don't have public APIs.

Uses requests + BeautifulSoup to extract UMK documents and PDF links.
"""

import re
import json
import logging
from dataclasses import dataclass, asdict
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).parent.parent.parent
OUTPUT_DIR = PROJECT_ROOT / "data" / "raw" / "jdih_scraped"


@dataclass
class ScrapedDocument:
    province: str
    title: str
    url: str
    pdf_url: str | None = None
    year: int | None = None
    doc_number: str | None = None


class JDIHScraper:
    def __init__(self, timeout: int = 30):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        })
        self.timeout = timeout

    def get_soup(self, url: str) -> BeautifulSoup:
        resp = self.session.get(url, timeout=self.timeout)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")

    def extract_year(self, text: str) -> int | None:
        match = re.search(r"(?:tahun\s*)?(\d{4})", text, re.I)
        return int(match.group(1)) if match else None

    def extract_doc_number(self, text: str) -> str | None:
        match = re.search(r"(?:nomor|no\.?)\s*([\d./\-]+)", text, re.I)
        return match.group(1) if match else None


class JatengScraper(JDIHScraper):
    """Scraper for jdih.jatengprov.go.id"""

    BASE_URL = "https://jdih.jatengprov.go.id"

    def search_umk(self) -> list[dict]:
        """Search for UMK documents."""
        url = f"{self.BASE_URL}/pencarian/pencarian?dokumen=upah+minimum"
        soup = self.get_soup(url)
        results = []
        seen_urls = set()

        for h4 in soup.select("h4"):
            link = h4.select_one("a[href*='/inventarisasi-hukum/detail/']")
            if not link:
                continue

            title = link.get_text(strip=True)
            href = link.get("href")
            full_url = href if href.startswith("http") else urljoin(self.BASE_URL, href)

            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)

            if title:
                results.append({"title": title, "url": full_url})

        logger.info(f"Jateng: Found {len(results)} UMK documents")
        return results

    def get_pdf_url(self, detail_url: str) -> str | None:
        """Extract PDF download URL from detail page."""
        soup = self.get_soup(detail_url)

        # Look for download link
        download_link = soup.select_one("a[href*='/download/']")
        if download_link:
            href = download_link.get("href")
            return href if href.startswith("http") else urljoin(self.BASE_URL, href)

        # Look for PDF in iframe
        iframe = soup.select_one("iframe[src*='.pdf']")
        if iframe:
            return iframe.get("src")

        return None

    def scrape(self) -> list[ScrapedDocument]:
        """Scrape all UMK documents."""
        docs = []
        for item in self.search_umk():
            pdf_url = self.get_pdf_url(item["url"])
            docs.append(ScrapedDocument(
                province="jateng",
                title=item["title"],
                url=item["url"],
                pdf_url=pdf_url,
                year=self.extract_year(item["title"]),
                doc_number=self.extract_doc_number(item["title"]),
            ))
        return docs


class JakartaScraper(JDIHScraper):
    """Scraper for jdih.jakarta.go.id"""

    BASE_URL = "https://jdih.jakarta.go.id"

    def search_umk(self, max_pages: int = 5) -> list[dict]:
        """Search for UMK documents via pencarianCepat with pagination."""
        results = []
        seen_urls = set()

        for page in range(1, max_pages + 1):
            url = f"{self.BASE_URL}/pencarianCepat?judul=upah+minimum&tipe_dokumen=PU&page={page}"
            try:
                soup = self.get_soup(url)
            except Exception as e:
                logger.warning(f"Jakarta page {page} failed: {e}")
                break

            page_results = 0
            for link in soup.select("a[href*='/dokumen/detail/']"):
                href = link.get("href")
                if not href or href in seen_urls:
                    continue

                title_el = link.select_one("p")
                if title_el:
                    title = title_el.get_text(strip=True)
                else:
                    title = link.get_text(strip=True)

                if not title or len(title) < 10:
                    continue

                full_url = href if href.startswith("http") else urljoin(self.BASE_URL, href)
                seen_urls.add(href)
                results.append({"title": title, "url": full_url})
                page_results += 1

            if page_results == 0:
                break

        logger.info(f"Jakarta: Found {len(results)} UMK documents")
        return results

    def get_pdf_url(self, detail_url: str) -> str | None:
        """Extract PDF URL from detail page."""
        soup = self.get_soup(detail_url)

        # Look for PDF in iframe
        iframe = soup.select_one("iframe[src*='.pdf']")
        if iframe:
            return iframe.get("src")

        # Look for download-fulltext link
        download_link = soup.select_one("a[href*='/download-fulltext/']")
        if download_link:
            href = download_link.get("href")
            return href if href.startswith("http") else urljoin(self.BASE_URL, href)

        # Look for direct PDF link
        pdf_link = soup.select_one("a[href*='.pdf']")
        if pdf_link:
            href = pdf_link.get("href")
            return href if href.startswith("http") else urljoin(self.BASE_URL, href)

        return None

    def scrape(self) -> list[ScrapedDocument]:
        """Scrape all UMK documents."""
        docs = []
        for item in self.search_umk():
            pdf_url = self.get_pdf_url(item["url"])
            docs.append(ScrapedDocument(
                province="jakarta",
                title=item["title"],
                url=item["url"],
                pdf_url=pdf_url,
                year=self.extract_year(item["title"]),
                doc_number=self.extract_doc_number(item["title"]),
            ))
        return docs


class KaltimScraper(JDIHScraper):
    """Scraper for jdih.kaltimprov.go.id"""

    BASE_URL = "https://jdih.kaltimprov.go.id"

    def search_umk(self) -> list[dict]:
        """Get UMK documents from homepage and search."""
        soup = self.get_soup(self.BASE_URL)
        results = []
        seen_urls = set()

        for link in soup.select("a[href*='/dokumen/']"):
            href = link.get("href")
            if not href or href in seen_urls:
                continue

            text = link.get_text(strip=True)
            parent = link.find_parent()
            if parent:
                parent_text = parent.get_text(strip=True)
                if "upah minimum" in parent_text.lower():
                    full_url = href if href.startswith("http") else urljoin(self.BASE_URL, href)
                    seen_urls.add(href)
                    title = parent_text[:200] if len(parent_text) > 20 else text
                    results.append({"title": title, "url": full_url})

        logger.info(f"Kaltim: Found {len(results)} UMK documents")
        return results

    def get_pdf_url(self, detail_url: str) -> str | None:
        """Extract PDF URL from detail page."""
        soup = self.get_soup(detail_url)

        pdf_link = soup.select_one("a[href*='/storage/dokumen/'][href$='.pdf']")
        if pdf_link:
            return pdf_link.get("href")

        img_pdf = soup.select_one("img[data-pdf-thumbnail-file]")
        if img_pdf:
            return img_pdf.get("data-pdf-thumbnail-file")

        return None

    def scrape(self) -> list[ScrapedDocument]:
        """Scrape all UMK documents."""
        docs = []
        for item in self.search_umk():
            pdf_url = self.get_pdf_url(item["url"])
            docs.append(ScrapedDocument(
                province="kaltim",
                title=item["title"],
                url=item["url"],
                pdf_url=pdf_url,
                year=self.extract_year(item["title"]),
                doc_number=self.extract_doc_number(item["title"]),
            ))
        return docs


SCRAPERS = {
    "jateng": JatengScraper,
    "jakarta": JakartaScraper,
    "kaltim": KaltimScraper,
}


def scrape_province(province: str) -> list[ScrapedDocument]:
    """Scrape a single province."""
    if province not in SCRAPERS:
        logger.error(f"No scraper for province: {province}")
        return []

    scraper = SCRAPERS[province]()
    return scraper.scrape()


def scrape_all() -> dict[str, list[ScrapedDocument]]:
    """Scrape all configured provinces."""
    results = {}
    for province in SCRAPERS:
        try:
            docs = scrape_province(province)
            if docs:
                results[province] = docs
        except Exception as e:
            logger.error(f"Failed to scrape {province}: {e}")
    return results


def save_results(results: dict[str, list[ScrapedDocument]]):
    """Save scraped results to JSON."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for province, docs in results.items():
        output_file = OUTPUT_DIR / f"{province}_umk.json"
        data = [asdict(d) for d in docs]
        output_file.write_text(json.dumps(data, indent=2, ensure_ascii=False))
        logger.info(f"Saved {len(docs)} documents to {output_file}")


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Scrape JDIH sites for UMK documents")
    parser.add_argument("--province", "-p", help="Province to scrape (jateng, jakarta)")
    parser.add_argument("--list", "-l", action="store_true", help="List available scrapers")
    parser.add_argument("--save", "-s", action="store_true", help="Save results to JSON")
    args = parser.parse_args()

    if args.list:
        print("Available scrapers:")
        for code in SCRAPERS:
            print(f"  {code}")
        return

    if args.province:
        docs = scrape_province(args.province)
        results = {args.province: docs} if docs else {}
    else:
        results = scrape_all()

    for province, docs in results.items():
        print(f"\n=== {province.upper()} ({len(docs)} documents) ===")
        for doc in docs:
            print(f"  [{doc.year}] {doc.title[:60]}...")
            if doc.pdf_url:
                print(f"    PDF: {doc.pdf_url[:80]}...")

    if args.save and results:
        save_results(results)


if __name__ == "__main__":
    main()
