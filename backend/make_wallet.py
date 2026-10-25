from pathlib import Path
from eth_account import Account

env = Path(".env")
if env.exists() and "PRIVATE_KEY" in env.read_text():
    raise SystemExit("A wallet already exists in .env. Not creating another.")

acct = Account.create()
key = acct.key.hex()
key = key if key.startswith("0x") else "0x" + key
with env.open("a") as f:
    f.write(f"PRIVATE_KEY={key}\nWALLET_ADDRESS={acct.address}\n")
    f.write("RPC_URL=https://ethereum-sepolia-rpc.publicnode.com\n")
print("Your wallet address:", acct.address)