import React, {ChangeEvent, useCallback, useMemo} from "react";
import {ModalWrapper} from "../../../modal/modal-wrapper";
import Button from "@mui/material/Button";
import {useNavigate, useSearchParams} from "react-router-dom";
import {fileManagerStore} from "../../../../stores/file-manager-store";
import {renameItem} from "../../../../services/yandex-disk-api";
import {observer} from "mobx-react-lite";
import {navigationStore, VIEW_TYPES} from "../../../../stores/navigation-store";
import {useSnackbarWithAction} from "../../../../hooks/use-snackbar-with-action";
import {useReplaceAfterLastSlash} from "../../../../hooks/use-replace-after-last-slash";

interface RenameDocumentsProps {
    onClose?: () => void;
}

export const RenameDocuments = observer((props: RenameDocumentsProps) => {
    const {onClose} = props;

    const [searchParams] = useSearchParams();
    const docId = useMemo(() => {
        return searchParams.get("id");
    }, [searchParams]);

    const navigate = useNavigate();
    const {enqueueSnackbar, closeSnackbar} = useSnackbarWithAction();
    const replaceAfterLastSlash = useReplaceAfterLastSlash();

    const [loading, setLoading] = React.useState(false);

    const currentView = navigationStore.currentView;
    const currentCategoryPath = fileManagerStore.currentCategoryPath;
    const selectedItemsIds = fileManagerStore.selectedItemsIds;

    const selected = useMemo(() => {
        if (selectedItemsIds.length) {
            return fileManagerStore.getFileById(currentCategoryPath, selectedItemsIds[0])
        }
    }, [currentCategoryPath, selectedItemsIds])

    const isCategoryViewType = useMemo(() => {
        return currentView === VIEW_TYPES.ALL_CATEGORIES;
    }, [currentView]);

    const file = useMemo(() => {
        return fileManagerStore.findFileById(docId || "/");
    }, [docId])

    const initialValue = useMemo(() => {
        if (isCategoryViewType && !docId) {
            if (selected) {
                return selected.name
            } else {
                return currentCategoryPath.split('/').pop();
            }
        } else {
            return file?.name
        }
    }, [currentCategoryPath])

    const [value, setValue] = React.useState(initialValue)

    const handleChangeValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, []);

    const handleOnClick = useCallback(async () => {
        setLoading(true);

        try {
            if (isCategoryViewType) {
                if (selected && value) {
                    await renameItem(
                        selected.path,
                        `CaseLabDocuments/${currentCategoryPath}/${value}`
                    );
                    fileManagerStore.renameFile(currentCategoryPath, value, selected.id)
                } else {
                    await renameItem(
                        `CaseLabDocuments/${currentCategoryPath}`,
                        `CaseLabDocuments/${replaceAfterLastSlash(currentCategoryPath, value || "")}`
                    );
                    navigate(-1)
                }
            } else {
                if (file) {
                    await renameItem(
                        file.path,
                        replaceAfterLastSlash(file.path, value || "")
                    )
                }
            }

            setLoading(false);

            if (onClose) {
                onClose();
            }

            enqueueSnackbar(
                `Объект ${selected ? selected.name : value} переименован`,
                () => {
                    closeSnackbar();
                },
                'Close',
                {},
                "success"
            );
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
    }, [navigate, value, currentCategoryPath]);

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