import { useEffect, useState } from "react";

import { Modal } from "react-bootstrap"

import IsDev from "@/components/UI/IsDev";
import ArticlesButton from "./Button";
import { useStore } from "@/hooks/useStore";

export default function GameInfoModal({
    show,
    setShow,
}) {

    const [showModal, setShowModal] = useState(true)

    const darkMode = useStore((state) => state.darkMode)

    return (
        <>
            {/* {lightboxData && (
                <Lightbox
                    mainSrc={lightboxData?.location}
                    onCloseRequest={() => setLightboxData(null)}
                    reactModalStyle={{
                        overlay: {
                            zIndex: '2000'
                        }
                    }}
                />
            )} */}

            <Modal
                className="articles-modal games-info-modal"
                size='md'
                show={showModal}
                centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>School Run Game Info</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-0">

                    <div className="ratio ratio-16x9 border">
                        {darkMode ?
                            <img
                                src={"img/school-run-thumbnail.jpg"}
                                style={{
                                    objectFit: "contain"
                                }}
                            ></img>
                            :
                            <img
                                src={"img/school-run-thumbnail.jpg"}
                                style={{
                                    objectFit: "contain"
                                }}
                            ></img>
                        }
                    </div>

                    <div className="p-3">

                        <div className="fw-bold mb-2">
                            Get as far as you can in this endless runner game, dodging obstacles and collecting items along the way! Compete with friends and aim for the top of the leaderboard.
                        </div>

                        <div className="">
                            Disable safe mode in the settings tab if you wish to enable graphic content.
                        </div>

                    </div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <div></div>

                    <ArticlesButton variant="outline-dark" onClick={() => {
                        setShow(false)
                    }}>
                        Close
                    </ArticlesButton>

                </Modal.Footer>

            </Modal>
        </>
    )

}