'use client';

import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="static">
            <a href="#menu" className="btn_mobile" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <div className={`hamburger hamburger--spin ${isMenuOpen ? 'is-active' : ''}`} id="hamburger">
                    <div className="hamburger-box">
                        <div className="hamburger-inner"></div>
                    </div>
                </div>
            </a>

            <div className="container">
                <div className="row">
                    <div className="col-lg-3 col-6">
                        <div id="logo">
                            <a href="/" title="Publicin">
                                <img src="/img/logo.png" alt="Publicin" width="163" height="36" />
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-9 col-6">
                        <ul id="top_access">
                            <li><a href="/login"><i className="pe-7s-user"></i></a></li>
                            <li><a href="/register-doctor"><i className="pe-7s-add-user"></i></a></li>
                        </ul>
                        <nav id="menu" className={`main-menu ${isMenuOpen ? 'open' : ''}`}>
                            <ul>
                                <li>
                                    <span><a href="#0">Home</a></span>
                                    <ul>
                                        <li><a href="/">Home Default</a></li>
                                        <li><a href="/home-kenburns">KenBurns Slider</a></li>
                                        <li><a href="/home-v2">Home Version 2</a></li>
                                        <li><a href="/home-v3">Home Version 3</a></li>
                                        <li><a href="/home-v4">Home Version 4</a></li>
                                        <li><a href="/home-map">Home with Map</a></li>
                                        <li><a href="/home-revolution">Revolution Slider</a></li>
                                        <li><a href="/home-cookie">With Cookie Bar (EU law)</a></li>
                                    </ul>
                                </li>
                              
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}