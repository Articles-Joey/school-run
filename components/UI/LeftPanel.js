import Link from "next/link";

import { useGameStore } from "@/hooks/useGameStore";
import ArticlesButton from "@/components/UI/Button";
import { useStore } from "@/hooks/useStore";
import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';
import { DebugPanel } from "./DebugPanel";

export default function LeftPanelContent(props) {

    const {
        // server,
        // players,
        // touchControlsEnabled,
        // setTouchControlsEnabled,
        // reloadScene,
        // controllerState,
        // isFullscreen,
        // requestFullscreen,
        // exitFullscreen,
        // setShowMenu
    } = props;

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const setSceneKey = useStore(state => state.setSceneKey);
    const sceneKey = useStore(state => state.sceneKey);

    const setShowMenu = useStore(state => state.setShowMenu);

    const setShowSettingsModal = useStore(state => state.setShowSettingsModal)

    // const {
    //     socket,
    // } = useSocketStore(state => ({
    //     socket: state.socket,
    // }));

    const cameraMode = useGameStore(state => state.cameraMode);
    const setCameraMode = useGameStore(state => state.setCameraMode);
    // const teleport = useGameStore(state => state.teleport);
    const setTeleport = useGameStore(state => state.setTeleport);
    // const playerLocation = useGameStore(state => state.playerLocation);
    // const setPlayerLocation = useGameStore(state => state.setPlayerLocation);
    const maxHeight = useGameStore(state => state.maxHeight);
    // const setMaxHeight = useGameStore(state => state.setMaxHeight);
    // const shift = useGameStore(state => state.shift);
    const characterAnimation = useGameStore(state => state.characterAnimation);
    const setCharacterAnimation = useGameStore(state => state.setCharacterAnimation);
    const distance = useGameStore(state => state.distance);

    // const setObstacles = useGameStore(state => state.setObstacles);
    const debug = useStore(state => state.debug)
    const highScore = useGameStore(state => state.highScore);

    const safeMode = useStore((state) => state.safeMode);
    const setSafeMode = useStore((state) => state.setSafeMode);
    // const saferMode = useGameStore(state => state.saferMode);
    // const setSaferMode = useGameStore(state => state.setSaferMode);

    const darkMode = useStore(state => state.darkMode);
    const toggleDarkMode = useStore(state => state.toggleDarkMode);
    const sidebar = useStore(state => state.sidebar);
    const toggleSidebar = useStore(state => state.toggleSidebar);
    // const touchControls = useGameStore(state => state.touchControls);
    // const setTouchControls = useGameStore(state => state.setTouchControls);

    return (
        <div className='w-100'>

            <div className="card card-articles card-sm">

                <div className="card-body d-flex flex-wrap">

                    <GameMenuPrimaryButtonGroup
                        useStore={useStore}
                        type="Game Menu"
                    />

                </div>
            </div>

            <div
                className="card card-articles card-sm"
            >
                <div className="card-body d-flex justify-content-between">

                    <div>

                        {/* <div className="small text-muted">playerData</div> */}

                        <div className="small">

                            {/* <div>X: {playerLocation?.x}</div> */}
                            {/* <div>Y: {playerLocation?.y}</div> */}
                            {/* <div>Z: {playerLocation.z}</div> */}

                            <div>Score: {distance.toFixed(0)}</div>
                            <div className="mb-0">High Score: {(+highScore || 0)?.toFixed(0)}</div>

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
    )

}