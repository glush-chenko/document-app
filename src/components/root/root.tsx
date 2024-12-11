import React, {useCallback, useEffect} from "react";
import {Outlet, useParams} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {Navigation} from "../header-nav/navigation";
import {fileManagerStore, FileObj} from "../../stores/file-manager-store";
import "./root-style.scss"
import {breadcrumbItemsProps, CustomBreadcrumbs} from "../breadcrumbs/custom-breadcrumbs";
import {LeftPanel} from "../left-panel/left-panel";
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {AsynchronousAutocomplete} from "../styled/asynchronous-autocomplete";
import {fetchFiles} from "../../services/yandex-disk-api";

export const Root = observer(() => {
    const currentCategory = fileManagerStore.currentCategoryPath;

    useEffect(() => {
        (async () => {
            const categories = await fetchFiles();

            fileManagerStore.setFilesByPath("/", categories);
        })()
    }, []);

    const generateBreadcrumbItems = useCallback((currentCategory: string | null) => {
        const breadcrumbItems: breadcrumbItemsProps[] = [
            {
                label: 'CaseLabDocuments',
                href: '/CaseLabDocuments',
                isLast: !currentCategory
            }
        ];

        if (currentCategory) {
            const categories = currentCategory.split('/');

            categories.forEach((category, index) => {
                const categoryPath = categories.slice(0, index + 1).join('/');
                breadcrumbItems.push({
                    label: decodeURIComponent(category.replace(/-/g, ' ')),
                    href: `/CaseLabDocuments/categories/${categoryPath}`,
                    isLast: index === categories.length - 1
                });
            });
        }

        return breadcrumbItems;
    }, [currentCategory]);

    return (
        <>
            <div className="root-nav">
                <Navigation/>
            </div>
            <div className="root-container">
                <div className="main-container">
                    <DndProvider backend={HTML5Backend}>
                        <LeftPanel/>
                    </DndProvider>
                    <div className="content-container">
                        <CustomBreadcrumbs items={generateBreadcrumbItems(currentCategory)}/>
                        <Outlet/>
                    </div>
                </div>
            </div>
        </>
    )
});