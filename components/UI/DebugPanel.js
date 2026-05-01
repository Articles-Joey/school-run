import { Dropdown, DropdownButton } from "react-bootstrap";

import { useGameStore } from "@/hooks/useGameStore";
import ArticlesButton from "@/components/UI/Button";
import { useStore } from "@/hooks/useStore";
import { useState } from "react";

export function DebugPanel() {

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

    const freeze = useGameStore(state => state.freeze);
    const setFreeze = useGameStore(state => state.setFreeze);

    const [showObstacles, setShowObstacles] = useState(false);

    return (
        <div
            className="card card-articles card-sm"
        >
            <div className="card-body">

                <div className="small text-muted">Debug Controls</div>

                <div className="mb-2">
                    <ArticlesButton
                        size="sm"
                        className="w-100"
                        onClick={() => {
                            setShowObstacles(!showObstacles)
                        }}
                    >
                        <i className="fad fa-redo"></i>
                        {showObstacles ? 'Hide Obstacles' : 'Show Obstacles'}
                    </ArticlesButton>

                    {showObstacles &&
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
                </div>

                <div className='d-flex flex-column'>

                    <div className='d-flex flex-wrap'>

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

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => {
                                setFreeze(!freeze)
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            {freeze ? 'Unfreeze' : 'Freeze'}
                        </ArticlesButton>

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