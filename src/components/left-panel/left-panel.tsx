import React, {ChangeEvent, useCallback} from "react";
import {fileManagerStore, FileObj} from "../../stores/file-manager-store";
import "./left-panel-style.scss"
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import {observer} from "mobx-react-lite";
import {LeftPanelListItem} from "./left-panel-list-item";
import {createFolder, moveDocument} from "../../services/yandex-disk-api";
import {useNavigate} from "react-router-dom";
import {useSnackbarWithAction} from "../../hooks/use-snackbar-with-action";
import {useTrimmedPath} from "../../hooks/use-trimmed-path";
import {navigationStore, VIEW_TYPES} from "../../stores/navigation-store";
import {ModalWrapper} from "../modal/modal-wrapper";

const navList = [
    {
        text: "Создать",
        icon: <AddIcon/>,
        id: 1
    }
]

export const LeftPanel = observer(() => {
    const navigate = useNavigate();
    const {enqueueSnackbar, closeSnackbar} = useSnackbarWithAction();
    const getTrimmedPath = useTrimmedPath();

    const files = fileManagerStore.files.get("/") || [];
    const loading = fileManagerStore.loading;

    const isDocumentViewType = navigationStore.currentView === VIEW_TYPES.ALL_DOCUMENTS;

    const [openCreateFolder, setOpenCreateFolder] = React.useState(false);
    const [nameFolder, setNameFolder] = React.useState("");

    const handleDrop = useCallback(async (targetCategory: string, file: FileObj) => {
        await moveDocument(
            `/CaseLabDocuments/${file.category}/${file.name}`,
            `/CaseLabDocuments/${targetCategory}/${file.name}`
        );

        if (!file.category) return;

        fileManagerStore.moveFiles(file.category, targetCategory, file.id);

        enqueueSnackbar(
            "Объект успешно перенесен",
            () => {
                closeSnackbar();
            },
            'Close',
            {},
            "success"
        );
    }, [navigate]);

    const handleClick = useCallback(() => {
        setOpenCreateFolder(true);
    }, []);

    const handleChangeValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setNameFolder(e.target.value);
    }, [nameFolder]);

    const handleCreate = useCallback(async () => {
        const res = getTrimmedPath("CaseLabDocuments/categories");

        await createFolder(`CaseLabDocuments${res}/${nameFolder.trim()}`);
        setOpenCreateFolder(false);
        navigate("..");
    }, [nameFolder]);

    const handleCreateFolderClose = useCallback(() => {
        setOpenCreateFolder(false);
    }, [])

    return (
        <div className="left-panel">
            {!isDocumentViewType && (
                <div className="top-buttons">
                    {navList.map((list) => (
                        <Button key={list.id} variant="contained" onClick={handleClick}>
                            {list.icon} {list.text}
                        </Button>
                    ))}
                </div>
            )}
            {openCreateFolder && (
                <ModalWrapper text="Создание папки" onClose={handleCreateFolderClose}>
                    <div className="dialog-body">
                        <form className="create-dialog-form">
                            <input
                                value={nameFolder}
                                onChange={handleChangeValue}
                            />
                        </form>
                        <Button
                            variant="contained"
                            disabled={!nameFolder || !nameFolder.trim()}
                            onClick={handleCreate}
                        >
                            {loading ? "Создаю..." : "Создать"}
                        </Button>
                    </div>
                </ModalWrapper>
            )}
            <nav className="left-navigation">
                {files.map((file) => (
                    <LeftPanelListItem
                        key={file.id}
                        file={file}
                        handleDrop={handleDrop}
                    />
                ))}
            </nav>
        </div>
    )
});