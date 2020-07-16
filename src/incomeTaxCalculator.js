import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

export default class IncomeTaxCalculator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            errors: {},
            salary: 0,
            url: "https://sctaxcalcservice.azurewebsites.net/api/TaxResults/"
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    loadCommentsFromServer() {
        const xhr = new XMLHttpRequest();
        xhr.open("get", this.state.url + this.state.salary, true);
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            this.setState({data: data});
        };
        xhr.send();
    }

    handleSubmit(event) {
        this.loadCommentsFromServer();
        event.preventDefault();
    }

    handleChange(event) {
        if (event.target.value && !event.target.value.match(/^\d+$/)) 
            this.setState({errors: {salary: "Not a number"}})
        else 
            this.setState({errors: {salary: ""}})

        this.setState({salary: event.target.value});
    }

    resultListItems() {
        return this.state.data.taxResultItems && this.state.data.taxResultItems.map((item, index) => {
            return (
                <li key={item.description} className={"list-group-item d-flex justify-content-between taxResult " + (item.isTotal ? "reportTotal" : "")}>
                    <div> <h6>{item.description}:</h6></div>
                    <div><h6>£{Math.round(item.amount).toLocaleString()}</h6></div>
                </li>
            );
        });
    }

    render() {
        if (this.state.data.length === 0)
            this.loadCommentsFromServer();

        return (
                <div className="row d-inline-flex flex-column flex-sm-row mx-3">
                    <div className="d-flex" >
                        <form onSubmit={this.handleSubmit}>
                            <div className="form-group  salaryForm">
                                <div><small>Annual Salary:</small></div>
                                <div><input type="text" placeholder="salary"
                                            className={"form-control " + (this.state.errors.salary ? "is-invalid" : "")}
                                            onChange={this.handleChange}/></div>
                                <div className="text-danger text-wrap" hidden={!this.state.errors.salary}>
                                    <small>Must be a positive number wihthout punctuation.</small>
                                </div>
                            </div>
                            <div>
                                <input className="mt-2" disabled={this.state.errors.salary} type="submit"
                                       value="Submit"/>
                            </div>
                        </form>
                    </div>
                    <div className="mt-3 ml-0 mt-sm-0 ml-sm-3">
                        <ul className="list-group">
                            {this.resultListItems()}
                        </ul>
                    </div>
                </div>
        );
    }
}

