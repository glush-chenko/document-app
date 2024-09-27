import React from 'react';
import {Link} from "react-router-dom";
import logo from "../../assets/logo.png"
import "./navigation-style.scss"

export const Navigation = () => {
    return (
        <nav className="navigation">
            <div className="logo">
                <Link to="/"><img src={logo} alt="logo-blog" style={{width: "3rem"}}/></Link>
            </div>

            <div className="nav-buttons">
                <div>
                    <button className="nav-btn">
                        Список всех документов
                    </button>
                </div>

                <div>
                    <button className="nav-btn">
                        Список всех категорий
                    </button>
                </div>
            </div>
        </nav>
    );
};