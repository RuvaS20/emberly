import os
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()
w3 = Web3(Web3.HTTPProvider(os.environ["RPC_URL"]))
print("Connected:", w3.is_connected(), "| Chain ID:", w3.eth.chain_id, "(Sepolia = 11155111)")
bal = w3.eth.get_balance(os.environ["WALLET_ADDRESS"])
print("Balance:", w3.from_wei(bal, "ether"), "SepoliaETH")