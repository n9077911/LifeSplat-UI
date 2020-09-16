import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from "react";
import ReactDOM from "react-dom";
import 'bootswatch/dist/darkly/bootstrap.min.css';
import "./index.css";
import {IntlProvider} from "react-intl";
import MainPage from "./components/mainPage";

class IncomeTax extends React.Component {
    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="ml-1 ml-md-3 mt-md-3 text-left">
                        <h2>LifeSplat.com<small className="text-muted"> - v0.1-beta {process.env.REACT_APP_ENV === 'production' ? '' : process.env.REACT_APP_ENV}</small></h2>
                    </div>
                </div>
                <MainPage>
                </MainPage>
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