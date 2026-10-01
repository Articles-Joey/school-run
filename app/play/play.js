"use client";
import Box from "@mui/material/Box";

import dynamic from "next/dynamic";

import useFullscreen from "@articles-media/articles-dev-box/useFullscreen";

import TouchControls from "@/components/UI/TouchControls";
import LeftPanelContent from "@/components/UI/LeftPanel";
import { useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import DeathScreen from "@/components/UI/DeathScreen";
import classNames from "classnames";
import GameMenu from "@articles-media/articles-dev-box/GameMenu";
import UiOverlay from "@/components/UI/UiOverlay";
// import GameOverModal from '@/components/UI/GameOverModal';

const GameCanvas = dynamic(() => import("@/components/Game/GameCanvas"), {
    ssr: false,
});

export default function GamePage() {
    const sceneKey = useStore((state) => state.sceneKey);

    const { isFullscreen } = useFullscreen();

    const sidebar = useStore((state) => state.sidebar);
    const showMenu = useStore((state) => state.showMenu);

    return (
        <Box
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    "menu-open": showMenu,
                    fullscreen: isFullscreen,
                    "show-sidebar": sidebar,
                },
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
            sx={{
                display: "flex",
                position: "relative",
                "& .container": {
                    position: "relative",
                    zIndex: 1,
                },
                "& .debug-info, & .game-info": {
                    height: "calc(100vh - 0px)",
                    "& .card": {
                        height: "100%",
                    },
                },
                "& .debug-info": {
                    width: 300,
                    flexShrink: 0,
                },
                "& .game-info": {
                    width: 300,
                    flexShrink: 0,
                },
                "& .game": {
                    padding: "0.5rem 1rem",
                    display: "flex",
                    justifyContent: "center",
                },
                "& .game-panel": {
                    width: "100%",
                },
            }}
        >
            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{
                    style: "Corner Button",
                    menuBarButtonPosition: "Left",
                }}
                sidebarConfig={{
                    style: "Static Panel",
                }}
            />

            <Box
                className="canvas-wrap"
                sx={{
                    position: "relative",
                    width: "100vw",
                    height: "calc(100vh - 0px)",
                    "& canvas": {
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        left: 0,
                        top: 0,
                    },
                }}
            >
                <TouchControls />

                <DeathScreen />

                <UiOverlay />

                <GameCanvas key={sceneKey} />
            </Box>
        </Box>
    );
}
