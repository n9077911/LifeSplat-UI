import React, {useEffect, useRef} from "react";
import Chart from "chart.js";

export default function AreaChart(props) {
    const chartRef = useRef(null)

    useEffect(() => {
        let dataSets = props.data.dataSets.map(ds => {
            return {
                label: ds.title,
                data: ds.data,
                fill: ds.fill ?? 'origin',
                backgroundColor: ds.color,
                pointRadius: ds.pointRadius ?? 0,
                borderColor: ds.color,
                borderWidth: 1,
                lineTension: 0,
                maintainAspectRatio: false,

            }
        })

        new Chart(chartRef.current, {
            type: 'line',
            options: {
                scales: {
                    xAxes: [{type: 'time', time: {unit: 'year'}}],
                    yAxes: [{ticks: {min: 0}}]
                }
            },
            data: {
                labels: props.data.xAxis,
                datasets: dataSets
            }
        });
    }, [props.color, props.data, props.title])

    return (
        <div className="chart-container">
            <canvas id="chart" ref={chartRef}/>
        </div>
    );
}