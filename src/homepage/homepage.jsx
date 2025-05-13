import { useState } from "react";
import './homepage.css'
import NavigationBar from "../NavigationBar/NavigationBar";

function Homepage() {

    return (
        <>
            <NavigationBar></NavigationBar>
            <div className="homepageContainer">
                <div>
                    <h1>Xin chào, bạn đã đăng nhập thành công!</h1>
                </div>
            </div>
        </>
    );
}

export default Homepage