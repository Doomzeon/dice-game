import React, { useState, useEffect } from "react"
import "./num_prediction.css"
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import registerPlayerPredictionTwoDiceTx from "../../utils/two-dice-game"
import rollTwoDegen from "../../utils/roll-two-dice"
import checkWithdrawTwoDice from "../../utils/withdraw-two-dice"
import initialzee from "../../utils/initialize"
import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js';

import BeatLoader from "react-spinners/BeatLoader";
import * as anchor from "@project-serum/anchor";

import idl from '../../idl.json';


function PlayTwoDC() {

    const [userPredictionResult, setUserPredictionResult] = useState("...")

    const [firstNumber, setFirstNumber] = useState(4)
    const [secondNumber, setSecondNumber] = useState(6)

    const [amount, setUserAmountBet] = useState(0.05 * LAMPORTS_PER_SOL)

    const [load, setLoad] = useState(false)

    const programID = new PublicKey(idl.metadata.address);
    clusterApiUrl('mainnet-beta')
    const wallet = useWallet()
    const opts = {
        preflightCommitment: "processed"
    }

    /*New logic*/
    useState(async ()=>{
        const provider = await getProvider();
        const program = new anchor.Program(idl, programID, provider);

        let counter = localStorage.getItem("counter");
        let step_ = localStorage.getItem("step_");

        if(counter != null){
            // If counter is != null look throught step on which user finished exp.
            if(step_ == null || step_ == ""){
                console.log('User has not any state....')

            }else if(step_ == "withdraw_success_2_dice"){
                //User was withdraw go and make him roll the dice 
                const txIdRolling = await rollTwoDegen(
                    provider,
                    program,
                    wallet,
                    counter
                )

                localStorage.setItem("step_", "rolled_2_dice")

                const result = await checkWithdrawTwoDice(
                provider,
                program,
                wallet,
                counter
            )

                console.log(result)
    
                setUserPredictionResult(result);

                setLoad(false)
                localStorage.setItem("step_", "")

            } else if(step_ == "rolled_2_dice"){
                //user rolled already dice go and check the result of dice

                const result = await checkWithdrawTwoDice(
                    provider,
                    program,
                    wallet,
                    counter
                )

                console.log(result)
    
                setUserPredictionResult(result);

                setLoad(false)
                localStorage.setItem("step_", "")

            // } else if(step_ == "withdraw_success_2_dice"){
            //     //User was withdraw go and make him roll  2 dice 
            // } else if(step_ == "rolled_2_dice"){
            //     //User rolled 2 dice
            // }
                }else{
                console.log("An error occured please contact Ardrop DEVs")

                //alert("OOps there are some problems. Contact Ardrop DEVs ")
            }
        }

    }, [])
    /* End new logic*/




    function manageFirstNumber(operator) {

        if (operator == "+") {
            if (firstNumber + 1 <= 11) {
                let s = firstNumber+1;
                console.log(s)
                console.log(firstNumber)
                console.log(firstNumber+2)

                setFirstNumber(s)
                console.log(s+2)
                setSecondNumber(s + 1)
            }
        } else {
            if (firstNumber - 1 > 0) {
                let s = firstNumber-1;
                setFirstNumber(s)
                setSecondNumber(s + 1)
            }
        }
    }

    async function getProvider() {
        const networks = clusterApiUrl('mainnet-beta');
        /* create the provider and return it to the caller */
        /* network set to local network for now */
        const network = "http://127.0.0.1:8899";
        const connection = new Connection(networks, opts.preflightCommitment);

        const provider = new anchor.AnchorProvider(
            connection, wallet, opts.preflightCommitment,
        );
        // await provider.connection.requestAirdrop(
        //     wallet.publicKey,
        //     2 * 100000000
        // );
        return provider;
    }

    async function rollTwoDice() {
        setLoad(true)
        const provider = await getProvider();
        const program = new anchor.Program(idl, programID, provider);



        // const txId = await initialzee(
        //     provider,
        //     program,
        //     wallet
        // )

        const account = await program.account.coreState.all();
        let counter = account[0].account.flipCounter.toNumber()

        try {
            const txId_registrationPrediction = await registerPlayerPredictionTwoDiceTx(
                provider,
                program,
                firstNumber,
                secondNumber,
                amount,
                wallet,
                counter
            )
            localStorage.setItem("counter", counter)
            localStorage.setItem("step_", "withdraw_success_2_dice")

            console.log(txId_registrationPrediction)

            const txIdRolling = await rollTwoDegen(
                provider,
                program,
                wallet,
                counter
            )
            localStorage.setItem("step_", "rolled_2_dice")


            const result = await checkWithdrawTwoDice(
                provider,
                program,
                wallet,
                counter
            )
            if (!result) throw new Error({ 'Error': 'rer' });
            localStorage.setItem("step_", "")
            localStorage.setItem("counter", null)

            console.log(result)

            setUserPredictionResult(result);


            setLoad(false)
        }

        catch (err) {
            console.log(err)
            setLoad(false)
        }
     }

    return (



        <div className="dc__play_main_container">

            {
                load
                    ? <div className="loader">
                        <BeatLoader />
                    </div>


                    : <>{userPredictionResult != "..."
                        ? <div className="dc__play_result_prediction_main_container">

                            <div className="dc__play_result_prediction_title_container">

                                {
                                    userPredictionResult.includes("won")
                                        ? <h4 className="green">{userPredictionResult} </h4>
                                        : <h4 className="red">{userPredictionResult}</h4>
                                }


                            </div>
                            <div className="dc__play_result_predictionplay_again_button_container">


                                <button className="dc__play_button_again" onClick={() => { setUserPredictionResult("...") }}>
                                    PLAY AGAIN!
                                </button>

                            </div>

                        </div>
                        : <><div className="dc__play_title_bet_options_container">

                            <h3>I BET:</h3>

                        </div>

                            <div className="dc__play_bet_options_container">

                                <div className="dc__play_bet_first_number_container">

                                    <div className="dc__play_bet_minus_num_container" onClick={() => {
                                        manageFirstNumber("-")
                                    }}>
                                        <p className="dc__play_bet_text">-</p>
                                    </div>

                                    <div className="dc__play_bet_num_container">
                                        <p className="dc__play_bet_text">{firstNumber}</p>
                                    </div>

                                    <div className="dc__play_bet_plus_num_container" onClick={() => {
                                        manageFirstNumber("+")
                                    }}>
                                        <p className="dc__play_bet_text">+</p>
                                    </div>


                                </div>

                                <div className="dc__bet_container_hint">
                                    <p className="dc__play_bet_text_hint">
                                        Only 2 numbers in range will be considerate
                                    </p>

                                </div>

                                <div className="dc__play_bet_second_number_container">

                                    <div className="dc__play_bet_minus_num_container second_cont_dis" onClick={() => {

                                    }}>
                                        <p className="dc__play_bet_text">-</p>
                                    </div>

                                    <div className="dc__play_bet_num_container">
                                        <p className="dc__play_bet_text">{secondNumber}</p>
                                    </div>

                                    <div className="dc__play_bet_plus_num_container second_cont_dis">
                                        <p className="dc__play_bet_text">+</p>
                                    </div>

                                </div>


                            </div>

                            <div className="dc__play_title_sol_option_container">
                                <h3>FOR:</h3>
                            </div>

                            <div className="dc__play_sol_options_container">

                                <div className="dc__play_sol_options_row1">

                                    {amount != 0 && amount == 0.05 * LAMPORTS_PER_SOL
                                        ? <button className="dc__sol_option_button sol_option_active" onClick={() => setUserAmountBet(0.05 * LAMPORTS_PER_SOL)}>
                                            0.05 SOL
                                        </button>
                                        : <button className="dc__sol_option_button" onClick={() => setUserAmountBet(0.05 * LAMPORTS_PER_SOL)}>
                                            0.05 SOL
                                        </button>}


                                    {amount != 0 && amount == 0.1 * LAMPORTS_PER_SOL
                                        ? <button className="dc__sol_option_button sol_option_active" onClick={() => setUserAmountBet(0.1 * LAMPORTS_PER_SOL)}>
                                            0.1 SOL
                                        </button>
                                        : <button className="dc__sol_option_button" onClick={() => setUserAmountBet(0.1 * LAMPORTS_PER_SOL)}>
                                            0.1 SOL
                                        </button>}

                                    {amount != 0 && amount == 0.25 * LAMPORTS_PER_SOL
                                        ? <button className="dc__sol_option_button sol_option_active" onClick={() => setUserAmountBet(0.25 * LAMPORTS_PER_SOL)}>
                                            0.25 SOL
                                        </button> : <button className="dc__sol_option_button" onClick={() => setUserAmountBet(0.25 * LAMPORTS_PER_SOL)}>
                                            0.25 SOL
                                        </button>}
                                </div>

                                <div className="dc__play_sol_options_row1">

                                    {amount != 0 && amount == 0.5 * LAMPORTS_PER_SOL
                                        ? <button className="dc__sol_option_button sol_option_active" onClick={() => setUserAmountBet(0.5 * LAMPORTS_PER_SOL)}>
                                            0.5 SOL
                                        </button> : <button className="dc__sol_option_button" onClick={() => setUserAmountBet(0.5 * LAMPORTS_PER_SOL)}>
                                            0.5 SOL
                                        </button>}

                                    {amount != 0 && amount == 1 * LAMPORTS_PER_SOL
                                        ? <button className="dc__sol_option_button sol_option_active disabled" onClick={() => setUserAmountBet(1.0 * LAMPORTS_PER_SOL)}>
                                            1 SOL
                                        </button> : <button className="dc__sol_option_button disabled" onClick={() => setUserAmountBet(1.0 * LAMPORTS_PER_SOL)}>
                                            1 SOL
                                        </button>}

                                    {amount != 0 && amount == 1.5 * LAMPORTS_PER_SOL
                                        ? <button className="dc__sol_option_button disabled sol_option_active" onClick={() => setUserAmountBet(1.5 * LAMPORTS_PER_SOL)}>
                                            1.5 SOL
                                        </button > : <button className="dc__sol_option_button disabled" onClick={() => setUserAmountBet(1.5 * LAMPORTS_PER_SOL)}>
                                            1.5 SOL
                                        </button>}

                                </div>

                            </div>

                            <div className="dc__play_container">
                                <button className="dc__play_button" onClick={() => {
                                    rollTwoDice()
                                }}>
                                    TRIPPLE OR NOTHING DEGEN!
                                </button>
                            </div></>}



                    </>
            }

        </div>

    )


}

export default PlayTwoDC