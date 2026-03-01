import ThreeScene from "@/components/ThreeScene";
import styles from "../styles.module.css";
import { terminusFont } from "./layout";
import DataLabels from "@/components/DataLabels";

export default async function Page(){
  /*
  const url = 'https://localhost:7035/api/metrics/HelloWorld';
  try{
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);  
  }catch(error: unknown){
    if (error instanceof TypeError)
      console.error(error);
    else 
      console.error("An unknown error occurred:", error);
  }
  */
  return (
    <div className={terminusFont.className}>
      <ThreeScene/>
      <DataLabels/>
    </div>    
  );
}