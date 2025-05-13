import NavigationBar from "../NavigationBar/NavigationBar";
import AddScene from "./addScene";
import './scene.css'

function Scene() {
    return (
        <>
            <NavigationBar></NavigationBar>
            <div className="sceneContainer">
                <AddScene></AddScene>
            </div>
        </>
    )
}

export default Scene