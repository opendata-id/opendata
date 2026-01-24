# UMK 2026 Official Sources & Scraping Strategy

## Overview
UMK (Upah Minimum Kabupaten/Kota) is set by each province's Governor through **Keputusan Gubernur (Kepgub)**.

## Data Sources Pattern

### Primary Sources (in order of reliability)
1. **JDIH** (jdih.{province}.go.id) - Legal documentation, has PDF of Kepgub
2. **Disnaker** (disnaker.{province}.go.id) - Often has summary tables or links to files
3. **Provincial Gov** ({province}.go.id/berita) - News announcements
4. **Google Drive/Dropbox** - Some provinces share via cloud storage

### Aggregated Sources (for cross-verification)
- **PT GASI PDF**: https://www.ptgasi.co.id/wp-content/uploads/2025/12/DAFTAR-UMK-TAHUN-2026.pdf
  - Contains 142 regions from 12 provinces
  - Cites official Kepgub numbers

---

## Provinces with Confirmed Sources

| No | Province | Kepgub Number | Source URL | Format |
|----|----------|---------------|------------|--------|
| 1 | Jawa Barat | 561.7/Kep.862-Kesra/2025 | jdih.jabarprov.go.id | PDF |
| 2 | Banten | 703/2025 | jdih.bantenprov.go.id | PDF |
| 3 | Jawa Tengah | 100.3.3.1/505/2025 | jdih.jatengprov.go.id | PDF |
| 4 | DI Yogyakarta | 443/2025 | jdih.jogjaprov.go.id | PDF |
| 5 | Jawa Timur | 100.3.3.1/937/013/2025 | jdih.jatimprov.go.id | PDF |
| 6 | Bali | 1021/03-M/HK/2025 | jdih.baliprov.go.id | PDF |
| 7 | Riau | Kpts.1164/XII/2025 | jdih.riau.go.id | PDF |
| 8 | Kepulauan Riau | 1333/2025 | jdih.kepriprov.go.id | PDF |
| 9 | Bengkulu | K.647.DKKTRANS/2025 | jdih.bengkuluprov.go.id | PDF |
| 10 | Kalimantan Selatan | 100.3.3.1/01107/KUM/2025 | jdih.kalselprov.go.id | PDF |
| 11 | Sulawesi Selatan | 2142/XII/2025 | jdih.sulselprov.go.id | PDF |
| 12 | Sulawesi Tengah | 500.15.14.1/486/2025 | jdih.sultengprov.go.id | PDF |
| 13 | Sumatera Utara | 188.44/908/KPTS/2025 | [GDrive](https://drive.google.com/drive/folders/1ZJdOIRCjFIXR4pAEooBKPeL_yc-Cuhau) | PDF |
| 14 | Aceh | TBD | disnakermobduk.acehprov.go.id | PDF |

---

## Provinces Needing Research (24 remaining)

### High Priority (most kab/kota)
| Province | Kab/Kota | JDIH URL | Disnaker URL |
|----------|----------|----------|--------------|
| Sulawesi Selatan | 24 | jdih.sulselprov.go.id | disnaker.sulselprov.go.id |
| Sumatera Barat | 19 | jdih.sumbarprov.go.id | disnaker.sumbarprov.go.id |
| Lampung | 15 | jdih.lampungprov.go.id | disnaker.lampungprov.go.id |
| Sumatera Selatan | 17 | jdih.sumselprov.go.id | disnaker.sumselprov.go.id |
| NTT | 22 | jdih.nttprov.go.id | disnaker.nttprov.go.id |
| NTB | 10 | jdih.ntbprov.go.id | disnaker.ntbprov.go.id |

### Medium Priority
| Province | JDIH URL | Disnaker URL |
|----------|----------|--------------|
| Jambi | jdih.jambiprov.go.id | disnaker.jambiprov.go.id |
| Bangka Belitung | jdih.babelprov.go.id | disnaker.babelprov.go.id |
| Kalimantan Barat | jdih.kalbarprov.go.id | disnaker.kalbarprov.go.id |
| Kalimantan Tengah | jdih.kalteng.go.id | disnaker.kalteng.go.id |
| Kalimantan Timur | jdih.kaltimprov.go.id | disnaker.kaltimprov.go.id |
| Kalimantan Utara | jdih.kaltaraprov.go.id | disnaker.kaltaraprov.go.id |
| Sulawesi Utara | jdih.sulutprov.go.id | disnaker.sulutprov.go.id |
| Sulawesi Tenggara | jdih.sultraprov.go.id | disnaker.sultraprov.go.id |
| Sulawesi Barat | jdih.sulbarprov.go.id | disnaker.sulbarprov.go.id |
| Gorontalo | jdih.gorontaloprov.go.id | disnaker.gorontaloprov.go.id |
| Maluku | jdih.malukuprov.go.id | disnaker.malukuprov.go.id |
| Maluku Utara | jdih.malutprov.go.id | disnaker.malutprov.go.id |

### Special Cases
| Province | Notes |
|----------|-------|
| DKI Jakarta | Only UMP (no UMK - single region) |
| Papua | New provinces split in 2022 |
| Papua Barat | May use old province data |
| Papua Barat Daya | New province |
| Papua Tengah | New province |
| Papua Pegunungan | New province |
| Papua Selatan | New province |

---

## Scraping Script Strategy

### Phase 1: Download existing compiled data
```python
# Sources to download:
# 1. PT GASI PDF (142 regions) ✅ Downloaded
# 2. Sumatera Utara GDrive PDFs
# 3. SatuData Kemnaker UMP Excel
```

### Phase 2: JDIH Scraper (for provinces with JDIH)
```python
# Pattern: jdih.{province}.go.id
# Search: "keputusan gubernur" + "upah minimum" + "2026"
# Download: PDF attachment
# Parse: Extract table from PDF
```

### Phase 3: Disnaker Scraper (fallback)
```python
# Pattern: disnaker.{province}.go.id
# Look for: /berita/, /artikel/, /publikasi/
# Find: Links to PDFs or Google Drive
```

### Phase 4: Manual verification
- Cross-check with PT GASI data
- Verify Kepgub numbers match
- Flag discrepancies

---

## Sample UMK 2026 Data (from PT GASI PDF)

### Top 10 Highest UMK 2026
| Rank | Region | Province | UMK 2026 |
|------|--------|----------|----------|
| 1 | Kota Bekasi | Jawa Barat | 5,999,443 |
| 2 | Kabupaten Bekasi | Jawa Barat | 5,938,885 |
| 3 | Kabupaten Karawang | Jawa Barat | 5,886,853 |
| 4 | Kota Depok | Jawa Barat | 5,522,662 |
| 5 | Kota Cilegon | Banten | 5,469,923 |
| 6 | Kota Bogor | Jawa Barat | 5,437,203 |
| 7 | Kota Tangerang | Banten | 5,399,406 |
| 8 | Kota Batam | Kepulauan Riau | 5,357,982 |
| 9 | Kota Surabaya | Jawa Timur | 5,288,796 |
| 10 | Kota Tangerang Selatan | Banten | 5,247,870 |

---

## Next Steps
1. [ ] Create JDIH scraper script
2. [ ] Create PDF parser for Kepgub documents
3. [ ] Build province-by-province data collection pipeline
4. [ ] Implement data validation against PT GASI baseline
5. [ ] Set up scheduled updates for future years
