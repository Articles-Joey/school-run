import { useStore } from "@/hooks/useStore";
import ArticlesButton from "./Button"
import LeftPanelContent from "./LeftPanel"
import { useGameStore } from "@/hooks/useGameStore";

export default function MobileMenu() {

    const showMenu = useStore(state => state.showMenu);
    const setShowMenu = useStore(state => state.setShowMenu);

    const playerLocation = useGameStore(state => state.playerLocation);

    return (
        <>
            <div 
                className={`menu-bar card card-articles p-1 justify-content-center`}
            >

                <div className='flex-header align-items-center'>

                    <ArticlesButton
                        small
                        active={showMenu}
                        onClick={() => {
                            setShowMenu(!showMenu)
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

            <div
                className={`mobile-menu ${showMenu && 'show'}`}
                onClick={() => setShowMenu(false)}
            >
                <div
                    style={{
                        maxWidth: '300px'
                    }}
                    className='mobile-menu-container'
                    onClick={(e) => e.stopPropagation()}
                >
                    <LeftPanelContent
                    // {...panelProps}
                    />
                </div>
            </div>
        </>
    )
}