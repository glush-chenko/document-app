import React, {ChangeEvent, useCallback, useEffect, useMemo} from "react";
import {ModalWrapper} from "../../../modal/modal-wrapper";
import Button from "@mui/material/Button";
import {useLocation, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {fileManagerStore} from "../../../../stores/file-manager-store";
import {renameItem} from "../../../../services/yandex-disk-api";
import {observer} from "mobx-react-lite";
import {navigationStore, VIEW_TYPES} from "../../../../stores/navigation-store";
import {File} from "../../../../stores/file-manager-store";
import {useSnackbarWithAction} from "../../../../hooks/use-snackbar-with-action";
import {useFetchAllDocuments} from "../../../../hooks/use-fetch-all-documents";

interface RenameDocumentsProps {
    onClose?: () => void;
    id: string;
    name: string;
    onRename: (item: File, newName: string) => Promise<boolean>;
}

export const RenameDocuments = observer((props: RenameDocumentsProps) => {
    const {onClose, id, name, onRename} = props;
    const location = useLocation();
    const navigate = useNavigate();
    const {enqueueSnackbar, closeSnackbar} = useSnackbarWithAction();

    const [loading, setLoading] = React.useState(false);

    // const categories = fileManagerStore.categories;
    // const documents = fileManagerStore.documents;
    const currentView = navigationStore.currentView;
    const documents = fileManagerStore.documents;
    const categories = fileManagerStore.categories;
    const currentCategoryPath = fileManagerStore.currentCategoryPath;

    const isCategoryViewType = useMemo(() => {
        return currentView === VIEW_TYPES.ALL_CATEGORIES;
    }, [currentView]);

    const [value, setValue] = React.useState(name);

    const handleChangeValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, []);

    const performRename = useCallback(async (item: File, newName: string) => {
        // const newPath = `CaseLabDocuments/${currentCategoryPath ? `${currentCategoryPath}/` : ""}${newName}`;
        // const res = await renameItem(`${item.path}`, newPath);
        //
        // fileManagerStore.updateDocumentsArray(item.id, newName, newPath);
        // fileManagerStore.updateCategoriesArray(item.id, newName, newPath);
        //возвращаю res
        //в навигации, в detail, в document-list

        const res = await onRename(item, newName);

        if (res) {
            //Яндекс api обрабатывает асинхронно запрос, поэтому setTimeout используется для ожидания обработки
            setTimeout(() => {
                // const newPath = item.type === "file" ?
                //     (isCategoryViewType ? `/CaseLabDocuments/categories/${item.name}/${item.id}` : `/CaseLabDocuments/documents/${item.id}`) :
                //     (isCategoryViewType ? `/CaseLabDocuments/categories/${newName}` : `/CaseLabDocuments/documents`);

                // navigate(newPath);
                setLoading(false);
                enqueueSnackbar(
                    `Объект ${item.name} переименован`,
                    () => {
                        closeSnackbar();
                    },
                    'Close',
                    {},
                    "success"
                );
                if (onClose) {
                    onClose();
                }
            }, 1000);
        } else {
            enqueueSnackbar(
                `Ошибка при переименовании объекта`,
                () => {
                    closeSnackbar();
                },
                'Close',
                {},
                "error"
            );
            setLoading(false);
            if (onClose) {
                onClose();
            }
        }
    }, [navigate, currentCategoryPath]);

    const handleOnClick = useCallback(async () => {
        if (!value) return;

        setLoading(true);

        try {
            const item = fileManagerStore.findItemById(id);

            if (!item) return;

            await performRename(item, value);
        } catch (error) {
            enqueueSnackbar(
                `${error}`,
                () => {
                    closeSnackbar();
                },
                'Close',
                {},
                "error"
            );
            setLoading(false);
            console.error("Ошибка при переименовании:", error);
        }

        fileManagerStore.setSelectedItemsIds([]);
    }, [id, value, navigate]);

    return (
        <ModalWrapper text="Переименовать" isRename onClose={onClose}>
            <div className="dialog-body">
                <form className="rename-dialog-form">
                    <input
                        value={value}
                        onChange={handleChangeValue}
                    />
                </form>
                <Button
                    variant="contained"
                    disabled={!value}
                    onClick={handleOnClick}
                >
                    {loading ? "Сохраняю..." : "Сохранить"}
                </Button>
            </div>
        </ModalWrapper>
    )
});