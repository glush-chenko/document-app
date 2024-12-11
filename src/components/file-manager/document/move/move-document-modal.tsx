import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ModalWrapper} from "../../../modal/modal-wrapper";
import Button from "@mui/material/Button";
import {File, fileManagerStore} from "../../../../stores/file-manager-store";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {Typography} from "@mui/material";
import Link from "@mui/material/Link";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import iconFolder from "../../../../assets/Icons_folder.png"
import {useLocation, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {navigationStore, VIEW_TYPES} from "../../../../stores/navigation-store";
import {moveDocument} from "../../../../services/yandex-disk-api";
import {Document} from "../../../../types/document";
import {breadcrumbItemsProps, CustomBreadcrumbs} from "../../../breadcrumbs/custom-breadcrumbs";
import {observer} from "mobx-react-lite";
import {useBreadcrumb} from "../../../../hooks/use-breadcrumb";
import {useTrimmedPath} from "../../../../hooks/use-trimmed-path";
import {useSnackbarWithAction} from "../../../../hooks/use-snackbar-with-action";

interface MoveDocumentModalProps {
    onClose?: () => void;
}

export const MoveDocumentModal = observer((props: MoveDocumentModalProps) => {
    const {onClose} = props;
    const location = useLocation();
    const {documentId} = useParams();

    const queryParams = new URLSearchParams(location.search);
    const selectedItemsIds = useMemo(() => {
        const ids = queryParams.get('ids');
        return ids ? ids.split(',') : documentId ? [documentId] : [];
    }, [queryParams, documentId]);

    const currentCategory = fileManagerStore.currentCategoryPath;
    const categories = fileManagerStore.categories;
    const currentView = navigationStore.currentView;

    const isCategoryViewType = useMemo(() => {
        return currentView === VIEW_TYPES.ALL_CATEGORIES;
    }, [currentView]);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const params = useParams();
    const getTrimmedPath = useTrimmedPath();
    const {enqueueSnackbar, closeSnackbar} = useSnackbarWithAction();

    const [movingAvailable, setMovingAvailable] = React.useState(false);
    const [documentDetail, setDocumentDetail] = React.useState(false);
    const [documents, setDocuments] = React.useState<Document[]>([]);
    const [nameCategory, setNameCategory] = React.useState("");
    const [localCurrentCategory, setLocalCurrentCategory] = React.useState<string[]>([]);

    const generateBreadcrumbItems = useCallback((currentCategory: string[]) => {
        const breadcrumbItems: breadcrumbItemsProps[] = [
            {
                label: 'CaseLabDocuments',
                isLast: !currentCategory,
                onClick: () => {
                    setDocumentDetail(false);
                    setLocalCurrentCategory([])
                }
            }
        ];

        if (currentCategory) {
            currentCategory.forEach((category, index) => {
                breadcrumbItems.push({
                    label: category,
                    isLast: index === currentCategory.length - 1,
                    onClick: async () => {
                        setLocalCurrentCategory(prev => prev.slice(0, -1));
                        const categoryPath = localCurrentCategory.slice(0, -1).join('/');

                        // const documents = await fetchDocuments(categoryPath);
                        // setDocuments(documents);
                    }
                });
            });
        }

        return breadcrumbItems;
    }, [localCurrentCategory]);

    const handleOnDoubleClick = useCallback(async (categoryName: string) => {
        setLocalCurrentCategory(prev => [...prev, categoryName]);

        try {
            // const categoryPath = localCurrentCategory.concat(categoryName).join('/');

            // const documents = await fetchDocuments(categoryPath);

            setDocumentDetail(true);
            // setDocuments(documents);
            setNameCategory(categoryName);
        } catch (error) {
            console.error("Ошибка при загрузке документов:", error);
        }
    }, [localCurrentCategory]);

    const isSelectedItem = useCallback((id: string, name: string) => {
        return selectedItemsIds?.some(item => {
            const findItem = fileManagerStore.findItemById(item);

            return findItem?.id === id || findItem?.type === "file" && findItem.category === name;
        });
    }, [selectedItemsIds]);

    const moveDocuments = useCallback(async () => {
        for (const id of selectedItemsIds) {
            const item = fileManagerStore.findItemById(id);
            const targetPath = localCurrentCategory.join('/');
            const path = getTrimmedPath("CaseLabDocuments", item?.path);
            let res;
            if (!item) return;
            fileManagerStore.setLoading(true);

            if (item.type === "file") {
                res = await moveDocument(
                    `CaseLabDocuments/${path}`,
                    `CaseLabDocuments/${targetPath}/${item.name}`
                );

                res && fileManagerStore.deleteDocument(item);
            } else {
                res = await moveDocument(
                    `CaseLabDocuments/${path}`,
                    `CaseLabDocuments/${targetPath}/${item.name}`
                );

                res && fileManagerStore.deleteCategory(item);
            }

            if (res) {
                enqueueSnackbar(
                    `Объект перенесен в ${localCurrentCategory[localCurrentCategory.length - 1]}`,
                    () => {
                        closeSnackbar();
                    },
                    'Close',
                    {},
                    "info"
                );
            } else {
                enqueueSnackbar(
                    `Произошла ошибка при перенесении объекта`,
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
        navigate("../..");
    }, [selectedItemsIds, navigate, localCurrentCategory]);

    const handleOnClick = useCallback(() => {
        void moveDocuments();
    }, [isCategoryViewType, currentCategory, nameCategory]);

    const selectedDocument = useMemo(() => {
        return documentId ? fileManagerStore.findItemById(documentId) : null;
    }, [documentId]);

    const isCategorySelected = useCallback((category: File) => {
        // (category.type === "file" &&
        //     isSelectedItem(category.id)) ||
        return currentCategory === category.name || isSelectedItem(category.id, category.name);
    }, [currentCategory, isSelectedItem]);

    const isDirectorySelected = useCallback((category: File) => {
        if (selectedDocument) {
            return selectedDocument.type === "file" && (category.name === selectedDocument.category);
        }
    }, [currentCategory, selectedDocument]);

    return (
        <ModalWrapper
            text={`Куда переместить ${selectedItemsIds?.length || 1} ${selectedItemsIds && selectedItemsIds.length > 1 ? "объекта" : "объект"}?`}
            isRename={false}>
            <div className="dialog-body">
                <div className="breadcrumbs">
                    <CustomBreadcrumbs items={generateBreadcrumbItems(localCurrentCategory)}/>
                </div>

                <div className="categories-container">
                    {documentDetail ? (
                        documents.map((document) => (
                            <div
                                key={document.id}
                                className={`categories-info ${document.type === "file" ? "current" : ""}`}
                                onDoubleClick={() => {
                                    if (document.type !== "file") {
                                        void handleOnDoubleClick(document.name);
                                    }
                                }}
                            >
                                <img src={document.preview || iconFolder} alt={document.name}/>
                                <p>{document.name}</p>
                            </div>
                        ))
                    ) : (
                        categories.map((category) => {
                            const isCurrentFile = isCategorySelected(category);
                            const isCurrentDirectory = isDirectorySelected(category);

                            return (
                                <div
                                    className={`categories-info ${isCurrentFile || isCurrentDirectory || category.type === "file" ? "current" : ""}`}
                                    key={category.id}
                                    onDoubleClick={() => {
                                        if (!isCurrentFile && !isCurrentDirectory && category.type === "dir") {
                                            void handleOnDoubleClick(category.name);
                                        }
                                    }}
                                >
                                    <img src={category.type === "file" ? category.preview : iconFolder}
                                         alt="icon-folder"/>
                                    <p>{category.name}</p>
                                </div>
                            );
                        })
                    )}
                </div>

                {/*<div className="btn-move">*/}
                <Button
                    variant="contained"
                    disabled={movingAvailable}
                    onClick={handleOnClick}
                >
                    Переместить
                </Button>
                {/*</div>*/}
            </div>
        </ModalWrapper>
    )
});