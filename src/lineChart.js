import React, {useEffect, useRef} from "react";
import Chart from "chart.js";

function LineChart(props) {
    const chartRef = useRef(null)

    useEffect(() => {
        let chart = new Chart(chartRef.current, {
            type: 'line',
            options: {
                scales: {
                    xAxes: [{type: 'time', time: {unit: 'year'}}],
                    yAxes: [{ticks: {min: 0}}]
                },
                animation: {
                    duration: 0
                }
            },
            data: {
                labels: props.data.map(d => d.time),
                datasets: [{
                    label: props.title,
                    data: props.data.map(d => d.value),
                    fill: 'none',
                    backgroundColor: props.color,
                    pointRadius: 0,
                    borderColor: props.color,
                    borderWidth: 1,
                    lineTension: 0,
                    maintainAspectRatio: false
                }]
            }
        });

        return () => {
            chart.destroy();
        }
    }, [props.color, props.data, props.title])

    return (
        <div className="chart-container" >
            <canvas id="chart" ref={chartRef}/>
        </div>
    );
}

export default React.memo(LineChart);

