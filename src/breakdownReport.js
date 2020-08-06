import React from "react";
import Table from 'react-bootstrap/Table'

export default function BreakdownReport(props) {

    let headers = props.report.stepsHeaders.map(s => <th>{s}</th>);
    let body = props.report.steps.map(step => <tr>{step.map(v => <td>{v}</td>)}</tr>);
    
    return <Table>
        <thead>
            {headers}
        </thead>
        <tbody>
            {body}
        </tbody>
    </Table>;
}