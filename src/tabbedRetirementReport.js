import React from "react";
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import SummaryReport from "./summaryReport";
import ChartReport from "./chartReport";
import BreakdownReport from "./breakdownReport";

export default function TabbedRetirementReport(props) {

    return (
        <div>
            <Tabs defaultActiveKey="highLevel">
                <Tab eventKey="highLevel" title="Summary">
                    <SummaryReport report={props.report}/>
                </Tab>
                <Tab eventKey="charts" title="Income vs Spending">
                    <ChartReport report={props.report} dob={props.dob}/>
                </Tab>
                {/*<Tab eventKey="numbers" title="Debug">*/}
                {/*    <BreakdownReport report={props.report}/>*/}
                {/*</Tab>*/}
            </Tabs>
        </div>
    );
}

