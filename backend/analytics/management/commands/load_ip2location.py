import csv
from ipaddress import ip_address
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from analytics.models import IP2LocationRange


class Command(BaseCommand):
    help = "Load IP2Location LITE CSV into the database for fast IP lookups."

    def add_arguments(self, parser):
        parser.add_argument(
            "--path",
            type=str,
            default="",
            help="Path to the IP2Location CSV (defaults to first CSV in backend/ipdata).",
        )
        parser.add_argument(
            "--truncate",
            action="store_true",
            help="Delete existing ranges before loading.",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=5000,
            help="Bulk insert batch size.",
        )

    def handle(self, *args, **options):
        csv_path = options["path"]
        if not csv_path:
            ipdata_dir = Path(__file__).resolve().parents[3] / "ipdata"
            matches = sorted(ipdata_dir.glob("*.csv"))
            if not matches:
                raise CommandError(f"No CSV found in {ipdata_dir}")
            csv_path = str(matches[0])

        file_path = Path(csv_path)
        if not file_path.exists():
            raise CommandError(f"CSV not found: {file_path}")

        batch_size = options["batch_size"]
        if options["truncate"]:
            self.stdout.write("Deleting existing IP2Location ranges...")
            IP2LocationRange.objects.all().delete()

        self.stdout.write(f"Loading {file_path}...")
        rows = []
        total = 0
        with file_path.open("r", encoding="utf-8") as handle:
            reader = csv.reader(handle)
            for row in reader:
                if not row or len(row) < 4:
                    continue
                try:
                    start_ip = self._parse_ip(row[0])
                    end_ip = self._parse_ip(row[1])
                except ValueError:
                    continue
                country_code = row[2].strip().strip('"') if len(row) > 2 else ""
                country = row[3].strip().strip('"') if len(row) > 3 else ""
                region = row[4].strip().strip('"') if len(row) > 4 else ""
                city = row[5].strip().strip('"') if len(row) > 5 else ""

                rows.append(
                    IP2LocationRange(
                        start_ip=start_ip,
                        end_ip=end_ip,
                        country_code=country_code,
                        country=country,
                        region=region,
                        city=city,
                    )
                )

                if len(rows) >= batch_size:
                    with transaction.atomic():
                        IP2LocationRange.objects.bulk_create(rows, batch_size=batch_size)
                    total += len(rows)
                    rows = []
                    self.stdout.write(f"Inserted {total} rows...")

        if rows:
            with transaction.atomic():
                IP2LocationRange.objects.bulk_create(rows, batch_size=batch_size)
            total += len(rows)

        self.stdout.write(self.style.SUCCESS(f"Loaded {total} IP ranges."))

    @staticmethod
    def _parse_ip(value: str) -> int:
        cleaned = value.strip().strip('"')
        if not cleaned:
            raise ValueError("Empty IP value")
        if cleaned.isdigit():
            return int(cleaned)
        return int(ip_address(cleaned))
