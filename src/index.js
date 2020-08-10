import React from "react";
import ReactDOM from "react-dom";
import 'bootswatch/dist/darkly/bootstrap.min.css';
import "./index.css";
import {IntlProvider} from "react-intl";
import RetirementCalculator from "./retirementCalculator";

class IncomeTax extends React.Component {
    render() {
        document.body.style = "background: #222;";
        
        return (
            <div className="container-fluid">
                <div className="m-3 text-left">
                    <h1>Retirement Planner<small className="text-muted"> - Alpha 0.1</small></h1>
                </div>
                <RetirementCalculator>
                </RetirementCalculator>
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