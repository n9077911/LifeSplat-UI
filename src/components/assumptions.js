import React from "react";

function Assumptions(props) {

    return (
        <div>
            <div className="mt-3" style={{'width':'90vw'}}>
                <ul>
                    <li className="mt-2 lead">Your're comfortable with your savings running out at age 100.</li>
                    <li className="mt-2 lead">All savings are invested and earn a return of 4%.</li>
                    <li className="mt-2 lead">All investments are held in tax free accounts e.g. ISAs</li>
                    <li className="mt-2 lead">Inflation: Currently inflation is ignored.
                        <ul>
                            <li>All numbers can be thought of in today's terms.</li>
                            <li>The 4% return from investments already factors in inflation, your real return is likely to be 6-7%.</li>
                            <li>Although your spending will increase your income is likely to increase also.</li>
                            <li>The state pension is currently inflation protected (unless you retire in a country which doens't have an inflation agreement with the UK).</li>
                        </ul>
                    </li>
                    <li className="mt-2 lead">Your salary remains constant.</li>
                    <li className="mt-2 lead">Your spending remains constant.</li>
                    <li className="mt-2 lead">The tax system remains constant.</li>
                    <li className="mt-2 lead">If NI contributions are left blank LifeSplat assumes you've been contributing since age 21.</li>
                </ul>
                <hr/>
                <p className={'lead'}>Clearly these assumptions won't hold true over time. LifeSplat should not be considered as a prediction but rather a projection of where your finances are heading.</p>
            </div>
        </div>
    );
}

export default React.memo(Assumptions)



