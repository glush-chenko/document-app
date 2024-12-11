import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {fileManagerStore} from "../stores/file-manager-store";
import {navigationStore, VIEW_TYPES} from "../stores/navigation-store";
import {useMemo, useState} from "react";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import {deleteDocument, downloadFile} from "../services/yandex-disk-api";
import {useSnackbarWithAction} from "./use-snackbar-with-action";

export const useCategoryMenuItemsInfo = () => {
    const {categoryName} = useParams();
    const navigate = useNavigate();
    const {enqueueSnackbar, closeSnackbar} = useSnackbarWithAction();

    const [showMoveDocumentModal, setShowMoveDocumentModal] = useState(false);
    const [showRenameDocumentModal, setShowRenameDocumentModal] = useState(false);

    const handleDeleteItem = async () => {
        const confirmed = window.confirm('Вы уверены, что хотите удалить?');

        if (confirmed) {
            const findCategory = fileManagerStore.findCategoryByName(fileManagerStore.currentCategoryPath);
            const currentCategory = fileManagerStore.removeCategoryByName()
            if (!currentCategory) return;

            await deleteDocument(currentCategory);

            if (findCategory) {
                fileManagerStore.deleteCategory(findCategory);

                navigate("../");
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
                    // if (categoryName) {
                    //     const item = fileManagerStore.findCategoryByName(categoryName);
                    //     navigate(`/CaseLabDocuments/categories/${categoryName}/move?ids=${item?.id}`);
                    // }
                }
            },
            {
                icon: <EditIcon/>,
                text: "Переименовать",
                divider: false,
                onClick: async () => {
                    setShowRenameDocumentModal(true);
                    // navigate(`/CaseLabDocuments/categories/${categoryName}/rename`);
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
    }, [navigate, categoryName]);

    return {
        menuItems,
        showMoveDocumentModal,
        setShowMoveDocumentModal,
        showRenameDocumentModal,
        setShowRenameDocumentModal
    };
}