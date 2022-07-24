import { useConnection, useWallet } from '@solana/wallet-adapter-react';


import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js';


import * as anchor from "@project-serum/anchor";


const initialzee = async function(provider, program, wallet){

    const [_treasury_pda, _bump] =await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("core_state_seed"),

            wallet.publicKey.toBuffer(),
        ],
        program.programId
    )
    const [__treasury_pda, bump] =await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("treasury"),
        ],
        program.programId
    )
    
    console.log('Going to initialize Admin...')
    
    const tx = program.transaction.initiliazeAdmin(
        {
            accounts: {
                admin: wallet.publicKey,
                coreState: _treasury_pda,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [wallet]
        }
    )
    
    // const tx = program.transaction.withdrawFunds(
    //     new anchor.BN(1* LAMPORTS_PER_SOL),{
    //             accounts: {
    //                 admin: wallet.publicKey,
    //                 houseTreasuryPda: __treasury_pda,
    //                 coreState:_treasury_pda,
    //                 systemProgram: anchor.web3.SystemProgram.programId,
    //             },
    //             signers: [wallet]
    //         }
    //     )

    tx.feePayer = wallet.publicKey
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash
    const signedTx = await wallet.signTransaction(tx)
    const txId = await provider.connection.sendRawTransaction(signedTx.serialize())
    await provider.connection.confirmTransaction(txId)
    return txId
}   


export default initialzee;