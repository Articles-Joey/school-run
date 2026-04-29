// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'

const useTouchControlsStore = create((set, get) => ({

    enabled: false,
    setEnabled: (newValue) => {
        set((prev) => ({
            enabled: newValue
        }))
    },
    toggleEnabled: () => {
        set(() => ({
            enabled: !get().enabled
        }))
    },

    touchControls: {
        jump: false,
        left: false,
        right: false
    },
    setTouchControls: (newValue) => {
        set((prev) => ({
            touchControls: newValue
        }))
    }

}))

export default useTouchControlsStore