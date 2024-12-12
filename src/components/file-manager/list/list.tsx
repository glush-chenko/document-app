import React, {useCallback} from "react";
import {fileManagerStore, FileObj} from "../../../stores/file-manager-store";
import {useNavigate, useParams} from "react-router-dom";
import iconBasket from "../../../assets/icon_basket.png";
import {getTrashContents} from "../../../services/yandex-disk-api";
import "./list-item-style.scss"
import {observer} from "mobx-react-lite";
import {ListItem} from "./list-item/list-item";
import {navigationStore, VIEW_TYPES} from "../../../stores/navigation-store";
import {Loading} from "../../generic/loading";

interface ListProps {
    showTrash?: boolean;
    items: FileObj[];
}

export const List = observer((props: ListProps) => {
    const {showTrash, items} = props;
    const navigate = useNavigate();
    const {'*': path} = useParams();
    const categories = path ? path.split('/') : [];

    const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

    const selectedItems = fileManagerStore.selectedItemsIds;
    const currentView = navigationStore.currentView;
    const currentCategory = fileManagerStore.currentCategoryPath;
    const loading = fileManagerStore.loading;

    const handleItemDoubleClick = useCallback((item: FileObj) => {
        if (currentView === VIEW_TYPES.ALL_CATEGORIES) {
            if (item.type === 'file') {
                navigate(`?id=${item.id}`);
            } else if (item.type === 'dir') {
                categories.push(item.name);

                const fullPath = `/CaseLabDocuments/categories/${categories.join('/')}`;
                navigate(fullPath);
            }
        } else {
            navigate(`?id=${item.id}`);
        }

        fileManagerStore.setSelectedItemsIds([]);
    }, [navigate, currentView, currentCategory, categories]);

    const handleItemClick = useCallback((itemId: string) => {
        const newSelected = selectedItems.includes(itemId)
            ? selectedItems.filter(id => id !== itemId)
            : [...selectedItems, itemId];

        fileManagerStore.setSelectedItemsIds(newSelected);
    }, [selectedItems]);

    const handleTrashDoubleClick = useCallback(async () => {
        try {
            fileManagerStore.setLoading(true);
            await getTrashContents();

            navigate('/trash');
        } catch (error) {
            console.error('Ошибка при загрузке содержимого корзины:', error);
        }
    }, [navigate]);

    return (
        <ul className="items-list">
            {loading ? (
                <Loading/>
            ) : (
                <>
                    {items.map((item) => (
                        <ListItem
                            key={item.id}
                            item={item}
                            isSelected={selectedItems.includes(item.id)}
                            onDoubleClick={handleItemDoubleClick}
                            onClick={handleItemClick}
                            isHovered={hoveredItemId === item.id}
                            onMouseEnter={() => setHoveredItemId(item.id)}
                            onMouseLeave={() => setHoveredItemId(null)}
                        />
                    ))}
                    {showTrash && (
                        <li
                            className="item"
                            onDoubleClick={handleTrashDoubleClick}
                            tabIndex={0}
                        >
                            <img
                                src={iconBasket}
                                alt="trash"
                                className="item-image trash"
                            />
                            <span className="item-name">Корзина</span>
                        </li>
                    )}
                </>
            )}
        </ul>
    )
});