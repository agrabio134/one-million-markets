import { Keypair, PublicKey, SystemProgram, Transaction, type Connection } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID, AuthorityType, ExtensionType, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE,
  createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction,
  createMintToInstruction, createSetAuthorityInstruction, getAssociatedTokenAddressSync, getMintLen,
} from "@solana/spl-token";
import { createInitializeInstruction, pack, type TokenMetadata } from "@solana/spl-token-metadata";

export type LaunchParams = { name: string; symbol: string; uri: string; decimals: number; supply: bigint };

export const U64_MAX = (1n << 64n) - 1n;

/**
 * Builds one transaction that creates a fixed-supply Token-2022 mint with on-chain metadata:
 *  1. create the mint account          4. initialize metadata (name, symbol, uri)
 *  2. point metadata at the mint       5. create the creator's token account
 *  3. initialize the mint, no freeze   6. mint the full supply to the creator
 *                                      7. revoke the mint authority permanently
 * The creator's wallet pays rent and fees and signs; the new mint keypair co-signs.
 */
export async function buildLaunchTx(connection: Connection, owner: PublicKey, p: LaunchParams) {
  const mint = Keypair.generate();
  const metadata: TokenMetadata = {
    mint: mint.publicKey, name: p.name, symbol: p.symbol, uri: p.uri,
    updateAuthority: owner, additionalMetadata: [],
  };
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
  const amount = p.supply * 10n ** BigInt(p.decimals);
  const ata = getAssociatedTokenAddressSync(mint.publicKey, owner, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

  const tx = new Transaction().add(
    SystemProgram.createAccount({ fromPubkey: owner, newAccountPubkey: mint.publicKey, space: mintLen, lamports, programId: TOKEN_2022_PROGRAM_ID }),
    createInitializeMetadataPointerInstruction(mint.publicKey, owner, mint.publicKey, TOKEN_2022_PROGRAM_ID),
    createInitializeMintInstruction(mint.publicKey, p.decimals, owner, null, TOKEN_2022_PROGRAM_ID),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID, metadata: mint.publicKey, updateAuthority: owner,
      mint: mint.publicKey, mintAuthority: owner, name: p.name, symbol: p.symbol, uri: p.uri,
    }),
    createAssociatedTokenAccountInstruction(owner, ata, owner, mint.publicKey, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID),
    createMintToInstruction(mint.publicKey, ata, owner, amount, [], TOKEN_2022_PROGRAM_ID),
    createSetAuthorityInstruction(mint.publicKey, owner, AuthorityType.MintTokens, null, [], TOKEN_2022_PROGRAM_ID),
  );
  tx.feePayer = owner;
  return { tx, mint, ata, rentLamports: lamports };
}
