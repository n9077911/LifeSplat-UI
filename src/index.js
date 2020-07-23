import React from "react";
import ReactDOM from "react-dom";
import 'bootswatch/dist/darkly/bootstrap.min.css';
import "./index.css";
import IncomeTaxCalculator from "./incomeTaxCalculator";
import {IntlProvider} from "react-intl";

class IncomeTax extends React.Component {
    render() {
        document.body.style = "background: #222;";
        
        return (
            <div className="container-fluid">
                <div className="m-3 text-left">
                    <h1>Retirement Planner</h1>
                </div>
                <IncomeTaxCalculator>
                </IncomeTaxCalculator>
            </div>
        );
    }
}

const locale = (navigator.languages && navigator.languages[0])
    || navigator.language
    || 'en-GB';

ReactDOM.render(
    <IntlProvider locale={locale}>
        <IncomeTax/>
    </IntlProvider>
        , document.getElementById("root"));