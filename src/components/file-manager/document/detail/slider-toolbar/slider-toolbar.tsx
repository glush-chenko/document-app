import React, {forwardRef, useCallback, useMemo} from "react";
import Tooltip from "@mui/material/Tooltip";
import {IconButton} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import {Unstable_Popup as BasePopup} from "@mui/base/Unstable_Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ClearIcon from "@mui/icons-material/Clear";
import {StyledMenu} from "../../../../styled/styled-menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {deleteDocument, downloadFile} from "../../../../../services/yandex-disk-api";
import "./slider-toolbar.scss"
import {PopupBody} from "../../../../styled/popup-body";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {useDocumentMenuItemsInfo} from "../../../../../hooks/use-document-menu-items-info";
import {navigationStore} from "../../../../../stores/navigation-store";
import {fileManagerStore, FileObj} from "../../../../../stores/file-manager-store";
import {useSnackbarWithAction} from "../../../../../hooks/use-snackbar-with-action";
import {MoveDocumentModal} from "../../move/move-document-modal";
import {RenameDocuments} from "../../rename/rename-documents";
import {useTrimmedPath} from "../../../../../hooks/use-trimmed-path";

interface SliderToolbarProps {
    currentDocIndex: number;
    setCurrentDocIndex: React.Dispatch<React.SetStateAction<number>>
    files: FileObj[];
    buttonsVisible: boolean;
    infoPopupAnchor: HTMLElement | null;
    setInfoPopupAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>
}

export const SliderToolbar = forwardRef<HTMLDivElement, SliderToolbarProps>((props, ref) => {
    const {
        currentDocIndex,
        setCurrentDocIndex,
        files,
        buttonsVisible,
        infoPopupAnchor,
        setInfoPopupAnchor
    } = props;

    const navigate = useNavigate();
    const {
        menuItems,
        showMoveDocumentModal,
        setShowMoveDocumentModal,
        showRenameDocumentModal,
        setShowRenameDocumentModal
    } = useDocumentMenuItemsInfo();
    const {enqueueSnackbar, closeSnackbar} = useSnackbarWithAction();

    const [_searchParams, setSearchParams] = useSearchParams();
    const {'*': path} = useParams();
    const getTrimmedPath = useTrimmedPath();

    const currentViewType = navigationStore.currentView;

    const selectedDocument = useMemo(() => {
        return files[currentDocIndex];
    }, [currentDocIndex, files]);

    const isFirstDocument = useMemo(() => {
        return currentDocIndex === 0 && files[currentDocIndex];
    }, [currentDocIndex, files]);

    const isLastDocument = useMemo(() => {
        if (currentDocIndex >= 0) {
            return currentDocIndex === files.length - 1;
        }
    }, [currentDocIndex, files]);

    const [actionsMenuAnchor, setActionsMenuAnchor] = React.useState<null | HTMLElement>(null);

    const openInfoPopup = Boolean(infoPopupAnchor);
    const openActionsMenu = Boolean(actionsMenuAnchor);

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setInfoPopupAnchor(infoPopupAnchor ? null : event.currentTarget);
    }, [infoPopupAnchor]);

    const handleClose = useCallback(() => {
        const path = getTrimmedPath("");
        navigate(`/${path}`);
    }, []);

    const handleDownload = useCallback(async () => {
        const item = fileManagerStore.findFileById(selectedDocument.id);

        if (item) {
            let link;

            if (item.type === "file") {
                link = await downloadFile(`CaseLabDocuments/${item.category}/${item.name}`);
            }

            if (link) {
                window.open(link);
            }
        }
    }, [selectedDocument]);

    const handleDelete = useCallback(async () => {
        const confirmed = window.confirm('Вы уверены, что хотите удалить этот документ?');

        if (confirmed && selectedDocument) {
            fileManagerStore.setLoading(true);

            handleClose();
            const result = await deleteDocument(selectedDocument.path);

            if (result) {
                fileManagerStore.deleteFile(path || "/", selectedDocument.id);
                enqueueSnackbar(
                    `Объект ${selectedDocument.name} успешно удалён`,
                    () => {
                        closeSnackbar();
                    },
                    'Close',
                    {},
                    "success"
                );
            } else {
                enqueueSnackbar(
                    `Произошла ошибка при удалении ${selectedDocument.name} `,
                    () => {
                        closeSnackbar();
                    },
                    'Close',
                    {},
                    "error"
                );
            }
        }

        fileManagerStore.setLoading(false);
    }, [selectedDocument, handleClose]);

    const handleNext = useCallback(() => {
        if (currentDocIndex < files.length - 1) {
            const nextIndex = currentDocIndex + 1;
            const item = files[nextIndex];

            setCurrentDocIndex(nextIndex);
            setSearchParams({
                id: item.id
            });
        }
    }, [currentDocIndex, files, navigate, currentViewType]);

    const handlePrev = useCallback(() => {
        if (currentDocIndex > 0) {
            const prevIndex = currentDocIndex - 1;
            const item = files[prevIndex];

            setCurrentDocIndex(prevIndex);
            setSearchParams({
                id: item.id
            });
        }
    }, [currentDocIndex, files, navigate, currentViewType]);

    const handleMoveDocumentModalClose = useCallback(() => {
        setShowMoveDocumentModal(false);
    }, []);

    const handleRenameDocumentModalClose = useCallback(() => {
        setShowRenameDocumentModal(false);
    }, []);

    return (
        <div ref={ref}>
            <div className={`slider-toolbar ${buttonsVisible ? 'visible' : 'hidden'}`}>
                <div className="slider-toolbar-right">
                    <div className="group-buttons">
                        <Tooltip title="информация" arrow>
                            <IconButton
                                onClick={handleClick}
                                type="button"
                                aria-describedby={openInfoPopup ? "popup-visible" : "popup-hidden"}
                                className="icon-button"
                            >
                                <InfoIcon/>
                            </IconButton>
                        </Tooltip>
                        <div className={`popup-info ${buttonsVisible ? "popup-visible" : "popup-hidden"}`}>
                            <BasePopup id="popup" open={openInfoPopup} anchor={infoPopupAnchor}>
                                <PopupBody>Имя: {selectedDocument?.name}</PopupBody>
                            </BasePopup>
                        </div>
                        <Tooltip title="скачать" arrow>
                            <IconButton onClick={handleDownload} className="icon-button">
                                <FileDownloadIcon/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="удалить" arrow>
                            <IconButton onClick={handleDelete} className="icon-button">
                                <DeleteIcon/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="ещё" arrow>
                            <IconButton
                                className="icon-button"
                                onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
                            >
                                <MoreVertIcon/>
                            </IconButton>
                        </Tooltip>
                    </div>
                    <Tooltip title="закрыть" arrow>
                        <IconButton onClick={handleClose} className="icon-button">
                            <ClearIcon/>
                        </IconButton>
                    </Tooltip>

                    <StyledMenu
                        anchorEl={actionsMenuAnchor}
                        open={openActionsMenu}
                        onClose={() => setActionsMenuAnchor(null)}
                    >
                        {menuItems.flatMap((itemInfo, index) => [
                            <MenuItem
                                onClick={() => {
                                    itemInfo.onClick();
                                    setActionsMenuAnchor(null)
                                }}
                                disableRipple
                                key={itemInfo.text}
                            >
                                {itemInfo.icon} {itemInfo.text}
                            </MenuItem>,
                            itemInfo.divider ? <Divider key={`divider-${index}`}/> : null,
                        ])}
                    </StyledMenu>
                </div>
            </div>

            <>
                <IconButton
                    className={`prev-button ${isFirstDocument || !buttonsVisible ? 'hidden ' : 'visible'}`}
                    id="arrow-button-left"
                    onClick={handlePrev}
                >
                    <ArrowBackIosNewIcon/>
                </IconButton>
                <IconButton
                    className={`next-button ${isLastDocument || !buttonsVisible ? 'hidden' : 'visible'}`}
                    id="arrow-button-right"
                    onClick={handleNext}
                >
                    <ArrowForwardIosIcon/>
                </IconButton>
            </>

            {showMoveDocumentModal && (
                <MoveDocumentModal onClose={handleMoveDocumentModalClose}/>
            )}

            {showRenameDocumentModal && (
                <RenameDocuments
                    onClose={handleRenameDocumentModalClose}
                />
            )}
        </div>
    )
});