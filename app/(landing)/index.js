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

const game_key = 'school-run'
const game_name = 'School Run'
const game_port = 3020

export default function SchoolRunGameLandingPage() {

    const {
        socket,
        connected
    } = useSocketStore(state => ({
        socket: state.socket,
        connected: state.connected,
    }));

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

        <div className="school-run-lobby-page">

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

                        {/* <div style={{ position: 'relative', height: '200px' }}>
                            <Image
                                src={Logo}
                                alt=""
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div> */}

                        <div className="card-header">

                            <div className="form-group articles mb-0">
                                <label htmlFor="nickname">Nickname</label>
                                {/* <SingleInput
                                            value={nickname}
                                            setValue={setNickname}
                                            noMargin
                                        /> */}
                                <div className="d-flex align-items-center">
                                    <input
                                        type="text"
                                        value={_hasHydrated ? nickname : ''}
                                        disabled={!_hasHydrated}
                                        id="nickname"
                                        name="nickname"
                                        placeholder="Enter your nickname"
                                        onChange={(e) => {
                                            setNickname(e.target.value)
                                        }}
                                        className={`form-control form-control-sm`}
                                    />
                                    <ArticlesButton
                                        small
                                        className=""
                                        onClick={() => {
                                            randomNickname()
                                        }}
                                    >
                                        <i className="fad fa-random"></i>
                                    </ArticlesButton>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.8rem' }}>Visible to all players</div>

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

                            

                            {/* <div className='small fw-bold  mt-3 mb-1'>Or</div> */}

                            {/* <div className='d-flex'>
    
                                <ArticlesButton
                                    className={`w-50`}
                                    onClick={() => {
                                        // TODO
                                        alert("Coming Soon!")
                                    }}
                                >
                                    <i className="fad fa-robot"></i>
                                    Practice
                                </ArticlesButton>
    
                                <ArticlesButton
                                    className={`w-50`}
                                    onClick={() => {
                                        setShowPrivateGameModal(prev => !prev)
                                    }}
                                >
                                    <i className="fad fa-lock"></i>
                                    Private Game
                                </ArticlesButton>
    
                            </div> */}

                            {/* <IsDev className={'mt-3'}>
                                <div>
                                    <ArticlesButton
                                        className="w-50"
                                        variant='warning'
                                        onClick={() => {
                                            socket.emit('game:four-frogs:reset', '');
                                        }}
                                    >
                                        Reset Server
                                    </ArticlesButton>
                                </div>
                            </IsDev> */}

                        </div>

                        <div className="card-footer d-flex flex-wrap justify-content-center">

                            <div className='d-flex w-50'>
                                <ArticlesButton
                                    className={`flex-grow-1`}
                                    small
                                    onClick={() => {
                                        setShowSettingsModal(true)
                                    }}
                                >
                                    <i className="fad fa-cog"></i>
                                    Settings
                                </ArticlesButton>
                                <ArticlesButton
                                    className={``}
                                    small
                                    onClick={() => {
                                        toggleDarkMode()
                                    }}
                                >
                                    {darkMode ?
                                        <i className="fad fa-sun"></i>
                                        :
                                        <i className="fad fa-moon"></i>
                                    }
                                </ArticlesButton>
                            </div>

                            <ArticlesButton
                                className={`w-50`}
                                small
                                onClick={() => {
                                    setShowInfoModal(true)
                                }}
                            >
                                <i className="fad fa-info-square"></i>
                                Info
                            </ArticlesButton>

                            <a
                                href={'https://github.com/Articles-Joey/school-run'}
                                className='w-50'
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ArticlesButton
                                    className={`w-100`}
                                    small
                                    onClick={() => {

                                    }}
                                >
                                    <i className="fab fa-github"></i>
                                    Github
                                </ArticlesButton>
                            </a>

                            <ArticlesButton
                                className={`w-50`}
                                small
                                onClick={() => {
                                    setShowCreditsModal(true)
                                }}
                            >
                                <i className="fad fa-users"></i>
                                Credits
                            </ArticlesButton>

                        </div>

                    </div>

                    <SessionButton
                        port={game_port}
                        friendsButton={true}
                    />

                    <ReturnToLauncherButton />

                </div>

                <GameScoreboard
                    game={game_name}
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

                <Ad section={"Games"} section_id={game_name} />

            </div>
        </div>
    );
}