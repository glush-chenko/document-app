import React from "react";
import {Outlet} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {Navigation} from "../ components/header-nav/navigation";

export const Root = observer(() => {
    return (
        <>
            <Navigation />
            <div style={{width: "100%", height: "95%", paddingTop: "1rem", boxSizing: "border-box"}}>
                <Outlet/>
            </div>
        </>
    )
});