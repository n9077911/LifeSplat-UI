import React from "react";
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import SummaryReport from "./summaryReport";
import BreakdownReport from "./breakdownReport";
import IncomeVsSpendingReport from "./incomeVsSpendingReport";
import SavingsReport from "./savingsReport";

export default function TabbedRetirementReport(props) {

    return (
        <div>
            <Tabs defaultActiveKey="highLevel">
                <Tab eventKey="highLevel" title="Summary">
                    <SummaryReport report={props.report}/>
                </Tab>
                <Tab eventKey="incomeVsSpendingChart" title="Income vs Spending">
                    <IncomeVsSpendingReport report={props.report} dob={props.dob}/>
                </Tab>
                <Tab eventKey="savingsChart" title="Savings">
                    <SavingsReport report={props.report}/>
                </Tab>
                {/*<Tab eventKey="numbers" title="Debug">*/}
                {/*    <BreakdownReport report={props.report}/>*/}
                {/*</Tab>*/}
            </Tabs>
        </div>
    );
}

