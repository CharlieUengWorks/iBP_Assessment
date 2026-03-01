<img width="929" height="589" alt="image" src="https://github.com/user-attachments/assets/58ba92cf-8a70-45c0-9915-9fbd94cdc6b5" />

## HOW TO RUN THIS
1. Install NPM
2. make sure port 3000 and 5000 is free
3. make sure .net 10 runtime is present on the running PC
4. Open a cmd console at the root folder
5. run "npm install"
6. run "npm run build"
7. run "npm run start"
8. start the provided server binary or build a new one with the project [here](https://github.com/CharlieUengWorks/iBP_APICore))
9. go to http://localhost:3000

## Design
This is a basic hardware monitor with a 3D viewport to better visualize data from CPU and GPU sensors.

Asp.NET API Core and libreHardwareMonitorLib is used as server to provide data for this webpage. 
NextJS is used as develoment framework. And threeJS is used as the 3D rendering library.

This webpage is consists of two main components. 

"DataLabels.tsx" is the component that fetches json data from server and renders the texts.
When the server is not running with admin permission or the server is unreachable, appropriate messages will be shown.

"ThreeScene.tsx" handles all the rendering of the PC model. 
Bloom and outline post processing effects are used to better the quality.

The server is a simple restful api server that whenever a get request is received it creates a computer object, sorts out the required data and returns it as a json string.

## Credit
Computer model - https://sketchfab.com/salvatore.butera1998
