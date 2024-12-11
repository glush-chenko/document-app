import React, {useCallback, useEffect, useMemo} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import "./documents-list-style.scss"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import {observer} from "mobx-react-lite";
import {File, fileManagerStore} from "../../../../stores/file-manager-store";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuItem from '@mui/material/MenuItem';
import {navigationStore, VIEW_TYPES} from "../../../../stores/navigation-store";
import {StyledMenu} from "../../../styled/styled-menu";
import {List} from "../../list/list";
import {useFetchAllDocuments} from "../../../../hooks/use-fetch-all-documents";
import {clearTrash, fetchFiles, getTrashContents, renameItem} from "../../../../services/yandex-disk-api";
import {useCategoryMenuItemsInfo} from "../../../../hooks/use-category-menu-items-info";
import {DocumentDetail} from "../detail/document-detail";
import {MoveDocumentModal} from "../move/move-document-modal";
import {RenameDocuments} from "../rename/rename-documents";
import {useReplaceAfterLastSlash} from "../../../../hooks/use-replace-after-last-slash";
import Button from "@mui/material/Button";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export const DocumentsList = observer(() => {
    const {
        menuItems,
        showMoveDocumentModal,
        setShowMoveDocumentModal,
        showRenameDocumentModal,
        setShowRenameDocumentModal
    } = useCategoryMenuItemsInfo();
    const fetchAllDocuments = useFetchAllDocuments();
    const {'*': path} = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const currentCategoryPath = fileManagerStore.currentCategoryPath;

    const replaceAfterLastSlash = useReplaceAfterLastSlash();

    const docId = useMemo(() => {
        return searchParams.get("id");
    }, [searchParams]);

    const files = useMemo(() => {
        switch (navigationStore.currentView) {
            case VIEW_TYPES.ALL_DOCUMENTS:
                return fileManagerStore.getAllDocuments();
            case VIEW_TYPES.ALL_CATEGORIES:
                return fileManagerStore.getFilesByPath(path || "/");
            case VIEW_TYPES.TRASH:
                return fileManagerStore.trashItems;
        }
    }, [fileManagerStore.files, path, fileManagerStore.trashItems, navigationStore.currentView]);

    useEffect(() => {
        const loadDocuments = async () => {
            fileManagerStore.setLoading(true);
            try {
                switch (navigationStore.currentView) {
                    case VIEW_TYPES.ALL_DOCUMENTS:
                        const allDocuments = await fetchAllDocuments();

                        fileManagerStore.replaceAllFiles(allDocuments);
                        break;
                    case VIEW_TYPES.ALL_CATEGORIES:
                        const files = await fetchFiles(path);

                        fileManagerStore.setFilesByPath(path || "/", files);
                        fileManagerStore.setCurrentCategoryPath(path || "");
                        break;
                    case VIEW_TYPES.TRASH:
                        const trashItems = await getTrashContents();

                        fileManagerStore.setTrashItems(trashItems);
                        break;
                }
            } catch (error) {
                console.error('Ошибка при загрузке документов:', error);
                // редирект
            } finally {
                fileManagerStore.setLoading(false);
            }
        };

        void loadDocuments();

    }, [path, navigationStore.currentView]);

    const handleBack = useCallback(() => {
        const categoryNames = path ? path.split("/") : [];
        const prevCategoryName = categoryNames.pop();
        const newPath = categoryNames.join("/");

        navigate(`/CaseLabDocuments/categories/${newPath}`)

        if (prevCategoryName) {
            fileManagerStore.setCurrentCategoryPath(newPath);
        } else {
            fileManagerStore.setCurrentCategoryPath("");
        }

        fileManagerStore.setSelectedItemsIds([]);
    }, [navigate, path]);

    const currentCategoryName = useMemo(() => {
        const categoryNames = path ? path.split("/") : [];
        return categoryNames[categoryNames.length - 1];
    }, [path]);

    const handleMoveDocumentModalClose = useCallback(() => {
        setShowMoveDocumentModal(false);
    }, []);

    const handleRenameDocumentModalClose = useCallback(() => {
        setShowRenameDocumentModal(false);
    }, []);

    const category = useMemo(() => {
        return fileManagerStore.findItemByName(currentCategoryName);
    }, [currentCategoryName]);

    const handleRename = useCallback(async (item: File, newName: string) => {
        const newItemPath = item.type === "file" ? `${currentCategoryPath}/` : `${replaceAfterLastSlash(currentCategoryPath, newName)}/`;
        const fullPath = `CaseLabDocuments/${currentCategoryPath ? newItemPath : ""}${newName}`;

        fileManagerStore.updateDocumentsArray(item.id, newName, fullPath);
        fileManagerStore.updateCategoriesArray(item.id, newName, fullPath);

        return await renameItem(`${item.path}`, fullPath);
    }, [currentCategoryPath]);

    const handleClearTrash = useCallback(() => {
        void clearTrash();
    }, []);

    const listTitle = useMemo(() => {
        switch (navigationStore.currentView) {
            case VIEW_TYPES.ALL_DOCUMENTS:
                return "";
            case VIEW_TYPES.ALL_CATEGORIES:
                return currentCategoryName || "CaseLabDocuments";
            case VIEW_TYPES.TRASH:
                return "Корзина"
        }
    }, [navigationStore.currentView, currentCategoryName]);

    const showBackButton = useMemo(() => {
        switch (navigationStore.currentView) {
            case VIEW_TYPES.ALL_DOCUMENTS:
                return false;
            case VIEW_TYPES.ALL_CATEGORIES:
                return !!path;
            case VIEW_TYPES.TRASH:
                return true
        }
    }, [navigationStore.currentView, path]);

    const showActionsMenu = useMemo(() => {
        return navigationStore.currentView === VIEW_TYPES.ALL_CATEGORIES;
    }, [navigationStore.currentView]);

    const showTrash = useMemo(() => {
        return navigationStore.currentView === VIEW_TYPES.ALL_CATEGORIES && !path;
    }, [navigationStore.currentView, path]);

    const showClearTrashButton = useMemo(() => {
        return navigationStore.currentView === VIEW_TYPES.TRASH;
    }, [navigationStore.currentView]);

    return (
        <div className="category-documents">
            <div className="category-info">
                <div className="category-header">
                    <div className="category-header-left-section">
                        {showBackButton && (
                            <IconButton onClick={handleBack}>
                                <ArrowBackIcon/>
                            </IconButton>
                        )}
                        <h2>{listTitle}</h2>

                        {showActionsMenu && (
                            <>
                                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                                    <MoreVertIcon/>
                                </IconButton>
                                <StyledMenu
                                    disablePortal={true}
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={() => setAnchorEl(null)}
                                >
                                    {menuItems.flatMap((itemInfo, index) =>
                                        [
                                            <MenuItem
                                                onClick={() => {
                                                    itemInfo.onClick()
                                                    setAnchorEl(null);
                                                }}
                                                disableRipple
                                                key={itemInfo.text}
                                            >
                                                {itemInfo.icon} {itemInfo.text}
                                            </MenuItem>,
                                            itemInfo.divider ? <Divider key={`divider-${index}`}/> : null,
                                        ]
                                    )}
                                </StyledMenu>
                            </>
                        )}
                    </div>

                    {showClearTrashButton && (
                        <div className="category-header-right-section">
                            <Button onClick={handleClearTrash}><WhatshotIcon/> <p>Очистить корзину</p></Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="documents-container">
                {files.length ? (
                    <List items={files} showTrash={showTrash}/>
                ) : (
                    <div className="empty-list-text">
                        <AutoAwesomeIcon/>
                        <span>Файлов нет</span>
                    </div>
                )}
            </div>

            {showMoveDocumentModal && (
                <MoveDocumentModal onClose={handleMoveDocumentModalClose}/>
            )}

            {(showRenameDocumentModal && category) && (
                <RenameDocuments
                    onClose={handleRenameDocumentModalClose}
                    id={category.id}
                    name={category.name}
                    onRename={handleRename}
                />
            )}

            {docId && (
                <DocumentDetail docId={docId}/>
            )}
        </div>
    )
});