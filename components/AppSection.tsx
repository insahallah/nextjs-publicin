"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const AppSection = () => {
  return (
    <div id="app_section">
      <div className="container">
        <div className="row justify-content-around">
          <div className="col-md-5">
            <Image
              src="/img/app_img.svg"
              alt="Findoctor App"
              width={500}
              height={433}
              unoptimized
            />
          </div>

          <div className="col-md-6">
            <small>Application</small>
            <h3>
              Download <strong>Publicin App</strong> Now!
            </h3>
            <p className="lead">
              Publicin App gives you complete access to local businesses right
              in your pocket.
            </p>

            <div
              className="app_buttons wow"
              data-wow-offset="100"
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Link href="https://apps.apple.com" target="_blank">
                <Image
                  src="/img/apple_app.png"
                  alt="App Store"
                  width={150}
                  height={50}
                  unoptimized
                />
              </Link>

              <Link href="https://play.google.com" target="_blank">
                <Image
                  src="/img/google_play_app.png"
                  alt="Google Play"
                  width={150}
                  height={50}
                  unoptimized
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSection;
