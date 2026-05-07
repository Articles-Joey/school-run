"use client"
import { useEffect, useContext, useState } from 'react';

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

import ArticlesButton from '@/components/UI/Button';
import { useSocketStore } from '@/hooks/useSocketStore';
import SchoolRunContentWarning from '@/components/ContentWarning';
import { useGameStore } from '@/hooks/useGameStore';
import useUserGameScore from '@/hooks/useUserGameScore';
import { useStore } from '@/hooks/useStore';
import RotatingMascot from '@/components/UI/RotatingMascot';

import useUserToken from '@articles-media/articles-dev-box/useUserToken';
import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import NicknameInput from '@articles-media/articles-dev-box/NicknameInput';
import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';
const GameScoreboard = dynamic(() =>
    import('@articles-media/articles-dev-box/GameScoreboard'),
    { ssr: false }
);
const Ad = dynamic(() =>
    import('@articles-media/articles-dev-box/Ad'),
    { ssr: false }
);
const ReturnToLauncherButton = dynamic(() =>
    import('@articles-media/articles-dev-box/ReturnToLauncherButton'),
    { ssr: false }
);
const SessionButton = dynamic(() =>
    import('@articles-media/articles-dev-box/SessionButton'),
    { ssr: false }
);

const game_key = process.env.NEXT_PUBLIC_GAME_KEY
const game_name = process.env.NEXT_PUBLIC_GAME_NAME
const game_port = process.env.NEXT_PUBLIC_GAME_PORT

export default function SchoolRunGameLandingPage() {

    const {
        socket,
        connected
    } = useSocketStore(state => ({
        socket: state.socket,
        connected: state.connected,
    }));

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken(
        game_port
    );

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate
    } = useUserDetails({
        token: userToken
    });

    const {
        setContentWarningAccept,
        highScore,
        setHighScore,
        setDistance
    } = useGameStore(state => ({
        setDistance: state.setDistance,
        setContentWarningAccept: state.setContentWarningAccept,
        highScore: state.highScore,
        setHighScore: state.setHighScore
    }));

    const {
        data: userHighScore,
        mutate: userHighScoreMutate
    } = useUserGameScore({
        game: 'School Run'
    });

    const toggleDarkMode = useStore(state => state.toggleDarkMode)
    const darkMode = useStore(state => state.darkMode)
    const nickname = useStore(state => state.nickname)
    const setNickname = useStore(state => state.setNickname)
    const _hasHydrated = useStore(state => state._hasHydrated)
    const randomNickname = useStore(state => state.randomNickname)
    const lobbyDetails = useStore(state => state.lobbyDetails)
    // const setLobbyDetails = useStore(state => state.setLobbyDetails)
    const setShowInfoModal = useStore(state => state.setShowInfoModal)
    const setShowSettingsModal = useStore(state => state.setShowSettingsModal)
    const setShowCreditsModal = useStore(state => state.setShowCreditsModal)

    useEffect(() => {

        setDistance(0)

    }, []);

    useEffect(() => {

        if (socket.connected) {
            socket.emit('join-room', `game:${game_key}-landing`);
        }

        return function cleanup() {
            socket.emit('leave-room', `game:${game_key}-landing`)
        };

    }, [connected]);

    return (

        <div className="landing-page">

            <SchoolRunContentWarning />

            <div className='background-wrap'>
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN}games/School Run/background.jpg`}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'bottom' }}
                />
            </div>

            <div className="container d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center py-3">

                <div
                    style={{ "width": "20rem" }}
                >

                    <div className='d-flex justify-content-center'>
                        <img
                            src={"img/school-bag.png"}
                            width={200}
                            style={{
                                // objectFit: "contain"
                            }}
                        ></img>
                    </div>

                    <div className="card card-articles mb-3">

                        <div className="card-header">

                            <NicknameInput 
                                useStore={useStore}
                            />

                        </div>

                        <div className="card-body">

                            <div
                                className="fw-bold mb-1 small text-center"
                                onClick={() => {
                                    console.log("Score")
                                    userHighScoreMutate()
                                }}
                            >
                                User High Score: {userHighScore?.score || 0}
                            </div>

                            <div className="fw-bold mb-1 small text-center d-flex justify-content-center align-items-center">
                                <span
                                    className=""
                                    onClick={() => {
                                        setHighScore(0)
                                    }}
                                >
                                    <i className="action fas fa-eraser"></i>
                                </span>
                                Local High Score: {+highScore?.toFixed(0)}
                            </div>

                            <div className="fw-bold mb-3 small text-center">
                                Global User High Score: 0
                            </div>

                            <hr />

                            <div className="fw-bold mb-1 small text-center">
                                {lobbyDetails.players.length || 0} player{(lobbyDetails.players.length !== 1) && 's'} in the school.
                            </div>

                            {/* <div className='small fw-bold'>Public Servers</div> */}

                            <Link
                                className={``}
                                href={{
                                    pathname: `/play`
                                }}
                            >
                                <ArticlesButton
                                    className="px-5 w-100 mb-2"
                                >
                                    Play
                                </ArticlesButton>
                            </Link>

                        </div>

                        <div className="card-footer d-flex flex-wrap justify-content-center">

                            <GameMenuPrimaryButtonGroup 
                                useStore={useStore}
                                type="Landing"
                            />

                        </div>

                    </div>

                    <SessionButton
                        port={process.env.NEXT_PUBLIC_GAME_PORT}
                        friendsButton={true}
                    />

                    <ReturnToLauncherButton />

                </div>

                <GameScoreboard
                    game={process.env.NEXT_PUBLIC_GAME_NAME}
                    style="Default"
                    darkMode={darkMode ? true : false}
                    prepend={
                        <div
                            style={{
                                width: '100%',
                                height: '200px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <RotatingMascot />
                        </div>
                    }
                />

                <Ad
                    style="Default"
                    section={"Games"}
                    section_id={process.env.NEXT_PUBLIC_GAME_NAME}
                    darkMode={darkMode ? true : false}
                    user_ad_token={userToken}
                    userDetails={userDetails}
                    userDetailsLoading={userDetailsLoading}
                />

            </div>
        </div>
    );
}