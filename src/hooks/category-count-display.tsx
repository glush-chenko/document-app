import React from 'react';

interface SelectedItemsCountDisplayProps {
    count: number;
}

export const SelectedItemsCountDisplay = (props: SelectedItemsCountDisplayProps) => {
    const {count} = props;

    let categoryLabel: string;
    if (count === 1) {
        categoryLabel = "файл";
    } else if (count >= 2 && count <= 4) {
        categoryLabel = "файла";
    } else {
        categoryLabel = "файлов";
    }

    return (
        <h4>
            {count} {categoryLabel}
        </h4>
    );
};