"use client";
import { Suspense } from "react";
import packageInfo from "@/package.json";

import { useStore } from "@/hooks/useStore";
import { useAudioStore } from "@/hooks/useAudioStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import { useSocketStore } from "@/hooks/useSocketStore";

import DarkModeHandler from "@articles-media/articles-dev-box/DarkModeHandler";
import GlobalBody from "@articles-media/articles-dev-box/GlobalBody";
// import ToontownModeHandler from '@articles-media/articles-dev-box/ToontownModeHandler';
import GlobalClientModals from "@articles-media/articles-dev-box/GlobalClientModals";

import SchoolRunContentWarning from "@/components/ContentWarning";
import { useGameStore } from "@/hooks/useGameStore";
import ArticlesButton from "@/components/UI/Button";
import { useHotkeys } from "react-hotkeys-hook";
import AudioHandler from "@/components/Game/AudioHandler";

export default function LayoutClient({ children }) {
    const darkMode = useStore((state) => state.darkMode);
    const safeMode = useStore((state) => state.safeMode);
    const setSafeMode = useStore((state) => state.setSafeMode);

    const disableDeath = useStore((state) => state.disableDeath);
    const setDisableDeath = useStore((state) => state.setDisableDeath);

    const setContentWarningAccept = useGameStore(
        (state) => state.setContentWarningAccept,
    );

    useHotkeys(
        "p",
        () => {
            useGameStore.getState().toggleFreeze();
        },
        [],
    );
    useHotkeys(
        "r",
        () => {
            console.log("Reloading Scene");
            useStore.getState().reloadScene();
        },
        [],
    );

    return (
        <>
            <GlobalBody />
            <DarkModeHandler useStore={useStore} />
            <AudioHandler />
            <Suspense>
                <SchoolRunContentWarning />
                <GlobalClientModals
                    useStore={useStore}
                    useAudioStore={useAudioStore}
                    useTouchControlsStore={useTouchControlsStore}
                    useSocketStore={useSocketStore}

                    packageInfo={packageInfo}
                    settingsModalConfig={{
                        tabs: {
                            Graphics: {
                                darkMode: true,
                                landingAnimation: true,
                                children: (
                                    <>
                                        <div>Safe Mode</div>
                                        <div className="mb-3">
                                            <ArticlesButton
                                                active={safeMode === false}
                                                onClick={() => {
                                                    // setSafeMode(false);
                                                    setContentWarningAccept(
                                                        false,
                                                    );
                                                }}
                                            >
                                                <i className="fad fa-skull"></i>
                                                Disabled
                                            </ArticlesButton>
                                            <ArticlesButton
                                                active={safeMode === true}
                                                onClick={() => {
                                                    setSafeMode(true);
                                                    // setContentWarningAccept(true);
                                                }}
                                            >
                                                <i className="fad fa-angel"></i>
                                                Enabled
                                            </ArticlesButton>
                                        </div>
                                    </>
                                ),
                            },
                            Audio: {
                                sliders: [
                                    ...(useAudioStore.getState().audioSettings
                                        ? Object.keys(
                                              useAudioStore.getState()
                                                  .audioSettings,
                                          )
                                              .filter(
                                                  (key) => key !== "enabled",
                                              )
                                              .map((key) => ({
                                                  key,
                                                  label: key
                                                      .split("_")
                                                      .map(
                                                          (word) =>
                                                              word
                                                                  .charAt(0)
                                                                  .toUpperCase() +
                                                              word.slice(1),
                                                      )
                                                      .join(" "),
                                              }))
                                        : []),
                                ],
                            },
                            Controls: {
                                touchControls: true,
                                // defaultKeyBindings: {
                                //     // moveUp: "W",
                                //     // moveDown: "S",
                                //     // moveLeft: "A",
                                //     // moveRight: "D",
                                // }
                            },
                            Multiplayer: {
                                serverUrl: true,
                                // children: <>Test</>
                            },
                            Other: {
                                toontownMode: true,
                                children: <></>,
                            },
                            Debug: {
                                // Debug settings can be added here
                                children: (
                                    <>
                                        <div>Disable Death</div>
                                        <div className="mb-3">
                                            <ArticlesButton
                                                active={disableDeath === false}
                                                onClick={() => {
                                                    setDisableDeath(false);
                                                }}
                                            >
                                                Disabled
                                            </ArticlesButton>
                                            <ArticlesButton
                                                active={disableDeath === true}
                                                onClick={() => {
                                                    setDisableDeath(true);
                                                }}
                                            >
                                                Enabled
                                            </ArticlesButton>
                                        </div>
                                    </>
                                ),
                            },
                        },
                        reset: () => {
                            useAudioStore.getState().resetAudioSettings();
                        },
                    }}
                    infoModalConfig={{
                        previewImage: darkMode
                            ? "img/preview.webp"
                            : "img/preview.webp",
                        appendContent: (
                            <>
                                <div className="mb-2">
                                    <b>Note:</b> You can jump over the ground
                                    obstacles with the jump actions. Roll
                                    actions can be used to avoid the flying
                                    obstacles, but they have a cooldown. The
                                    game gets faster and more obstacles appear
                                    the further you go, so good luck!
                                </div>
                                <div className="">
                                    View full controls in the settings menu
                                </div>
                            </>
                        ),
                    }}
                />
            </Suspense>
        </>
    );
}
