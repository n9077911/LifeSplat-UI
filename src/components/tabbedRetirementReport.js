import React from "react";
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import SavingsReport from "./savingsReport";
import IncomeVsSpendingReport from "./incomeVsSpendingReport";
import Report from "../model/report";
// import SummaryReport from "./summaryReportForCouple";
import SummaryReportForCouple from "./summaryReportForCouple";

function TabbedRetirementReport(props) {

    let report = new Report(props.report);
    
    return (
        <div>
            <Tabs defaultActiveKey="highLevel" className="mx-0">
                <Tab eventKey="highLevel" title="Summary">
                    <SummaryReportForCouple report={props.report}/>
                </Tab>
                <Tab eventKey="incomeVsSpendingReport" title="Income vs Spending">
                    <IncomeVsSpendingReport report={props.report} dob={props.dob}/>
                </Tab>
                <Tab eventKey="savingsReport" title="Savings">
                    <SavingsReport report={report} dob={props.dob}/>
                </Tab>
                {/*<Tab eventKey="numbers" title="Debug">*/}
                {/*    <BreakdownReport report={props.report}/>*/}
                {/*</Tab>*/}
            </Tabs>
        </div>
    );
}

export default React.memo(TabbedRetirementReport)



