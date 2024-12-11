import React, {PropsWithChildren, useCallback} from "react";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import "./modal-wrapper-style.scss"
import {useNavigate} from "react-router-dom";

interface ModalWrapperProps {
    text: string;
    isRename?: boolean;
    onClose?: () => void;
}

export const ModalWrapper = (props: PropsWithChildren<ModalWrapperProps>) => {
    const {text, children, onClose} = props;
    const navigate = useNavigate();

    const handleClose = useCallback(() => {
        if (onClose) {
            onClose()
        } else {
            navigate("..")
        }
    }, [onClose, navigate]);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="dialog-wrap">
                    <div className="dialog-info">
                        <h2 className="dialog-title" tabIndex={-1}>{text}</h2>
                        <IconButton onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    )
}