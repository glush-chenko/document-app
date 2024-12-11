import {Document} from "../../../../types/document";
import {Category} from "../../../../types/category";
import {observer} from "mobx-react-lite";
import React from "react";
import Checkbox from "@mui/material/Checkbox";
import iconFolder from "../../../../assets/Icons_folder.png"
import {FileObj} from "../../../../stores/file-manager-store";

// type Item = Document | Category;

interface ListItemProps {
    item: FileObj;
    isSelected: boolean;
    onDoubleClick: (item: FileObj) => void;
    onClick: (itemId: string) => void;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const ListItem = observer((props: ListItemProps) => {
    const {item, isSelected, onDoubleClick, onClick, isHovered, onMouseEnter, onMouseLeave} = props;

    const [isCheckboxClicked, setIsCheckboxClicked] = React.useState(false);

    return (
        <li
            key={item.id}
            className={`item ${isSelected ? "active" : ""}`}
            onDoubleClick={() => {
                if (!isCheckboxClicked) {
                    onDoubleClick(item);
                }
                setIsCheckboxClicked(false);
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            tabIndex={0}
        >
            {(isSelected || isHovered) && (
                <Checkbox
                    onMouseDown={() => setIsCheckboxClicked(true)}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(item.id);
                    }}
                    checked={isSelected}
                    className="item-checkbox"
                />
            )}
            <img
                src={item.type === "file" ? item.preview : iconFolder}
                alt={item.name}
                className="item-image"
            />
            <span className={item.type === "file" ? "document-name" : ""}>{item.name}</span>
        </li>
    )
});