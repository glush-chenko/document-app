import React, {useCallback, useMemo} from "react";
import {useDrop} from "react-dnd";
import {LeftPanelNestedListItem} from "./left-panel-nested-list-item";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import {useNavigate} from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import {observer} from "mobx-react-lite";
import {fileManagerStore, FileObj} from "../../stores/file-manager-store";
import FolderIcon from "@mui/icons-material/Folder";
import classNames from "classnames";
import {fetchFiles} from "../../services/yandex-disk-api";
import {useTrimmedPath} from "../../hooks/use-trimmed-path";

interface RenderCategoryItemProps {
    file: FileObj;
    handleDrop: (targetCategory: string, file: FileObj) => void;
}

export const LeftPanelListItem = observer((props: RenderCategoryItemProps) => {
    const {
        file,
        handleDrop
    } = props;

    const navigate = useNavigate();
    const getTrimmedPath = useTrimmedPath();

    const [expandedCategory, setExpandedCategory] = React.useState<FileObj | null>(null);

    const nestedFiles = useMemo(() => {
        if (!expandedCategory) return [];

        return fileManagerStore.getFilesByPath(getTrimmedPath("CaseLabDocuments", expandedCategory.path));
    }, [expandedCategory, fileManagerStore.files]);

    const [{isOver, canDrop}, drop] = useDrop<FileObj, void, { isOver: boolean, canDrop: boolean }>(() => ({
        accept: "File",
        drop: (item) => handleDrop(file.name, item),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
        canDrop: (item, monitor) => {
            if (file.type === "file") {
                return false;
            }

            if (item.type === "file") {
                const parts: any = item.category?.split("/");
                return !parts.includes(file.name);
            }

            if (item.type === "dir") {
                return item.category !== file.name;
            }

            return false;
        }
    }), [handleDrop, file]);

    const isDragActive = useMemo(() => {
        return canDrop && isOver;
    }, [canDrop, isOver])

    const [loading, setLoading] = React.useState(true);

    const toggleCategory = useCallback(async (category: FileObj) => {
        if (expandedCategory?.id === category.id) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(category);
            setLoading(true);

            const path = getTrimmedPath("CaseLabDocuments", category.path);
            const newFiles = await fetchFiles(path);

            fileManagerStore.setFilesByPath(path, newFiles);
            setLoading(false);
        }
    }, [expandedCategory, fileManagerStore.files]);

    const spanHandleOncClick = useCallback(() => {
        if (file.type === "file") {
            navigate(`/CaseLabDocuments/${file.id}`);
        } else {
            navigate(`/CaseLabDocuments/categories/${file.name}`);
        }
    }, [file, navigate]);

    return (
        <div ref={drop}>
            <div className={classNames("category-header", {
                expanded: expandedCategory?.id === file.id,
                highlight: isDragActive,
                valid: canDrop,
                disabled: isDragActive && !canDrop
            })}>
                {file.type === "dir" ? <FolderIcon/> : <img src={file.preview} alt={file.name}/>}
                <span onClick={spanHandleOncClick}>{file.name}</span>
                {file.type === "dir" && (
                    <IconButton onClick={() => toggleCategory(file)}>
                        {expandedCategory?.id === file.id ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                    </IconButton>
                )}
            </div>
            <Collapse in={expandedCategory?.id === file.id}>
                <List id="list">
                    {loading ? (
                        <div className="spinner">
                            <CircularProgress size={20}/>
                        </div>
                    ) : (
                        nestedFiles.map((file) => (
                            <LeftPanelNestedListItem
                                key={file.id}
                                file={file}
                            />
                        ))
                    )}
                </List>
            </Collapse>
        </div>
    )
})