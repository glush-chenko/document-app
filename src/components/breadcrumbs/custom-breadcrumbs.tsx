import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {ButtonBase, Typography} from "@mui/material";
import Link from "@mui/material/Link";
import React from "react";

export interface breadcrumbItemsProps {
    label: string;
    href?: string;
    isLast: boolean;
    onClick?: () => void;
}

interface CustomBreadcrumbsProps {
    items: breadcrumbItemsProps[];
    isLink?: boolean;
}

export const CustomBreadcrumbs = (props: CustomBreadcrumbsProps) => {
    const {items, isLink = true} = props;

    return (
        <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small"/>}
            aria-label="breadcrumb"
            className="breadcrumbs"
        >
            {items.map((item) => {
                if (item.isLast) {
                    return (
                        <Typography key={item.label} className="breadcrumb-item last">
                            {item.label}
                        </Typography>
                    )
                }

                if (!item.isLast && isLink) {
                    return (
                        <Link
                            key={item.label}
                            underline="hover"
                            color="inherit"
                            href={isLink ? item.href : undefined}
                            className="breadcrumb-item"
                            onClick={item.onClick}
                        >
                            {item.label}
                        </Link>
                    )
                }

                if (!item.isLast && !isLink) {
                    return (
                        <ButtonBase></ButtonBase>
                    )
                }
            })}
        </Breadcrumbs>
    )
}