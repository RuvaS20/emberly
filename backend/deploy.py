import json, os
from pathlib import Path
from dotenv import load_dotenv
from solcx import install_solc, compile_source
from web3 import Web3

load_dotenv()
w3 = Web3(Web3.HTTPProvider(os.environ["RPC_URL"]))
acct = w3.eth.account.from_key(os.environ["PRIVATE_KEY"])

install_solc("0.8.20")
src = Path("contracts/HeatAlertRegistry.sol").read_text()
compiled = compile_source(src, output_values=["abi", "bin"], solc_version="0.8.20")
_, iface = compiled.popitem()
Path("contracts/abi.json").write_text(json.dumps(iface["abi"], indent=2))

Contract = w3.eth.contract(abi=iface["abi"], bytecode=iface["bin"])
tx = Contract.constructor().build_transaction({
    "from": acct.address,
    "nonce": w3.eth.get_transaction_count(acct.address),
    "chainId": w3.eth.chain_id,
})
signed = acct.sign_transaction(tx)
raw = getattr(signed, "raw_transaction", None) or signed.rawTransaction
tx_hash = w3.eth.send_raw_transaction(raw)
print("Sent! Waiting for confirmation (up to a minute)...")
receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

addr = receipt.contractAddress
with open(".env", "a") as f:
    f.write(f"CONTRACT_ADDRESS={addr}\n")
print("Contract address:", addr)
print("Deploy tx:  https://sepolia.etherscan.io/tx/" + w3.to_hex(tx_hash))
print("Contract:   https://sepolia.etherscan.io/address/" + addr)