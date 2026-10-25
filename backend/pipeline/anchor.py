import json, os, sys
from datetime import datetime, timezone
from pathlib import Path
from chain import fingerprint, contract, onchain_record, EXPLORER

ALERTS = Path(__file__).resolve().parents[1] / "data" / "alerts"
dates = sorted(p.stem for p in ALERTS.glob("*.json") if not p.name.endswith(".anchor.json"))
date = sys.argv[1] if len(sys.argv) > 1 else dates[-1]

alert = json.loads((ALERTS / f"{date}.json").read_text())
fp = fingerprint(alert)
print(f"Date: {date}\nFingerprint: {fp}")

existing = onchain_record(date)
if existing:
    if existing["fingerprint"] == fp:
        sys.exit("Already anchored, and the file still matches. Nothing to do.")
    sys.exit("Already anchored with a DIFFERENT fingerprint. This file was changed after anchoring!")

w3, c = contract()
acct = w3.eth.account.from_key(os.environ["PRIVATE_KEY"])
tx = c.functions.anchor(date, bytes.fromhex(fp), alert.get("label", "Daily heat alerts")).build_transaction({
    "from": acct.address,
    "nonce": w3.eth.get_transaction_count(acct.address),
    "chainId": w3.eth.chain_id,
})
signed = acct.sign_transaction(tx)
raw = getattr(signed, "raw_transaction", None) or signed.rawTransaction
tx_hash = w3.eth.send_raw_transaction(raw)
print("Sent. Waiting for confirmation...")
receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
if receipt.status != 1:
    sys.exit("Transaction failed. Check it on the explorer.")

anchor = {
    "date": date,
    "fingerprint": fp,
    "tx_hash": w3.to_hex(tx_hash),
    "block": receipt.blockNumber,
    "contract": c.address,
    "explorer_tx": f"{EXPLORER}/tx/{w3.to_hex(tx_hash)}",
    "explorer_contract": f"{EXPLORER}/address/{c.address}",
    "anchored_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
}
(ALERTS / f"{date}.anchor.json").write_text(json.dumps(anchor, indent=2))
print(f"Anchored! {anchor['explorer_tx']}")