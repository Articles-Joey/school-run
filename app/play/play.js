"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic'
// import Script from 'next/script'

// import { useSelector, useDispatch } from 'react-redux'

// import ROUTES from '@/components/constants/routes';

import ArticlesButton from '@/components/UI/Button';

import useFullscreen from '@/hooks/useFullScreen';
import { useControllerStore } from '@/hooks/useControllerStore';
// import ControllerPreview from '@/components/Games/ControllerPreview';

// import { Dropdown, DropdownButton } from 'react-bootstrap';
import TouchControls from '@/components/UI/TouchControls';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
import LeftPanelContent from '@/components/UI/LeftPanel';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useGameStore } from '@/hooks/useGameStore';
import SchoolRunContentWarning from '@/components/ContentWarning';

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
    ssr: false,
});

function getDirections(axes) {
    // Determine movement direction based on axes
    const isMovingUp = axes[1] < -0.5;
    const isMovingDown = axes[1] > 0.5;
    const isMovingLeft = axes[0] < -0.5;
    const isMovingRight = axes[0] > 0.5;

    // Update movement payload
    return {
        up: isMovingUp,
        down: isMovingDown,
        left: isMovingLeft,
        right: isMovingRight,
    };
}

function isMoving(movementPayload) {
    // Check if any property in the movement payload is true
    return Object.values(movementPayload).some((value) => value === true);
}

// const ArticlesModal = dynamic(() => import('@/components/Articles/ArticlesModal'), {
//     ssr: false,
// });

export default function SchoolRunGamePage() {

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    const canvasGameRef = useRef(null);

    const {
        cameraMode, setCameraMode,
        teleport, setTeleport,
        playerLocation, setPlayerLocation,
        maxHeight, setMaxHeight,
        shift,
        distance,
        setDistance,
        setObstacles,
        gameOver,
        setGameOver
        // distance
        // touchControls, setTouchControls
    } = useGameStore()

    // const [playerData, setPlayerData] = useState({
    //     x: 0,
    //     y: 0,
    //     z: 0,
    //     money: 0,
    //     maxHeight: 0
    // });

    const [players, setPlayers] = useState([])

    var canvas;
    var context;

    var movement = {
        up: false,
        down: false,
        left: false,
        right: false,
        // tongue: false
    }

    // Box width
    var bw = 300;

    // Box height
    var bh = 800;

    // Padding
    var p = 0;

    let movementEmit = false


    const { controllerState, setControllerState } = useControllerStore()
    const [showControllerState, setShowControllerState] = useState(false)

    // const [ cameraMode, setCameraMode ] = useState('Player')

    const [showMenu, setShowMenu] = useState(false)

    // const [touchControlsEnabled, setTouchControlsEnabled] = useState(false)
    const [touchControlsEnabled, setTouchControlsEnabled] = useLocalStorageNew("game:touchControlsEnabled", false)

    useEffect(() => {

        const handleGamepadInput = () => {
            const gamepad = navigator.getGamepads()[0]; // Assuming only one controller is connected

            if (gamepad) {

                setControllerState(gamepad);

                let directions = getDirections(gamepad.axes);
                let buttons = getDirections(gamepad.buttons);

                let dropPressed

                gamepad.buttons.forEach((button, index) => {
                    if (button.pressed && index == 0) {
                        // dropPressed = true
                        console.log(`Jump button pressed`);
                    }
                });

                if (isMoving(directions) || dropPressed) {
                    console.log("Emit movement shit!");

                    // socket.emit('glass-ceiling-player-movement', {
                    //     room,
                    //     ...(directions.down && { moveDown: directions.down }),
                    //     ...(directions.up && { moveUp: directions.up }),
                    //     ...(directions.right && { moveRight: directions.right }),
                    //     ...(directions.left && { moveLeft: directions.left }),
                    //     drop: dropPressed,
                    // });
                }
            }
        };

        // Start the monitoring loop with an interval
        const intervalId = setInterval(handleGamepadInput, 1000 / 30);

        const movementEmit = setInterval(function () {

            // console.log("Beep")

            socket.emit('glass-ceiling-movement', playerLocation);

            // setPlayerData(prevLocation => {

            //     // console.log("Boop")
            //     // Do any necessary computations or updates based on the previous state
            //     const updatedLocation = prevLocation /* your logic to update the location */;
            //     socket.emit('glass-ceiling-movement', updatedLocation);
            //     return updatedLocation; // Return the new state
            // });

            // socket.emit('glass-ceiling-movement', playerLocation);

        },
            // 1000 / 30
            1000
        );

        return () => {
            // Stop the monitoring loop when the component is unmounted
            clearInterval(movementEmit);
            clearInterval(intervalId);
        };

        return

        canvas = canvasGameRef.current
        context = canvas.getContext("2d");

        const movementEmitOld = setInterval(function () {

            socket.emit('glass-ceiling-movement', movement);

        }, 1000 / 30);

        function glassCeilingLogic(msg) {

            console.log(`Just received this message from server`);

        }

        // socket.emit('join-room', 'game:glass-ceiling');

        socket.on('glass-ceiling-players', glassCeilingLogic);

        document.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                case 65: // A
                    movement.left = true;
                    break;
                case 87: // W
                    movement.up = true;
                    break;
                case 68: // D
                    movement.right = true;
                    break;
                case 83: // S
                    movement.down = true;
                    break;
                case 37: // ArrowLeft
                    movement.rotateLeft = true;
                    break;
                case 39: // ArrowRight
                    movement.rotateRight = true;
                    break;
                case 38: // ArrowUp
                    movement.score = true;
                    break;
                case 32: // Tongue
                    movement.tongue = true;
                    break;
            }
        });

        document.addEventListener('keyup', function (event) {
            switch (event.keyCode) {
                case 65: // A
                    movement.left = false;
                    break;
                case 87: // W
                    movement.up = false;
                    break;
                case 68: // D
                    movement.right = false;
                    break;
                case 83: // S
                    movement.down = false;
                    break;
                case 37: // ArrowLeft
                    movement.rotateLeft = false;
                    break;
                case 39: // ArrowRight
                    movement.rotateRight = false;
                    break;
                case 32: // Tongue
                    movement.tongue = false;
                    break;
            }
        });

        return () => {
            // console.log("Leave room");
            // socket.off('glass-ceiling-players', glassCeilingLogic)
            // clearInterval(movementEmit);
            // socket.emit('leave-room', 'game:glass-ceiling');
        }

    }, []);

    const [sceneKey, setSceneKey] = useState(0);

    // Function to handle scene reload
    const reloadScene = () => {
        setDistance(0)
        setObstacles([])
        setSceneKey((prevKey) => prevKey + 1);
    };

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    let panelProps = {
        server,
        players,
        touchControlsEnabled,
        setTouchControlsEnabled,
        reloadScene,
        controllerState,
        isFullscreen,
        requestFullscreen,
        exitFullscreen,
        setShowMenu
    }

    return (

        <div
            className={`school-run-game-page ${isFullscreen && 'fullscreen'}`}
            id="school-run-game-page"
        >

            <SchoolRunContentWarning />

            <div className="menu-bar card card-articles p-1 justify-content-center">

                <div className='flex-header align-items-center'>

                    <ArticlesButton
                        small
                        active={showMenu}
                        onClick={() => {
                            setShowMenu(prev => !prev)
                        }}
                    >
                        <i className="fad fa-bars"></i>
                        <span>Menu</span>
                    </ArticlesButton>

                    <div>
                        Y: {(playerLocation?.y || 0)}
                    </div>

                </div>

            </div>

            <div className={`mobile-menu ${showMenu && 'show'}`}>
                <LeftPanelContent
                    {...panelProps}
                />
            </div>

            <TouchControls
                touchControlsEnabled={touchControlsEnabled}
            />

            <div className='panel-left card rounded-0 d-none d-lg-flex'>

                <LeftPanelContent
                    {...panelProps}
                />

            </div>

            {/* <div className='game-info'>
                <div className="card card-articles card-sm">
                    <div className="card-body">
                        <pre> 
                            {JSON.stringify(playerData, undefined, 2)}
                        </pre>
                    </div>
                </div>
            </div> */}

            <div className='canvas-wrap'>

                {gameOver &&
                    <div className='death-screen'>

                        <img 
                            className="background"
                            src={`${process.env.NEXT_PUBLIC_CDN}games/School Run/blood-splat.png`}
                        />

                        <div className="gradient">

                        </div>

                        <div
                            className='card card-articles'
                            style={{
                                width: "300px"
                            }}
                        >

                            <div className="card-header text-center">
                                <h3 className='mb-0'>{distance.toFixed(0)} ft - You're Dead!</h3>
                            </div>

                            <div className="card-body text-center">
                                You tripped over a dead classmate and the shooter got you. If only your government cared!
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
                                        setGameOver(false)
                                        setDistance(0)
                                    }}
                                >
                                    Restart Game
                                </ArticlesButton>

                            </div>

                        </div>

                    </div>
                }

                <GameCanvas
                    key={sceneKey}
                    // playerData={playerData}
                    // setPlayerData={setPlayerData}
                    players={players}
                />

            </div>

            {/* <div className='d-flex justify-content-center w-100'>

                <div className="canvas-wrap">
                    <canvas
                        width={300}
                        height={600}
                        ref={canvasGameRef}
                    />
                    <canvas
                        width={300}
                        height={600}
                        id='static-canvas'
                    />
                </div>

            </div> */}

            {/* <div className="container py-3">

                <div className="card card-articles">
                    <div className="card-body p-2">
                        {JSON.stringify(playerData)}
                    </div>
                </div>

                <ArticlesButton onClick={() => socket.emit('join-room', 'glass-ceiling')} className="">Ping</ArticlesButton>

            </div>

            <div className="background"></div> */}

        </div>
    );
}