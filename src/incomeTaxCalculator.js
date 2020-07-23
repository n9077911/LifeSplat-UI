import React, {useCallback, useEffect, useState} from 'react';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export default function IncomeTaxCalculator () {
    const [data, setData] = useState({})
    const [errors, setErrors] = useState({})
    const [salary, setSalary] = useState(0)
    const [spending, setSpending] = useState(0)
    const [dob, setDob] = useState(new Date(1981, 4, 1))
    const url  = "https://sctaxcalcservice.azurewebsites.net/api/TaxResults/"

    const loadCommentsFromServer = useCallback(()=>{
        fetch(url + salary)
            .then((resp) => resp.json())
            .then((data) => setData(data))
    }, [salary, spending, dob])
    
    function handleSubmit(event) {
        loadCommentsFromServer();
        event.preventDefault();
    }

    function handleSalaryChange(event) {
        if (event.target.value && !event.target.value.match(/^\d+$/)) 
            setErrors({salary: "Not a number"})
        else 
            setErrors({salary: ""})
        
        setSalary(event.target.value);
    }
    
    function handleDateChange(dob) {
        setDob(dob);
    }
    
    function handleSpendingChange(event) {
        setSpending(event.target.value);
    }

    function resultListItems() {
        return data.taxResultItems && data.taxResultItems.map((item, index) => {
            return (
                <li key={item.description} className={"list-group-item d-flex justify-content-between taxResult " + (item.isTotal ? "reportTotal" : "")}>
                    <div> <h6>{item.description}:</h6></div>
                    <div><h6>£{Math.round(item.amount).toLocaleString()}</h6></div>
                </li>
            );
        });
    }

    useEffect(()=>{
        if (data.taxResultItems === undefined)
             loadCommentsFromServer();
    }, [data, loadCommentsFromServer])
    
    return (
        <div className="row d-inline-flex flex-column flex-sm-row mx-3">
            <div className="d-flex" >
                <form onSubmit={handleSubmit} className="salaryForm">
                    <div className="form-group">
                        <div><small>Annual Salary:</small></div>
                        <div><input type="text" placeholder="salary"
                                    className={"form-control " + (errors.salary ? "is-invalid" : "")}
                                    onChange={handleSalaryChange}/></div>
                        <div className="text-danger text-wrap" hidden={!errors.salary}>
                            <small>Must be a positive number wihthout punctuation.</small>
                        </div>
                    </div>
                    <div className="form-group">
                        <div><small>Annual Spending:</small></div>
                        <div><input type="text" placeholder="spending"
                                    className={"form-control " + (errors.annualSpending ? "is-invalid" : "")}
                                    onChange={handleSpendingChange}/></div>
                        <div className="text-danger text-wrap" hidden={!errors.annualSpending}>
                            <small>Must be a positive number wihthout punctuation.</small>
                        </div>
                    </div>
                    <div className="form-group">
                        <div><small>DOB:</small></div>
                        <div><DatePicker
                                selected={dob}
                                onChange={handleDateChange}
                                showYearDropdown
                                showMonthDropdown
                                dateFormat="dd/MM/yyyy"/>
                        </div>
                    </div>
                    <div>
                        <input className="mt-2" disabled={errors.salary} type="submit"
                               value="Submit"/>
                    </div>
                </form>
            </div>
            <div className="mt-3 ml-0 mt-sm-0 ml-sm-3">
                <ul className="list-group">
                    {resultListItems()}
                </ul>
            </div>
        </div>
    );
}

