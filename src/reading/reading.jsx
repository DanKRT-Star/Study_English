import NavigationBar from "../NavigationBar/NavigationBar";
import './reading.css';
import AddReading from "./addReading";

function Reading() {
    return (
        <>
            <NavigationBar></NavigationBar>
            <div className="readingContainer">
                <AddReading></AddReading>
            </div>    
        </>
    )
}

export default Reading