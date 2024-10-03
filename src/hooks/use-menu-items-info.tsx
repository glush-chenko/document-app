import {useNavigate, useParams} from "react-router-dom";
import {fileManagerStore} from "../stores/file-manager-store";
import {navigationStore, VIEW_TYPES} from "../stores/navigation-store";
import {useMemo} from "react";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";

export const useMenuItemsInfo = () => {
    const {documentId} = useParams();
    const navigate = useNavigate();

    const selectedItemsIds = fileManagerStore.selectedItemsIds;
    const currentView = navigationStore.currentView;

    const isCategoryViewType = useMemo(() => {
        return currentView === VIEW_TYPES.ALL_CATEGORIES;
    }, [currentView]);


    const menuItems = useMemo(() => {
        const items = [
            {
                icon: <DriveFileMoveIcon />,
                text: "Переместить",
                divider: false,
                onClick: () => {
                    if (isCategoryViewType) {
                        navigate("CaseLabDocuments/categories/move")
                    } else {
                        navigate("CaseLabDocuments/documents/move")
                    }
                }
            },
            {
                icon: <DownloadIcon />,
                text: "Скачать",
                divider: false,
                onClick: () => {
                    // Логика скачивания
                }
            }
        ];

        if (selectedItemsIds.length === 1) {
            items.push({
                icon: <EditIcon />,
                text: "Переименовать",
                divider: false,
                onClick: async () => {
                    const item = fileManagerStore.findItemById(selectedItemsIds[0]);
                    if (!item) return;

                    if (item.type === "dir") {
                        navigate(`/CaseLabDocuments/categories/rename?name=${item.name}`);
                    } else {
                        const documentDetailPath = documentId ? `${item.id}/` : "";

                        if (isCategoryViewType) {
                            navigate(`/CaseLabDocuments/categories/${item.category}/${documentDetailPath}rename?name=${item.name}`);
                        } else {
                            navigate(`/CaseLabDocuments/documents/${documentDetailPath}rename?name=${item.name}`);
                        }
                    }
                }
            });
        }

        // if () {
        //
        // }

        return items;
    }, [navigate, selectedItemsIds, isCategoryViewType, documentId]);

    return menuItems;
}