import Link from "next/link";

import { Dropdown, DropdownButton } from "react-bootstrap";

// import ROUTES from '@/components/constants/routes';
import { useGameStore } from "@/hooks/useGameStore";
import ArticlesButton from "@/components/UI/Button";
import { useStore } from "@/hooks/useStore";
import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';

// import ControllerPreview from "@/components/Games/ControllerPreview";

// import { useSocketStore } from "@/components/context/useSocketStore";

export default function LeftPanelContent(props) {

    const {
        // server,
        // players,
        touchControlsEnabled,
        setTouchControlsEnabled,
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

                    {/* <div className='flex-header'>
                        <div>Server: {server}</div>
                        <div>Players: {players.length || 0}/50</div>
                    </div> */}

                    {/* {!socket?.connected &&
                        <div
                            className=""
                        >

                            <div className="">

                                <div className="h6 mb-1">Not connected</div>

                                <ArticlesButton
                                    onClick={() => {
                                        console.log("Reconnect")
                                        socket.connect()
                                    }}
                                >
                                    Reconnect!
                                </ArticlesButton>

                            </div>

                        </div>
                    } */}

                    <Link
                        href={"/"}
                        className="w-50"
                    >
                        <ArticlesButton
                            className='w-100'
                            small
                        >
                            <i className="fad fa-arrow-alt-square-left"></i>
                            <span>Leave Game</span>
                        </ArticlesButton>
                    </Link>

                    <ArticlesButton
                        small
                        className="w-50"
                        active={isFullscreen}
                        onClick={() => {
                            if (isFullscreen) {
                                exitFullscreen()
                            } else {
                                requestFullscreen()
                            }
                        }}
                    >
                        {isFullscreen && <span>Exit </span>}
                        {!isFullscreen && <span><i className='fad fa-expand'></i></span>}
                        <span>Fullscreen</span>
                    </ArticlesButton>

                    <div className='w-50 d-flex'>
                        <ArticlesButton
                            // ref={el => elementsRef.current[4] = el}
                            // active={activeIndex === 3}
                            className={`w-100 flex-grow-1`}
                            small
                            onClick={() => {
                                setShowSettingsModal(true)
                            }}
                        >
                            <i className="fad fa-cog"></i>
                            Settings
                        </ArticlesButton>
                        <ArticlesButton
                            // ref={el => elementsRef.current[4] = el}
                            // active={activeIndex === 3}
                            className={`flex-grow-0`}
                            small
                            onClick={() => {
                                toggleDarkMode()
                            }}
                        >
                            {darkMode ? <i className="fad fa-moon"></i> : <i className="fad fa-sun"></i>}
                            {/* <i className="fad fa-sun"></i> */}
                        </ArticlesButton>
                    </div>

                    <ArticlesButton
                        size="sm"
                        className="w-50"
                        active={sidebar}
                        onClick={() => toggleSidebar()}
                    >
                        <i className="fad fa-bars"></i>
                        Sidebar
                    </ArticlesButton>

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

function DebugPanel() {

    const setSceneKey = useStore(state => state.setSceneKey);
    const sceneKey = useStore(state => state.sceneKey);

    const setShowMenu = useStore(state => state.setShowMenu);

    const cameraMode = useGameStore(state => state.cameraMode);
    const setCameraMode = useGameStore(state => state.setCameraMode);
    const setTeleport = useGameStore(state => state.setTeleport);
    const maxHeight = useGameStore(state => state.maxHeight);
    const characterAnimation = useGameStore(state => state.characterAnimation);
    const setCharacterAnimation = useGameStore(state => state.setCharacterAnimation);
    const debug = useStore(state => state.debug)
    const setDebug = useStore(state => state.setDebug);
    const obstacles = useGameStore(state => state.obstacles);

    return (
        <div
            className="card card-articles card-sm"
        >
            <div className="card-body">

                <div className="small text-muted">Debug Controls</div>

                {debug &&
                    <div className="small border mb-2 p-2">
                        {obstacles?.map((obstacle, obstacle_i) => {
                            return (
                                <div key={obstacle.id}>
                                    {obstacle_i} - {obstacle.position?.[2].toFixed(2)}
                                </div>
                            )
                        })}
                    </div>
                }

                <div className='d-flex flex-column'>

                    <div>
                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => {
                                setSceneKey(sceneKey + 1)
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            Reload Game
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => {
                                setSceneKey(sceneKey + 1)
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            Reset Camera
                        </ArticlesButton>
                    </div>

                    <div className='d-flex'>

                        <div className='w-50'>
                            <DropdownButton
                                variant="articles w-100"
                                size='sm'
                                disabled={true}
                                id="dropdown-basic-button"
                                className="dropdown-articles"
                                title={
                                    <span>
                                        <i className="fad fa-ufo"></i>
                                        <span>Teleport</span>
                                    </span>
                                }
                            >

                                <div style={{ maxHeight: '600px', overflowY: 'auto', width: '200px' }}>

                                    {[
                                        {
                                            name: '20',
                                            position: [-4, 20, 0]
                                        },
                                        {
                                            name: '30',
                                            position: [-4, 31, 0]
                                        },
                                        {
                                            name: '100',
                                            position: [-4, 101, 0]
                                        },
                                        {
                                            name: 'Sprint 1 116',
                                            position: [-28, 116.5, 0]
                                        },
                                        {
                                            name: 'Sprint 2 132',
                                            position: [27, 131, 0]
                                        }
                                    ]
                                        .map(location =>
                                            <Dropdown.Item
                                                key={location.name}
                                                onClick={() => {
                                                    setTeleport(location.position)
                                                    setShowMenu(false)
                                                }}
                                                className="d-flex justify-content-between"
                                            >

                                                {maxHeight > location.position[1] ?
                                                    <i className="fad fa-unlock"></i>
                                                    :
                                                    <i className="fad fa-lock"></i>
                                                }

                                                {location.name}
                                            </Dropdown.Item>
                                        )}

                                </div>

                            </DropdownButton>
                        </div>

                        <div className='w-50'>
                            <DropdownButton
                                variant="articles w-100"
                                size='sm'
                                id="dropdown-basic-button"
                                className="dropdown-articles"
                                title={
                                    <span>
                                        <i className="fad fa-camera"></i>
                                        <span>Camera</span>
                                    </span>
                                }
                            >

                                <div style={{ maxHeight: '600px', overflowY: 'auto', width: '200px' }}>

                                    {[
                                        {
                                            name: 'Free',
                                        },
                                        {
                                            name: 'Player',
                                        }
                                    ]
                                        .map(location =>
                                            <Dropdown.Item
                                                key={location.name}
                                                active={cameraMode == location.name}
                                                onClick={() => {
                                                    setCameraMode(location.name)
                                                    setShowMenu(false)
                                                }}
                                                className="d-flex justify-content-between"
                                            >
                                                <i className="fad fa-camera"></i>
                                                {location.name}
                                            </Dropdown.Item>
                                        )}

                                </div>

                            </DropdownButton>
                        </div>

                    </div>

                    <div className="d-flex">

                        <div className='w-50'>
                            <DropdownButton
                                variant="articles w-100"
                                size='sm'
                                id="dropdown-basic-button"
                                className="dropdown-articles"
                                title={
                                    <span>
                                        <i className="fad fa-film"></i>
                                        <span>Animation</span>
                                    </span>
                                }
                            >

                                <div style={{ maxHeight: '600px', overflowY: 'auto', width: '200px' }}>

                                    {[
                                        {
                                            name: "Running",
                                            key: 'CharacterArmature|Run'
                                        },
                                        {
                                            name: "Death",
                                            key: 'CharacterArmature|Death'
                                        },
                                        {
                                            name: "Roll",
                                            key: 'CharacterArmature|Roll'
                                        },
                                        {
                                            name: "Idle",
                                            key: 'CharacterArmature|Idle'
                                        },
                                        {
                                            name: "Idle_Neutral",
                                            key: 'CharacterArmature|Idle_Neutral'
                                        },
                                        {
                                            name: "Wave",
                                            key: 'CharacterArmature|Wave'
                                        },
                                        // {
                                        //     name: "HitRecieve",
                                        //     key: 'CharacterArmature|HitRecieve'
                                        // }
                                    ]
                                        .map(location =>
                                            <Dropdown.Item
                                                key={location.name}
                                                active={characterAnimation == location.key}
                                                onClick={() => {
                                                    // setTeleport(location.position)
                                                    // setShowMenu(false)
                                                    setCharacterAnimation(location.key)
                                                }}
                                                className="d-flex justify-content-between"
                                            >

                                                {/* {maxHeight > location.position[1] ?
                                                        <i className="fad fa-unlock"></i>
                                                        :
                                                        <i className="fad fa-lock"></i>
                                                    } */}

                                                {location.name}
                                            </Dropdown.Item>
                                        )}

                                </div>

                            </DropdownButton>
                        </div>

                        <div className='w-50'>
                            <DropdownButton
                                variant="articles w-100"
                                size='sm'
                                id="dropdown-basic-button"
                                className="dropdown-articles"
                                title={
                                    <span>
                                        <i className="fad fa-bug"></i>
                                        <span>Debug </span>
                                        <span>{debug ? 'On' : 'Off'}</span>
                                    </span>
                                }
                            >

                                <div style={{ maxHeight: '600px', overflowY: 'auto', width: '200px' }}>

                                    {[
                                        false,
                                        true
                                    ]
                                        .map(location =>
                                            <Dropdown.Item
                                                key={location}
                                                active={characterAnimation == location}
                                                onClick={() => {
                                                    setDebug(location)
                                                }}
                                                className="d-flex justify-content-between"
                                            >
                                                {location ? 'True' : 'False'}
                                            </Dropdown.Item>
                                        )}

                                </div>

                            </DropdownButton>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}