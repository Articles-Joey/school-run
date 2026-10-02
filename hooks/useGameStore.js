"use client";
// import { create } from 'zustand'
import { createWithEqualityFn as create } from "zustand/traditional";
import { useStore } from "./useStore";
// import { persist, createJSONStorage } from 'zustand/middleware'

import generateRandomInteger from "@/util/generateRandomInteger";

// TODO - Add spawnRange logic that affects the obstacle spawn rate per section at higher distances.

// Normal way right now, everything is default spawnRange of 1
// { name: "Body", weight: 10, spawnRange: [1] },
// For example this would allow 1 to 3 bodies to spawn per section
// { name: "Body", weight: 10, spawnRange: [1, 3] },

export const OBSTACLE_TYPE_ZONES = [
    {
        range: [0, 99],
        types: [
            { name: "Body", weight: 100 },
            // { name: "Drone", weight: 30 },
            // { name: "FireLine", weight: 10 },
            // { name: "Horizontal", weight: 5 },
        ],
    },
    {
        range: [100, 299],
        types: [
            { name: "Body", weight: 50 },
            { name: "Drone", weight: 50 },
            // { name: "FireLine", weight: 10 },
            // { name: "Horizontal", weight: 5 },
        ],
    },
    {
        range: [300, 499],
        types: [
            { name: "Body", weight: 55 },
            { name: "Drone", weight: 30 },
            { name: "FireLine", weight: 10 },
            { name: "Horizontal", weight: 5 },
        ],
    },
    {
        range: [500, 749],
        speedMultiplier: 1.25,
        types: [
            { name: "Body", weight: 55 },
            { name: "Drone", weight: 30 },
            { name: "FireLine", weight: 10 },
            { name: "Horizontal", weight: 5 },
        ],
    },
    {
        range: [750, 999],
        speedMultiplier: 1.5,
        types: [
            { name: "Body", weight: 55 },
            { name: "Drone", weight: 30 },
            { name: "FireLine", weight: 10 },
            { name: "Horizontal", weight: 5 },
        ],
    },
    {
        range: [1000, 1249],
        speedMultiplier: 1.75,
        types: [
            { name: "Body", weight: 55 },
            { name: "Drone", weight: 30 },
            { name: "FireLine", weight: 10 },
            { name: "Horizontal", weight: 5 },
        ],
    },
    {
        range: [1250, 1499],
        speedMultiplier: 2,
        types: [
            { name: "Body", weight: 55 },
            { name: "Drone", weight: 30 },
            { name: "FireLine", weight: 10 },
            { name: "Horizontal", weight: 5 },
        ],
    },
    {
        range: [1500, 1999],
        speedMultiplier: 2.25,
        types: [
            { name: "Body", weight: 55 },
            { name: "Drone", weight: 30 },
            { name: "FireLine", weight: 10 },
            { name: "Horizontal", weight: 5 },
        ],
    },
];

const SPAWN_RANGE = 2.5;

export function getActiveZone(distance) {
    const lastIndex = OBSTACLE_TYPE_ZONES.length - 1;
    for (let i = 0; i <= lastIndex; i++) {
        const zone = OBSTACLE_TYPE_ZONES[i];
        const inRange =
            i === lastIndex
                ? distance >= zone.range[0]
                : distance >= zone.range[0] &&
                  distance < OBSTACLE_TYPE_ZONES[i + 1].range[0];
        if (inRange) return zone;
    }
    return OBSTACLE_TYPE_ZONES[0];
}

// Preserve the original 0.1 units/frame speed at 60 Hz. Cap tab-resume gaps.
export function getRunStep(distance, delta) {
    const speedMultiplier = getActiveZone(distance).speedMultiplier ?? 1;
    return 6 * Math.min(delta, 0.1) * speedMultiplier;
}

export function pickObstacleType(distance) {
    const zone = getActiveZone(distance);
    const types = zone.types;
    const total = types.reduce((sum, t) => sum + t.weight, 0);
    let rand = Math.random() * total;
    for (const type of types) {
        rand -= type.weight;
        if (rand <= 0) return type.name;
    }
    return types[0].name;
}

const getLocalStorage = (key) => {
    if (typeof window !== "undefined" && window.localStorage) {
        try {
            return JSON.parse(window.localStorage.getItem(key));
        } catch {
            return null;
        }
    }
    return null;
};
const setLocalStorage = (key, value) => {
    if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
    }
};

function randomId() {
    return Math.random().toString(36).substr(2, 9);
}

export const useGameStore = create((set, get, store) => ({
    cameraMode: "Player",
    setCameraMode: (newValue) => {
        set((prev) => ({
            cameraMode: newValue,
        }));
    },

    playerLocation: false,
    setPlayerLocation: (newValue) => {
        set((prev) => ({
            playerLocation: newValue,
        }));
    },

    freeze: false,
    toggleFreeze: () => {
        set((prev) => ({
            freeze: !prev.freeze,
        }));
    },
    setFreeze: (newValue) => {
        set((prev) => ({
            freeze: newValue,
        }));
    },

    isRolling: false,
    setIsRolling: (newValue) => {
        set((prev) => ({
            isRolling: newValue,
        }));
    },
    rollCooldown: false,
    setRollCooldown: (newValue) => {
        set((prev) => ({
            rollCooldown: newValue,
        }));
    },

    contentWarningAccept: true,
    setContentWarningAccept: (newValue) => {
        set((prev) => ({
            contentWarningAccept: newValue,
        }));
        // setLocalStorage('game:school-run:contentWarningAccept', newValue)
    },

    highScore: getLocalStorage("game:school-run:highScore") || 0,
    setHighScore: (newValue) => {
        set((prev) => ({
            highScore: newValue,
        }));
        setLocalStorage("game:school-run:highScore", newValue);
    },

    // debug: getLocalStorage('game:school-run:debug'),
    // setDebug: (newValue) => {
    //     set((prev) => ({
    //         debug: newValue
    //     }))
    //     setLocalStorage('game:school-run:debug', newValue)
    // },

    gameOver: 0,
    setGameOver: (newValue) => {
        set((prev) => ({
            gameOver: newValue,
        }));
    },

    maxHeight: 0,
    setMaxHeight: (newValue) => {
        set((prev) => ({
            maxHeight: newValue,
        }));
    },

    distance: 0,
    setDistance: (newValue) => {
        set((prev) => ({
            distance: newValue,
        }));
    },
    addDistance: (newValue) => {
        set((prev) => ({
            distance: prev.distance + newValue,
        }));
    },

    obstacles: [],
    setObstacles: (newValue) => {
        set((prev) => ({
            obstacles: newValue,
        }));
    },
    generateInitialObstacles: () => {
        console.log("generateInitialObstacles called");

        const graphicsQuality = useStore.getState().graphicsQuality; // Get graphics quality from the store

        const max = 10;

        const obstacleCount =
            graphicsQuality === "High"
                ? max
                : graphicsQuality === "Medium"
                  ? max / 2
                  : max / 4;

        // if (useGameStore.getState().obstacles?.length !== 0) return

        let initialObstacles = [];

        for (let i = 0; i < obstacleCount; i++) {
            const pickedObstacle = pickObstacleType(0);

            initialObstacles.push({
                position: [
                    pickedObstacle === "Drone"
                        ? generateRandomInteger(0, 0)
                        : generateRandomInteger(-SPAWN_RANGE, SPAWN_RANGE),
                    0,
                    -i * 10,
                ],
                id: randomId(),
                obstacleType: i === 0 ? false : pickedObstacle,
            });
        }

        // setObstacles(initialObstacles)

        // console.log("generateInitialObstacles called, initialObstacles", initialObstacles)

        console.log("initialObstacles", initialObstacles);

        // remove first item in array
        // initialObstacles.shift()
        // initialObstacles

        // console.log("initialObstacles", initialObstacles.length)

        set((prev) => ({
            obstacles: initialObstacles,
        }));
    },

    shift: false,
    setShift: (newValue) => {
        set((prev) => ({
            shift: newValue,
        }));
    },

    touchControls: {
        jump: false,
        left: false,
        right: false,
    },
    setTouchControls: (newValue) => {
        set((prev) => ({
            touchControls: newValue,
        }));
    },

    teleport: false,
    setTeleport: (newValue) => {
        set((prev) => ({
            teleport: newValue,
        }));
    },

    characterAnimation: "CharacterArmature|Run",
    setCharacterAnimation: (newValue) => {
        set((prev) => ({
            characterAnimation: newValue,
        }));
    },

    gameState: {},
    setGameState: (newValue) => {
        set((prev) => ({
            gameState: newValue,
        }));
    },

    reset: () => {
        set((prev) => ({
            obstacles: [],
            gameOver: 0,
            distance: 0,
        }));

        const { generateInitialObstacles } = get();

        generateInitialObstacles();
    },
}));
