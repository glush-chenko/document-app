import {useNavigate, useParams} from "react-router-dom";
import {fileManagerStore} from "../stores/file-manager-store";
import {navigationStore, VIEW_TYPES} from "../stores/navigation-store";
import {useMemo, useState} from "react";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import {downloadFile} from "../services/yandex-disk-api";

export const useMenuItemsInfo = () => {
    const {categoryName, documentId} = useParams();
    const navigate = useNavigate();

    const [showMoveDocumentModal, setShowMoveDocumentModal] = useState(false);
    const [showRenameDocumentModal, setShowRenameDocumentModal] = useState(false);

    const selectedItemsIds = fileManagerStore.selectedItemsIds;
    const currentView = navigationStore.currentView;

    const isCategoryViewType = useMemo(() => {
        return currentView === VIEW_TYPES.ALL_CATEGORIES;
    }, [currentView]);

    const downloadSelectedFiles = async () => {
        try {
            const downloadLinks = await Promise.all(selectedItemsIds.map(async (id) => {
                const item = fileManagerStore.findFileById(id);

                if (item) {
                    let link;

                    if (item.type === "file") {
                        link = await downloadFile(`CaseLabDocuments/${item.category}/${item.name}`);
                    } else {
                        link = await downloadFile(`CaseLabDocuments/${item.name}`);
                    }
                    return link;
                }

                console.warn(`Элемент с ID ${id} не найден или не имеет пути.`);
                return null;
            }));

            downloadLinks.filter(link => link).forEach(link => {
                if (link) {
                    window.open(link);
                }
            });
        } catch (error) {
            console.error('Ошибка при скачивании файлов:', error);
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
            }
        ];

        if (selectedItemsIds.length <= 1) {
            items.push({
                icon: <EditIcon/>,
                text: "Переименовать",
                divider: false,
                onClick: async () => {
                    setShowRenameDocumentModal(true);
                }
            });
        }

        if (selectedItemsIds.length === 1) {
            items.push({
                icon: <DownloadIcon/>,
                text: "Скачать",
                divider: false,
                onClick: downloadSelectedFiles
            })
        }

        return items;
    }, [navigate, selectedItemsIds, isCategoryViewType, documentId, categoryName]);

    return {
        menuItems,
        showMoveDocumentModal,
        setShowMoveDocumentModal,
        showRenameDocumentModal,
        setShowRenameDocumentModal
    };
}