import React from "react";

function Assumptions(props) {

    return (
        <div>
            <div className="mt-3" style={{'width':'90vw'}}>
                <ul>
                    <li className="mt-2 lead">All savings are invested and earn a return of 4%</li>
                    <li className="mt-2 lead">All investments are held in tax free accounts e.g. ISAs</li>
                    <li className="mt-2 lead">Inflation: Currenlty inflation is ignored.
                        <ul>
                            <li>The 4% return from investments already factors in inflation, your real return is likely to be 6-7%</li>
                            <li>Ignoring inflation on your income is balanced by also ignoring inflation on your spending</li>
                            <li>All numbers can be thought of in todays terms</li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default React.memo(Assumptions)



