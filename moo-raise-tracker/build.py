#!/usr/bin/env python3
"""
Rebuild moo-raise-tracker/index.html from an edited payload.

Decrypts the PAYLOAD embedded in index.html, hands the plain dict to an
edit function, re-encrypts with THE SAME passphrase and a fresh salt+IV,
and writes index.html back.

The passphrase is shared with three people and MUST NOT change. This
script reads it from the environment and refuses to run without it, so
rotating is never an accident:

    MOO_TRACKER_PASS='unsay-coat-purre-atlas-fate-taro' python3 build.py

Verifies after writing that the same passphrase still opens the result.
"""
import os, re, sys, json, base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, "index.html")
PAYLOAD_RE = re.compile(r'(PAYLOAD\s*=\s*)(\{.*?"ct":\s*"[A-Za-z0-9+/=]+"\s*\})', re.S)


def _key(passphrase: bytes, salt: bytes, iters: int) -> bytes:
    return PBKDF2HMAC(
        algorithm=hashes.SHA256(), length=32, salt=salt, iterations=iters
    ).derive(passphrase)


def load(html: str, passphrase: bytes):
    p = json.loads(PAYLOAD_RE.search(html).group(2))
    k = _key(passphrase, base64.b64decode(p["salt"]), p["iter"])
    pt = AESGCM(k).decrypt(base64.b64decode(p["iv"]), base64.b64decode(p["ct"]), None)
    return json.loads(pt), p["iter"]


def dump(data: dict, passphrase: bytes, iters: int) -> dict:
    salt, iv = os.urandom(16), os.urandom(12)
    ct = AESGCM(_key(passphrase, salt, iters)).encrypt(
        iv, json.dumps(data, ensure_ascii=False).encode("utf-8"), None
    )
    return {
        "v": 1,
        "iter": iters,
        "salt": base64.b64encode(salt).decode(),
        "iv": base64.b64encode(iv).decode(),
        "ct": base64.b64encode(ct).decode(),
    }


def rebuild(edit):
    """edit(data) -> data. Mutates the payload in place on disk."""
    passphrase = os.environ.get("MOO_TRACKER_PASS", "").encode()
    if not passphrase:
        sys.exit("MOO_TRACKER_PASS not set — refusing to run (it must not change).")

    html = open(INDEX, encoding="utf-8").read()
    data, iters = load(html, passphrase)
    before = (len(data["investors"]), len(data["connectors"]))

    data = edit(data)

    blob = json.dumps(dump(data, passphrase, iters), separators=(",", ":"))
    out = PAYLOAD_RE.sub(lambda m: m.group(1) + blob, html, count=1)
    open(INDEX, "w", encoding="utf-8").write(out)

    # The whole point of the script: prove the shared passphrase still works.
    check, _ = load(open(INDEX, encoding="utf-8").read(), passphrase)
    after = (len(check["investors"]), len(check["connectors"]))
    print(f"ok — passphrase unchanged and verified against the written file")
    print(f"   investors {before[0]} -> {after[0]} · connectors {before[1]} -> {after[1]}")
    print(f"   sweptOn {check.get('sweptOn')}")
    return check
