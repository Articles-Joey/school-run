"use client"
// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'
// import { persist, createJSONStorage } from 'zustand/middleware'

const getLocalStorage = (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            return JSON.parse(window.localStorage.getItem(key))
        } catch {
            return null;
        }
    }
    return null;
}
const setLocalStorage = (key, value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value))
    }
}

export const useGameStore = create((set) => ({

    cameraMode: 'Player',
    setCameraMode: (newValue) => {
        set((prev) => ({
            cameraMode: newValue
        }))
    },

    playerLocation: false,
    setPlayerLocation: (newValue) => {
        set((prev) => ({
            playerLocation: newValue
        }))
    },

    contentWarningAccept: getLocalStorage('game:school-run:contentWarningAccept'),
    setContentWarningAccept: (newValue) => {
        set((prev) => ({
            contentWarningAccept: newValue
        }))
        setLocalStorage('game:school-run:contentWarningAccept', newValue)
    },

    highScore: getLocalStorage('game:school-run:highScore') || 0,
    setHighScore: (newValue) => {
        set((prev) => ({
            highScore: newValue
        }))
        setLocalStorage('game:school-run:highScore', newValue)
    },

    debug: getLocalStorage('game:school-run:debug'),
    setDebug: (newValue) => {
        set((prev) => ({
            debug: newValue
        }))
        setLocalStorage('game:school-run:debug', newValue)
    },

    gameOver: 0,
    setGameOver: (newValue) => {
        set((prev) => ({
            gameOver: newValue
        }))
    },

    maxHeight: 0,
    setMaxHeight: (newValue) => {
        set((prev) => ({
            maxHeight: newValue
        }))
    },

    distance: 0,
    setDistance: (newValue) => {
        set((prev) => ({
            distance: newValue
        }))
    },
    addDistance: (newValue) => {
        set((prev) => ({
            distance: (prev.distance + newValue)
        }))
    },

    obstacles: [],
    setObstacles: (newValue) => {
        set((prev) => ({
            obstacles: newValue
        }))
    },

    shift: false,
    setShift: (newValue) => {
        set((prev) => ({
            shift: newValue
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
    },

    teleport: false,
    setTeleport: (newValue) => {
        set((prev) => ({
            teleport: newValue
        }))
    },

    characterAnimation: 'CharacterArmature|Run',
    setCharacterAnimation: (newValue) => {
        set((prev) => ({
            characterAnimation: newValue
        }))
    },

    gameState: {},
    setGameState: (newValue) => {
        set((prev) => ({
            gameState: newValue
        }))
    },
}))

export const useControlsStore = create((set) => ({

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