import React, {useCallback} from 'react';
import {Link, useParams} from "react-router-dom";
import logo from "../../assets/logo.png"
import "./navigation-style.scss"
import {navigationStore, VIEW_TYPES} from "../../stores/navigation-store";
import {observer} from "mobx-react-lite";
import {SelectedItemsCountDisplay} from "../../hooks/category-count-display";
import DeleteIcon from '@mui/icons-material/Delete';
import {IconButton} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from '@mui/material/MenuItem';
import {fileManagerStore} from "../../stores/file-manager-store";
import {StyledMenu} from "../styled/styled-menu";
import Divider from "@mui/material/Divider";
import {
    deleteDocument,
    deleteFileFromTrash,
    restoreFileFromTrash
} from "../../services/yandex-disk-api";
import {useMenuItemsInfo} from "../../hooks/use-menu-items-info";
import {MainButton} from "./main-button/main-button";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import {AsynchronousAutocomplete} from "../styled/asynchronous-autocomplete";
import {useSnackbarWithAction} from "../../hooks/use-snackbar-with-action";
import {MoveDocumentModal} from "../file-manager/document/move/move-document-modal";
import {RenameDocuments} from "../file-manager/document/rename/rename-documents";

export const Navigation = observer(() => {
    const {
        menuItems,
        showMoveDocumentModal,
        setShowMoveDocumentModal,
        showRenameDocumentModal,
        setShowRenameDocumentModal
    } = useMenuItemsInfo();
    const {enqueueSnackbar, closeSnackbar} = useSnackbarWithAction();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const selectedItemsIds = fileManagerStore.selectedItemsIds;
    const {'*': path} = useParams();
    const currentView = navigationStore.currentView;
    const trashItems = fileManagerStore.trashItems;

    const open = Boolean(anchorEl);

    const handleDeleteItem = useCallback(async () => {
        const confirmed = window.confirm('Вы уверены, что хотите удалить?');
        if (confirmed) {
            fileManagerStore.setLoading(true);

            for (const id of selectedItemsIds) {
                const item = fileManagerStore.getFileById(path || "/", id);

                if (!item) continue;

                let result = await deleteDocument(item.path);

                if (result) {
                    fileManagerStore.deleteFile(path || "/", item.id);
                    enqueueSnackbar(
                        `Объект ${item.name} успешно удалён`,
                        () => {
                            closeSnackbar();
                        },
                        'Close',
                        {},
                        "success"
                    );
                } else {
                    enqueueSnackbar(
                        `Произошла ошибка при удалении ${item.name} `,
                        () => {
                            closeSnackbar();
                        },
                        'Close',
                        {},
                        "error"
                    );
                }
            }

            fileManagerStore.setSelectedItemsIds([]);
            fileManagerStore.setLoading(false);
        }
    }, [selectedItemsIds, path]);

    const handleClose = useCallback(() => {
        fileManagerStore.setSelectedItemsIds([]);
    }, []);

    const handleFileOperation = useCallback(async (operation: (path: string) => Promise<void>, restore?: boolean) => {
        for (const trashId of selectedItemsIds) {

            if (trashId) {
                fileManagerStore.setLoading(true);
                const file = fileManagerStore.findTrashItemById(trashId);

                await operation(file?.path || "");

                enqueueSnackbar(
                    `Объект успешно ${restore ? "восстановлен" : "удалён"}`,
                    () => {
                        closeSnackbar();
                    },
                    'Close',
                    {},
                    restore ? "info" : "success"
                );
            } else {
                console.warn(`Файл не найден или не имеет пути.`);
            }
        }

        fileManagerStore.setLoading(false);
    }, [selectedItemsIds, fileManagerStore.trashItems]);

    const handleRestore = useCallback(async () => {
        await handleFileOperation(restoreFileFromTrash, true);

        const newTrashItems = trashItems.filter(trashItem =>
            !selectedItemsIds.some(item => item === trashItem.id)
        );

        fileManagerStore.setTrashItems(newTrashItems);

        fileManagerStore.setSelectedItemsIds([]);
    }, [handleFileOperation, selectedItemsIds]);

    const handleDeleteForever = useCallback(async () => {
        await handleFileOperation(deleteFileFromTrash);

        const newTrashItems = trashItems.filter(trashItem =>
            !selectedItemsIds.some(item => item === trashItem.id)
        );

        fileManagerStore.setTrashItems(newTrashItems);
        fileManagerStore.setSelectedItemsIds([]);
    }, [handleFileOperation, selectedItemsIds]);

    const handleRenameModalClose = useCallback(() => {
        setShowRenameDocumentModal(false);
    }, []);

    const handleMoveModalClose = useCallback(() => {
        setShowMoveDocumentModal(false);
    }, []);

    return (
        <nav className={(!selectedItemsIds.length) ? "navigation" : "navigation list"}>
            {!selectedItemsIds.length ? (
                <>
                    <div className="nav-left-section">
                        <div className="logo">
                            <Link to="/">
                                <img src={logo} alt="logo-blog"/>
                            </Link>
                        </div>
                        <MainButton/>
                    </div>

                    <AsynchronousAutocomplete/>
                </>
            ) : (
                <div className="file-info">
                    <SelectedItemsCountDisplay
                        count={selectedItemsIds.length}/>
                    <div className="container-btn">
                        {currentView !== VIEW_TYPES.TRASH ? (
                            <IconButton
                                onClick={handleDeleteItem}
                                id="btn-delete"
                                className="icon-button"
                            >
                                <DeleteIcon/>
                                Удалить
                            </IconButton>
                        ) : (
                            <>
                                <IconButton
                                    onClick={handleRestore}
                                    id="btn-recover"
                                    className="icon-button"
                                >
                                    <RestartAltIcon/>
                                    Восстановить
                                </IconButton>
                                <IconButton
                                    onClick={handleDeleteForever}
                                    id="btn-delete-forever"
                                >
                                    <WhatshotIcon/>
                                    Удалить навсегда
                                </IconButton>
                            </>
                        )}
                        {currentView !== VIEW_TYPES.TRASH && (
                            <IconButton
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                className="icon-button"
                            >
                                <MoreVertIcon/>
                            </IconButton>
                        )}

                        <StyledMenu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={() => setAnchorEl(null)}
                        >
                            {menuItems.flatMap((itemInfo, index) => [
                                <MenuItem
                                    onClick={() => {
                                        itemInfo.onClick();
                                        setAnchorEl(null)
                                    }}
                                    disableRipple
                                    key={itemInfo.text}
                                >
                                    {itemInfo.icon} {itemInfo.text}
                                </MenuItem>,
                                itemInfo.divider ? <Divider key={`divider-${index}`}/> : null,
                            ])}
                        </StyledMenu>

                        <IconButton onClick={handleClose} className="icon-button">
                            <CloseIcon/>
                        </IconButton>
                    </div>

                </div>
            )}
            {showMoveDocumentModal && (
                <MoveDocumentModal onClose={handleMoveModalClose}/>
            )}

            {showRenameDocumentModal && (
                <RenameDocuments
                    onClose={handleRenameModalClose}
                />
            )}
        </nav>
    );
});