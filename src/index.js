import React from "react";
import ReactDOM from "react-dom";
import 'bootswatch/dist/darkly/bootstrap.min.css';
import "./index.css";
import {IntlProvider} from "react-intl";
import RetirementCalculator from "./components/retirementCalculator";

class IncomeTax extends React.Component {
    render() {
        document.body.style = "background: #222;";
        
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="ml-1 ml-md-3 mt-md-3 text-left">
                        <h2>LifeSplat.com<small className="text-muted"> - Alpha 0.1</small></h2>
                    </div>
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