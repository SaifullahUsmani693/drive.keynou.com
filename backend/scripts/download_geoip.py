import os
import zipfile
from pathlib import Path
from urllib.request import urlretrieve

MAXMIND_URL = "https://download.maxmind.com/app/geoip_download"


def main() -> None:
    license_key = os.getenv("MAXMIND_LICENSE_KEY", "")
    if not license_key:
        raise SystemExit("MAXMIND_LICENSE_KEY is required to download GeoLite2.")

    output_dir = Path(__file__).resolve().parent / ".." / "geoip"
    output_dir.mkdir(parents=True, exist_ok=True)

    zip_path = output_dir / "GeoLite2-City.zip"
    params = "?edition_id=GeoLite2-City&license_key={}&suffix=zip".format(license_key)
    url = f"{MAXMIND_URL}{params}"

    print(f"Downloading GeoLite2 City database to {zip_path}...")
    urlretrieve(url, zip_path)

    with zipfile.ZipFile(zip_path, "r") as archive:
        archive.extractall(output_dir)

    mmdb = next(output_dir.rglob("GeoLite2-City.mmdb"), None)
    if not mmdb:
        raise SystemExit("GeoLite2-City.mmdb not found after extraction.")

    target = output_dir / "GeoLite2-City.mmdb"
    mmdb.replace(target)
    print(f"GeoLite2 City database saved to {target}")


if __name__ == "__main__":
    main()
