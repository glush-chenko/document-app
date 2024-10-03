import React from "react";
import {Outlet} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {Navigation} from "../header-nav/navigation";
import {Typography} from "@mui/material";
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import {fileManagerStore} from "../../stores/file-manager-store";
import "./root-style.scss"

export interface breadcrumbItemsProps {
    label: string;
    href: string;
    isLast: boolean;
}

export const Root = observer(() => {
    const currentCategory = fileManagerStore.currentCategory;

    const breadcrumbItems: breadcrumbItemsProps[] = [
        {
            label: 'CaseLabDocuments',
            href: '/CaseLabDocuments',
            isLast: !currentCategory
        }
    ];

    if (currentCategory) {
        breadcrumbItems.push({
            label: decodeURIComponent(currentCategory.replace(/-/g, ' ')),
            href: `/CaseLabDocuments/categories/${currentCategory}`,
            isLast: true
        });
    }

    return (
        <>
            <Navigation/>
            <div className="root-container">
                <div className="breadcrumb-container">
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small"/>}
                        aria-label="breadcrumb"
                        className="breadcrumbs"
                    >
                        {breadcrumbItems.map((item, index) => (
                            item.isLast ? (
                                <Typography key={index} className="breadcrumb-item last">
                                    {item.label}
                                </Typography>
                            ) : (
                                <Link
                                    key={index}
                                    underline="hover"
                                    color="inherit"
                                    href={item.href}
                                    className="breadcrumb-item"
                                >
                                    {item.label}
                                </Link>
                            )
                        ))}
                    </Breadcrumbs>
                    <Outlet/>
                </div>
            </div>
        </>
    )
});