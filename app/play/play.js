"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic'
// import Script from 'next/script'

// import { useSelector, useDispatch } from 'react-redux'

// import ROUTES from '@/components/constants/routes';

import ArticlesButton from '@/components/UI/Button';

import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';
import { useControllerStore } from '@/hooks/useControllerStore';
// import ControllerPreview from '@/components/Games/ControllerPreview';

// import { Dropdown, DropdownButton } from 'react-bootstrap';
import TouchControls from '@/components/UI/TouchControls';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
import LeftPanelContent from '@/components/UI/LeftPanel';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useGameStore } from '@/hooks/useGameStore';
import SchoolRunContentWarning from '@/components/ContentWarning';
import { useStore } from '@/hooks/useStore';
import useTouchControlsStore from '@/hooks/useTouchControlsStore';
import DeathScreen from '@/components/UI/DeathScreen';
import MobileMenu from '@/components/UI/MobileMenu';

import GameMenu from '@articles-media/articles-dev-box/GameMenu';
import { useHotkeys } from 'react-hotkeys-hook';
import UiOverlay from '@/components/UI/UiOverlay';

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

export default function GamePage() {

    const showMenu = useStore(state => state.showMenu);
    const setShowMenu = useStore(state => state.setShowMenu);
    const sceneKey = useStore(state => state.sceneKey);

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const sidebar = useStore(state => state.sidebar);

    useHotkeys('p', () => {
        useGameStore.getState().toggleFreeze();
    }, [])
    useHotkeys('r', () => {
        useStore.getState().reloadScene();
    }, [])

    return (

        <div
            className={`school-run-game-page ${isFullscreen && 'fullscreen'} ${sidebar && 'show-sidebar'}`}
            id="school-run-game-page"
        >

            <SchoolRunContentWarning />

            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                // menuBarStyle={"Bar"}
                menuBarStyle={"Corner Button"}
                // TODO add positioning for corner button style
                menuBarConfig={{
                    style: "Corner Button",
                    menuButtonPosition: ""
                }}
                sidebarStyle={"Static Panel"}
                // sidebarStyle={"Floating Panel"}
            />

            {/* <MobileMenu /> */}

            <TouchControls />            

            <div className='canvas-wrap'>

                <DeathScreen />

                <UiOverlay />

                <GameCanvas
                    key={sceneKey}
                />

            </div>

        </div>
    );
}