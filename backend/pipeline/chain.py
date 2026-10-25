import hashlib, json, os
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")
EXPLORER = "https://sepolia.etherscan.io"

def fingerprint(obj) -> str:
    """Same JSON in, same fingerprint out. Change one number and it changes completely."""
    canon = json.dumps(obj, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canon.encode()).hexdigest()

def contract():
    w3 = Web3(Web3.HTTPProvider(os.environ["RPC_URL"]))
    abi = json.loads((ROOT / "contracts" / "abi.json").read_text())
    return w3, w3.eth.contract(address=Web3.to_checksum_address(os.environ["CONTRACT_ADDRESS"]), abi=abi)

def onchain_record(key: str):
    """Read what the blockchain holds for this date. Reading is free (no gas)."""
    _, c = contract()
    h, ts, label = c.functions.records(key).call()
    if ts == 0:
        return None
    return {"fingerprint": h.hex().removeprefix("0x"), "timestamp": ts, "label": label}