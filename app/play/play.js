"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import dynamic from 'next/dynamic'

import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';

import TouchControls from '@/components/UI/TouchControls';
import LeftPanelContent from '@/components/UI/LeftPanel';
import { useGameStore } from '@/hooks/useGameStore';
import SchoolRunContentWarning from '@/components/ContentWarning';
import { useStore } from '@/hooks/useStore';
import DeathScreen from '@/components/UI/DeathScreen';

import GameMenu from '@articles-media/articles-dev-box/GameMenu';
import { useHotkeys } from 'react-hotkeys-hook';
import UiOverlay from '@/components/UI/UiOverlay';

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
    ssr: false,
});

export default function GamePage() {

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
                menuBarConfig={{
                    style: "Corner Button",
                    menuBarButtonPosition: "Left"
                }}
                sidebarConfig={{
                    style: "Static Panel",
                }}
            />

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