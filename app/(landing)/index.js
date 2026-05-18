"use client"
import { useEffect, useContext, useState } from 'react';

import Link from 'next/link'
import dynamic from 'next/dynamic'

import ArticlesButton from '@/components/UI/Button';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useGameStore } from '@/hooks/useGameStore';
import useUserGameScore from '@/hooks/useUserGameScore';
import { useStore } from '@/hooks/useStore';
import RotatingMascot from '@/components/UI/RotatingMascot';
import LandingBackgroundAnimation from '@/components/Game/LandingBackgroundAnimation';
import getAssetSource from "@/util/getAssetSource";

import useUserToken from '@articles-media/articles-dev-box/useUserToken';
import PageTemplateLandingPage from '@articles-media/articles-dev-box/PageTemplateLandingPage';

const background_link = getAssetSource(
    `img/preview.webp`
);

export default function SchoolRunGameLandingPage() {

    const connected = useSocketStore(state => state.connected);

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken(
        process.env.NEXT_PUBLIC_GAME_PORT
    );

    // const {
    //     data: userDetails,
    //     error: userDetailsError,
    //     isLoading: userDetailsLoading,
    //     mutate: userDetailsMutate
    // } = useUserDetails({
    //     token: userToken
    // });

    const {
        highScore,
        setHighScore,
        setDistance
    } = useGameStore(state => ({
        highScore: state.highScore,
        setHighScore: state.setHighScore,
        setDistance: state.setDistance,
    }));

    const {
        data: userHighScore,
        isLoading: userHighScoreLoading,
        mutate: userHighScoreMutate
    } = useUserGameScore({
        game: 'School Run'
    });

    const lobbyDetails = useStore(state => state.lobbyDetails)

    useEffect(() => {

        setDistance(0)

    }, []);

    return (
        <>
            <PageTemplateLandingPage
                useSocketStore={useSocketStore}
                useStore={useStore}
                RotatingMascot={RotatingMascot}
                Link={Link}
                // logoImage={logo.src}
                LandingBackgroundAnimation={
                    <LandingBackgroundAnimation />
                }
                CardBodyOverride={<>
                    <div className="card-body">

                        <div className="fw-bold mb-1 small text-center d-flex justify-content-center align-items-center">
                            <span
                                className=""
                                style={{
                                    cursor: 'pointer',
                                    marginRight: '0.25rem'
                                }}
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to reset your local high score?")) {
                                        setHighScore(0);
                                    }
                                }}
                            >
                                <i className="action fas fa-eraser"></i>
                            </span>
                            Local High Score: {+highScore?.toFixed(0)}
                        </div>

                        {userToken &&
                            <>
                                {userHighScoreLoading ?
                                    <div className="fw-bold mb-0 small text-center">
                                        Loading user high score...
                                    </div>
                                    :
                                    <div
                                        className="fw-bold mb-0 small text-center"
                                    >
                                        <span
                                            className=""
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '0.25rem'
                                            }}
                                            onClick={() => {
                                                userHighScoreMutate()
                                            }}
                                        >
                                            <i className="action fas fa-redo"></i>
                                        </span>
                                        User High Score: {userHighScore?.score || 0}
                                    </div>
                                }
                            </>
                        }

                        {/* <div className="fw-bold mb-3 small text-center">
                                    Global User High Score: 0
                                </div> */}

                        {process.env.NEXT_PUBLIC_ENABLE_ARTICLES === 'true' &&
                            <>
                                <hr />

                                <div className="fw-bold mb-1 small text-center">
                                    {lobbyDetails.online_player_count || 0} player{(lobbyDetails.online_player_count !== 1) && 's'} in the school.
                                </div>
                            </>
                        }

                        {/* <div className='small fw-bold'>Public Servers</div> */}

                        <Link
                            prefetch={false}
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
                </>}
                // disableHero
                heroOverride={<>
                    <div className='branding-backpack py-3'>
                        <img
                            src={"img/school-bag.png"}
                            width={200}
                            style={{
                                // objectFit: "contain"
                            }}
                        ></img>
                    </div>

                    <div className="branding-chalkboard">

                        <img
                            src={"img/green-chalkboard.webp"}
                            width={200}
                            className="background"
                        ></img>

                        <h1 className="playwrite-ar-guides-regular text-center">
                            {process.env.NEXT_PUBLIC_GAME_NAME}
                        </h1>

                    </div>
                </>}
                backgroundImage={background_link}
                singlePlayerConfig={{

                }}
                NicknameInputConfig={{
                    // PreComponent: <div className='flex-shrink-0 me-2'>

                    //     <div style={{ width: '50px', height: '50px' }} >
                    //         <div
                    //             className="ratio ratio-1x1 mb-1"
                    //         >
                    //             <div>
                    //                 <Viewer scale={13} model={character.model} />
                    //             </div>
                    //         </div>
                    //     </div>

                    //     <ArticlesButton
                    //         small
                    //         className="w-100"
                    //         onClick={() => {
                    //             setCharacterEdit(true)
                    //         }}
                    //     >
                    //         Edit
                    //     </ArticlesButton>

                    // </div>
                }}
                multiplayerConfig={{
                    // type: "WebSocket",
                    // comingSoon: true,
                    // defaultServers: 2,
                    // privateServerSupport: false,
                }}
                gameScoreboardConfig={{
                    append_score_text: "m",
                    metrics: [
                        {
                            label: 'Max Distance',
                            key: "score",
                            format: (value) => `${value} m`
                        },
                        {
                            label: 'Distance Ran',
                            key: "total_distance",
                            format: (value) => `${value} m`
                        }
                    ]
                }}
                // brandingTextClass="jaro-primary"
                disableGameScoreboard={process.env.NEXT_PUBLIC_ENABLE_ARTICLES !== 'true'}
                disableAd={process.env.NEXT_PUBLIC_ENABLE_ARTICLES !== 'true'}
            />
        </>
    );
}