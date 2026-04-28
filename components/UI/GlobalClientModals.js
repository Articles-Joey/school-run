"use client";
import { useAudioStore } from '@/hooks/useAudioStore';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';
import useTouchControlsStore from '@/hooks/useTouchControlsStore';
import dynamic from 'next/dynamic'
import ArticlesButton from './Button';

const InfoModal = dynamic(
    () => import('@/components/UI/InfoModal'),
    { ssr: false }
)

// const SettingsModal = dynamic(
//     () => import('@/components/UI/Settings/SettingsModal'),
//     { ssr: false }
// )

const SettingsModal = dynamic(
    () => import('@articles-media/articles-dev-box/SettingsModal'),
    { ssr: false }
)

const CreditsModal = dynamic(
    () => import('@articles-media/articles-dev-box/CreditsModal'),
    { ssr: false }
)

// const CreditsModal = dynamic(
//     () => import('@/components/UI/CreditsModal'),
//     { ssr: false }
// )

export default function GlobalClientModals() {

    const showInfoModal = useStore((state) => state.showInfoModal)
    const setShowInfoModal = useStore((state) => state.setShowInfoModal)

    const showSettingsModal = useStore((state) => state.showSettingsModal)
    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal)

    const showCreditsModal = useStore((state) => state.showCreditsModal)
    const setShowCreditsModal = useStore((state) => state.setShowCreditsModal)

    const safeMode = useStore((state) => state.safeMode);
    const setSafeMode = useStore((state) => state.setSafeMode);

    return (
        <>
            {showInfoModal &&
                <InfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            }

            {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                    store={useStore}
                    useAudioStore={useAudioStore}
                    useTouchControlsStore={useTouchControlsStore}
                    useSocketStore={useSocketStore}
                    config={{
                        tabs: {
                            'Graphics': {
                                darkMode: true,
                                landingAnimation: true,
                                children: <>

                                    <div>Safe Mode</div>
                                    <div className="mb-3">
                                        <ArticlesButton
                                            active={safeMode === false}
                                            onClick={() => {
                                                setSafeMode(false);
                                            }}
                                        >
                                            Disabled
                                        </ArticlesButton>
                                        <ArticlesButton
                                            active={safeMode === true}
                                            onClick={() => {
                                                setSafeMode(true);
                                            }}
                                        >
                                            Enabled
                                        </ArticlesButton>
                                    </div>

                                </>,
                            },
                            'Audio': {
                                sliders: [
                                    {
                                        key: "gameVolume",
                                        label: "Game Volume"
                                    },
                                    {
                                        key: "musicVolume",
                                        label: "Music Volume"
                                    }
                                ]
                            },
                            'Controls': {
                                // defaultKeyBindings: {
                                //     // moveUp: "W",
                                //     // moveDown: "S",
                                //     // moveLeft: "A",
                                //     // moveRight: "D",
                                // }
                            },
                            'Multiplayer': {
                                serverUrl: true,
                            },
                            'Other': {
                                // toontownMode: true,
                            }
                        }
                    }}
                />
            }

            {showCreditsModal &&
                <CreditsModal
                    show={showCreditsModal}
                    setShow={setShowCreditsModal}
                    owner="Articles-Joey"
                    repo="school-run"
                />
            }
        </>
    )
}