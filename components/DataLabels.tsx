'use client';
import styles from "../styles.module.css";
import React from "react";
import usePolling from "./usePolling";
import { MonitorData } from "./Interface";

export default function DataLabels(){
    const data=usePolling('http://localhost:5000/api/metrics',1000) as MonitorData;
    let cpuTexts:string[]=[];
    let gpuTexts:string[]=[];
    const message:string = "//Not running as administrator, some data might be unfetchable";
    if(data){
        //console.log(data);
        const cpuData = data.CPU;
        const gpuData = data.GPU;
        cpuTexts.push('CPU');
        if(cpuData.name)
            cpuTexts.push(cpuData.name);
        else
            cpuTexts.push("name unavailable");
        if(cpuData.CoreLoad)
            cpuTexts.push(`LOAD:${cpuData.CoreLoad}%`);
        else
            cpuTexts.push("LOAD:--");
        if(cpuData.CoreTemperature&&cpuData.CoreTemperature>0)
            cpuTexts.push(`TEMP:${cpuData.CoreTemperature}°C`);
        else
            cpuTexts.push("TEMP:--");

        gpuData.forEach((gpu,idx)=>{
            console.log(gpu);
            gpuTexts.push(`GPU${idx}`);
            if(gpu.name)
                gpuTexts.push(gpu.name);
            else
                gpuTexts.push("name unavailable");
            if(gpu.CoreLoad)
                gpuTexts.push(`LOAD:${gpu.CoreLoad}%`);
            else
                gpuTexts.push("LOAD:--");
            if(gpu.CoreTemperature&&gpu.CoreTemperature>0)
                gpuTexts.push(`TEMP:${gpu.CoreTemperature}°C`);
            else
                gpuTexts.push("TEMP:--");
        });
    }else{
        cpuTexts.push("--SERVER ERROR--");
        gpuTexts.push("--SERVER ERROR--");
    }
    return (
        <div>
            {data&&!data.IsRunningAsAdmin&&(<div className={styles.topLabel}>{message}</div>)}
            <div className={styles.leftLabel}>
                {cpuTexts.map((str,idx)=>(<p key={idx}>{str}</p>))}
            </div>
            <div className={styles.rightLabel}>
                {gpuTexts.map((str,idx)=>(<p key={idx}>{str}</p>))}
            </div>
        </div>
    );
}