"""Prepare documented single-table imports without copying development sessions."""

import hashlib
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent.parent
source = root / "migration-private/readiness/development-snapshot.zip"
destination = root / "migration-private/readiness/production-data"
destination.mkdir(parents=True, exist_ok=True)
tables = ("brandLogos", "featureFlags", "users", "authAccounts")
with zipfile.ZipFile(source) as snapshot:
    counts = {}
    documents = {}
    for table in tables:
        raw = snapshot.read(f"{table}/documents.jsonl")
        rows = [json.loads(line) for line in raw.decode().splitlines() if line.strip()]
        counts[table] = len(rows)
        documents[table] = rows
        (destination / f"{table}.jsonl").write_bytes(raw)
    if counts["users"] != 1 or counts["authAccounts"] != 1:
        raise RuntimeError("Expected one owner and one password account.")
    owner = documents["users"][0]
    account = documents["authAccounts"][0]
    if account.get("userId") != owner["_id"] or account.get("provider") != "password":
        raise RuntimeError("Owner account references do not match.")
    if not all(row["src"].startswith("https://imagedelivery.net/") for row in documents["brandLogos"]):
        raise RuntimeError("A logo still depends on the old storage service.")
    assets = [json.loads(line) for line in snapshot.read("siteAssets/documents.jsonl").decode().splitlines() if line.strip()]
    resume = next(row for row in assets if row["name"] == "resume")
    files = [name for name in snapshot.namelist() if name.startswith("_storage/" + resume["storageId"]) and not name.endswith("/")]
    if len(files) != 1:
        raise RuntimeError("Resume file is missing from the snapshot.")
    pdf = snapshot.read(files[0])
    if not pdf.startswith(b"%PDF-") or len(pdf) > 10 * 1024 * 1024:
        raise RuntimeError("Resume is not a supported PDF.")
    (destination / "resume.pdf").write_bytes(pdf)
    report = {"target": "animated-roadrunner-856", "tables": counts, "resumeBytes": len(pdf), "resumeSha256": hashlib.sha256(pdf).hexdigest(), "developmentSessionsIncluded": False}
    (destination / "manifest.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"tables": counts, "resumePrepared": True, "developmentSessionsIncluded": False}))
