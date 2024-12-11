import {useNavigate, useParams} from "react-router-dom";
import {navigationStore, VIEW_TYPES} from "../stores/navigation-store";
import {useMemo, useState} from "react";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import EditIcon from "@mui/icons-material/Edit";

export const useDocumentMenuItemsInfo = () => {
    const {categoryName, documentId} = useParams();
    const navigate = useNavigate();

    const [showMoveDocumentModal, setShowMoveDocumentModal] = useState(false);
    const [showRenameDocumentModal, setShowRenameDocumentModal] = useState(false);

    const currentView = navigationStore.currentView;

    const isCategoryViewType = useMemo(() => {
        return currentView === VIEW_TYPES.ALL_CATEGORIES;
    }, [currentView]);


    const menuItems = useMemo(() => {
        const items = [
            {
                icon: <DriveFileMoveIcon/>,
                text: "Переместить",
                divider: false,
                onClick: () => {
                    setShowMoveDocumentModal(true);
                    // if (isCategoryViewType) {
                    //     navigate(`/CaseLabDocuments/categories/${categoryName}/${documentId}/move`);
                    // } else {
                    //     navigate(`/CaseLabDocuments/documents/${documentId}/move`);
                    // }
                }
            },
            {
                icon: <EditIcon/>,
                text: "Переименовать",
                divider: false,
                onClick: async () => {
                    setShowRenameDocumentModal(true);

                    // if (isCategoryViewType) {
                    //     navigate(`/CaseLabDocuments/categories/${categoryName}/${documentId}/rename`);
                    // } else {
                    //     navigate(`/CaseLabDocuments/documents/${documentId}/rename`);
                    // }

                    // if (item) {
                    //     if (item.type === "dir") {
                    //         navigate(`/CaseLabDocuments/categories/rename?name=${item.name}`);
                    //     } else {
                    //         const documentDetailPath = documentId ? `${item.id}/` : "";
                    //
                    //         if (isCategoryViewType) {
                    //             navigate(`/CaseLabDocuments/categories/${item.category}/${documentDetailPath}rename?name=${item.name}`);
                    //         } else {
                    //             navigate(`/CaseLabDocuments/documents/${documentDetailPath}rename?name=${item.name}`);
                    //         }
                    //     }
                    // } else if (documentId) {
                    //     if (isCategoryViewType) {
                    //         navigate(`/CaseLabDocuments/categories/${categoryName}/${documentId}/rename`);
                    //     } else {
                    //         navigate(`/CaseLabDocuments/documents/${documentId}/rename`);
                    //     }
                    // } else {
                    //     navigate(`/CaseLabDocuments/categories/${categoryName}/rename?name=${categoryName}`);
                    // }
                }
            }
        ];

        return items;
    }, [navigate, isCategoryViewType, documentId, categoryName]);

    return {
        menuItems,
        showMoveDocumentModal,
        setShowMoveDocumentModal,
        showRenameDocumentModal,
        setShowRenameDocumentModal
    };
}