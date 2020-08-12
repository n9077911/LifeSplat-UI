import React from "react";
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import SummaryReport from "./summaryReport";
import BreakdownReport from "./breakdownReport";
import SavingsReport from "./savingsReport";
import IncomeVsSpendingReport from "./incomeVsSpendingReport";

export default function TabbedRetirementReport(props) {

    return (
        <div>
            <Tabs defaultActiveKey="highLevel" className="mx-0">
                <Tab eventKey="highLevel" title="Summary">
                    <SummaryReport report={props.report}/>
                </Tab>
                <Tab eventKey="incomeVsSpendingReport" title="Income vs Spending">
                    <IncomeVsSpendingReport report={props.report} dob={props.dob}/>
                </Tab>
                <Tab eventKey="savingsReport" title="Savings">
                    <SavingsReport report={props.report} dob={props.dob}/>
                </Tab>
                {/*<Tab eventKey="numbers" title="Debug">*/}
                {/*    <BreakdownReport report={props.report}/>*/}
                {/*</Tab>*/}
            </Tabs>
        </div>
    );
}


