// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
 
contract HeatAlertRegistry {
    struct Record { bytes32 hash; uint256 timestamp; string label; }
 
    mapping(string => Record) public records;   // key e.g. "2026-10-24"
    address public owner;
 
    event AlertAnchored(string key, bytes32 hash, uint256 timestamp);
 
    constructor() { owner = msg.sender; }
 
    function anchor(string calldata key, bytes32 hash, string calldata label) external {
        require(msg.sender == owner, "not owner");
        require(records[key].timestamp == 0, "already anchored");
        records[key] = Record(hash, block.timestamp, label);
        emit AlertAnchored(key, hash, block.timestamp);
    }
 
    function verify(string calldata key, bytes32 hash) external view returns (bool) {
        return records[key].hash == hash;
    }
}
