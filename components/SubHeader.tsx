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
                <li>
                  <span><a href="#0">Pages</a></span>
                  <ul>
                    <li>
                      <span><a href="#0">List pages</a></span>
                      <ul>
                        <li><a href="/list">List page</a></li>
                        <li><a href="/grid-list">List grid page</a></li>
                        <li><a href="/list-map">List map page</a></li>
                      </ul>
                    </li>
                    <li>
                      <span><a href="#0">Detail pages</a></span>
                      <ul>
                        <li><a href="/detail">Detail page</a></li>
                        <li><a href="/detail-2">Detail page 2</a></li>
                        <li><a href="/detail-3">Detail page 3</a></li>
                        <li><a href="/detail-booking">Detail working booking</a></li>
                      </ul>
                    </li>
                    <li><a href="/submit-review">Submit Review</a></li>
                    <li><a href="/blog">Blog</a></li>
                    <li><a href="/badges">Badges</a></li>
                    <li><a href="/login">Login</a></li>
                    <li><a href="/login-2">Login 2</a></li>
                    <li><a href="/register-doctor">Register Doctor</a></li>
                    <li><a href="/register-doctor-working">Working doctor register</a></li>
                    <li><a href="/register">Register</a></li>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/contacts">Contacts</a></li>
                  </ul>
                </li>
                <li>
                  <span><a href="#0">Extra Elements</a></span>
                  <ul>
                    <li><a href="/detail-booking">Detail working booking</a></li>
                    <li><a href="/booking">Booking page</a></li>
                    <li><a href="/confirm">Confirm page</a></li>
                    <li><a href="/faq">Faq page</a></li>
                    <li><a href="/coming-soon">Coming soon</a></li>
                    <li>
                      <span><a href="#0">Pricing tables</a></span>
                      <ul>
                        <li><a href="/pricing-1">Pricing tables 1</a></li>
                        <li><a href="/pricing-2">Pricing tables 2</a></li>
                        <li><a href="/pricing-3">Pricing tables 3</a></li>
                      </ul>
                    </li>
                    <li><a href="/icon-pack-1">Icon pack 1</a></li>
                    <li><a href="/icon-pack-2">Icon pack 2</a></li>
                    <li><a href="/icon-pack-3">Icon pack 3</a></li>
                    <li><a href="/404">404 page</a></li>
                  </ul>
                </li>
                <li><span><a href="/menu-v2">Menu V2</a></span></li>
                <li><span><a href="/admin" target="_blank">Admin</a></span></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}