import React from "react";
import Table from 'react-bootstrap/Table'

export default function BreakdownReport(props) {

    let key = 1;
    let headers = props.report.stepsHeaders.map(s => <th key={key+=1}>{s}</th>);
    let body = props.report.steps.map((step, i) => <tr key={i}>{step.map(v => <td key={key+=1}>{v}</td>)}</tr>);
    
    return <Table>
        <thead>
            <tr>
                {headers}
            </tr>
        </thead>
        <tbody>
            {body}
        </tbody>
    </Table>;
}