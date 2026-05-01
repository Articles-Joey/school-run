import { useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import Link from "next/link";
import ArticlesButton from "./Button";

export default function DeathScreen() {

    const safeMode = useStore(state => state.safeMode);
    const gameOver = useGameStore(state => state.gameOver);
    const distance = useGameStore(state => state.distance);
    const setGameOver = useGameStore(state => state.setGameOver);
    const setDistance = useGameStore(state => state.setDistance);
    const generateInitialObstacles = useGameStore(state => state.generateInitialObstacles);

    if (!gameOver) {
        return null;
    }

    return (
        <>
            <div className='death-screen'>

                    {!safeMode &&
                        <img
                            className="background"
                            src={`${process.env.NEXT_PUBLIC_CDN}games/School Run/blood-splat.png`}
                        />
                    }

                    <div 
                        className="gradient"
                        style={{
                            ...(!safeMode && {
                                backgroundColor: "rgba(255, 0, 0, 0.5)"
                            })
                        }}
                    >

                    </div>

                    <div
                        className='card card-articles'
                        style={{
                            width: "300px"
                        }}
                    >

                        <div className="card-header text-center">
                            <h3 className='mb-0'>
                                {`${distance.toFixed(0)} ft - ${safeMode ? "You Tripped!" : "You're Dead!"}`}
                            </h3>
                        </div>

                        <div className="card-body text-center">
                            {safeMode ?
                                "You slipped and the chaser got you."
                                :
                                "You tripped over a dead classmate and the shooter got you. If only your government cared!"
                            }
                        </div>

                        <div className="card-footer d-flex justify-content-center">

                            <Link href={'/'} className="w-50">
                                <ArticlesButton
                                    className="w-100"
                                >
                                    Leave Game
                                </ArticlesButton>
                            </Link>

                            <ArticlesButton
                                className="w-50"
                                onClick={() => {
                                    generateInitialObstacles()
                                    setGameOver(false)
                                    setDistance(0)
                                }}
                            >
                                Restart Game
                            </ArticlesButton>

                        </div>

                    </div>

                </div>
        </>
    )

}