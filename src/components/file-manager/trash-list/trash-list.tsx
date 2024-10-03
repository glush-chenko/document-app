import React from "react";
import {observer} from "mobx-react-lite";
import {fileManagerStore} from "../../../stores/file-manager-store";
import iconFolder from "../../../assets/Icons_folder.png"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "./trash-list.scss"
import IconButton from "@mui/material/IconButton";
import {useNavigate} from "react-router-dom";

export const TrashList = observer(() => {
    const trashItems = fileManagerStore.getTrashItems();
    const navigate = useNavigate();

    return (
        <>
            <div className="category-info">
                <IconButton onClick={() => navigate("../")}>
                    <ArrowBackIcon/>
                </IconButton>
                <h2>Корзина</h2>
            </div>

            <div className="trash-items-list">
                {trashItems.map((item) => (
                    <div key={item.path} className="trash-item">
                        {item.type === 'dir' ? (
                            <>
                                <img
                                    src={iconFolder}
                                    alt={item.name}
                                />
                                <span className="category-name">{item.name}</span>
                            </>
                        ) : (
                            <>
                                <img
                                    src={item.preview}
                                    alt={item.name}
                                />
                                <span className="category-name">{item.name}</span>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </>
    )
});