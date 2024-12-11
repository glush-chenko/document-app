import React, {useCallback, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {useDrag} from "react-dnd";
import FolderIcon from "@mui/icons-material/Folder";
import IconButton from "@mui/material/IconButton";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import List from "@mui/material/List";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Divider from '@mui/material/Divider';
import {fileManagerStore, FileObj} from "../../stores/file-manager-store";
import classNames from "classnames";
import {useTrimmedPath} from "../../hooks/use-trimmed-path";
import {fetchFiles} from "../../services/yandex-disk-api";
import {observer} from "mobx-react-lite";

interface RenderDocumentItemProps {
    file: FileObj;
}

export const LeftPanelNestedListItem = observer((props: RenderDocumentItemProps) => {
    const {file} = props;

    const navigate = useNavigate();
    const getTrimmedPath = useTrimmedPath();

    const [expandedCategory, setExpandedCategory] = React.useState<FileObj | null>(null);
    const [loading, setLoading] = React.useState(false);

    const nestedFiles = useMemo(() => {
        if (!expandedCategory) return [];

        return fileManagerStore.getFilesByPath(getTrimmedPath("CaseLabDocuments", expandedCategory.path));
    }, [expandedCategory, fileManagerStore.files]);

    const [{isDragging}, drag] = useDrag(() => ({
        type: "File",
        item: file,
        isDragging(monitor) {
            const item = monitor.getItem();
            return file.name === item.name;
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [file]);

    const toggleCategory = useCallback(async (category: FileObj) => {
        if (expandedCategory?.id === category.id) {
            setExpandedCategory(null);
        } else {
            setLoading(true);
            setExpandedCategory(category);


            const path = getTrimmedPath("CaseLabDocuments", category.path);
            const newFiles = await fetchFiles(path);

            fileManagerStore.setFilesByPath(path, newFiles);
            setLoading(false);
        }
    }, [expandedCategory, fileManagerStore.files]);

    return (
        <>
            <div
                className={classNames("document-item", {
                    dragging: isDragging,
                    // disabled: !isDragging
                })}
                onDoubleClick={() => {
                    if (file.type === "file") {
                        navigate(`/CaseLabDocuments/categories/${file.category}/${file.id}`);
                    }
                }}
                ref={drag}
            >
                <div className="document-info">
                    {/*<DragPreviewImage connect={preview} src={`${document.preview}`}/>*/}
                    {file.type === "file" ? <img src={file.preview} alt={file.name}/> : <FolderIcon/>}
                    <p>{file.name}</p>
                    {file.type !== "file" && (
                        <IconButton
                            onClick={() => toggleCategory(file)}
                        >
                            {expandedCategory?.id === file.id ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                        </IconButton>
                    )}
                </div>
                <div className="document-collapse">
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
                            <Divider/>
                        </List>
                    </Collapse>
                </div>
            </div>
        </>
    );
})