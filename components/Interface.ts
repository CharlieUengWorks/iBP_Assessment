export interface CoreValue {
    name:string;
    CoreLoad:number;
    CoreTemperature:number;
}
export interface MonitorData {
    IsRunningAsAdmin:boolean;
    CPU:CoreValue;
    GPU:CoreValue;
}