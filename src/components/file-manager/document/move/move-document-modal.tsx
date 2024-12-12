import React, {useCallback, useMemo} from "react";
import {ModalWrapper} from "../../../modal/modal-wrapper";
import Button from "@mui/material/Button";
import {fileManagerStore} from "../../../../stores/file-manager-store";
import iconFolder from "../../../../assets/Icons_folder.png"
import { useNavigate, useParams} from "react-router-dom";
import {navigationStore, VIEW_TYPES} from "../../../../stores/navigation-store";
import {fetchFiles, moveDocument} from "../../../../services/yandex-disk-api";
import {breadcrumbItemsProps, CustomBreadcrumbs} from "../../../breadcrumbs/custom-breadcrumbs";
import {observer} from "mobx-react-lite";
import {useSnackbarWithAction} from "../../../../hooks/use-snackbar-with-action";

interface MoveDocumentModalProps {
    onClose?: () => void;
}

export const MoveDocumentModal = observer((props: MoveDocumentModalProps) => {
    const {onClose} = props;
    const {'*': path} = useParams();

    const selectedItemsIds = fileManagerStore.selectedItemsIds;
    const currentCategory = fileManagerStore.currentCategoryPath;
    const currentView = navigationStore.currentView;

    const isCategoryViewType = useMemo(() => {
        return currentView === VIEW_TYPES.ALL_CATEGORIES;
    }, [currentView]);

    const navigate = useNavigate();
    const {enqueueSnackbar, closeSnackbar} = useSnackbarWithAction();

    const [nameCategory, setNameCategory] = React.useState("");
    const [localCurrentCategory, setLocalCurrentCategory] = React.useState<string[]>([]);

    const initialFiles = useMemo(() => {
        switch (navigationStore.currentView) {
            case VIEW_TYPES.ALL_DOCUMENTS:
                return fileManagerStore.getAllDocuments();
            case VIEW_TYPES.ALL_CATEGORIES:
                return fileManagerStore.getFilesByPath(nameCategory || "/");
        }
    }, [navigationStore.currentView, localCurrentCategory.length, nameCategory]);

    const generateBreadcrumbItems = useCallback((currentCategory: string[]) => {
        const breadcrumbItems: breadcrumbItemsProps[] = [
            {
                label: 'CaseLabDocuments',
                isLast: !currentCategory,
                onClick: () => {
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
                        setNameCategory(categoryPath)
                    }
                });
            });
        }

        return breadcrumbItems;
    }, [localCurrentCategory]);

    const handleOnDoubleClick = useCallback(async (categoryName: string) => {
        setLocalCurrentCategory(prev => [...prev, categoryName]);

        try {
            const files = await fetchFiles(categoryName);
            fileManagerStore.setFilesByPath(categoryName, files);

            setNameCategory(categoryName);
        } catch (error) {
            console.error("Ошибка при загрузке документов:", error);
        }
    }, [localCurrentCategory]);

    const moveDocuments = useCallback(async () => {
        for (const id of selectedItemsIds) {
            const item = fileManagerStore.getFileById(path || "/", id);
            const targetPath = localCurrentCategory.join('/');
            let res;
            fileManagerStore.setLoading(true);

            if (item && item.type === "file") {
                res = await moveDocument(
                    item.path,
                    `CaseLabDocuments/${targetPath}/${item.name}`
                );
            } else {
                res = await moveDocument(
                    item?.path || "",
                    `CaseLabDocuments/${targetPath}/${item?.name}`
                );
            }

            if (onClose) {
                onClose()
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
    }, [selectedItemsIds, navigate, localCurrentCategory, nameCategory, path]);

    const handleOnClick = useCallback(() => {
        void moveDocuments();
    }, [isCategoryViewType, currentCategory, nameCategory]);

    return (
        <ModalWrapper
            text={`Куда переместить ${selectedItemsIds?.length || 1} ${selectedItemsIds && selectedItemsIds.length > 1 ? "объекта" : "объект"}?`}
            isRename={false}
            onClose={onClose}
        >
            <div className="dialog-body">
                <div className="breadcrumbs">
                    <CustomBreadcrumbs items={generateBreadcrumbItems(localCurrentCategory)}/>
                </div>

                <div className="categories-container">
                    {initialFiles && (
                        initialFiles.map((document) => (
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
                    )}
                </div>

                <Button
                    variant="contained"
                    onClick={handleOnClick}
                >
                    Переместить
                </Button>
            </div>
        </ModalWrapper>
    )
});