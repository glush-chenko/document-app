import React from 'react';

interface SelectedItemsCountDisplayProps {
    selectedItemsIds: string[];
}

export const SelectedItemsCountDisplay = (props: SelectedItemsCountDisplayProps) => {
    const {selectedItemsIds} = props;
    const categoryCount = selectedItemsIds.length;

    let categoryLabel: string;
    if (categoryCount === 1) {
        categoryLabel = "файл";
    } else if (categoryCount >= 2 && categoryCount <= 4) {
        categoryLabel = "файла";
    } else {
        categoryLabel = "файлов";
    }

    return (
        <h4>
            {categoryCount} {categoryLabel}
        </h4>
    );
};