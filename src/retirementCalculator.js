import React, {useCallback, useState} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RetirementReport from "./retirementReport";
import Tab from "react-bootstrap/Tab";


export default function RetirementCalculator () {
    const [data, setData] = useState({})
    const [errors, setErrors] = useState({})
    const [salary, setSalary] = useState(100_000)
    const [spending, setSpending] = useState(20_000)
    const [dob, setDob] = useState(new Date(1981, 4, 1))
    const [female, setFemale] = useState(false)
    const url  = "https://sctaxcalcservice.azurewebsites.net/api/Retirement/Report"
    // api/Retirement/Report?salary=100000&spending=40000&dob=1981-05-30&female=false

    const loadReportFromServer = useCallback(()=>{
        fetch(url + '?salary=' + salary + '&spending=' + spending + '&dob=' + dob.toISOString() + '&female=' + female)
            .then((resp) => resp.json())
            .then((data) => {setData(data)})
            .catch(reason => setData({error:reason.toString()}))
    }, [salary, spending, dob, female])
    
    function handleSubmit(event) {
        loadReportFromServer();
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

    function onChangeMaleFemale(event) {
        setFemale(event.target.value === "true")
    }

    return (
        <div className="row d-flex flex-column flex-sm-row mx-3">
            <div className="d-flex w-auto" >
                <form onSubmit={handleSubmit} className="salaryForm">
                    <div className="form-group">
                        <div><small>Annual Spending:</small></div>
                        <div><input type="text" placeholder="spending"
                                    className={"form-control " + (errors.annualSpending ? "is-invalid" : "")}
                                    onChange={handleSpendingChange}
                                    value={spending}/></div>
                        <div className="text-danger text-wrap" hidden={!errors.annualSpending}>
                            <small>Must be a positive number wihthout punctuation.</small>
                        </div>
                    </div>
                    <div className="form-group">
                        <div><small>Annual Salary:</small></div>
                        <div><input type="text" placeholder="salary"
                                    className={"form-control " + (errors.salary ? "is-invalid" : "")}
                                    onChange={handleSalaryChange}
                                    value={salary}/></div>
                        <div className="text-danger text-wrap" hidden={!errors.salary}>
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
                    <fieldset className="form-group" onChange={onChangeMaleFemale}>
                        <small>Gender:</small>
                        <div className="form-check">
                            <label className="form-check-label">
                                <input type="radio" className="form-check-input" name="maleFemaleRadios"
                                       id="maleRadios" value="false" defaultChecked={true}/>
                                    Male
                            </label>
                        </div>
                        <div className="form-check">
                            <label className="form-check-label">
                                <input type="radio" className="form-check-input" name="maleFemaleRadios"
                                       id="femaleRadios" value="true"/>
                                    Female
                            </label>
                        </div>
                    </fieldset>
                    <div>
                        <input className="mt-2" disabled={errors.salary} type="submit"
                               value="Submit"/>
                    </div>
                </form>
            </div>
            <div className="w-auto mt-3 ml-0 mt-sm-0 ml-sm-3">
                {/*<LineChart*/}
                {/*    data={d}*/}
                {/*    title="Savings"*/}
                {/*    color="#70CAD1"/>*/}
                {data.retirementAge ? <RetirementReport report={data} /> :''}
                {data.error ? data.error : ''}
            </div>
        </div>
    );
}