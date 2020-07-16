import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";
import IncomeTaxCalculator from "./incomeTaxCalculator";

class IncomeTax extends React.Component {
    render() {
        document.body.style = "background: #f8f9fa;";
        
        return (
            <div className="container-fluid bg-light">
                <div className="m-3 text-left">
                    <h1>Income Tax</h1>
                </div>
                <IncomeTaxCalculator>
                </IncomeTaxCalculator>
            </div>
        );
    }
}

ReactDOM.render(<IncomeTax/>, document.getElementById("root"));