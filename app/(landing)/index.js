"use client"
import { useEffect, useContext, useState } from 'react';

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// import { useSelector, useDispatch } from 'react-redux'

// import ROUTES from 'components/constants/routes'

import GameScoreboard from '@/components/UI/GameScoreboard'

// const Ad = dynamic(() => import('components/Ads/Ad'), {
//     ssr: false,
// });

import ArticlesButton from '@/components/UI/Button';
// import SingleInput from '@/components/Articles/SingleInput';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
// import IsDev from '@/components/IsDev';
import { useSocketStore } from '@/hooks/useSocketStore';
import SchoolRunContentWarning from '@/components/ContentWarning';
import { useGameStore } from '@/hooks/useGameStore';
import useUserGameScore from '@/hooks/useUserGameScore';

const InfoModal = dynamic(
    () => import('@/components/UI/InfoModal'),
    { ssr: false }
)

const SettingsModal = dynamic(
    () => import('@/components/UI/SettingsModal'),
    { ssr: false }
)

// const PrivateGameModal = dynamic(
//     () => import('app/(site)/community/games/four-frogs/components/PrivateGameModal'),
//     { ssr: false }
// )

// const ArticlesModal = dynamic(() => import('@/components/Articles/ArticlesModal'), {
//     ssr: false,
// });

const game_key = 'school-run'
const game_name = 'School Run'

export default function SchoolRunGameLandingPage() {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const {
        setContentWarningAccept,
        highScore,
        setHighScore,
    } = useGameStore(state => ({
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

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)

    // const [contentWarningAccept, setContentWarningAccept] = useLocalStorageNew("game:school-run:contentWarningAccept", false)

    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [showPrivateGameModal, setShowPrivateGameModal] = useState(false)

    const [lobbyDetails, setLobbyDetails] = useState({
        players: [],
        games: [],
    })

    // useEffect(() => {

    //     if (socket) {
    //         socket.emit('join-room', 'four-frogs');
    //     }

    //     return () => {
    //         if (socket) {
    //             socket.emit('leave-room', 'four-frogs');
    //         }
    //     }

    // }, [socket]);

    useEffect(() => {

        setShowInfoModal(localStorage.getItem('game:four-frogs:rulesAnControls') === 'true' ? true : false)

        // if (userReduxState._id) {
        //     console.log("Is user")
        // }

        socket.on('game:four-frogs-landing-details', function (msg) {
            console.log('game:four-frogs-landing-details', msg)

            if (JSON.stringify(msg) !== JSON.stringify(lobbyDetails)) {
                setLobbyDetails(msg)
            }
        });

        return () => {
            socket.off('game:four-frogs-landing-details');
        };

    }, [])

    useEffect(() => {

        localStorage.setItem('game:four-frogs:rulesAnControls', showInfoModal)

    }, [showInfoModal])

    useEffect(() => {

        if (socket.connected) {
            socket.emit('join-room', 'game:four-frogs-landing');
        }

        return function cleanup() {
            socket.emit('leave-room', 'game:four-frogs-landing')
        };

    }, [socket.connected]);

    return (

        <div className="school-run-lobby-page">

            <SchoolRunContentWarning />

            {showInfoModal &&
                <InfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            }

            {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                />
            }

            {/* {showPrivateGameModal &&
                <PrivateGameModal
                    show={showPrivateGameModal}
                    setShow={setShowPrivateGameModal}
                />
            } */}

            <div className='background-wrap'>
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN}games/School Run/background.jpg`}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'bottom' }}
                />
            </div>

            <div className="container d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center">

                <div className="card card-articles mb-3 mb-lg-0" style={{ "width": "20rem" }}>

                    {/* <div style={{ position: 'relative', height: '200px' }}>
                        <Image
                            src={Logo}
                            alt=""
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div> */}

                    <div className="card-header">

                        <div className="form-group articles mb-1">
                            <label htmlFor="nickname">Nickname</label>
                            {/* <SingleInput
                                value={nickname}
                                setValue={setNickname}
                                noMargin
                            /> */}
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => {
                                    setNickname(e.target.value)
                                }}
                                className={`form-control form-control-sm`}
                            />
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
                            {lobbyDetails.players.length || 0} player{(lobbyDetails.players.length > 1 || lobbyDetails.players.length == 0) && 's'} in the school.
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

                        <div
                            className="btn-link small text-center"
                            type='button'
                            onClick={() => {
                                setContentWarningAccept(false)
                            }}
                        >
                            Content Warning!
                        </div>

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

                        <ArticlesButton
                            className={`w-50`}
                            small
                            onClick={() => {
                                setShowSettingsModal(prev => !prev)
                            }}
                        >
                            <i className="fad fa-cog"></i>
                            Settings
                        </ArticlesButton>

                        <ArticlesButton
                            className={`w-50`}
                            small
                            onClick={() => {
                                setShowInfoModal({
                                    game: game_name
                                })
                            }}
                        >
                            <i className="fad fa-info-square"></i>
                            Rules & Controls
                        </ArticlesButton>

                        <Link href={'/'} className='w-50'>
                            <ArticlesButton
                                className={`w-100`}
                                small
                                onClick={() => {

                                }}
                            >
                                <i className="fad fa-sign-out fa-rotate-180"></i>
                                Leave Game
                            </ArticlesButton>
                        </Link>

                        <ArticlesButton
                            className={`w-50`}
                            small
                            onClick={() => {
                                setShowInfoModal({
                                    game: game_name
                                })
                            }}
                        >
                            <i className="fad fa-users"></i>
                            Credits
                        </ArticlesButton>

                    </div>

                </div>

                <GameScoreboard game="School Run" />

                {/* <Ad section={"Games"} section_id={game_name} /> */}

            </div>
        </div>
    );
}