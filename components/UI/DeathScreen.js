import { useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import Link from "next/link";
import Box from "@mui/material/Box";
import ArticlesButton from "./Button";

export default function DeathScreen() {
    const safeMode = useStore((state) => state.safeMode);
    const gameOver = useGameStore((state) => state.gameOver);
    const distance = useGameStore((state) =>
        state.gameOver ? state.distance : 0,
    );
    const setGameOver = useGameStore((state) => state.setGameOver);
    const setDistance = useGameStore((state) => state.setDistance);
    const generateInitialObstacles = useGameStore(
        (state) => state.generateInitialObstacles,
    );
    const reset = useGameStore((state) => state.reset);

    if (!gameOver) {
        return null;
    }

    return (
        <>
            <Box
                className="death-screen"
                sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    left: 0,
                    top: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1,
                }}
            >
                {!safeMode && (
                    <Box
                        component="img"
                        className="background"
                        src={`img/blood-splat.png`}
                        sx={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            left: 0,
                            top: 0,
                            backgroundColor: "rgba(255, 0, 0, 0.75)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1,
                            objectFit: "cover",
                            animation: "fadeInBackground 5s ease-in-out",
                            "@keyframes fadeInBackground": {
                                from: {
                                    backgroundColor: "rgba(255, 0, 0, 0)",
                                },
                                to: {
                                    backgroundColor: "rgba(255, 0, 0, 0.75)",
                                },
                            },
                        }}
                    />
                )}

                {safeMode && (
                    <Box
                        className="gradient"
                        sx={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            left: 0,
                            top: 0,
                            backgroundColor: "rgba(255, 150, 0, 0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 2,
                        }}
                    />
                )}

                <Box
                    className="card card-articles"
                    sx={{
                        width: 300,
                        zIndex: 3,
                    }}
                >
                    <div className="card-header text-center">
                        <h3 className="mb-0">
                            {`${distance.toFixed(0)} ft - ${safeMode ? "You Tripped!" : "You're Dead!"}`}
                        </h3>
                    </div>

                    <div className="card-body text-center">
                        {safeMode
                            ? "You slipped and the chaser got you."
                            : "You tripped over a dead classmate and the shooter got you. If only your government cared!"}
                    </div>

                    <div className="card-footer d-flex justify-content-center">
                        <Link
                            href={"/"}
                            className="w-50"
                        >
                            <ArticlesButton
                                className="w-100"
                                onClick={() => {
                                    reset();
                                }}
                            >
                                Leave Game
                            </ArticlesButton>
                        </Link>

                        <ArticlesButton
                            className="w-50"
                            onClick={() => {
                                reset();
                            }}
                        >
                            Restart Game
                        </ArticlesButton>
                    </div>
                </Box>
            </Box>
        </>
    );
}
