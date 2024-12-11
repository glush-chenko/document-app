import {NavigateFunction} from "react-router-dom";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";

export const menuItemsInfo = (
    navigate: NavigateFunction, //-
    isCategoryViewType: boolean, //-
    categoryName: string, //useParams
    documentId?: string //useParams
) => {
    const items = [
        {
            icon: <DriveFileMoveIcon/>,
            text: "Переместить",
            divider: false,
            onClick: () => {
            }
        },
        {
            icon: <DownloadIcon/>,
            text: "Скачать",
            divider: false,
            onClick: () => {
            }
        },
        {
            icon: <EditIcon/>,
            text: "Переименовать",
            divider: false,
            onClick: () => {
                if (!documentId) return null;

                if (isCategoryViewType) {
                    // обновляем данные с помощью api
                    // потом обновляем данные в нашем сторе чтобы отобразить изменения
                    // сеттим в стор, если требуется
                    navigate(`/CaseLabDocuments/categories/${categoryName}/${documentId}/rename`);
                } else {
                    // обновляем данные с помощью api
                    // потом обновляем данные в нашем сторе чтобы отобразить изменения
                    // сеттим в стор, если требуется
                    navigate(`/CaseLabDocuments/documents/${documentId}/rename`);
                }

            },
        }
    ];
    return items;
};
