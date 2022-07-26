import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';




const checkWithdraw = async function (provider, program, wallet, counter) {

    try {

        
        const [_wallet_pda, bump] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from("playes"),
                wallet.publicKey.toBuffer(),
                (new anchor.BN(counter).toArrayLike(Buffer, "le", 8)),
            ],
            program.programId
        )

        //const account = await program.account.degenPrediction.fetch(_wallet_pda);


        const [_core_state_pda, __bump] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from("core_state_seed"),
                new anchor.web3.PublicKey("A6t3KEsEaUkAA7P8ptnuhpT5T8KST9jDR7dCTUgj3GVG").toBuffer(),
                
            ],
            program.programId
        )
        const [_treasury_pda, _bump] =await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from("treasury"),
            ],
            program.programId
        )
        
        const tx = program.transaction.widthdrawAmount(
            {
                accounts: {
                    degen: wallet.publicKey,
                    degenPrediction: _wallet_pda,
                    houseTreasuryPda:_treasury_pda,
                    coreState:_core_state_pda,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
                signers: [wallet]
            }
        )
        
        tx.feePayer = wallet.publicKey
        tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash
        const signedTx = await wallet.signTransaction(tx)
        const txId = await provider.connection.sendRawTransaction(signedTx.serialize())
        await provider.connection.confirmTransaction(txId)
        const account = await program.account.degenPrediction.fetch(_wallet_pda)

        console.log(account)
        let msg = "You won " + account.amount/LAMPORTS_PER_SOL + "SOL. GG"

        let result_k = Object.keys(account.result)
        if (result_k[0] == "lost"){
            msg = "You lost " + account.amount/LAMPORTS_PER_SOL + "SOL. GG"
        }
        console.log(msg)
        return  msg
        
    } catch (err) {
        console.log("Transaction error: ", err);
    }
}

export default checkWithdraw;