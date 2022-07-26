import React, { useState, useEffect } from "react"
import "./play.css"
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import registerPlayerPredictionTx from "../../utils/dice-game"
import rollItDegen from "../../utils/rol-it";
import idl from '../../idl.json';
import initialzee from "../../utils/initialize"
import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js';
import checkWithdraw from "../../utils/withdraw"
import BeatLoader from "react-spinners/BeatLoader";
import * as anchor from "@project-serum/anchor";


function PlayDC() {

    const [userPredictionResult, setUserPredictionResult] = useState("...")

    const [prediction, setUserPrediction] = useState("even")

    const [amount, setUserAmountBet] = useState(0.05 * LAMPORTS_PER_SOL)

    const [load, setLoad] = useState(false)

    
    const programID = new PublicKey(idl.metadata.address);
    clusterApiUrl('mainnet-beta')
    const wallet = useWallet()
    const opts = {
        preflightCommitment: "processed"
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


    /*New logic */

    //Check on user connect wallet if counter in localstoage is set to none

     useState(async ()=>{

        let counter = localStorage.getItem("counter");
        let step_ = localStorage.getItem("step_");
        const provider = await getProvider();
        const program = new anchor.Program(idl, programID, provider);

        if(counter != null){
            // If counter is != null look throught step on which user finished exp.
            if(step_ == null || step_ == ""){
                console.log('User has not any state....')

            }else if(step_ == "withdraw_success_even_odd"){
                //User was withdraw go and make him roll the dice 
                const txIdRolling = await rollItDegen(
                    provider,
                    program,
                    wallet,
                    counter
                )
                localStorage.setItem("step_", "rolled_dice_even_odd")

                const result  = await checkWithdraw(
                    provider,
                    program,
                    wallet,
                    counter
                )

                console.log(result)
    
                setUserPredictionResult(result);

                setLoad(false)
                localStorage.setItem("step_", "")

            } else if(step_ == "rolled_dice_even_odd"){
                //user rolled already dice go and check the result of dice
                const result  = await checkWithdraw(
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



    /*Remove from production */
    



    async function rollIt() {
        setLoad(true)
        const provider = await getProvider();
        const program = new anchor.Program(idl, programID, provider);

        let prediction_struct = { shots: {} };

        if (prediction == "even") {
            prediction_struct = { even: {} }
        }


        // const txId = await initialzee(
        //     provider,
        //     program,
        //     wallet
        // )

            const account = await program.account.coreState.all();
            let counter = account[0].account.flipCounter.toNumber()

            try{
            const txId_registrationPrediction = await registerPlayerPredictionTx(
                provider,
                program,
                prediction_struct,
                amount,
                wallet,
                counter
            )

            localStorage.setItem("counter", counter)
            localStorage.setItem("step_", "withdraw_success_even_odd")

            // if (!txId_registrationPrediction) throw new Error({'Error':'rer'});
             console.log(txId_registrationPrediction)

            const txIdRolling = await rollItDegen(
                provider,
                program,
                wallet,
                counter
            )
            localStorage.setItem("step_", "rolled_dice_even_odd")


            const result  = await checkWithdraw(
                provider,
                program,
                wallet,
                counter
            )
            localStorage.setItem("step_", "")
            localStorage.setItem("counter", null)
            

            console.log(result)

            setUserPredictionResult(result);


            setLoad(false)
        }

        catch(err){
            alert("An error occured please contact dev team")
            setLoad(false)
        }

        setLoad(false)



    }

    return (



        <div className="dc__play_main_container">

            {
                load
                    ? <div className="loader">
                        <BeatLoader/>
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

                                {
                                    prediction != "" && prediction == "even"
                                        ? <button className="dc__bet_button_even selected_prediction" onClick={() => setUserPrediction("even")}>
                                            EVEN
                                        </button>
                                        : <button className="dc__bet_button_even" onClick={() => setUserPrediction("even")}>
                                            EVEN
                                        </button>
                                }



                                {
                                    prediction != "" && prediction == "ods"
                                        ? <button className="dc__bet_button_ods selected_prediction" onClick={() => setUserPrediction("ods")}>
                                            ODD
                                        </button>
                                        : <button className="dc__bet_button_ods" onClick={() => setUserPrediction("ods")}>
                                            ODD
                                        </button>
                                }

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
                                <button className="dc__play_button" onClick={() => rollIt()}>
                                    DOUBLE OR NOTHING DEGEN!
                                </button>
                            </div></>}



                    </>
            }

        </div>

    )


        }

    export default PlayDC




