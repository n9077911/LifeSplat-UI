import React, {useEffect, useRef} from 'react';
import Chart from 'chart.js';
import {displayConstants, formatMoney} from './helpers';
import 'chartjs-plugin-annotation';

function AreaChart(props) {
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
                steppedLine: ds.step || 'after',
                maintainAspectRatio: false,
            }
        })

        let annotations = props.data.annotations && props.data.annotations.map(a => {
            return {
                drawTime: 'afterDatasetsDraw',
                type: 'line',
                mode: a.axis.startsWith('x') ? 'vertical' : 'horizontal',
                scaleID: a.axis,
                value: a.value,
                borderColor: a.color || '#28a745',
                borderWidth: 6,
                label: {
                    yAdjust: a.yShift || 0,
                    xAdjust: a.xShift || 0,
                    position: a.position || 'centre',
                    backgroundColor: 'white',
                    fontColor: 'black',
                    content: a.title,
                    enabled: true,
                }
            }
        })

        let chart = new Chart(chartRef.current, {
            type: 'line',
            data: {
                labels: props.data.xAxisLabels,
                datasets: dataSets
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time', 
                        time: {unit: 'year'},
                        ticks: {...(props.data.xAxesFormatCallback && {callback: props.data.xAxesFormatCallback})}
                    }],
                    yAxes: [{
                        ticks: {
                            min: 0, 
                            ...(props.data.yAxesFormatCallback && {callback: props.data.yAxesFormatCallback})
                        },
                        stacked: true,
                        scaleLabel:{
                            labelString: props.data.yAxisTitle,
                            display: true,
                            fontColor: 'white',
                            fontFamily: displayConstants().fontFamily,
                            fontSize: 18
                        }
                    }]
                },
                animation: {
                    duration: 0
                },
                annotation: {
                    ...(annotations && {annotations: annotations})
                }
            },
        })

        return () => {
            chart.destroy();
        }
    }, [props.color, props.data, props.title])

    return (
        <div className='chart-container'>
            <canvas id='chart' ref={chartRef}/>
        </div>
    );
}

export default React.memo(AreaChart)