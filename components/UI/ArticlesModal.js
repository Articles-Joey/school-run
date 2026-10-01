import { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";
import ArticlesButton from "./Button";

export default function ArticlesModal({
    show,
    setShow,
    action,
    actionText,
    closeAction,
    closeText,
    title,
    children,
    backdrop,
    disableClose,
    disableAction,
    className,
    modalClassName,
    centered,
    scrollable,
    size,
    actionVariant,
    footerOverride,
}) {
    const [showModal, setShowModal] = useState(true);

    return (
        <Dialog
            className={`articles-modal ${modalClassName || ""}`}
            maxWidth={size || "md"}
            fullWidth
            open={showModal}
            scroll={scrollable === false ? "body" : "paper"}
            hideBackdrop={backdrop === false}
            disableEscapeKeyDown={disableClose}
            onTransitionExited={() => {
                setShow(false);
            }}
            onClose={(_, reason) => {
                if (
                    disableClose ||
                    (backdrop === "static" && reason === "backdropClick")
                ) {
                    return;
                }
                setShowModal(false);
            }}
            slotProps={{
                paper:
                    centered === false
                        ? {
                              sx: {
                                  alignSelf: "flex-start",
                                  marginTop: 4,
                              },
                          }
                        : undefined,
            }}
        >
            <DialogTitle sx={{ paddingRight: disableClose ? 3 : 7 }}>
                {title || "Info"}
                {!disableClose && (
                    <IconButton
                        aria-label="Close dialog"
                        onClick={() => {
                            setShowModal(false);
                        }}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent className={className}>
                {children || "..."}
            </DialogContent>

            <DialogActions sx={{ justifyContent: "space-between" }}>
                {footerOverride ? (
                    footerOverride(setShow)
                ) : (
                    <>
                        {!action && <div></div>}

                        <div>
                            {(!disableClose || closeAction) && (
                                <ArticlesButton
                                    variant="outline-dark"
                                    onClick={() => {
                                        if (closeAction) {
                                            closeAction();
                                        } else {
                                            setShowModal(false);
                                        }
                                    }}
                                >
                                    {closeText || "Close"}
                                </ArticlesButton>
                            )}
                        </div>

                        {action && (
                            <ArticlesButton
                                variant={actionVariant || "articles"}
                                disabled={disableAction}
                                onClick={() => {
                                    console.log("action");
                                    action(setShowModal);
                                }}
                            >
                                {actionText || "Continue"}
                            </ArticlesButton>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
