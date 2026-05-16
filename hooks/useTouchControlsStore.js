
import { createWithEqualityFn as create } from 'zustand/traditional'
import { persist } from 'zustand/middleware'

const initialTouchControls = {
    jump: false,
    left: false,
    right: false,
    roll: false,
}

const useTouchControlsStore = create(
    persist(
        (set, get) => ({

            enabled: false,
            setEnabled: (newValue) => set({ enabled: newValue }),
            toggleEnabled: () => set({ enabled: !get().enabled }),

            touchControls: initialTouchControls,
            setTouchControls: (newValue) => set({ touchControls: newValue })
            
        }),
        {
            name: 'touch-controls-store', // unique name
            version: 2,
            partialize: (state) => ({ 
                enabled: state.enabled 
            }),
        }
    )
)

export default useTouchControlsStore