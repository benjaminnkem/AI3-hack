// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

/// @notice Immutable, compact anchors for Mesh Evidence Passports.
contract MeshAttestationRegistry is Ownable {
    struct Attestation {
        bytes32 inputHash;
        bytes32 claimsRoot;
        bytes32 evidenceRoot;
        bytes32 kimiOutputHash;
        bytes32 minimaxOutputHash;
        bytes32 requestIdsHash;
        uint8 truthScore;
        uint32 verificationVersion;
        uint64 timestamp;
        address attestor;
    }

    mapping(bytes32 passportHash => Attestation) private attestations;
    mapping(address operator => bool allowed) public operators;

    error Unauthorized(address caller);
    error ZeroAddress();
    error InvalidPassportHash();
    error InvalidTruthScore(uint256 truthScore);
    error AlreadyAttested(bytes32 passportHash);
    error AttestationNotFound(bytes32 passportHash);

    event OperatorUpdated(address indexed operator, bool allowed);
    event PassportAttested(
        bytes32 indexed passportHash,
        bytes32 claimsRoot,
        bytes32 evidenceRoot,
        uint8 truthScore,
        uint32 verificationVersion,
        address indexed attestor,
        uint64 timestamp
    );

    constructor(address initialOwner) Ownable(initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
    }

    modifier onlyAttestor() {
        if (msg.sender != owner() && !operators[msg.sender]) revert Unauthorized(msg.sender);
        _;
    }

    function setOperator(address operator, bool allowed) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        operators[operator] = allowed;
        emit OperatorUpdated(operator, allowed);
    }

    function attestPassport(
        bytes32 passportHash,
        bytes32 inputHash,
        bytes32 claimsRoot,
        bytes32 evidenceRoot,
        bytes32 kimiOutputHash,
        bytes32 minimaxOutputHash,
        bytes32 requestIdsHash,
        uint256 truthScore,
        uint32 verificationVersion
    ) external onlyAttestor {
        if (passportHash == bytes32(0)) revert InvalidPassportHash();
        if (truthScore > 100) revert InvalidTruthScore(truthScore);
        if (attestations[passportHash].timestamp != 0) revert AlreadyAttested(passportHash);

        uint64 timestamp = uint64(block.timestamp);
        attestations[passportHash] = Attestation({
            inputHash: inputHash,
            claimsRoot: claimsRoot,
            evidenceRoot: evidenceRoot,
            kimiOutputHash: kimiOutputHash,
            minimaxOutputHash: minimaxOutputHash,
            requestIdsHash: requestIdsHash,
            truthScore: uint8(truthScore),
            verificationVersion: verificationVersion,
            timestamp: timestamp,
            attestor: msg.sender
        });

        emit PassportAttested(
            passportHash,
            claimsRoot,
            evidenceRoot,
            uint8(truthScore),
            verificationVersion,
            msg.sender,
            timestamp
        );
    }

    function exists(bytes32 passportHash) external view returns (bool) {
        return attestations[passportHash].timestamp != 0;
    }

    function getAttestation(bytes32 passportHash) external view returns (Attestation memory) {
        Attestation memory attestation = attestations[passportHash];
        if (attestation.timestamp == 0) revert AttestationNotFound(passportHash);
        return attestation;
    }
}
