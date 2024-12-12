import {useNavigate} from "react-router-dom";
import {fileManagerStore} from "../stores/file-manager-store";
import {useMemo, useState} from "react";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import {useSnackbarWithAction} from "./use-snackbar-with-action";
import {deleteDocument} from "../services/yandex-disk-api";

export const useCategoryMenuItemsInfo = () => {
    const navigate = useNavigate();
    const {enqueueSnackbar, closeSnackbar} = useSnackbarWithAction();
    const currentCategoryPath = fileManagerStore.currentCategoryPath;

    const [showMoveDocumentModal, setShowMoveDocumentModal] = useState(false);
    const [showRenameDocumentModal, setShowRenameDocumentModal] = useState(false);

    const handleDeleteItem = async () => {
        const confirmed = window.confirm('Вы уверены, что хотите удалить?');

        if (confirmed) {
            const result = await deleteDocument(`CaseLabDocuments/${currentCategoryPath}`);

            if (result) {
                navigate("..");
                enqueueSnackbar(
                    `Объект успешно удалён`,
                    () => {
                        closeSnackbar();
                    },
                    'Close',
                    {},
                    "success"
                );
            }
        }
    };

    const menuItems = useMemo(() => {
        const items = [
            {
                icon: <DriveFileMoveIcon/>,
                text: "Переместить",
                divider: false,
                onClick: () => {
                    setShowMoveDocumentModal(true);
                }
            },
            {
                icon: <EditIcon/>,
                text: "Переименовать",
                divider: false,
                onClick: async () => {
                    setShowRenameDocumentModal(true);
                }
            },
            {
                icon: <DeleteIcon/>,
                text: "Удалить",
                divider: false,
                onClick: handleDeleteItem
            }
        ];

        return items;
    }, [navigate, currentCategoryPath]);

    return {
        menuItems,
        showMoveDocumentModal,
        setShowMoveDocumentModal,
        showRenameDocumentModal,
        setShowRenameDocumentModal
    };
}