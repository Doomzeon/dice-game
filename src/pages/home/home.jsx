import React, { useState, useEffect } from "react"
import "./home.css"

import dicePNG from "../../assets/dc.png"
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PlayDC } from "../index"
import dark_svg from "../../assets/dark.svg"
import light_svg from "../../assets/light.svg"

import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

function HomeDC() {


    const [walletConnected, connectedWallet] = useState(false)

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [theme, setTheme ] = useState("dark")

    useEffect(() => {
        console.log('uSER CONNCTED THE WALLET', publicKey)

        if (publicKey != "" && publicKey != null) {
            connectedWallet(true)
        } else {

            connectedWallet(false)
        }

    }, [publicKey])

    return (
        // Move this one to the App.js set widht and heigh to the user screen!
        <div className="dc__main_container" data-theme={theme}>

            <div className="dc__navbar_container">

                <div className="dc__navbar_item_switch_container">

                    {theme == "dark"
                        ? <div className="dc__navbar_item_switch_container_light_container enabled" onClick={() => { setTheme("dark") }}>
                            <img src={dark_svg} className="dark" />
                        </div>

                        : <div className="dc__navbar_item_switch_container_light_container" onClick={() => { setTheme("dark") }}>
                            <img src={dark_svg} className="dark" />
                        </div>
                    }

                    {theme == "light" ? <div className="dc__navbar_item_switch_container_dark_container enabled" onClick={() => { setTheme("light") }}>
                        <img className="" src={light_svg} />
                    </div>

                        : <div className="dc__navbar_item_switch_container_dark_container " onClick={() => { setTheme("light") }}>
                            <img className="" src={light_svg} />
                        </div>}

                </div>

                <div className="dc__navbar_item_dice_game_container navbar_link_active">
                    <a className="navbar_link"> Dice EVEN/ODD</a>
                </div>

                <div className="dc__navbar_item_dice_prediction_container">
                    <a className="navbar_link"> Dice PREDICTION</a>
                </div>


            </div>

            <div className="dc__home__main_container">

                <div className="dc__home_title_container">
                    <h2>Degen Dice <span className="purple">Game</span></h2>
                </div>

                <div className="dc__home_image_dc_container">

                </div>



                <div className="dc__home_connect_wallet_container">


                    {
                        walletConnected
                            ? <div>
                                <PlayDC />
                            </div>

                            : <WalletModalProvider>
                                <WalletMultiButton />

                            </WalletModalProvider>}

                </div>

            </div>

        </div>
    )
}

export default HomeDC;
