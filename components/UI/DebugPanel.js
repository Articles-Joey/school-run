import BugReportIcon from "@mui/icons-material/BugReport";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MovieIcon from "@mui/icons-material/Movie";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { Menu, MenuItem } from "@mui/material";

import { OBSTACLE_TYPE_ZONES, useGameStore } from "@/hooks/useGameStore";
import ArticlesButton from "@/components/UI/Button";
import { useStore } from "@/hooks/useStore";
import { useState } from "react";

function DebugDropdown({ id, label, Icon, children }) {
    const [anchorElement, setAnchorElement] = useState(null);
    const isOpen = Boolean(anchorElement);

    const closeMenu = () => {
        setAnchorElement(null);
    };

    return (
        <>
            <ArticlesButton
                aria-controls={isOpen ? id : undefined}
                aria-expanded={isOpen ? "true" : undefined}
                aria-haspopup="menu"
                endIcon={<KeyboardArrowDownIcon />}
                fullWidth
                id={`${id}-button`}
                onClick={(event) => {
                    setAnchorElement(event.currentTarget);
                }}
                size="small"
                startIcon={<Icon fontSize="small" />}
                sx={{
                    justifyContent: "flex-start",
                    "& .MuiButton-endIcon": {
                        marginLeft: "auto",
                    },
                }}
                variant="contained"
            >
                {label}
            </ArticlesButton>
            <Menu
                anchorEl={anchorElement}
                anchorOrigin={{
                    horizontal: "left",
                    vertical: "bottom",
                }}
                id={id}
                marginThreshold={0}
                onClose={closeMenu}
                open={isOpen}
                slotProps={{
                    list: {
                        "aria-labelledby": `${id}-button`,
                        style: {
                            margin: 0,
                            padding: 0,
                        },
                    },
                    paper: {
                        sx: {
                            maxHeight: 600,
                            margin: 0,
                            width: 200,
                        },
                    },
                }}
                transformOrigin={{
                    horizontal: "left",
                    vertical: "top",
                }}
            >
                {children(closeMenu)}
            </Menu>
        </>
    );
}

export function DebugPanel() {
    const setSceneKey = useStore((state) => state.setSceneKey);
    const sceneKey = useStore((state) => state.sceneKey);

    const setShowMenu = useStore((state) => state.setShowMenu);

    const cameraMode = useGameStore((state) => state.cameraMode);
    const setCameraMode = useGameStore((state) => state.setCameraMode);
    const characterAnimation = useGameStore(
        (state) => state.characterAnimation,
    );
    const setCharacterAnimation = useGameStore(
        (state) => state.setCharacterAnimation,
    );
    const debug = useStore((state) => state.debug);
    const setDebug = useStore((state) => state.setDebug);
    const obstacles = useGameStore((state) => state.obstacles);

    const freeze = useGameStore((state) => state.freeze);
    const setFreeze = useGameStore((state) => state.setFreeze);
    const distance = useGameStore((state) => state.distance);
    const setDistance = useGameStore((state) => state.setDistance);

    const [showObstacles, setShowObstacles] = useState(false);

    return (
        <div className="card card-articles card-sm">
            <div className="card-body">
                <div className="small text-muted">Debug Controls</div>

                <div className="mb-2">
                    <ArticlesButton
                        size="sm"
                        className="w-100"
                        onClick={() => {
                            setShowObstacles(!showObstacles);
                        }}
                    >
                        <i className="fad fa-redo"></i>
                        {showObstacles ? "Hide Obstacles" : "Show Obstacles"}
                    </ArticlesButton>

                    {showObstacles && (
                        <div className="small border mb-2 p-2">
                            {obstacles?.map((obstacle, obstacle_i) => {
                                return (
                                    <div key={obstacle.id}>
                                        {obstacle_i} -{" "}
                                        {obstacle.position?.[2].toFixed(2)}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="d-flex flex-column">
                    <div className="d-flex flex-wrap">
                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => {
                                setSceneKey(sceneKey + 1);
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            Reload Game
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => {
                                setSceneKey(sceneKey + 1);
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            Reset Camera
                        </ArticlesButton>

                        <div className="w-50">
                            <DebugDropdown
                                Icon={CameraAltIcon}
                                id="camera-menu"
                                label="Camera"
                            >
                                {(closeMenu) =>
                                    ["Free", "Player"].map((location) => (
                                        <MenuItem
                                            key={location}
                                            onClick={() => {
                                                setCameraMode(location);
                                                setShowMenu(false);
                                                closeMenu();
                                            }}
                                            selected={cameraMode === location}
                                        >
                                            <CameraAltIcon
                                                fontSize="small"
                                                sx={{ marginRight: 1 }}
                                            />
                                            {location}
                                        </MenuItem>
                                    ))
                                }
                            </DebugDropdown>
                        </div>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            active={freeze}
                            onClick={() => {
                                setFreeze(!freeze);
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            {freeze ? "Unfreeze" : "Freeze"}
                        </ArticlesButton>

                        {/* Animation Override */}
                        <div className="w-50">
                            <DebugDropdown
                                Icon={MovieIcon}
                                id="animation-menu"
                                label="Animation"
                            >
                                {(closeMenu) =>
                                    [
                                        {
                                            name: "Running",
                                            key: "CharacterArmature|Run",
                                        },
                                        {
                                            name: "Death",
                                            key: "CharacterArmature|Death",
                                        },
                                        {
                                            name: "Roll",
                                            key: "CharacterArmature|Roll",
                                        },
                                        {
                                            name: "Idle",
                                            key: "CharacterArmature|Idle",
                                        },
                                        {
                                            name: "Idle_Neutral",
                                            key: "CharacterArmature|Idle_Neutral",
                                        },
                                        {
                                            name: "Wave",
                                            key: "CharacterArmature|Wave",
                                        },
                                    ].map((location) => (
                                        <MenuItem
                                            key={location.name}
                                            onClick={() => {
                                                setCharacterAnimation(
                                                    location.key,
                                                );
                                                closeMenu();
                                            }}
                                            selected={
                                                characterAnimation ===
                                                location.key
                                            }
                                        >
                                            <MovieIcon
                                                fontSize="small"
                                                sx={{ marginRight: 1 }}
                                            />
                                            {location.name}
                                        </MenuItem>
                                    ))
                                }
                            </DebugDropdown>
                        </div>

                        {/* Debug */}
                        <div className="w-50">
                            <DebugDropdown
                                Icon={BugReportIcon}
                                id="debug-menu"
                                label={`Debug ${debug ? "On" : "Off"}`}
                            >
                                {(closeMenu) =>
                                    [false, true].map((location) => (
                                        <MenuItem
                                            key={String(location)}
                                            onClick={() => {
                                                setDebug(location);
                                                closeMenu();
                                            }}
                                            selected={debug === location}
                                        >
                                            <BugReportIcon
                                                fontSize="small"
                                                sx={{ marginRight: 1 }}
                                            />
                                            {location ? "True" : "False"}
                                        </MenuItem>
                                    ))
                                }
                            </DebugDropdown>
                        </div>

                        {/* Teleport */}
                        <div className="w-50">
                            <DebugDropdown
                                Icon={RocketLaunchIcon}
                                id="teleport-menu"
                                label="Teleport"
                            >
                                {(closeMenu) =>
                                    OBSTACLE_TYPE_ZONES.map((zone) => {
                                        const location = zone.range[0];
                                        const isActiveZone =
                                            distance >= location &&
                                            (distance <= zone.range[1] ||
                                                location === 1500);

                                        return (
                                            <MenuItem
                                                key={location}
                                                onClick={() => {
                                                    setDistance(location);
                                                    closeMenu();
                                                }}
                                                selected={isActiveZone}
                                            >
                                                <RocketLaunchIcon
                                                    fontSize="small"
                                                    sx={{ marginRight: 1 }}
                                                />
                                                {location} ft
                                            </MenuItem>
                                        );
                                    })
                                }
                            </DebugDropdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
