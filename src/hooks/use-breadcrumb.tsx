import {breadcrumbItemsProps} from "../components/breadcrumbs/custom-breadcrumbs";
import React, {useMemo} from "react";
import {Document} from "../types/document";
import {fetchFiles} from "../services/yandex-disk-api";
import {FileObj} from "../stores/file-manager-store";

export const useBreadcrumb = (currentCategory: string[] | string) => {

    const createBreadcrumbItems = (
        setDocumentDetail: React.Dispatch<React.SetStateAction<boolean>>,
        setLocalCurrentCategory: React.Dispatch<React.SetStateAction<string[]>>,
        setDocuments: React.Dispatch<React.SetStateAction<FileObj[]>>
    ): breadcrumbItemsProps[] => {
        const items: breadcrumbItemsProps[] = [];

        if (Array.isArray(currentCategory)) {
            items.push({
                label: 'CaseLabDocuments',
                isLast: !currentCategory.length,
                onClick: () => {
                    setDocumentDetail(false);
                    setLocalCurrentCategory([]);
                }
            });
        } else {
            items.push({
                label: 'CaseLabDocuments',
                href: '/CaseLabDocuments',
                isLast: !currentCategory
            });
        }

        if (currentCategory) {
            let categories: string[];

            if (Array.isArray(currentCategory)) {
                categories = currentCategory;

                categories.forEach((category, index) => {
                    items.push({
                        label: category,
                        isLast: index === currentCategory.length - 1,
                        onClick: async () => {
                            setLocalCurrentCategory((prev) => prev.slice(0, -1));
                            const categoryPath = categories.slice(0, -1).join('/');
                            const files = await fetchFiles(categoryPath);
                            setDocuments(files);
                        }
                    });
                });
            } else {
                categories = currentCategory.split('/');

                categories.forEach((category, index) => {
                    const categoryPath = categories.slice(0, index + 1).join('/');

                    items.push({
                        label: decodeURIComponent(category.replace(/-/g, ' ')),
                        href: `/CaseLabDocuments/categories/${categoryPath}`,
                        isLast: index === categories.length - 1
                    });
                });
            }
        }

        return items;
    }

    return createBreadcrumbItems;
}