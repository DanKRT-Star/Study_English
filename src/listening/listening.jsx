import { useState } from "react";
import NavigationBar from "../NavigationBar/NavigationBar";
import './listening.css';
import AddListening from "./addListening";

function Listening() {
    return (
        <>
            <NavigationBar></NavigationBar>
            <div className="listeningContainer">
                <AddListening/>               
            </div>    
        </>
    )
}

export default Listening