import React from "react";
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import SavingsReport from "./savingsReport";
import IncomeVsSpendingReport from "./incomeVsSpendingReport";
import Report from "../model/report";
import SummaryReportForCouple from "./summaryReportForCouple";
import Assumptions from "./assumptions";

function TabbedRetirementReport(props) {

    function reportHasRan() {
        return typeof props.rawReport.person !== 'undefined'
    }        

    let report = reportHasRan() ? new Report(props.rawReport) : null;
    
    return (
        <div id="results" className="w-auto mt-3 ml-1 ml-md-3">
            {reportHasRan() ? 
            <Tabs defaultActiveKey="highLevel" className="mx-0">
                <Tab eventKey="highLevel" title="Summary">
                    <SummaryReportForCouple report={props.rawReport}/>
                </Tab>
                <Tab eventKey="incomeVsSpendingReport" title="Income vs Spending">
                    <IncomeVsSpendingReport report={props.rawReport} dob={props.dob}/>
                </Tab>
                <Tab eventKey="savingsReport" title="Investments">
                    <SavingsReport report={report} dob={props.dob}/>
                </Tab>
                <Tab eventKey="assumptionsReport" title="Assumptions">
                    <Assumptions report={report} dob={props.dob}/>
                </Tab>
                {/*<Tab eventKey="numbers" title="Debug">*/}
                {/*    <BreakdownReport report={props.report}/>*/}
                {/*</Tab>*/}
            </Tabs>
                : ''}
            {props.rawReport.error ? props.rawReport.error : ''}
        </div>
    );
}

export default React.memo(TabbedRetirementReport)



