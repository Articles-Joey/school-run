import { useGameStore } from "@/hooks/useGameStore";
import Box from "@mui/material/Box";
import { useStore } from "@/hooks/useStore";

export default function UiOverlay() {
    const screenshotMode = useStore((state) => state.screenshotMode);

    const distance = useGameStore((state) => Math.round(state.distance));
    const highScore = useGameStore((state) => state.highScore);
    const isRolling = useGameStore((state) => state.isRolling);

    return (
        <Box
            className="ui-overlay"
            sx={{
                zIndex: 1,
                position: "absolute",
                top: "0.5rem",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#000",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                color: "#fff",
                display: screenshotMode ? "none" : "flex",
                // display: "none",
                fontSize: "0.8rem",
            }}
        >
            <div className="distance">
                {`Distance: ${distance.toFixed(0)} ft`}
            </div>
            <div className="px-2">-</div>
            <div className="high-score">
                {`High Score: ${highScore.toFixed(0)} ft`}
            </div>
            <div>
                {isRolling && (
                    <span style={{ marginLeft: "1rem", color: "cyan" }}>
                        Rolling
                    </span>
                )}
            </div>
        </Box>
    );
}
