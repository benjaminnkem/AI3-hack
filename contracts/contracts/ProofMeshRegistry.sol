// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ProofMeshRegistry
 * @notice Anchors ProofMesh Evidence Passports on-chain. Stores ONLY the
 *         minimal, non-sensitive fingerprint of a verification: the passport
 *         hash, its truth score, the verification version, a timestamp, and
 *         the Gonka request id. No evidence, no claims, no private data.
 */
contract ProofMeshRegistry {
    struct Attestation {
        uint16 truthScore; // 0-100
        uint16 verificationVersion; // e.g. 100 == v1.0.0
        uint64 timestamp; // block time of attestation
        string requestId; // Gonka Router request id for auditability
        bool exists;
    }

    /// @dev passportHash => attestation
    mapping(bytes32 => Attestation) private attestations;

    /// @notice total number of attestations recorded
    uint256 public totalAttestations;

    event PassportAttested(
        bytes32 indexed passportHash,
        uint16 truthScore,
        uint16 verificationVersion,
        uint64 timestamp
    );

    error AlreadyAttested(bytes32 passportHash);
    error InvalidTruthScore(uint16 truthScore);
    error NotFound(bytes32 passportHash);

    /**
     * @notice Record an attestation for a passport hash.
     * @dev Reverts if the hash was already attested (immutability) or the
     *      score is out of range. Returns the running total.
     */
    function attest(
        bytes32 passportHash,
        uint16 truthScore,
        uint16 verificationVersion,
        string calldata requestId
    ) external returns (uint256) {
        if (truthScore > 100) revert InvalidTruthScore(truthScore);
        if (attestations[passportHash].exists) revert AlreadyAttested(passportHash);

        attestations[passportHash] = Attestation({
            truthScore: truthScore,
            verificationVersion: verificationVersion,
            timestamp: uint64(block.timestamp),
            requestId: requestId,
            exists: true
        });

        unchecked {
            totalAttestations++;
        }

        emit PassportAttested(passportHash, truthScore, verificationVersion, uint64(block.timestamp));
        return totalAttestations;
    }

    /**
     * @notice Read an attestation. Reverts if the passport hash is unknown.
     */
    function getAttestation(bytes32 passportHash)
        external
        view
        returns (
            uint16 truthScore,
            uint16 verificationVersion,
            uint256 timestamp,
            string memory requestId
        )
    {
        Attestation storage a = attestations[passportHash];
        if (!a.exists) revert NotFound(passportHash);
        return (a.truthScore, a.verificationVersion, a.timestamp, a.requestId);
    }

    /// @notice Cheap existence check for the public verify page.
    function isAttested(bytes32 passportHash) external view returns (bool) {
        return attestations[passportHash].exists;
    }
}
