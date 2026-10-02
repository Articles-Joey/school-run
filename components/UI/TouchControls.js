import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";

import ArticlesButton from "@/components/UI/Button";
// import { useControlsStore, useGameStore } from "@/hooks/useGameStore"
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import { useStore } from "@/hooks/useStore";
import { useGameStore } from "@/hooks/useGameStore";

const arePropsEqual = (prevProps, nextProps) => {
    // Compare all props for equality
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

function ActionButtons() {
    const screenshotMode = useStore((state) => state.screenshotMode);
    const setTouchControls = useTouchControlsStore(
        (state) => state.setTouchControls,
    );

    return (
        <Box
            className="action-buttons"
            sx={{
                position: "fixed",
                right: "1rem",
                bottom: 50,
                display: screenshotMode ? "none" : "flex",
                flexDirection: "column",
                gap: "1rem",
                zIndex: 2,
            }}
        >
            <ArticlesButton
                className="jump-button"
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    opacity: 0.75,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    transitionDuration: "200ms",
                    "&:hover": {
                        opacity: 1,
                    },
                }}
                onClick={() => {
                    console.log("Jump!");
                    setTouchControls({ jump: true });
                }}
            >
                Jump
            </ArticlesButton>

            <ArticlesButton
                className="roll-button"
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    opacity: 0.75,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    transitionDuration: "200ms",
                    "&:hover": {
                        opacity: 1,
                    },
                }}
                onClick={() => {
                    setTouchControls({ roll: true });
                }}
            >
                Roll
            </ArticlesButton>
        </Box>
    );
}

export default function TouchControls() {
    // const {
    //     touchControlsEnabled,
    // } = props;

    const sceneKey = useStore((state) => state.sceneKey);
    const cameraMode = useGameStore((state) => state.cameraMode);

    const touchControls = useTouchControlsStore((state) => state.touchControls);
    const setTouchControls = useTouchControlsStore(
        (state) => state.setTouchControls,
    );
    const touchControlsEnabled = useTouchControlsStore(
        (state) => state.enabled,
    );

    const [nStart, setnStart] = useState(false);
    const [nDirection, setnDirection] = useState(false);

    // const {
    //     touchControls, setTouchControls
    // } = useTouchControlsStore()

    const startNipple = useCallback(() => {
        // console.log("n", nipplejs)

        // return

        var options = {
            zone: document.getElementById("zone_joystick"),
            // threshold: 0.5
            // lockX: true,
        };

        // var manager = nipplejs.create(options);
        var manager = require("nipplejs").create(options);

        let dragDistance;
        let dragDirection;

        manager
            .on("start end", function (evt, data) {
                // dump(evt.type);
                // debug(data);
                console.log("1", evt.type);

                if (evt.type == "start") {
                    setnStart(true);
                } else if (evt.type == "end") {
                    setnStart(false);
                    setnDirection(false);
                    dragDistance = 0;
                    dragDirection = false;
                    setTouchControls({
                        left: false,
                        right: false,
                    });
                }
            })
            .on("move", function (evt, data) {
                // debug(data);
                dragDistance = data.distance;
                console.log("2", dragDistance);

                if (dragDistance > 15 && dragDirection) {
                    if (dragDirection == "left")
                        setTouchControls({
                            left: true,
                            right: false,
                        });

                    if (dragDirection == "right")
                        setTouchControls({
                            left: false,
                            right: true,
                        });
                } else {
                    setTouchControls({
                        left: false,
                        right: false,
                    });
                }
            })
            .on(
                " " +
                    "dir:up plain:up dir:left plain:left dir:down " +
                    "plain:down dir:right plain:right",
                function (evt, data) {
                    if (evt.type == "move") {
                        dragDistance = data.distance;
                    }

                    // dump(evt.type);
                    console.log("3", evt.type, dragDistance);

                    if (evt.type == "dir:left") {
                        dragDirection = "left";
                        // setnDirection('left')
                        // setTouchControls({
                        //     ...touchControls,
                        //     left: true,
                        //     right: false
                        // })
                    }

                    if (evt.type == "dir:right") {
                        dragDirection = "right";
                        // setnDirection('right')
                        // setTouchControls({
                        //     ...touchControls,
                        //     left: false,
                        //     right: true
                        // })
                    }
                },
            )
            .on("pressure", function (evt, data) {
                // debug({
                //   pressure: data
                // });
            });

        return manager;
    }, [setTouchControls]);

    useEffect(() => {
        console.log("Load nipple");
        const manager = startNipple();

        return () => {
            if (manager) {
                console.log("Destroy nipple");
                manager.destroy();
            }
            setTouchControls({ left: false, right: false });
        };
    }, [sceneKey, setTouchControls, startNipple]);

    if (cameraMode == "Free") return null;

    return (
        <Box
            className="touch-controls-area"
            sx={{
                position: "absolute",
                right: 0,
                width: "100%",
                height: "100%",
                zIndex: 1,
                display: touchControlsEnabled ? "flex" : "none",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <Box sx={{ width: "100%", height: "100%" }}>
                <Box
                    sx={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        zIndex: 1,
                    }}
                    id="zone_joystick"
                />
            </Box>

            <Box sx={{ display: "none" }}>
                <div>
                    {/* <ArticlesButton
                    onClick={() => {
                        setTouchControls({
                            left: true
                        })
                    }}
                >
                    Left
                </ArticlesButton>
                <ArticlesButton
                    onClick={() => {
                        setTouchControls({
                            right: true
                        })
                    }}
                >
                    Right
                </ArticlesButton> */}
                </div>

                <div className="ms-2 d-none d-lg-block">
                    <div>Active: {nStart ? "True" : "False"}</div>
                    <div>Direction: {nDirection ? nDirection : "None"}</div>
                    <div>Touch: {JSON.stringify(touchControls)}</div>
                </div>
            </Box>

            <ActionButtons />
        </Box>
    );
}
