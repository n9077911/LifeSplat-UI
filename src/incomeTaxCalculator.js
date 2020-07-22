import React, {useCallback, useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

export default function IncomeTaxCalculator () {
    const [data, setData] = useState({})
    const [errors, setErrors] = useState({})
    const [salary, setSalary] = useState(0)
    const url  = "https://sctaxcalcservice.azurewebsites.net/api/TaxResults/"

    const loadCommentsFromServer = useCallback(()=>{
        const xhr = new XMLHttpRequest();
        xhr.open("get", url + salary, true);
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            setData(data);
        };
        xhr.send();
    }, [salary])

    function handleSubmit(event) {
        setSalary(event.target.value);
        loadCommentsFromServer();
        event.preventDefault();
    }

    function handleChange(event) {
        if (event.target.value && !event.target.value.match(/^\d+$/)) 
            setErrors({salary: "Not a number"})
        else 
            setErrors({salary: ""})
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
    }, [salary, data, loadCommentsFromServer])
    
    return (
        <div className="row d-inline-flex flex-column flex-sm-row mx-3">
            <div className="d-flex" >
                <form onSubmit={handleSubmit}>
                    <div className="form-group  salaryForm">
                        <div><small>Annual Salary:</small></div>
                        <div><input type="text" placeholder="salary"
                                    className={"form-control " + (errors.salary ? "is-invalid" : "")}
                                    onChange={handleChange}/></div>
                        <div className="text-danger text-wrap" hidden={!errors.salary}>
                            <small>Must be a positive number wihthout punctuation.</small>
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

