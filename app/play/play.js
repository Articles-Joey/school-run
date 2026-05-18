"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import dynamic from 'next/dynamic'

import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';

import TouchControls from '@/components/UI/TouchControls';
import LeftPanelContent from '@/components/UI/LeftPanel';
import { useGameStore } from '@/hooks/useGameStore';
import { useStore } from '@/hooks/useStore';
import DeathScreen from '@/components/UI/DeathScreen';
import classNames from "classnames";
import GameMenu from '@articles-media/articles-dev-box/GameMenu';
import UiOverlay from '@/components/UI/UiOverlay';
// import GameOverModal from '@/components/UI/GameOverModal';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function GamePage() {

    const sceneKey = useStore(state => state.sceneKey);

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const sidebar = useStore(state => state.sidebar);
    const showMenu = useStore(state => state.showMenu);

    return (

        <div
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    'menu-open': showMenu,
                    'fullscreen': useFullscreen().isFullscreen,
                    'show-sidebar': sidebar,
                }
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
        >            

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

            <div className='canvas-wrap'>

                <TouchControls />

                <DeathScreen />

                <UiOverlay />

                <GameCanvas
                    key={sceneKey}
                />

            </div>

        </div>
    );
}