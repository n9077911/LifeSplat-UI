import React from "react";
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import SummaryReport from "./summaryReport";
import ChartReport from "./chartReport";
import BreakdownReport from "./breakdownReport";

export default function RetirementReport(props) {

    return (
        <div>
            <Tabs defaultActiveKey="highLevel">
                <Tab eventKey="highLevel" title="Summary">
                    <SummaryReport report={props.report}/>
                </Tab>
                <Tab eventKey="charts" title="Report">
                    <ChartReport report={props.report}/>
                </Tab>
                <Tab eventKey="numbers" title="Breakdown">
                    <BreakdownReport report={props.report}/>
                </Tab>
            </Tabs>
        </div>
    );
}

