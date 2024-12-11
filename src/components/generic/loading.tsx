import loading from "../../assets/bouncing-circles.svg"
import "./loading-style.scss"

export const Loading = () => {
    return (
        <div className="loading-container">
            <img
                src={loading}
                alt="loading-animation"
                className="loading"
            />
        </div>
    )
}