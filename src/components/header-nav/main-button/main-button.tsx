import React, {useCallback, useEffect} from "react";
import {navigationStore, VIEW_TYPES} from "../../../stores/navigation-store";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import {fileManagerStore} from "../../../stores/file-manager-store";
import {useNavigate} from "react-router-dom";

const navButtonsInfo = [
    {
        type: VIEW_TYPES.ALL_CATEGORIES,
        path: "CaseLabDocuments/categories",
        icon: <FolderIcon/>,
        text: "Категории",
    },
    {
        type: VIEW_TYPES.ALL_DOCUMENTS,
        path: "CaseLabDocuments/documents",
        icon: <DescriptionIcon/>,
        text: "Документы"
    }
];

export const MainButton = () => {
    const navigate = useNavigate();
    const [activeType, setActiveType] = React.useState<VIEW_TYPES>(VIEW_TYPES.ALL_CATEGORIES);

    useEffect(() => {
        setActiveType(navigationStore.currentView);
    }, [navigationStore.currentView]);

    const handleNavigation = useCallback((viewType: VIEW_TYPES, path: string) => {
        fileManagerStore.setCurrentCategoryPath("");
        setActiveType(viewType);
        navigate(path);
    }, [navigate]);

    return (
        <div className="nav-buttons">
            {navButtonsInfo.map((info) => {
                return (
                    <div
                        className={`container-btn ${activeType === info.type ? 'active' : ''}`}
                        onClick={() => handleNavigation(info.type, info.path)}
                        key={`nav-button-${info.type}`}
                    >
                        <button className="nav-btn">
                            {info.icon} {info.text}
                        </button>
                    </div>
                )
            })}
        </div>
    )
}