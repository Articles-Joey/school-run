import { useGameStore } from "@/hooks/useGameStore";

export default function UiOverlay() {

    const distance = useGameStore(state => state.distance);

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
            }}
        >
            <div className='distance'>
                {`${distance.toFixed(0)} ft`}
            </div>
        </div>
    )

}