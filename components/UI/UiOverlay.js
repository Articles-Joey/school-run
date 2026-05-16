import { useGameStore } from "@/hooks/useGameStore";

export default function UiOverlay() {

    const distance = useGameStore(state => state.distance);
    const highScore = useGameStore(state => state.highScore);
    const isRolling = useGameStore(state => state.isRolling);

    return (
        <div 
            className='ui-overlay'
            style={{
                zIndex: 1,
                position: 'absolute',
                top: '0.5rem',
                left: "50%",
                transform: 'translateX(-50%)',
                backgroundColor: '#000',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                color: '#fff',
                display: 'flex',
                fontSize: '0.8rem',
            }}
        >
            <div className='distance'>
                {`Distance: ${distance.toFixed(0)} ft`}
            </div>
            <div className="px-2">
                -
            </div>
            <div className='high-score'>
                {`High Score: ${highScore.toFixed(0)} ft`}
            </div>
            <div>
                {isRolling && 
                    <span style={{ marginLeft: '1rem', color: 'cyan' }}>
                        Rolling
                    </span>
                }
            </div>
        </div>
    )

}