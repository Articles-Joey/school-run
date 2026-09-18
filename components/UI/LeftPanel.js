import { useGameStore } from "@/hooks/useGameStore";
import ArticlesButton from "@/components/UI/Button";
import { useStore } from "@/hooks/useStore";
import { DebugPanel } from "./DebugPanel";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import { useRouter } from "next/navigation";

export default function LeftPanelContent(props) {
    const debug = useStore((state) => state.debug);

    const distance = useGameStore((state) => state.distance);
    const highScore = useGameStore((state) => state.highScore);

    return (
        <div className="w-100">
            <div className="card card-articles card-sm">
                <div className="card-body d-flex flex-wrap">
                    <GameMenuPrimaryButtonGroup
                        useStore={useStore}
                        type="GameMenu"
                        useRouter={useRouter}
                    />
                </div>
            </div>

            <div className="card card-articles card-sm">
                <div className="card-body d-flex justify-content-between">
                    <div>
                        {/* <div className="small text-muted">playerData</div> */}

                        <div className="small">
                            {/* <div>X: {playerLocation?.x}</div> */}
                            {/* <div>Y: {playerLocation?.y}</div> */}
                            {/* <div>Z: {playerLocation.z}</div> */}

                            <div>Score: {distance.toFixed(0)}</div>
                            <div className="mb-0">
                                High Score: {(+highScore || 0)?.toFixed(0)}
                            </div>

                            {/* <div>Shift: {shift ? 'True' : 'False'}</div> */}

                            {/* <div className="small">Character Animation: {characterAnimation ? characterAnimation : 'None'}</div> */}
                        </div>
                    </div>

                    {/* <div>
                        <div className="small text-muted">maxHeight</div>
                        <div>Y: {maxHeight}</div>
                        <ArticlesButton
                            small
                            onClick={() => {
                                setMaxHeight(playerLocation?.y)
                            }}
                        >
                            Reset
                        </ArticlesButton>
                    </div> */}
                </div>
            </div>

            {/* Debug Controls */}
            {debug && <DebugPanel />}
        </div>
    );
}
