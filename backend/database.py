import os
import re
import pyodbc
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "1433")  # ว่าง = ไม่ระบุพอร์ต (ใช้กับ lpc: หรือชื่อ instance)
DB_USER = os.getenv("DB_USER", "sa")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "agrimatch")
DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
DB_TRUSTED_CONNECTION = os.getenv("DB_TRUSTED_CONNECTION", "no").lower() in ("1", "true", "yes")


def _connection_string():
    parts = [
        f"DRIVER={{{DB_DRIVER}}}",
        f"SERVER={DB_HOST},{DB_PORT}" if DB_PORT else f"SERVER={DB_HOST}",
        f"DATABASE={DB_NAME}",
        "TrustServerCertificate=yes",
    ]
    if DB_TRUSTED_CONNECTION:
        parts.append("Trusted_Connection=yes")
    else:
        parts += [f"UID={DB_USER}", f"PWD={DB_PASSWORD}"]
    return ";".join(parts)


class DictCursor:
    """Cursor ที่รับ placeholder แบบ %s และคืนแถวเป็น dict เหมือน PyMySQL เดิม"""

    def __init__(self, raw):
        self._raw = raw

    def execute(self, sql, params=()):
        self._raw.execute(sql.replace("%s", "?"), tuple(params))
        return self

    def _columns(self):
        return [c[0] for c in self._raw.description] if self._raw.description else []

    def fetchone(self):
        row = self._raw.fetchone()
        return dict(zip(self._columns(), row)) if row else None

    def fetchall(self):
        cols = self._columns()
        return [dict(zip(cols, r)) for r in self._raw.fetchall()]

    @property
    def rowcount(self):
        return self._raw.rowcount

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self._raw.close()


class Connection:
    def __init__(self, raw):
        self._raw = raw

    def cursor(self):
        return DictCursor(self._raw.cursor())

    def close(self):
        self._raw.close()


def get_connection():
    return Connection(pyodbc.connect(_connection_string(), autocommit=True))


def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


_SQL_ERROR = re.compile(r"\[SQL Server\](.*?) \((50\d{3})\)", re.S)
_STATUS_BY_CODE = {50400: 400, 50403: 403, 50404: 404}


def parse_proc_error(exc):
    """แปลง error ที่ THROW จาก stored procedure (50400/50403/50404) เป็น (HTTP status, ข้อความ)
    คืน None ถ้าไม่ใช่ error ที่เรา THROW เอง"""
    match = _SQL_ERROR.search(str(exc))
    if not match:
        return None
    status = _STATUS_BY_CODE.get(int(match.group(2)))
    return (status, match.group(1).strip()) if status else None
